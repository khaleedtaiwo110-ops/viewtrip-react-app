import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "../componentss/adsgoogle";

export default function FlightOffers() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [tripType, setTripType] = useState("oneway");
  const [returnDate, setReturnDate] = useState("");
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    passportNumber: "",
    travelers: 1,
    travelClass: "Economy",
  });
  const [suggestions, setSuggestions] = useState({ origin: [], destination: [] });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (origin.length >= 2) fetchAirportSuggestions(origin, "origin");
      if (destination.length >= 2) fetchAirportSuggestions(destination, "destination");
    }, 500);
    return () => clearTimeout(timeout);
  }, [origin, destination]);

  const fetchAirportSuggestions = async (query, field) => {
    try {
      const res = await axios.get(`https://view-trip-travels-app.onrender.com/api/search?keyword=${query}`);
      setSuggestions((prev) => ({ ...prev, [field]: res.data.slice(0, 5) }));
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResults([]);
    setSelectedFlight(null);

    try {
      const res = await axios.get("https://view-trip-travels-app.onrender.com/api/flight-offers", {
        params: { origin, destination, date, travelClass },
      });
      setResults(res.data);
    } catch (err) {
      console.error("❌ Flight search failed:", err);
      setError("Failed to fetch flight offers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (d) => {
    const m = d?.match(/PT(\d+H)?(\d+M)?/);
    if (!m) return "";
    const hours = m[1] ? m[1].replace("H", "h ") : "";
    const mins = m[2] ? m[2].replace("M", "m") : "";
    return hours + mins;
  };

  const handleBookFlight = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://view-trip-travels-app.onrender.com/api/book-flight", {
        flight: selectedFlight,
        passenger: bookingData,
      });

      alert(`✅ ${res.data.message}\nBooking ID: ${res.data.bookingId}`);
      setShowBookingForm(false);
      setSelectedFlight(null);
      setBookingData({
        fullName: "",
        email: "",
        phone: "",
        passportNumber: "",
        travelers: 1,
        travelClass: "Economy",
      });
    } catch (err) {
      console.error("Booking failed:", err);
      alert("❌ Failed to complete booking. Please try again later.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ✨ Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 30, repeat: Infinity }}
      />

      {/* Overlay */}
      <div className="relative bg-black bg-opacity-60 min-h-screen py-16 px-4 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 drop-shadow">
            ViewTrip Travels — Find & Book Flights
          </h2>

          {/* Flight Search Form */}
          <form onSubmit={handleSearch} className="grid md:grid-cols-2 gap-4">
            {/* Origin */}
            <div className="relative">
              <input
                type="text"
                placeholder="From (e.g. LOS)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {suggestions.origin.length > 0 && (
                <ul className="absolute bg-white border mt-1 w-full rounded-lg shadow-lg z-10">
                  {suggestions.origin.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setOrigin(s.iataCode);
                        setSuggestions((prev) => ({ ...prev, origin: [] }));
                      }}
                      className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                    >
                      {s.name} ({s.iataCode})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <input
                type="text"
                placeholder="To (e.g. DXB)"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              {suggestions.destination.length > 0 && (
                <ul className="absolute bg-white border mt-1 w-full rounded-lg shadow-lg z-10">
                  {suggestions.destination.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setDestination(s.iataCode);
                        setSuggestions((prev) => ({ ...prev, destination: [] }));
                      }}
                      className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                    >
                      {s.name} ({s.iataCode})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Trip Type */}
            <div>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="oneway">One Way</option>
                <option value="round">Round Trip</option>
              </select>
            </div>

            {/* Class Selector */}
            <div>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First Class</option>
              </select>
            </div>

            {/* Dates */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            {tripType === "round" && (
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}

            <button
              type="submit"
              className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search Flights"}
            </button>
          </form>

          {error && <p className="text-red-500 text-center mt-4 font-medium">{error}</p>}

          {/* Results */}
          <div className="mt-10">
            {results.length > 0 && (
              <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
                Available Flights
              </h2>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              {results.map((flight, i) => {
                const itinerary = flight.itineraries[0];
                const departureSegment = itinerary.segments[0];
                const arrivalSegment =
                  itinerary.segments[itinerary.segments.length - 1];

                return (
                  <motion.div
                    key={i}
                    className="bg-white border rounded-xl shadow-md p-5 hover:shadow-xl transition cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedFlight(flight)}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold text-gray-700">
                        {flight.validatingAirlineCodes?.join(", ") || "Airline"}
                      </p>
                      <p className="font-bold text-blue-600 text-lg">
                        ${flight.price?.total || "N/A"}
                      </p>
                    </div>

                    <div className="flex justify-between text-gray-600 mb-3">
                      <div>
                        <p className="font-medium">From</p>
                        <p>
                          {departureSegment.departure.iataCode} -{" "}
                          {new Date(departureSegment.departure.at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Duration</p>
                        <p>{formatDuration(itinerary.duration)}</p>
                      </div>
                      <div>
                        <p className="font-medium">To</p>
                        <p>
                          {arrivalSegment.arrival.iataCode} -{" "}
                          {new Date(arrivalSegment.arrival.at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between text-gray-500 text-sm">
                      <p>Stops: {itinerary.segments.length - 1}</p>
                      <p>Class: {travelClass.replace("_", " ")}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Booking modals kept same as before */}
        <AnimatePresence>
          {selectedFlight && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFlight(null)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-blue-700 mb-4">Flight Itinerary</h3>
                {selectedFlight.itineraries[0].segments.map((seg, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-3 mb-3 text-gray-700">
                    <p className="font-semibold text-lg">
                      {seg.departure.iataCode} → {seg.arrival.iataCode}
                    </p>
                    <p>Departure: {new Date(seg.departure.at).toLocaleString()}</p>
                    <p>Arrival: {new Date(seg.arrival.at).toLocaleString()}</p>
                    <p>Carrier: {seg.carrierCode}</p>
                    <p>Duration: {formatDuration(seg.duration)}</p>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-4">
                  <p className="text-lg font-semibold text-blue-600">
                    Total Price: ${selectedFlight.price.total}
                  </p>
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Passenger form modal */}
        <AnimatePresence>
          {showBookingForm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingForm(false)}
            >
              <motion.form
                onSubmit={handleBookFlight}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-blue-700 mb-4 text-center">
                  Passenger Information
                </h3>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={bookingData.fullName}
                  onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                  required
                  className="w-full border rounded-lg p-3 mb-3"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  required
                  className="w-full border rounded-lg p-3 mb-3"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  required
                  className="w-full border rounded-lg p-3 mb-3"
                />
                <input
                  type="text"
                  placeholder="Passport Number"
                  value={bookingData.passportNumber}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, passportNumber: e.target.value })
                  }
                  required
                  className="w-full border rounded-lg p-3 mb-3"
                />
                <input
                  type="number"
                  placeholder="Number of Travelers"
                  min="1"
                  value={bookingData.travelers}
                  onChange={(e) => setBookingData({ ...bookingData, travelers: e.target.value })}
                  required
                  className="w-full border rounded-lg p-3 mb-3"
                />

                <select
                  value={bookingData.travelClass}
                  onChange={(e) => setBookingData({ ...bookingData, travelClass: e.target.value })}
                  className="w-full border rounded-lg p-3 mb-4"
                >
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-semibold transition"
                >
                  Confirm Booking
                </button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AdBanner />
      <AdBanner />
    </div>
  );
}
