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
// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// POST /send-booking
app.post("/send-booking", async (req, res) => {
  const booking = req.body;

  if (!booking.name || !booking.email || !booking.type || !booking.itemName) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  try {
    // ✉️ Email to Admin
    const adminMsg = {
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      from: process.env.EMAIL_USER,
      subject: `🧳 New ${booking.type.toUpperCase()} Booking from ${booking.name}`,
      html: `
        <h2>New Booking Details</h2>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Email:</b> ${booking.email}</p>
        <p><b>Type:</b> ${booking.type}</p>
        <p><b>Item:</b> ${booking.itemName}</p>
        ${
          booking.type === "flight"
            ? `<p><b>Passengers:</b> ${booking.passengers}</p><p><b>Class:</b> ${booking.travelClass}</p>`
            : ""
        }
        ${
          booking.type === "hotel"
            ? `<p><b>Check-in:</b> ${booking.checkIn}</p><p><b>Check-out:</b> ${booking.checkOut}</p><p><b>Guests:</b> ${booking.guests}</p>`
            : ""
        }
        ${
          booking.type === "tour"
            ? `<p><b>Travelers:</b> ${booking.travelers}</p><p><b>Special Requests:</b> ${booking.specialRequests}</p>`
            : ""
        }
        ${
          booking.type === "visa"
            ? `<p><b>Country:</b> ${booking.country}</p>`
            : ""
        }
        <hr/>
        <p style="color: gray;">Sent automatically from your ViewTrip website.</p>
      `,
    };

    await sgMail.send(adminMsg);
    console.log("✅ Admin booking email sent successfully!");

    // ✉️ Email to Customer
    const customerMsg = {
      to: booking.email,
      from: process.env.EMAIL_USER,
      subject: `✅ Booking Confirmation - ViewTrip Travels`,
      html: `
        <h2>Dear ${booking.name},</h2>
        <p>Thank you for booking your ${booking.type} with <b>ViewTrip Travels</b>!</p>
        <p>We have received your booking for <b>${booking.itemName}</b>.</p>
        <p>Our team will contact you shortly with further details.</p>
        <br/>
        <p><b>Booking Summary:</b></p>
        <ul>
          <li>Type: ${booking.type}</li>
          <li>Item: ${booking.itemName}</li>
          ${
            booking.type === "flight"
              ? `<li>Passengers: ${booking.passengers}</li><li>Class: ${booking.travelClass}</li>`
              : ""
          }
          ${
            booking.type === "hotel"
              ? `<li>Check-in: ${booking.checkIn}</li><li>Check-out: ${booking.checkOut}</li><li>Guests: ${booking.guests}</li>`
              : ""
          }
          ${
            booking.type === "tour"
              ? `<li>Travelers: ${booking.travelers}</li><li>Special Requests: ${booking.specialRequests}</li>`
              : ""
          }
          ${
            booking.type === "visa"
              ? `<li>Country: ${booking.country}</li>`
              : ""
          }
        </ul>
        <p>We appreciate your trust in us!</p>
        <p>Warm regards,</p>
        <p><b>ViewTrip Travels</b></p>
      `,
    };

    await sgMail.send(customerMsg);
    console.log("✅ Confirmation email sent to customer!");

    res.status(200).json({ message: "Booking submitted successfully! Emails sent ✅" });
  } catch (error) {
    console.error("❌ Error sending booking emails via SendGrid:", error);
    res.status(500).json({ message: "Failed to send booking emails ❌" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));