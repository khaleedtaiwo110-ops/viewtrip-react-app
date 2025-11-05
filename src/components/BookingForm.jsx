import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const flight = location.state?.flight;

  const [passenger, setPassenger] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");

  if (!flight) {
    return (
      <div className="p-8 text-center text-red-600">
        No flight selected. Please go back and choose a flight.
      </div>
    );
  }

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/book-flight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flight, passenger }),
      });
      if (!res.ok) throw new Error("Booking failed");
      const data = await res.json();
      setConfirmation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
        Confirm Your Booking ✈️
      </h1>

      {!confirmation ? (
        <form onSubmit={handleBook} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={passenger.firstName}
              onChange={(e) =>
                setPassenger({ ...passenger, firstName: e.target.value })
              }
              className="border rounded-lg p-3 flex-1 min-w-[150px]"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={passenger.lastName}
              onChange={(e) =>
                setPassenger({ ...passenger, lastName: e.target.value })
              }
              className="border rounded-lg p-3 flex-1 min-w-[150px]"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={passenger.email}
            onChange={(e) =>
              setPassenger({ ...passenger, email: e.target.value })
            }
            className="border rounded-lg p-3 w-full"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={passenger.phone}
            onChange={(e) =>
              setPassenger({ ...passenger, phone: e.target.value })
            }
            className="border rounded-lg p-3 w-full"
            required
          />

          <div className="bg-gray-50 p-4 rounded-lg border mt-4">
            <h3 className="font-semibold text-gray-700 mb-1">
              Flight Summary:
            </h3>
            <p>
              {flight.itineraries[0].segments[0].departure.iataCode} →{" "}
              {
                flight.itineraries[0].segments[
                  flight.itineraries[0].segments.length - 1
                ].arrival.iataCode
              }{" "}
              | {flight.price.total} {flight.price.currency}
            </p>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-green-600 mb-3">
            🎉 Booking Confirmed!
          </h2>
          <p>Your booking reference: <strong>{confirmation.bookingId}</strong></p>
          <button
            onClick={() => navigate("/flights")}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Flights
          </button>
        </div>
      )}
    </div>
  );
}
