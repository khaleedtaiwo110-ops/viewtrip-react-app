
import { useState } from "react";
import ChatMessage from "./ChatMessage";
import TripRecommendation from "./TripRecommendation";

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm ViewTrip AI. Where would you love to travel? Tell me your budget and the experience you're looking for."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const sendMessage = async (event) => {
  event.preventDefault();

  const text = input.trim();

  if (!text || loading) return;

  const userMessage = {
    role: "user",
    content: text
  };

  setMessages(prev => [...prev, userMessage]);
  setInput("");
  setLoading(true);
  setRecommendations([]);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    console.log("Sending message to ViewTrip AI...");

    const response = await fetch(
      "https://view-trip-travels-app.onrender.com/api/ai/chat",
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        message: text,
        history: messages
          .filter(item =>
            ["user", "assistant"].includes(item.role)
          )
          .slice(-8)
      })
    });

    console.log("Backend response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "ViewTrip AI request failed.");
    }

    if (!data.answer) {
      throw new Error("The AI returned an empty response.");
    }

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: data.answer
      }
    ]);

    setRecommendations(data.recommendations || []);

  } catch (error) {
    console.error("ViewTrip AI frontend error:", error);

    let errorMessage = error.message;

    if (error.name === "AbortError") {
      errorMessage = "ViewTrip AI took too long to respond. Please try again.";
    }

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: errorMessage || "Unable to connect to ViewTrip AI."
      }
    ]);

  } finally {
    clearTimeout(timeout);
    setLoading(false);
    console.log("ViewTrip AI request finished.");
  }
};

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">✈️</div>

        <h1 className="text-3xl font-bold text-gray-900">
          ViewTrip AI
        </h1>

        <p className="text-gray-500 mt-2">
          Tell us your budget. We'll help you find your adventure.
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="min-h-[300px] max-h-[500px] overflow-y-auto mb-5">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          {loading && (
            <p className="text-sm text-gray-500 animate-pulse mb-4">
              ViewTrip AI is planning your trip...
            </p>
          )}
        </div>

        {recommendations.length > 0 && (
          <div className="border-t pt-5 mb-5">
            <h2 className="font-bold text-lg mb-3">
              Recommended destinations
            </h2>

            {recommendations.map(trip => (
              <TripRecommendation
                key={trip.id}
                trip={trip}
              />
            ))}
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Describe your dream vacation..."
            className="flex-1 min-w-0 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Travel estimates are indicative and subject to verification.
        </p>
      </div>
    </div>
  );
}
