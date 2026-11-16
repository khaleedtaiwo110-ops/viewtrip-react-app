import express from "express";
import multer from "multer";
import { createRequire } from "node:module";
import { v2 as cloudinary } from "cloudinary";
import Destination from "../models/Destination.js";

const require = createRequire(import.meta.url);
const CloudinaryStorage = require("multer-storage-cloudinary");
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "travel_community",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// 1. GET all destinations
router.get("/", async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST new destination (Admin Upload)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Unauthorized admin access" });
    }

    const { title, location, duration, price, description } = req.body;
    const newDestination = new Destination({
      title,
      location,
      duration,
      price,
      description,
      image: req.file.path,
    });

    await newDestination.save();
    res.status(201).json(newDestination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST a review & star rating
router.post("/:id/reviews", async (req, res) => {
  try {
    const { userName, rating, comment } = req.body;
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ error: "Not found" });

    destination.reviews.push({ userName, rating: Number(rating), comment });
    await destination.save();
    res.status(201).json(destination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST a community thought
router.post("/:id/discussions", async (req, res) => {
  try {
    const { userName, message } = req.body;
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ error: "Not found" });

    destination.discussions.push({ userName, message });
    await destination.save();
    res.status(201).json(destination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;