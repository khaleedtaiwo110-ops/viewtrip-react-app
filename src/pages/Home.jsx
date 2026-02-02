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
import AdBanner from "../componentss/adsgoogle";
import { useNavigate } from "react-router-dom";
import AirplaneLoader from "../componentss/AirplaneLoader";
import { AirportSelector } from "./AirportSelector";
import { PassengerSelector } from "./PassengerSelector";
import AdventureActivities from "./AdventureActivities";
import WhyBookWithUs from "./WhyBookWithUs";



export default function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("flights");
  const [tripType, setTripType] = useState("oneway");
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedFlight, setExpandedFlight] = useState(null);
  const [flightResults, setFlightResults] = useState([]);
  const [hotelResults, setHotelResults] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const airlineLogoUrl = (code) =>
  `https://content.airlinecodes.co.uk/logos/${code.toUpperCase()}.png` || 
  "https://via.placeholder.com/50x50?text=Logo";

  const airlineNames = {
  // Nigerian Domestic & Regional
  "P4": "Air Peace",
  "QI": "Ibom Air",
  "W3": "Arik Air",
  "N2": "Aero Contractors",
  "U5": "United Nigeria",
  "VM": "Max Air",
  "ZQ": "Azman Air",
  "OF": "Overland Airways",
  "Q9": "Green Africa",
  "VK": "ValueJet",
  "U0": "XEJet",
  "NG": "Aero Contractors",
  
  // International Carriers
  "AT": "Royal Air Maroc",
  "ET": "Ethiopian Airlines",
  "BA": "British Airways",
  "LH": "Lufthansa",
  "AF": "Air France",
  "KL": "KLM Royal Dutch",
  "EK": "Emirates",
  "QR": "Qatar Airways",
  "TK": "Turkish Airlines",
  "DL": "Delta Air Lines",
  "KQ": "Kenya Airways",
  "MS": "EgyptAir",
  "WB": "RwandAir",
  "VS": "Virgin Atlantic",
  "LY": "El Al Israel",
  };

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

    // Map API response to include a safe price
    const hotelsWithPrices = (data.data || []).map((h) => ({
      ...h,
      price: h.offers?.[0]?.price?.total || "N/A",  // ✅ Proper pricing
      images: h.hotel?.images || ["/images/default-hotel.jpg"], // fallback images
      rating: h.hotel?.rating || +(3.5 + Math.random() * 1.4).toFixed(1), // fallback rating
    }));

    setHotelResults(hotelsWithPrices);

  } catch (e) {
    console.error("Hotel search error:", e);
    alert("Hotel search failed. Check your city code or backend API.");
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

  {loading && <AirplaneLoader />}


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

    <div className="flex-1 min-w-[150px] p-4 border-r">
      <PassengerSelector
        value={flightForm.passengers}
        onChange={(v) => setFlightForm({ ...flightForm, passengers: v })}
      />
      <p className="text-sm text-gray-400">1 Traveller</p>
    </div>

    {/* ⭐ NEW — TRAVEL CLASS SELECTOR */}
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

{/* ✈️ Display Flight Results */}
{flightResults.length > 0 && (
  <div className="grid gap-6 mt-8">
    {flightResults.map((offer, i) => {
      const itineraries = offer.itineraries || [];
      if (!itineraries.length) return null;

      const isExpanded = expandedFlight === i;
      const priceInNaira = Math.round(parseFloat(offer.price?.total || 0) * 1500);
      const formattedPrice = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(priceInNaira);

      return (
        <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* === ITINERARIES SECTION (Outbound & Return) === */}
              <div className="flex-1 space-y-6">
                {itineraries.map((itinerary, itiIdx) => {
                  const segments = itinerary.segments || [];
                  const firstSegment = segments[0];
                  const lastSegment = segments[segments.length - 1];
                  const airlineCode = firstSegment.carrierCode;

                  return (
                    <div key={itiIdx} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Airline Info */}
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border p-1 shadow-sm">
                          <img
                            src={`https://content.airhex.com/content/logos/airlines/${airlineCode}.svg`}
                            alt={airlineCode}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            {itiIdx === 0 ? "Departure" : "Return"}
                          </p>
                          <p className="font-bold text-gray-900 leading-tight">
                            {airlineNames[airlineCode] || airlineCode}
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex-1 flex items-center justify-between px-4 max-w-md">
                        <div className="text-center">
                          <p className="text-xl font-bold">{firstSegment.departure.iataCode}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(firstSegment.departure.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        
                        <div className="flex-1 px-4 flex flex-col items-center">
                          <p className="text-[10px] text-gray-400 mb-1">{itinerary.duration.replace("PT", "").toLowerCase()}</p>
                          <div className="relative w-full h-[1px] bg-gray-300">
                            <div className="absolute -top-1 left-0 w-2 h-2 rounded-full border border-gray-300 bg-white"></div>
                            <Plane className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-blue-500 ${itiIdx === 1 ? 'rotate-[270deg]' : 'rotate-90'}`} />
                            <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                          <p className="text-[10px] mt-1 text-gray-500 font-medium">
                            {segments.length > 1 ? `${segments.length - 1} stop(s)` : 'Non-stop'}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xl font-bold">{lastSegment.arrival.iataCode}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(lastSegment.arrival.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* === PRICE & ACTION SECTION === */}
              <div className="lg:border-l lg:pl-8 flex flex-col items-center justify-center min-w-[180px]">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Price</p>
                <p className="text-3xl font-black text-blue-900">{formattedPrice}</p>
                
                <button
                  onClick={() => {
                    const flightDesc = `${itineraries[0].segments[0].departure.iataCode} ↔ ${itineraries[0].segments.slice(-1)[0].arrival.iataCode}`;
                    navigate(`/booking?flight=${encodeURIComponent(flightDesc)}&price=${priceInNaira}`);
                  }}
                  className="mt-4 w-full bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 shadow-md shadow-orange-200 transition-all active:scale-95"
                >
                  Book This Flight
                </button>
                
                <button 
                  onClick={() => setExpandedFlight(isExpanded ? null : i)}
                  className="mt-3 text-blue-600 text-xs font-bold hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  {isExpanded ? "Hide Details" : "View Details"}
                </button>
              </div>
            </div>

            {/* === EXPANDABLE DETAILS === */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 pt-6 border-t border-dashed border-gray-200"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Map through all itineraries for detailed path */}
                    <div className="space-y-6">
                      {itineraries.map((iti, itiIdx) => (
                        <div key={itiIdx}>
                          <p className="text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">
                            {itiIdx === 0 ? "Outbound Flight Path" : "Return Flight Path"}
                          </p>
                          {iti.segments.map((seg, idx) => (
                            <div key={idx} className="flex gap-3 mb-3 last:mb-0">
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="w-[1px] h-full bg-gray-200"></div>
                              </div>
                              <div className="text-xs">
                                <p className="font-bold text-gray-700">{seg.departure.iataCode} → {seg.arrival.iataCode}</p>
                                <p className="text-gray-400">{seg.carrierCode} {seg.number} • {seg.duration.replace("PT", "").toLowerCase()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Fare Information */}
                    <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                      <p className="text-sm font-bold text-blue-900 mb-4">Fare & Baggage</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <Briefcase className="w-5 h-5 text-blue-500" />
                          <span>Baggage: <strong>{offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity || 0} Checked Bag(s)</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <Users className="w-5 h-5 text-blue-500" />
                          <span>Cabin: <strong>{offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <span>Last Ticketing: {offer.lastTicketingDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    })}
  </div>
)}
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
      // Currency Conversion for Hotels (Rate: 1500)
      const rawPrice = parseFloat(h.offers?.[0]?.price?.total || 0);
      const priceInNaira = Math.round(rawPrice * 1500);
      const formattedHotelPrice = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(priceInNaira);

      return (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
          {/* Hotel Image with Overlay Rating */}
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

          {/* Hotel Info */}
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
                {/* ... other inputs remain the same ... */}
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
 
      <WhyBookWithUs /> 
      <TrendingHotels /> 
      <AdventureActivities />
      <Tours/>
    </div>
  </>  
  );
}