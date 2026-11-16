
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Primary model followed by fallback models.
const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite",
];

const REQUEST_TIMEOUT = 22000;

const createTicketBookingTool = {
  name: "createTicketBooking",
  description:
    "Creates a pending travel booking after the customer has provided all required details and explicitly confirmed.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      passengerName: {
        type: Type.STRING,
        description: "Full name of the passenger",
      },
      passengerEmail: {
        type: Type.STRING,
        description: "Passenger email address",
      },
      origin: {
        type: Type.STRING,
        description: "Departure city or airport code",
      },
      destination: {
        type: Type.STRING,
        description: "Arrival city or airport code",
      },
      travelDate: {
        type: Type.STRING,
        description: "Departure date in YYYY-MM-DD format",
      },
    },
    required: [
      "passengerName",
      "passengerEmail",
      "origin",
      "destination",
      "travelDate",
    ],
  },
};

function getErrorStatus(error) {
  return Number(
    error?.status ||
    error?.code ||
    error?.cause?.status ||
    error?.cause?.code ||
    0
  );
}

function isTemporaryError(error) {
  const status = getErrorStatus(error);
  const message = String(error?.message || "");

  return (
    [500, 502, 503, 504].includes(status) ||
    error?.name === "AbortError" ||
    /timeout|timed out|temporarily unavailable|high demand/i.test(message)
  );
}

async function generateWithFallback(contents, config) {
  let lastError;

  for (const model of MODELS) {
    try {
      console.log(`Sending request to Gemini: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          ...config,
          httpOptions: {
            timeout: REQUEST_TIMEOUT,
          },
        },
      });

      console.log(`Gemini response received from ${model}.`);

      return response;

    } catch (error) {
      lastError = error;

      const status = getErrorStatus(error);

      console.error(
        `Gemini model ${model} failed. Status: ${status}`,
        error?.message
      );

      // Do not waste calls when the API key has exhausted its quota.
      if (status === 429) {
        throw error;
      }

      // Authentication, permission and invalid-request errors
      // should not trigger model switching.
      if ([400, 401, 403].includes(status)) {
        throw error;
      }

      // Only move to another model for temporary failures.
      if (!isTemporaryError(error)) {
        throw error;
      }

      console.warn(`Trying the next available Gemini model...`);
    }
  }

  throw lastError;
}

export async function generateTravelResponse({
  message,
  history = [],
  websiteData,
  saveBookingCallback,
}) {
  if (typeof message !== "string" || !message.trim()) {
    throw new Error("AI message is empty or invalid.");
  }

  const systemInstruction = `
You are the official AI Travel Assistant for Viewtrip Travels.

Help customers discover destinations, plan holidays, and understand
the travel services offered by Viewtrip Travels.

Use the supplied website data when answering questions about Viewtrip.

If a customer wants to book a trip:
1. Collect their full name.
2. Collect their email.
3. Collect departure location.
4. Collect destination.
5. Collect travel date.
6. Summarize the details and ask for explicit confirmation.
7. Only call createTicketBooking after confirmation.

Never claim a booking has been created unless the booking service
actually confirms successful creation.

WEBSITE DATA:
${JSON.stringify(websiteData ?? {})}
`;

  const formattedContents = [];

  for (const item of Array.isArray(history) ? history : []) {
    if (
      !item ||
      !["user", "assistant"].includes(item.role) ||
      typeof item.content !== "string" ||
      !item.content.trim()
    ) {
      continue;
    }

    const role = item.role === "assistant" ? "model" : "user";

    const previous =
      formattedContents[formattedContents.length - 1];

    if (previous && previous.role === role) {
      previous.parts[0].text += "\n" + item.content.trim();
    } else {
      formattedContents.push({
        role,
        parts: [{ text: item.content.trim() }],
      });
    }
  }

  const lastMessage =
    formattedContents[formattedContents.length - 1];

  if (lastMessage?.role === "user") {
    lastMessage.parts[0].text += "\n" + message.trim();
  } else {
    formattedContents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });
  }

  let response;

  try {
    response = await generateWithFallback(formattedContents, {
      systemInstruction,
      temperature: 0.3,
      maxOutputTokens: 700,
      tools: [
        {
          functionDeclarations: [createTicketBookingTool],
        },
      ],
    });

  } catch (error) {
    console.error("ViewTrip Gemini request failed:", error);

    const status = getErrorStatus(error);

    let friendlyMessage;

    if (status === 429) {
      friendlyMessage =
        "ViewTrip AI has reached its current API usage limit. Please try again later.";
    } else if ([400, 401, 403].includes(status)) {
      friendlyMessage =
        "ViewTrip AI configuration needs attention. Please contact support.";
    } else if (
      error?.name === "AbortError" ||
      /timeout|timed out/i.test(String(error?.message || ""))
    ) {
      friendlyMessage =
        "ViewTrip AI took too long to respond. Please try again.";
    } else {
      friendlyMessage =
        "ViewTrip AI is temporarily unavailable. Please try again shortly.";
    }

    const friendlyError = new Error(friendlyMessage);

    friendlyError.status =
      status === 429 ? 429 :
      [400, 401, 403].includes(status) ? status : 503;

    friendlyError.cause = error;

    throw friendlyError;
  }

  // Handle booking function calls.
  if (response.functionCalls?.length) {
    const call = response.functionCalls[0];

    if (call.name === "createTicketBooking") {
      if (typeof saveBookingCallback !== "function") {
        throw new Error("Booking service is unavailable.");
      }

      const bookingResult = await saveBookingCallback(call.args);

      if (
        !bookingResult?.referenceId ||
        !bookingResult?.paymentUrl
      ) {
        throw new Error(
          "Booking service did not return a valid booking."
        );
      }

      return {
        reply: `Your booking has been created. Reference: ${bookingResult.referenceId}. Payment: ${bookingResult.paymentUrl}`,
        bookingCreated: bookingResult,
      };
    }
  }

  const reply = response.text;

  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return {
    reply,
    bookingCreated: null,
  };
}
