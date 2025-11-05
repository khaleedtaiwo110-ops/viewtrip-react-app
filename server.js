import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Amadeus from "amadeus";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

// ✅ Health/Test Route
app.get("/test-amadeus", async (req, res) => {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: "LON",
      subType: "CITY",
    });
    res.json(response.data);
  } catch (error) {
    console.error("❌ Test route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ City or Airport Search (Autocomplete)
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

    if (tripType === "ROUNDTRIP" && returnDate) {
      params.returnDate = returnDate;
    }

    const response = await amadeus.shopping.flightOffersSearch.get(params);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Flight search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Hotel Search (final stable version)
// ✅ Modern Amadeus hotel search (2-step process)
app.post("/api/hotels", async (req, res) => {
  const { cityCode, checkInDate, checkOutDate, adults = 1 } = req.body;

  if (!cityCode || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Step 1️⃣ — Obtain a valid token
    const tokenResponse = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_CLIENT_ID,
        client_secret: process.env.AMADEUS_CLIENT_SECRET,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const token = tokenResponse.data.access_token;

    // Step 2️⃣ — Find hotels in the city to get IDs
    const hotelListResponse = await axios.get(
      "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { cityCode: cityCode.toUpperCase() },
      }
    );

    const hotelIds = hotelListResponse.data.data
      .slice(0, 5) // limit to top 5
      .map((h) => h.hotelId)
      .filter(Boolean);

    if (hotelIds.length === 0) {
      return res.status(404).json({ error: "No hotels found for this city." });
    }

    // Step 3️⃣ — Get offers for those hotels
    const offersResponse = await axios.get(
      "https://test.api.amadeus.com/v3/shopping/hotel-offers",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          hotelIds: hotelIds.join(","),
          checkInDate: new Date(checkInDate).toISOString().split("T")[0],
          checkOutDate: new Date(checkOutDate).toISOString().split("T")[0],
          adults: Number(adults),
          currencyCode: "USD",
        },
      }
    );

    console.log(`✅ Received ${offersResponse.data.data?.length || 0} hotel offers for ${cityCode}`);
    res.json(offersResponse.data);
  } catch (error) {
    const err = error.response?.data || error.message;
    console.error("❌ Amadeus Hotel Search Error:", err);
    res.status(500).json({ error: err });
  }
});


// ✅ Simulate Flight Booking
app.post("/api/book-flight", async (req, res) => {
  const { flight, passenger } = req.body;

  if (!flight || !passenger) {
    return res.status(400).json({ error: "Missing flight or passenger data" });
  }

  try {
    const bookingId = "PNR" + Math.floor(Math.random() * 1000000);
    console.log("✅ Booking received:", { passenger, flight });
    res.json({ success: true, bookingId });
  } catch (err) {
    console.error("❌ Booking failed:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
