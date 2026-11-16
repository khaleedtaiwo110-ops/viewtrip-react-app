import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const discussionSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const destinationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  reviews: [reviewSchema],
  discussions: [discussionSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Destination", destinationSchema);