import React, { useState, useEffect } from "react";
import {
  Plane,
  BedDouble,
  ArrowLeftRight,
  MapPin,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TrendingHotels from "./TrendingHotels";
import Tours from "./Tours";
import AdBanner from "../componentss/adsgoogle";
import { useNavigate } from "react-router-dom";
import AirplaneLoader from "../componentss/AirplaneLoader";
import { AirportSelector } from "./AirportSelector";
import AdventureActivities from "./AdventureActivities";
import WhyBookWithUs from "./WhyBookWithUs";

export default function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("flights");
  const [tripType, setTripType] = useState("oneway");
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hotelResults, setHotelResults] = useState([]);

  // Flight Form States (Updated passengers to structured object)
  const [flightForm, setFlightForm] = useState({
    origin: "",
    destination: "",
    date: "",
    returnDate: "",
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    travelClass: "ECONOMY",
    originLabel: "",
    destinationLabel: "",
  });

  // State to control visibility of custom passenger popup menu
  const [showHomePaxDropdown, setShowHomePaxDropdown] = useState(false);

  const [hotelForm, setHotelForm] = useState({
    destination: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    rooms: 1,
  });

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
      img: " /images/hotel8.jpg ",
      title: "Dubai, UAE",
    },
    {
      img: " /images/hotel7.avif ",
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

  // === ✈️ Handle Flight Search (Redirect with Full Breakdown State) ===
  const handleFlightSearch = () => {
    const { origin, destination, date, returnDate, passengers, travelClass } = flightForm;
    if (!origin || !destination || !date) {
      alert("Please fill in all flight fields");
      return;
    }

    // Automatically navigate to search results page and pass fields down inside location state
    navigate("/flight-offers", {
      state: {
        origin,
        destination,
        date,
        returnDate: tripType === "round" ? returnDate : undefined,
        adults: passengers.adults,
        children: passengers.children,
        infants: passengers.infants,
        travelClass,
        tripType: tripType === "round" ? "ROUNDTRIP" : "ONEWAY",
      },
    });
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
      const params = new URLSearchParams({
        cityCode: destination.slice(0, 3).toUpperCase(),
        checkInDate,
        checkOutDate,
        adults: guests,
      });

      const res = await fetch(`https://view-trip-travels-app.onrender.com/api/hotels?${params}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      const hotelsWithPrices = (data.data || []).map((h) => ({
        ...h,
        price: h.offers?.[0]?.price?.total || "N/A",
        images: h.hotel?.images || ["/images/default-hotel.jpg"],
        rating: h.hotel?.rating || +(3.5 + Math.random() * 1.4).toFixed(1),
      }));

      setHotelResults(hotelsWithPrices);

    } catch (e) {
      console.error("Hotel search error:", e);
      alert("Hotel search failed. Check your city code or backend API.");
    } finally {
      setLoading(false);
    }
  };

  const totalPassengers = flightForm.passengers.adults + flightForm.passengers.children + flightForm.passengers.infants;

  return (
    <>
      {loading && <AirplaneLoader />}

      <div className="flex flex-col items-center">
        {/* === HERO SECTION === */}
        <div className="relative w-full h-screen pt-36 flex flex-col items-center justify-center text-white overflow-hidden ">

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
          <div className="relative z-10 w-full min-h-screen px-6 py-8 overflow-y-auto"> 
            <h1 className="text-center text-4xl font-bold mb-6 text-white">
              Find Your Best Holiday
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
            <div className="space-y-6 text-black w-full h-full overflow-auto"> 
              {tab === "flights" ? (
                <>
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <Plane /> Book a Flight
                  </h2>

                  {/* Trip Type Selector */}
                  <div className="flex justify-center gap-4 mb-4">
                    {["oneway", "round"].map((type) => (
                      <label
                        key={type}
                        className={`cursor-pointer px-4 py-2 rounded-xl font-medium transition 
                          ${tripType === type ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50"}`}
                      >
                        <input
                          type="radio"
                          value={type}
                          checked={tripType === type}
                          onChange={() => setTripType(type)}
                          className="hidden"
                        />
                        {type === "oneway" ? "One-way" : "Round-trip"}
                      </label>
                    ))}
                  </div>

                  {/* === FULL FLIGHT FORM === */}     
                  <div className="bg-white rounded-3xl shadow-xl p-6 mt-6">
                    <div className="flex flex-wrap items-center justify-between border rounded-2xl">

                      <div className="flex-1 min-w-[220px] p-4 border-r">
                        <AirportSelector
                          label="From"
                          value={flightForm.origin}
                          placeholder="LOS"
                          onChange={(iata, labelText) => setFlightForm({...flightForm, origin: iata, originLabel: labelText})}
                          airportsUrl="/airports.json"
                        />
                        <p className="text-sm text-gray-400">{flightForm.originLabel || ""}</p>
                      </div>

                      <div className="p-4 flex items-center justify-center border-r">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-[220px] p-4 border-r">
                        <AirportSelector
                          label="To"
                          value={flightForm.destination}
                          placeholder="DXB"
                          onChange={(iata, labelText) =>
                            setFlightForm({ ...flightForm, destination: iata, destinationLabel: labelText })
                          }
                          airportsUrl="/airports.json"
                        />
                        <p className="text-sm text-gray-400">{flightForm.destinationLabel || ""}</p>
                      </div>

                      <div className="flex-1 min-w-[180px] p-4 border-r">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Departure</p>
                        <input
                          type="date"
                          value={flightForm.date}
                          onChange={(e) => setFlightForm({ ...flightForm, date: e.target.value })}
                          className="text-2xl font-bold text-gray-900 w-full bg-transparent outline-none"
                        />
                        <p className="text-sm text-gray-400">
                          {flightForm.date ? new Date(flightForm.date).toDateString() : ""}
                        </p>
                      </div>

                      {tripType === "round" && (
                        <div className="flex-1 min-w-[180px] p-4 border-r">
                          <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Return</p>
                          <input
                            type="date"
                            value={flightForm.returnDate}
                            onChange={(e) =>
                              setFlightForm({ ...flightForm, returnDate: e.target.value })
                            }
                            className="text-2xl font-bold text-gray-900 w-full bg-transparent outline-none"
                          />
                          <p className="text-sm text-gray-400">
                            {flightForm.returnDate ? new Date(flightForm.returnDate).toDateString() : ""}
                          </p>
                        </div>
                      )}

                      {/* Customized Passenger Component Breakdown UI Section */}
                      <div className="flex-1 min-w-[180px] p-4 border-r relative">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Travellers</p>
                        <button
                          type="button"
                          onClick={() => setShowHomePaxDropdown(!showHomePaxDropdown)}
                          className="text-2xl font-bold text-gray-900 w-full text-left bg-transparent outline-none flex items-center justify-between"
                        >
                          <span>{totalPassengers} {totalPassengers > 1 ? "Travellers" : "Traveller"}</span>
                        </button>
                        <p className="text-sm text-gray-400">
                          {flightForm.passengers.adults}A, {flightForm.passengers.children}C, {flightForm.passengers.infants}I
                        </p>

                        <AnimatePresence>
                          {showHomePaxDropdown && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setShowHomePaxDropdown(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 z-30 space-y-4 text-sm text-gray-800"
                              >
                                {/* Adults */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">Adults</p>
                                    <p className="text-[11px] text-gray-400">Age 12+</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      type="button" 
                                      disabled={flightForm.passengers.adults <= 1} 
                                      onClick={() => setFlightForm({
                                        ...flightForm, 
                                        passengers: { ...flightForm.passengers, adults: flightForm.passengers.adults - 1 }
                                      })} 
                                      className="w-7 h-7 bg-gray-100 rounded-lg font-bold disabled:opacity-50"
                                    >-</button>
                                    <span className="font-bold w-4 text-center">{flightForm.passengers.adults}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setFlightForm({
                                        ...flightForm, 
                                        passengers: { ...flightForm.passengers, adults: flightForm.passengers.adults + 1 }
                                      })} 
                                      className="w-7 h-7 bg-gray-100 rounded-lg font-bold"
                                    >+</button>
                                  </div>
                                </div>

                                {/* Children */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">Children</p>
                                    <p className="text-[11px] text-gray-400">Age 2-11</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      type="button" 
                                      disabled={flightForm.passengers.children <= 0} 
                                      onClick={() => setFlightForm({
                                        ...flightForm, 
                                        passengers: { ...flightForm.passengers, children: flightForm.passengers.children - 1 }
                                      })} 
                                      className="w-7 h-7 bg-gray-100 rounded-lg font-bold disabled:opacity-50"
                                    >-</button>
                                    <span className="font-bold w-4 text-center">{flightForm.passengers.children}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setFlightForm({
                                        ...flightForm, 
                                        passengers: { ...flightForm.passengers, children: flightForm.passengers.children + 1 }
                                      })} 
                                      className="w-7 h-7 bg-gray-100 rounded-lg font-bold"
                                    >+</button>
                                  </div>
                                </div>

                                {/* Infants */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">Infants</p>
                                    <p className="text-[11px] text-gray-400">Under 2</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      type="button" 
                                      disabled={flightForm.passengers.infants <= 0} 
                                      onClick={() => setFlightForm({
                                        ...flightForm, 
                                        passengers: { ...flightForm.passengers, infants: flightForm.passengers.infants - 1 }
                                      })} 
                                      className="w-7 h-7 bg-gray-100 rounded-lg font-bold disabled:opacity-50"
                                    >-</button>
                                    <span className="font-bold w-4 text-center">{flightForm.passengers.infants}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setFlightForm({
                                        ...flightForm, 
                                        passengers: { ...flightForm.passengers, infants: flightForm.passengers.infants + 1 }
                                      })} 
                                      className="w-7 h-7 bg-gray-100 rounded-lg font-bold"
                                    >+</button>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100 flex justify-end">
                                  <button type="button" onClick={() => setShowHomePaxDropdown(false)} className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow hover:bg-blue-700 transition">
                                    Apply
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex-1 min-w-[180px] p-4">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Class</p>
                        <select
                          value={flightForm.travelClass}
                          onChange={(e) =>
                            setFlightForm({ ...flightForm, travelClass: e.target.value })
                          }
                          className="text-lg font-bold text-gray-900 w-full bg-transparent outline-none"
                        >
                          <option value="ECONOMY">Economy</option>
                          <option value="PREMIUM_ECONOMY">Premium Economy</option>
                          <option value="BUSINESS">Business</option>
                          <option value="FIRST">First</option>
                        </select>
                      </div>

                    </div>

                    <div className="flex justify-center mt-6">
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg"
                        onClick={handleFlightSearch}
                      >
                        SEARCH
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 🏨 Hotel Form */}
                  <div className="bg-white rounded-3xl shadow-xl p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BedDouble className="text-blue-600" /> Find a Hotel
                    </h2>

                    <div className="flex flex-wrap items-center justify-between border rounded-2xl overflow-hidden">
                      {/* DESTINATION */}
                      <div className="flex-1 min-w-[260px] p-4 border-r">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Destination</p>
                        <input
                          placeholder="City (e.g. Dubai)"
                          value={hotelForm.destination}
                          onChange={(e) => setHotelForm({ ...hotelForm, destination: e.target.value })}
                          className="text-2xl font-bold text-gray-900 w-full bg-transparent outline-none"
                        />
                        <p className="text-sm text-gray-400">Where do you want to stay?</p>
                      </div>

                      {/* CHECK-IN DATE */}
                      <div className="flex-1 min-w-[200px] p-4 border-r">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Check-in</p>
                        <input
                          type="date"
                          value={hotelForm.checkInDate}
                          onChange={(e) => setHotelForm({ ...hotelForm, checkInDate: e.target.value })}
                          className="text-2xl font-bold text-gray-900 w-full bg-transparent outline-none"
                        />
                        <p className="text-sm text-gray-400">
                          {hotelForm.checkInDate ? new Date(hotelForm.checkInDate).toDateString() : ""}
                        </p>
                      </div>

                      {/* CHECK-OUT DATE */}
                      <div className="flex-1 min-w-[200px] p-4 border-r">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Check-out</p>
                        <input
                          type="date"
                          value={hotelForm.checkOutDate}
                          onChange={(e) => setHotelForm({ ...hotelForm, checkOutDate: e.target.value })}
                          className="text-2xl font-bold text-gray-900 w-full bg-transparent outline-none"
                        />
                        <p className="text-sm text-gray-400">
                          {hotelForm.checkOutDate ? new Date(hotelForm.checkOutDate).toDateString() : ""}
                        </p>
                      </div>

                      {/* GUESTS */}
                      <div className="flex-1 min-w-40 p-4 border-r">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Guests</p>
                        <div className="text-2xl font-bold text-gray-900">
                          {hotelForm.guests} {hotelForm.guests > 1 ? "Guests" : "Guest"}
                        </div>
                        <p className="text-sm text-gray-400">Adults only</p>
                      </div>

                      {/* ROOMS */}
                      <div className="flex-1 min-w-40 p-4">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Rooms</p>
                        <div className="text-2xl font-bold text-gray-900">
                          {hotelForm.rooms} {hotelForm.rooms > 1 ? "Rooms" : "Room"}
                        </div>
                        <p className="text-sm text-gray-400">Total rooms</p>
                      </div>
                    </div>

                    {/* SEARCH BUTTON */}
                    <div className="flex justify-center mt-6">
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg"
                        onClick={handleHotelSearch}
                      >
                        SEARCH HOTELS
                      </button>
                    </div>
                  </div>

                  {/* 🏨 Display Hotel Results */}
                  {hotelResults.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 w-full max-w-7xl">
                      {hotelResults.map((h, i) => {
                        const rawPrice = parseFloat(h.offers?.[0]?.price?.total || 0);
                        const priceInNaira = Math.round(rawPrice * 1500);
                        const formattedHotelPrice = new Intl.NumberFormat('en-NG', {
                          style: 'currency',
                          currency: 'NGN',
                          maximumFractionDigits: 0,
                        }).format(priceInNaira);

                        return (
                          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
                            <div className="relative h-56">
                              <img
                                src={h.hotel?.media?.[0]?.uri || "/images/default-hotel.jpg"}
                                alt={h.hotel?.name}
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target.src = "/images/default-hotel.jpg")}
                              />
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <span className="text-orange-500 font-bold">★</span>
                                <span className="text-sm font-bold text-gray-800">{h.rating || "4.2"}</span>
                              </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                              <h3 className="text-xl font-bold text-gray-800 line-clamp-1 capitalize">
                                {h.hotel?.name?.toLowerCase() || "Premium Stay"}
                              </h3>
                              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {h.hotel?.address?.cityName}, {h.hotel?.address?.countryCode}
                              </p>

                              <div className="mt-auto pt-6 flex items-end justify-between">
                                <div>
                                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Price per night</p>
                                  <p className="text-2xl font-black text-blue-900">{priceInNaira > 0 ? formattedHotelPrice : "Check Price"}</p>
                                </div>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/booking?hotel=${encodeURIComponent(h.hotel?.name || "")}&checkIn=${hotelForm.checkInDate}&checkOut=${hotelForm.checkOutDate}&guests=${hotelForm.guests}&price=${priceInNaira}`
                                    )
                                  }
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition shadow-md active:scale-95"
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <WhyBookWithUs /> 
        <TrendingHotels /> 
        <AdventureActivities />
        <Tours/>
      </div>
    </>  
  );
}