import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Amadeus from "amadeus";
import axios from "axios";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ✅ Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

// ✅ City or Airport Search
app.get("/api/search", async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: "Missing keyword" });

  try {
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: "CITY,AIRPORT",
    });
    res.json(response.data);
  } catch (error) {
    console.error("❌ Amadeus search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Flight Offers Search
app.get("/api/flight-offers", async (req, res) => {
  const {
    origin,
    destination,
    date,
    returnDate,
    adults = 1,
    travelClass = "ECONOMY",
    tripType = "ONEWAY",
  } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: "Missing origin, destination, or date" });
  }

  try {
    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: date,
      adults: parseInt(adults),
      currencyCode: "USD",
      max: 10,
      travelClass: travelClass.toUpperCase(),
    };

    if (tripType === "ROUNDTRIP" && returnDate) params.returnDate = returnDate;

    const response = await amadeus.shopping.flightOffersSearch.get(params);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Flight search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED HOTEL SEARCH API
app.get("/api/hotels", async (req, res) => {
  const { cityCode, checkInDate, checkOutDate, adults = 1 } = req.query;

  if (!cityCode || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ⭐ STEP 1: Get hotel IDs for the city
    const hotelsRes = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode,
    });

    const hotelIds = hotelsRes.data.map(h => h.hotelId).slice(0, 20); // take first 20 hotels

    if (!hotelIds.length) {
      return res.status(404).json({ error: "No hotels found in this city" });
    }

    // ⭐ STEP 2: Fetch offers using hotel IDs
    const offersRes = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(","),
      checkInDate,
      checkOutDate,
      adults,
      currency: "USD",
    });

    return res.json({ data: offersRes.data });

  } catch (error) {
    console.error("❌ FIXED HOTEL SEARCH ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ Simulate Flight Booking
app.post("/api/book-flight", async (req, res) => {
  const { flight, passenger } = req.body;
  if (!flight || !passenger)
    return res.status(400).json({ error: "Missing flight or passenger data" });

  try {
    const bookingId = "PNR" + Math.floor(Math.random() * 1000000);
    console.log("✅ Booking received:", { passenger, flight });
    res.json({ success: true, bookingId });
  } catch (err) {
    console.error("❌ Booking failed:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// ✅ 🆕 Send Booking Email + Confirmation to Customer

app.get("/api/send-booking", async (req, res) => {
  const booking = req.query;
  console.log("📩 New booking received:", booking);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to Admin
    const adminMail = {
      from: `"ViewTrip Travels" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `🧳 New ${booking.type?.toUpperCase()} Booking from ${booking.name}`,
      html: `
        <h2>New Booking Details</h2>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Email:</b> ${booking.email}</p>
        <p><b>Type:</b> ${booking.type}</p>
        <p><b>Item:</b> ${booking.itemName}</p>
      `,
    };

    // Email to Customer
    const customerMail = {
      from: `"ViewTrip Travels" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `✅ Booking Confirmation - ViewTrip Travels`,
      html: `
        <h2>Dear ${booking.name},</h2>
        <p>Thank you for booking your ${booking.type} with <b>ViewTrip Travels</b>!</p>
        <p>We’ve received your booking for <b>${booking.itemName}</b>.</p>
        <p>Our team will contact you shortly.</p>
        <br/>
        <p><b>Warm regards,</b><br/>ViewTrip Travels</p>
      `,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(customerMail);

    console.log("✅ Emails sent!");
    res.status(200).json({ message: "Booking emails sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending emails:", error);
    

    res.status(500).json({ message: "Failed to send booking emails" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));