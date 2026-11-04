import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

// ✅ Helper Function: Get Travelport OAuth Token (Password Grant Type with .net endpoint)
async function getTravelportToken() {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", process.env.TRAVELPORT_USERNAME);
    params.append("password", process.env.TRAVELPORT_PASSWORD);
    params.append("client_id", process.env.TRAVELPORT_CLIENT_ID);
    params.append("client_secret", process.env.TRAVELPORT_CLIENT_SECRET);

    const response = await axios.post(
      "https://auth.pp.travelport.net/oauth/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    console.log("🔑 Travelport token generated successfully!");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Travelport Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Travelport API");
  }
}

// ✅ City or Airport Search
app.get("/api/search", async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: "Missing keyword" });

  try {
    res.json([{ name: keyword.toUpperCase(), iataCode: keyword.toUpperCase() }]);
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Flight Offers Search using Travelport TripServices
app.get('/api/flight-offers', async (req, res) => {
  console.log("🔍 DEBUG QUERY RECEIVED for Travelport:", req.query);

  try {
    const { origin, destination, date, adults } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({ 
        error: "Missing required flight parameters (origin, destination, date)." 
      });
    }

    // 1. Get OAuth Bearer Token
    const accessToken = await getTravelportToken();

    // 2. Exact Dashboard curl Payload Structure
    const searchPayload = {
      "@type": "CatalogProductOfferingsQueryRequest",
      "CatalogProductOfferingsRequest": {
        "@type": "CatalogProductOfferingsRequestAir",
        "maxNumberOfUpsellsToReturn": 4,
        "contentSourceList": ["GDS"],
        "PassengerCriteria": [
          {
            "@type": "PassengerCriteria",
            "number": parseInt(adults || 1),
            "passengerTypeCode": "ADT"
          }
        ],
        "SearchCriteriaFlight": [
          {
            "@type": "SearchCriteriaFlight",
            "departureDate": date,
            "From": {
              "value": origin.toUpperCase()
            },
            "To": {
              "value": destination.toUpperCase()
            }
          }
        ]
      }
    };

    console.log("🚀 Dispatching search request to Travelport API...");

    // 3. Dispatch to Travelport API Endpoint
    const response = await axios.post(
      process.env.TRAVELPORT_BASE_URL || "https://api.pp.travelport.net/11/air/catalog/search/catalogproductofferings",
      searchPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'TVP-PCC-Core': '7K99_1G',
          'TraceId': 'TraceId_' + Date.now()
        }
      }
    );

    // ✅ Transform Travelport Response to match React Frontend expectations if needed
    // Inside your /api/flight-offers route in server.js:
    const rawData = response.data;
    console.log("✅ Travelport flight offers fetched successfully!");
    
    // Safely unwrap Travelport's nested catalog offerings structure
    const flightOffersArray = 
      rawData.CatalogProductOfferingsResponse?.catalogProductOfferings ||
      rawData.catalogProductOfferings ||
      rawData.productOffering ||
      rawData.data ||
      (Array.isArray(rawData) ? rawData : [rawData]);

    // Send the clean, verified array back to the frontend
    res.json(flightOffersArray);

    
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error("❌ Travelport API Error:", JSON.stringify(errorDetails, null, 2));
    res.status(500).json({ error: "Failed to fetch flight offers from Travelport provider." });
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

// ✅ Send Booking Email
app.post("/api/send-booking", async (req, res) => {
  const booking = req.body;
  console.log("📩 Booking received:", booking);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.mailchannels.net",
      port: 25,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "apikey",
        pass: process.env.EMAIL_PASS || "apikey",
      },
    });

    const adminMail = {
      from: `ViewTrip Travels <no-reply@viewtriptravels.com>`,
      to: process.env.EMAIL_RECEIVER || "khaleedtaiwo110@gmail.com",
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