import React, { useState, useEffect } from "react";
import {
  Plane,
  BedDouble,
  ArrowLeftRight,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TrendingHotels from "./TrendingHotels";
import Tours from "./Tours"

export default function Home() {
  const [tab, setTab] = useState("flights");
  const [tripType, setTripType] = useState("oneway");
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [flightResults, setFlightResults] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Flight + Hotel Form States
  const [flightForm, setFlightForm] = useState({
    origin: "",
    destination: "",
    date: "",
    returnDate: "",
    passengers: 1,
    travelClass: "ECONOMY",
  });

  const [hotelForm, setHotelForm] = useState({
    destination: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    rooms: 1,
  });

  // Passenger Booking Info
  const [passenger, setPassenger] = useState({
    fullName: "",
    email: "",
    phone: "",
    passport: "",
    birthDate: "",
    gender: "",
    nationality: "",
  });

  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Destination Backgrounds
  const destinations = [
    {
      img: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1400&q=80",
      title: "Paris, France",
    },
    {
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
      title: "Bali, Indonesia",
    },
    {
      img: "hotel8.jpg",
      title: "Dubai, UAE",
    },
    {
      img: "hotel6.avif",
      title: "Lagos, Nigeria",
    },
  ];

  // 🖼 Auto Background Change
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % destinations.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // === ✈️ Handle Flight Search ===
  const handleFlightSearch = async () => {
    const { origin, destination, date, returnDate, passengers, travelClass } =
      flightForm;
    if (!origin || !destination || !date) {
      alert("Please fill in all flight fields");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        origin,
        destination,
        date,
        returnDate,
        adults: passengers,
        travelClass,
        tripType: tripType === "round" ? "ROUNDTRIP" : "ONEWAY",
      });
      const res = await fetch(
        `https://view-trip-travels-app.onrender.com/api/flight-offers?${params}`
      );
      const data = await res.json();
      setFlightResults(data || []);
    } catch (e) {
      console.error(e);
      alert("Flight search failed");
    } finally {
      setLoading(false);
    }
  };

  // === 🏨 Handle Hotel Search ===
  const handleHotelSearch = async () => {
    const { destination, checkInDate, checkOutDate, guests } = hotelForm;
    if (!destination || !checkInDate || !checkOutDate) {
      alert("Please fill in all hotel fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://view-trip-travels-app.onrender.com/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityCode: destination.slice(0, 3).toUpperCase(),
          checkInDate,
          checkOutDate,
          adults: guests,
        }),
      });
      const data = await res.json();
      setHotelResults(data.data || []);
    } catch (e) {
      console.error(e);
      alert("Hotel search failed");
    } finally {
      setLoading(false);
    }
  };

  // === 🧾 Handle Booking Submit ===
  const handleBookFlight = async () => {
    if (!passenger.fullName || !passenger.email || !selectedFlight) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://view-trip-travels-app.onrender.com/api/book-flight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flight: selectedFlight, passenger }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.bookingId);
        setSelectedFlight(null);
      } else {
        alert("Booking failed");
      }
    } catch (e) {
      console.error(e);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* === HERO SECTION === */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center text-white overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              backgroundImage: `url(${destinations[currentImage].img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        {/* === MAIN BOOKING CARD === */}
        <div className="relative z-10 w-full max-w-3xl px-6 py-8 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl">
          <h1 className="text-center text-4xl font-bold mb-6 text-white">
            Plan Your Next Adventure
          </h1>

          {/* Tabs */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setTab("flights")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl shadow-md transition ${
                tab === "flights"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              <Plane className="w-5 h-5" /> Flights
            </button>
            <button
              onClick={() => setTab("hotels")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl shadow-md transition ${
                tab === "hotels"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50"
              }`}
            >
              <BedDouble className="w-5 h-5" /> Hotels
            </button>
          </div>

          {/* === FORMS === */}
          <div className="space-y-6 text-black">
            {tab === "flights" ? (
              <>
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <Plane /> Book a Flight
                </h2>
                <div className="flex gap-4 mb-4 text-white justify-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={tripType === "oneway"}
                      onChange={() => setTripType("oneway")}
                    />
                    One-way
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={tripType === "round"}
                      onChange={() => setTripType("round")}
                    />
                    Round-trip
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="input-box">
                    <MapPin className="icon" />
                    <input
                      placeholder="From (City Code e.g. LOS)"
                      value={flightForm.origin}
                      onChange={(e) =>
                        setFlightForm({
                          ...flightForm,
                          origin: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                  <div className="input-box">
                    <MapPin className="icon" />
                    <input
                      placeholder="To (City Code e.g. DXB)"
                      value={flightForm.destination}
                      onChange={(e) =>
                        setFlightForm({
                          ...flightForm,
                          destination: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                  <div className="input-box">
                    <Calendar className="icon" />
                    <input
                      type="date"
                      value={flightForm.date}
                      onChange={(e) =>
                        setFlightForm({ ...flightForm, date: e.target.value })
                      }
                    />
                  </div>
                  {tripType === "round" && (
                    <div className="input-box">
                      <Calendar className="icon" />
                      <input
                        type="date"
                        value={flightForm.returnDate}
                        onChange={(e) =>
                          setFlightForm({
                            ...flightForm,
                            returnDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                  <select
                    className="input-select"
                    value={flightForm.travelClass}
                    onChange={(e) =>
                      setFlightForm({
                        ...flightForm,
                        travelClass: e.target.value,
                      })
                    }
                  >
                    <option value="ECONOMY">Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST">First</option>
                  </select>
                  <div className="input-box">
                    <Users className="icon" />
                    <input
                      type="number"
                      min="1"
                      value={flightForm.passengers}
                      onChange={(e) =>
                        setFlightForm({
                          ...flightForm,
                          passengers: e.target.value,
                        })
                      }
                      placeholder="Passengers"
                    />
                  </div>
                </div>

                <button
                  className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
                  onClick={handleFlightSearch}
                  disabled={loading}
                >
                  {loading ? "Searching..." : (
                    <>
                      <ArrowLeftRight className="w-5 h-5" /> Search Flights
                    </>
                  )}
                </button>

                {/* ✈️ Display Flight Results */}
                {flightResults.length > 0 && (
                  <div className="grid gap-4 mt-8">
                    {flightResults.map((offer, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition"
                      >
                        <p className="font-semibold text-gray-800">
                          {offer.itineraries[0].segments[0].departure.iataCode} →{" "}
                          {offer.itineraries[0].segments.slice(-1)[0].arrival.iataCode}
                        </p>
                        <p className="text-sm text-gray-500">
                          Duration: {offer.itineraries[0].duration.replace("PT", "")}
                        </p>
                        <p className="text-blue-600 font-bold mt-2">
                          From ${offer.price.total}
                        </p>
                        <button
                          onClick={() => setSelectedFlight(offer)}
                          className="mt-3 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 🏨 Hotel Form */}
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <BedDouble /> Find a Hotel
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="input-box md:col-span-2">
                    <MapPin className="icon" />
                    <input
                      placeholder="Destination (City Code e.g. PAR)"
                      value={hotelForm.destination}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          destination: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-box">
                    <Calendar className="icon" />
                    <input
                      type="date"
                      value={hotelForm.checkInDate}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          checkInDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-box">
                    <Calendar className="icon" />
                    <input
                      type="date"
                      value={hotelForm.checkOutDate}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          checkOutDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-box">
                    <Users className="icon" />
                    <input
                      type="number"
                      min="1"
                      value={hotelForm.guests}
                      onChange={(e) =>
                        setHotelForm({ ...hotelForm, guests: e.target.value })
                      }
                      placeholder="Guests"
                    />
                  </div>
                  <div className="input-box">
                    <Briefcase className="icon" />
                    <input
                      type="number"
                      min="1"
                      value={hotelForm.rooms}
                      onChange={(e) =>
                        setHotelForm({ ...hotelForm, rooms: e.target.value })
                      }
                      placeholder="Rooms"
                    />
                  </div>
                </div>

                <button
                  className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
                  onClick={handleHotelSearch}
                  disabled={loading}
                >
                  {loading ? "Searching..." : (
                    <>
                      <ArrowLeftRight className="w-5 h-5" /> Search Hotels
                    </>
                  )}
                </button>

                {hotelResults.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    {hotelResults.map((h, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition"
                      >
                        <h3 className="text-lg font-semibold text-gray-800">
                          {h.hotel.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {h.hotel.address.cityName}, {h.hotel.address.countryCode}
                        </p>
                        {h.offers && h.offers[0] && (
                          <p className="text-blue-600 font-bold mt-2">
                            From ${h.offers[0].price.total}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* === ✈️ Booking Modal === */}
      <AnimatePresence>
        {selectedFlight && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setSelectedFlight(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              >
                <X />
              </button>

              <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
                Passenger Information
              </h2>

              <div className="space-y-3">
                <input
                  className="w-full border rounded-lg p-2"
                  placeholder="Full Name"
                  value={passenger.fullName}
                  onChange={(e) =>
                    setPassenger({ ...passenger, fullName: e.target.value })
                  }
                />
                <input
                  className="w-full border rounded-lg p-2"
                  placeholder="Email"
                  type="email"
                  value={passenger.email}
                  onChange={(e) =>
                    setPassenger({ ...passenger, email: e.target.value })
                  }
                />
                <input
                  className="w-full border rounded-lg p-2"
                  placeholder="Phone Number"
                  value={passenger.phone}
                  onChange={(e) =>
                    setPassenger({ ...passenger, phone: e.target.value })
                  }
                />
                <input
                  className="w-full border rounded-lg p-2"
                  placeholder="Passport Number"
                  value={passenger.passport}
                  onChange={(e) =>
                    setPassenger({ ...passenger, passport: e.target.value })
                  }
                />
                <input
                  className="w-full border rounded-lg p-2"
                  type="date"
                  value={passenger.birthDate}
                  onChange={(e) =>
                    setPassenger({ ...passenger, birthDate: e.target.value })
                  }
                />
                <select
                  className="w-full border rounded-lg p-2"
                  value={passenger.gender}
                  onChange={(e) =>
                    setPassenger({ ...passenger, gender: e.target.value })
                  }
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  className="w-full border rounded-lg p-2"
                  placeholder="Nationality"
                  value={passenger.nationality}
                  onChange={(e) =>
                    setPassenger({ ...passenger, nationality: e.target.value })
                  }
                />

                <button
                  onClick={handleBookFlight}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === ✅ Booking Success Popup === */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-green-600 mb-3">
                Booking Confirmed! 🎉
              </h2>
              <p className="text-gray-700 mb-2">Your booking ID:</p>
              <p className="text-blue-700 font-bold text-xl">{bookingSuccess}</p>
              <button
                onClick={() => setBookingSuccess(null)}
                className="mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        {/* Trending Hotels Section */}
      <TrendingHotels />
      {/* Tours section */}
      <Tours/>
    </div>
  );
}
