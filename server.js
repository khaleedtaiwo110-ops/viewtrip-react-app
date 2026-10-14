import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Amadeus from "amadeus";
import axios from "axios";
import nodemailer from "nodemailer";


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
// Note: If you are using Production keys, make sure hostname: 'production' is uncommented.
// If you are using Test keys, leave hostname out or set to 'test'.
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  hostname: 'test' // <--- Forces it to hit the live global production servers
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
app.get('/api/flight-offers', async (req, res) => {
  console.log("🔍 DEBUG QUERY RECEIVED:", req.query);

  try {
    const { origin, destination, date, travelClass, adults, children, infants } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({ 
        error: "Missing required flight parameters (origin, destination, date)." 
      });
    }

    const searchParams = {
      originLocationCode: origin.toUpperCase().trim(),
      destinationLocationCode: destination.toUpperCase().trim(),
      departureDate: date,
      travelClass: (travelClass || 'ECONOMY').toUpperCase(),
      adults: String(adults || 1),
    };

    console.log("🚀 Dispatching clean search params to Amadeus:", searchParams);

    // Make sure this is awaited properly!
    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    
    console.log("✅ Flight offers fetched successfully!");
    res.json(response.data);
    
  } catch (error) {
    const errorDetails = error.description || error.response?.data || error.response || error.message || error;
    console.error("❌ FULL AMADEUS ERROR OBJECT:", JSON.stringify(errorDetails, null, 2));

    const errorDetail = error.description?.[0]?.detail || 
                        error.response?.data?.errors?.[0]?.detail || 
                        error.message || 
                        "Failed to fetch flight offers from provider.";

    res.status(500).json({ error: errorDetail });
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

// ✅ Send Booking Email + Confirmation to Customer
app.post("/api/send-booking", async (req, res) => {
  const booking = req.body;
  console.log("📩 Booking received:", booking);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.mailchannels.net",
      port: 25,
      secure: false,
      auth: {
        user: "apikey",
        pass: "apikey",
      },
    });

    const adminMail = {
      from: `ViewTrip Travels <no-reply@viewtriptravels.com>`,
      to: "khaleedtaiwo110@gmail.com",
      subject: `🧳 New ${booking.type?.toUpperCase()} Booking from ${booking.name}`,
      html: `
        <h2>New Booking Received</h2>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Email:</b> ${booking.email}</p>
        <p><b>Type:</b> ${booking.type}</p>
        <p><b>Item:</b> ${booking.itemName}</p>
      `,
    };

    const customerMail = {
      from: `ViewTrip Travels <no-reply@viewtriptravels.com>`,
      to: booking.email,
      subject: `✅ Booking Confirmation - ViewTrip Travels`,
      html: `
        <h2>Dear ${booking.name},</h2>
        <p>Thank you for booking your <b>${booking.type}</b> with <b>ViewTrip Travels</b>!</p>
        <p>We have received your request for:</p>
        <p><b>${booking.itemName}</b></p>
        <p>Our team will reach out shortly.</p>
        <br/>
        <p>Warm regards,<br/>ViewTrip Travels Team</p>
      `,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(customerMail);

    res.status(200).json({ success: true, message: "Booking emails sent successfully!" });

  } catch (error) {
    console.error("❌ Email Error:", error);
    res.status(500).json({ message: "Failed to send booking emails" });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));