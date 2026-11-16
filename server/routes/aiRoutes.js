
import express from "express";
import { generateTravelResponse } from "../services/aiService.js";
import { recommendDestinations } from "../services/destinationService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Validate message
    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid travel request.",
      });
    }

    // Validate history
    if (!Array.isArray(history) || history.length > 8) {
      return res.status(400).json({
        success: false,
        error: "Invalid conversation history.",
      });
    }

    // Keep history in one consistent format.
    // aiService.js will convert assistant to Gemini's model role.
    const cleanHistory = history
      .filter(
        (item) =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string" &&
          item.content.trim().length > 0
      )
      .slice(-8)
      .map((item) => ({
        role: item.role,
        content: item.content.trim().slice(0, 2000),
      }));

    // Extract travel budget
    const budgetMatch = message.match(
      /(?:₦|NGN|N)\s*([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s*(?:naira|NGN)/i
    );

    const budget = budgetMatch
      ? Number(
          (budgetMatch[1] || budgetMatch[2]).replace(/,/g, "")
        )
      : null;

    // Extract trip duration and travellers
    const daysMatch = message.match(/(\d+)\s*[- ]?days?/i);

    const peopleMatch = message.match(
      /(\d+)\s*(?:people|persons|travellers|travelers)/i
    );

    const days = daysMatch ? Number(daysMatch[1]) : 5;
    const travellers = peopleMatch ? Number(peopleMatch[1]) : 1;

    // Extract interests
    const interestWords = [
      "beach",
      "romantic",
      "nightlife",
      "culture",
      "adventure",
      "nature",
      "relaxation",
      "food",
    ];

    const interests = interestWords.filter((word) =>
      message.toLowerCase().includes(word)
    );

    // Generate destination recommendations
    const recommendations = budget
      ? recommendDestinations({
          budget,
          days,
          travellers,
          interests,
        })
      : [];

    // Website information available to Gemini
    const websiteData = {
      company: "Viewtrip Travels",
      recommendations,
      supportEmail: "support@viewtriptravels.com",
    };

    // IMPORTANT:
    // Actual database booking creation is not implemented here yet.
    // Never return a fake successful booking.
    const saveBookingCallback = async () => {
      throw new Error(
        "Booking creation is not yet connected to the Viewtrip booking database."
      );
    };

    console.log("ViewTrip AI request received.");

    // Generate AI response
    const aiResult = await generateTravelResponse({
      message: message.trim(),
      history: cleanHistory,
      websiteData,
      saveBookingCallback,
    });

    // Return successful response
    return res.status(200).json({
      success: true,
      answer: aiResult.reply,
      recommendations,
      bookingDetails: aiResult.bookingCreated || null,
      disclaimer:
        "All destination costs are illustrative estimates. Flights are managed via Viewtrip GDS.",
    });

  } catch (error) {
    console.error("ViewTrip AI error:", error);

    const errorStatus = Number(error.status || error.code);

    const timedOut = /timed out/i.test(error.message || "");

    let statusCode = 500;
    let userMessage =
      "Sorry, ViewTrip AI could not process your request. Please try again.";

    if (errorStatus === 429) {
      statusCode = 429;
      userMessage =
        "ViewTrip AI is receiving too many requests. Please try again shortly.";
    } else if (errorStatus === 503 || errorStatus === 502) {
      statusCode = 503;
      userMessage =
        "ViewTrip AI is temporarily unavailable. Please try again shortly.";
    } else if (timedOut) {
      statusCode = 504;
      userMessage =
        "ViewTrip AI is taking too long to respond. Please try again.";
    }

    return res.status(statusCode).json({
      success: false,
      error: userMessage,
    });
  }
});

export default router;
