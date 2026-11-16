import express from "express";

const router = express.Router();

// Convert OAG status values into customer-friendly labels
function normalizeFlightStatus(state) {
  const value = String(state || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  const statuses = {
    scheduled: "Scheduled",
    departed: "Departed",
    enroute: "En Route",
    inair: "En Route",
    landed: "Landed",
    ingate: "Arrived",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    delayed: "Delayed",
    diverted: "Diverted"
  };

  return statuses[value] || "Status unavailable";
}


router.get("/departures", async (req, res) => {
  try {
    const { date, airport = "LOS" } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return res.status(400).json({
        error: "Provide a date in YYYY-MM-DD format"
      });
    }

    if (!process.env.OAG_API_KEY) {
      return res.status(500).json({
        error: "OAG API key is not configured"
      });
    }

    const params = new URLSearchParams({
      version: "v2",
      DepartureDateTime: String(date),
      DepartureAirport: String(airport).toUpperCase(),
      Content: "Status",
      CodeType: "IATA",
      Limit: "10"
    });

    const response = await fetch(
      `https://api.oag.com/flight-instances?${params}`,
      {
        headers: {
          "Subscription-Key": process.env.OAG_API_KEY,
          Accept: "application/json"
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OAG flight search failed",
        details: result
      });
    }

    const flights = (result.data || []).map((flight) => {
      const updates = flight.statusDetails || [];

      const latest = [...updates].sort(
        (a, b) =>
          new Date(b.updatedAt || 0) -
          new Date(a.updatedAt || 0)
      )[0] || {};

      return {
        airline: flight.carrier?.iata,
        flightNumber: flight.flightNumber,
        date: flight.departure?.date?.local,
        departure: flight.departure?.airport?.iata,
        arrival: flight.arrival?.airport?.iata,
        scheduledDeparture: flight.departure?.time?.local,
        scheduledArrival: flight.arrival?.time?.local,
        status: latest.state || "Not available",
        lastUpdated: latest.updatedAt || null
      };
    });

    res.json({
      success: true,
      count: flights.length,
      flights,
      paging: result.paging
    });

  } catch (error) {
    console.error("OAG departures error:", error);

    res.status(500).json({
      error: "Unable to retrieve departures"
    });
  }
});


router.get("/status", async (req, res) => {
  try {
    const {
      carrierCode,
      flightNumber,
      date,
      departureAirport,
      arrivalAirport
    } = req.query;

    // Validate required parameters
    if (!carrierCode || !flightNumber || !date) {
      return res.status(400).json({
        error: "carrierCode, flightNumber and date are required"
      });
    }

    if (!/^\d{1,4}$/.test(String(flightNumber))) {
      return res.status(400).json({
        error: "Flight number must contain 1–4 digits"
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return res.status(400).json({
        error: "Date must use YYYY-MM-DD format"
      });
    }

    if (!process.env.OAG_API_KEY) {
      return res.status(500).json({
        error: "OAG API key is not configured"
      });
    }

    // Build OAG request
    const params = new URLSearchParams({
      version: "v2",
      DepartureDateTime: date,
      CarrierCode: String(carrierCode).toUpperCase(),
      FlightNumber: String(flightNumber),
      Content: "Status",
      CodeType: "IATA",
      Limit: "10"
    });

    if (departureAirport) {
      params.set(
        "DepartureAirport",
        String(departureAirport).toUpperCase()
      );
    }

    if (arrivalAirport) {
      params.set(
        "ArrivalAirport",
        String(arrivalAirport).toUpperCase()
      );
    }

    const oagResponse = await fetch(
      `https://api.oag.com/flight-instances?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Subscription-Key": process.env.OAG_API_KEY,
          Accept: "application/json"
        }
      }
    );

    const result = await oagResponse.json();

    if (!oagResponse.ok) {
      return res.status(oagResponse.status).json({
        error: "OAG flight lookup failed",
        details: result
      });
    }

    // Convert OAG's response into a simpler format
    const flights = (result.data || []).map((flight) => {
      const updates = [...(flight.statusDetails || [])];

      updates.sort(
        (a, b) =>
          new Date(b.updatedAt || 0) -
          new Date(a.updatedAt || 0)
      );

      const latest = updates[0] || {};

      // Normalize the actual status returned by OAG
      const status = normalizeFlightStatus(latest.state);

      return {
        airline: flight.carrier?.iata,
        flightNumber: flight.flightNumber,
        date: flight.departure?.date?.local,

        departure: {
          airport: flight.departure?.airport?.iata,
          scheduledDate: flight.departure?.date?.local,
          scheduledTime: flight.departure?.time?.local,
          estimated: latest.departure?.estimatedTime,
          actual: latest.departure?.actualTime,
          actualTakeoff: latest.departure?.actualTime?.offGround?.local || null,
          terminal: latest.departure?.actualTerminal,
          gate: latest.departure?.gate
        },

        arrival: {
          airport: flight.arrival?.airport?.iata,
          scheduledDate: flight.arrival?.date?.local,
          scheduledTime: flight.arrival?.time?.local,
          estimated: latest.arrival?.estimatedTime,
          actual: latest.arrival?.actualTime,
          actualTouchdown: latest.arrival?.actualTime?.onGround?.local || null,
          terminal: latest.arrival?.actualTerminal,
          gate: latest.arrival?.gate
        },

        status,
        originalStatus: latest.state || null,
        lastUpdated: latest.updatedAt || null,

        // Keep the full OAG status object for debugging
        statusDetails: latest
      };
    });

    return res.json({
      success: true,
      count: flights.length,
      flights,
      paging: result.paging
    });

  } catch (error) {
    console.error("Flight tracking error:", error);

    return res.status(500).json({
      error: "Unable to retrieve flight status"
    });
  }
});

export default router;