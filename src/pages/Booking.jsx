// Booking.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Booking = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Query params
  const preselectedFlight = queryParams.get("flight") || "";
  const preselectedHotel = queryParams.get("hotel") || "";
  const preselectedTour = queryParams.get("tour") || "";
  const preselectedCountry = queryParams.get("country") || "";

  // Booking type & item
  const [bookingType, setBookingType] = useState(""); // "flight" | "hotel" | "tour" | "visa"
  const [itemName, setItemName] = useState(""); // Flight, hotel, tour or country

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Flight-specific
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("ECONOMY");

  // Hotel-specific
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  // Tour-specific
  const [travelers, setTravelers] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (preselectedFlight) {
      setBookingType("flight");
      setItemName(preselectedFlight);
    } else if (preselectedHotel) {
      setBookingType("hotel");
      setItemName(preselectedHotel);
    } else if (preselectedTour) {
      setBookingType("tour");
      setItemName(preselectedTour);
    } else if (preselectedCountry) {
      setBookingType("visa");
      setItemName(preselectedCountry);
    }
  }, [preselectedFlight, preselectedHotel, preselectedTour, preselectedCountry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const info = { name, email, type: bookingType, itemName };

    if (bookingType === "flight") {
      info.passengers = passengers;
      info.travelClass = travelClass;
    }

    if (bookingType === "hotel") {
      info.checkIn = checkIn;
      info.checkOut = checkOut;
      info.guests = guests;
    }

    if (bookingType === "tour") {
      info.travelers = travelers;
      info.specialRequests = specialRequests;
    }

    if (bookingType === "visa") {
      info.country = itemName;
    }

    console.log("Booking Info:", info);
    alert("Booking submitted! Check console for details.");
    // Here you can send `info` to your backend API
  };

  return (
    <section className="relative py-20 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
      <div className="relative max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white">
          {bookingType === "flight"
            ? "Flight Booking"
            : bookingType === "hotel"
            ? "Hotel Booking"
            : bookingType === "tour"
            ? "Tour Booking"
            : "Visa Booking"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-90 p-8 rounded-xl shadow-md space-y-4 relative z-10"
        >
          {/* Common Fields */}
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="example@mail.com"
              required
            />
          </div>

          {/* Flight Fields */}
          {bookingType === "flight" && (
            <>
              <div>
                <label className="block font-medium mb-1">Flight</label>
                <input
                  type="text"
                  value={itemName}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Passengers</label>
                <input
                  type="number"
                  min="1"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Class</label>
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First</option>
                </select>
              </div>
            </>
          )}

          {/* Hotel Fields */}
          {bookingType === "hotel" && (
            <>
              <div>
                <label className="block font-medium mb-1">Hotel Name</label>
                <input
                  type="text"
                  value={itemName}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Check-In</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Check-Out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
            </>
          )}

          {/* Tour Fields */}
          {bookingType === "tour" && (
            <>
              <div>
                <label className="block font-medium mb-1">Tour Name</label>
                <input
                  type="text"
                  value={itemName}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Travelers</label>
                <input
                  type="number"
                  min="1"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Special Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Any special requests"
                />
              </div>
            </>
          )}

          {/* Visa Fields */}
          {bookingType === "visa" && (
            <div>
              <label className="block font-medium mb-1">Country</label>
              <input
                type="text"
                value={itemName}
                readOnly
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Submit Booking
          </button>
        </form>
      </div>
    </section>
  );
};

export default Booking;

