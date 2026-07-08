import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeftRight, 
  Calendar, 
  Users, 
  Briefcase,
  MapPin,
  Search,
  X,
  ChevronDown
} from "lucide-react";
import AdBanner from "../componentss/adsgoogle";

const formatDuration = (durationStr) => {
  if (!durationStr) return "";
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return durationStr;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return `${hours} ${minutes}`.trim();
};

export default function FlightOffers() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // --- Passenger Breakdown States ---
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showPaxDropdown, setShowPaxDropdown] = useState(false);

  // --- Airport Selection Modals ---
  const [airportsList, setAirportsList] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'origin' or 'destination'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOriginName, setSelectedOriginName] = useState("");
  const [selectedDestName, setSelectedDestName] = useState("");

  // --- Passenger Dynamic Form array ---
  const [passengers, setPassengers] = useState([]);

  // Load Airports Metadata
  useEffect(() => {
    axios.get("/airports.json")
      .then((res) => setAirportsList(res.data || []))
      .catch((err) => console.error("Failed to load airports file:", err));
  }, []);

  // Dynamically generate individual form slots based on the passenger selector configuration
  useEffect(() => {
    const newPaxRows = [];
    for (let i = 0; i < adults; i++) {
      newPaxRows.push({ type: "ADULT", firstName: "", lastName: "", dateOfBirth: "", gender: "MALE" });
    }
    for (let i = 0; i < children; i++) {
      newPaxRows.push({ type: "CHILD", firstName: "", lastName: "", dateOfBirth: "", gender: "MALE" });
    }
    for (let i = 0; i < infants; i++) {
      newPaxRows.push({ type: "INFANT", firstName: "", lastName: "", dateOfBirth: "", gender: "MALE" });
    }
    setPassengers(newPaxRows);
  }, [adults, children, infants]);

  const filteredAirports = airportsList.filter((item) => {
    if (!item) return false;
    const code = (item.code || item.Code || item.iata || item.IATA || "").toLowerCase();
    const city = (item.city || item.City || "").toLowerCase();
    const name = (item.name || item.Name || "").toLowerCase();
    const country = (item.country || item.Country || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      code.includes(query) || city.includes(query) || name.includes(query) || country.includes(query)
    );
  });

  const handleSearch = async (e) => {
  if (e) e.preventDefault();
  setError("");
  setLoading(true);
  setResults([]);
  setSelectedFlight(null);

  if (!origin || !destination || !date) {
    setError("Please ensure Origin, Destination, and Departure Date are selected.");
    setLoading(false);
    return;
  }

  try {
    const res = await axios.get("https://view-trip-travels-app.onrender.com/api/flight-offers", {
      params: { 
        origin: origin.toUpperCase().trim(), 
        destination: destination.toUpperCase().trim(), 
        date, 
        travelClass,
        adults,
        children: children > 0 ? children : undefined,
        infants: infants > 0 ? infants : undefined
      },
      timeout: 30000 // 30 seconds timeout limit before breaking the infinite loading state
    });
    
    if (!res.data || res.data.length === 0) {
      setError("No flights found matching your parameters.");
    } else {
      setResults(res.data);
    }
  } catch (err) {
    console.error("Search API Error Context:", err); // Log the real error to debug further
    
    const serverMessage = err.response?.data?.error || err.response?.data?.message;
    if (serverMessage) {
      setError(`Error: ${serverMessage}`);
    } else if (err.code === "ECONNABORTED") {
      setError("The request timed out. The backend server might be waking up from sleep mode. Please try clicking search again.");
    } else if (err.code === "ERR_NETWORK") {
      setError("Network Connection Failed. Backend server spinning up, please wait a moment and try again.");
    } else {
      setError("Failed to fetch flight offers. Please check your network connection.");
    }
  } finally {
    // This blocks runs absolutely every time, guaranteeing the infinite spinner stops
    setLoading(false);
  }
};
  const updatePassengerField = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    alert("Flight booking successfully initiated!");
    setShowBookingForm(false);
  };

  const totalPassengersCount = adults + children + infants;

  return (
    <div className="min-h-screen bg-slate-50 antialiased text-slate-800">
      <div className="bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 text-white text-center py-2 px-4 text-xs font-bold uppercase tracking-wide shadow-sm">
        Premium Flights Search System Engine ✈️
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* MAIN FORM PANEL */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600" />
          
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* SEARCH PANEL FILTERS */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-black rounded-lg bg-white text-blue-600 shadow-sm"
                >
                  One-Way
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* PASSENGER COUNT SELECTOR DROPDOWN */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPaxDropdown(!showPaxDropdown)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>
                      {totalPassengersCount} Traveler{totalPassengersCount > 1 ? "s" : ""} ({adults}A, {children}C, {infants}I)
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showPaxDropdown ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showPaxDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowPaxDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-64 z-20 space-y-4"
                        >
                          {/* Adults Row */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-900">Adults</p>
                              <p className="text-[10px] text-slate-400">Age 12+</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={adults <= 1}
                                onClick={() => setAdults(adults - 1)}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black disabled:opacity-40 flex items-center justify-center border border-slate-200"
                              >
                                -
                              </button>
                              <span className="text-sm font-black text-slate-800 w-4 text-center">{adults}</span>
                              <button
                                type="button"
                                onClick={() => setAdults(adults + 1)}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black flex items-center justify-center border border-slate-200"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children Row */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-900">Children</p>
                              <p className="text-[10px] text-slate-400">Age 2-11</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={children <= 0}
                                onClick={() => setChildren(children - 1)}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black disabled:opacity-40 flex items-center justify-center border border-slate-200"
                              >
                                -
                              </button>
                              <span className="text-sm font-black text-slate-800 w-4 text-center">{children}</span>
                              <button
                                type="button"
                                onClick={() => setChildren(children + 1)}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black flex items-center justify-center border border-slate-200"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Infants Row */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-900">Infants</p>
                              <p className="text-[10px] text-slate-400">Under 2</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={infants <= 0}
                                onClick={() => setInfants(infants - 1)}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black disabled:opacity-40 flex items-center justify-center border border-slate-200"
                              >
                                -
                              </button>
                              <span className="text-sm font-black text-slate-800 w-4 text-center">{infants}</span>
                              <button
                                type="button"
                                onClick={() => setInfants(infants + 1)}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-black flex items-center justify-center border border-slate-200"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setShowPaxDropdown(false)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-sm"
                            >
                              Apply
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* CABIN TYPE SELECTION */}
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-600 border-none focus:ring-0 cursor-pointer hover:text-blue-600 focus:outline-none"
                  >
                    <option value="ECONOMY">Economy Cabin</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business Class</option>
                    <option value="FIRST">First Class Luxury</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ROUTE LOCATION GRID CONFIGURATION */}
            <div className="grid grid-cols-1 md:grid-cols-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div 
                onClick={() => { setActiveModal("origin"); setSearchQuery(""); }}
                className="col-span-3 p-4 hover:bg-slate-50/50 cursor-pointer transition"
              >
                <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-500" /> From
                </p>
                <p className="text-xl font-black text-slate-900">
                  {origin || <span className="text-slate-300 font-normal">Select Origin</span>}
                </p>
                <p className="text-xs text-slate-400 mt-1 truncate font-medium">
                  {selectedOriginName || "Departure Airport Code"}
                </p>
              </div>

              <div className="hidden md:flex col-span-1 items-center justify-center bg-slate-50/30">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
                  <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                </div>
              </div>

              <div 
                onClick={() => { setActiveModal("destination"); setSearchQuery(""); }}
                className="col-span-3 p-4 hover:bg-slate-50/50 cursor-pointer transition"
              >
                <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500" /> To
                </p>
                <p className="text-xl font-black text-slate-900">
                  {destination || <span className="text-slate-300 font-normal">Select Destination</span>}
                </p>
                <p className="text-xs text-slate-400 mt-1 truncate font-medium">
                  {selectedDestName || "Arrival Airport Code"}
                </p>
              </div>
            </div>

            {/* DEPARTURE DATE ROW */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 hover:border-blue-300 transition">
              <Calendar className="w-6 h-6 text-blue-500 shrink-0" />
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Departure Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-transparent text-slate-900 font-extrabold focus:outline-none border-none p-0 [color-scheme:light]"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold p-4 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="flex-1">{error}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-base font-black rounded-2xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching Live Offers...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Flights
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RESULTS FEED MODULE */}
        <div className="mt-8 space-y-6">
          {results.length > 0 && (
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 px-1">
              Available Flight Options
              <span className="text-sm font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
                {results.length} found
              </span>
            </h3>
          )}

          {results.map((flight) => {
            const price = flight.price?.total || "0.00";
            const currency = flight.price?.currency || "NGN";
            const itineraries = flight.itineraries || [];

            return (
              <div
                key={flight.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-6">
                    {itineraries.map((itinerary, itineraryIdx) => {
                      const segments = itinerary.segments || [];
                      if (segments.length === 0) return null;

                      const firstSegment = segments[0];
                      const lastSegment = segments[segments.length - 1];
                      const carrierCode = firstSegment.carrierCode || "XX";

                      return (
                        <div
                          key={itineraryIdx}
                          className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-50"
                        >
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                              <img
                                src={`https://content.airlinecodes.co.uk/logos/${carrierCode.toUpperCase()}.png`}
                                alt={carrierCode}
                                onError={(e) => { e.target.src = "https://via.placeholder.com/50x50?text=✈️"; }}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900 text-sm">{carrierCode} Airlines</p>
                              <p className="text-[10px] uppercase font-black tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 inline-block mt-0.5">
                                Outbound Flight
                              </p>
                            </div>
                          </div>

                          <div className="flex-1 flex items-center justify-between gap-4 relative">
                            <div className="text-left">
                              <p className="text-lg font-black text-gray-900 leading-none">
                                {firstSegment.departure?.at
                                  ? new Date(firstSegment.departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                  : "--:--"}
                              </p>
                              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                {firstSegment.departure?.iataCode || "???"}
                              </p>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center px-2 max-w-[180px]">
                              <span className="text-[11px] font-extrabold text-gray-500">{formatDuration(itinerary.duration)}</span>
                              <div className="w-full flex items-center justify-center my-1.5 relative">
                                <div className="absolute left-0 right-0 h-[2px] bg-gray-200 rounded-full" />
                                <div className="w-2 h-2 rounded-full bg-blue-500 border border-white z-10 absolute left-0" />
                                <div className="w-2 h-2 rounded-full bg-orange-500 border border-white z-10 absolute right-0" />
                                <span className="text-xs z-10 bg-white px-2 rounded-full border border-gray-100 shadow-sm text-gray-400 font-bold scale-90">
                                  {segments.length - 1 === 0 ? "Direct" : `${segments.length - 1} Stop`}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium truncate">
                                Class: {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY"}
                              </span>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-black text-gray-900 leading-none">
                                {lastSegment.arrival?.at
                                  ? new Date(lastSegment.arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                  : "--:--"}
                              </p>
                              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                {lastSegment.arrival?.iataCode || "???"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* FARE CARD PRICE SUMMARY */}
                  <div className="lg:pl-6 lg:border-l lg:border-dashed lg:border-gray-200 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 min-w-[160px] pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    <div className="text-left lg:text-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Fare</p>
                      <p className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">
                        <span className="text-xs font-extrabold text-blue-600 mr-0.5">{currency}</span>
                        {parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFlight(flight);
                        setShowBookingForm(true);
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl tracking-wide shadow-md transition duration-300 active:scale-95 whitespace-nowrap"
                    >
                      Select Flight
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm bg-white p-2">
          <AdBanner />
        </div>
      </div>

      {/* AUTOCOMPLETE AIRPORT SELECTION MODAL */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  placeholder={activeModal === "origin" ? "Where are you flying from?" : "Where is your destination?"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 p-0"
                />
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 transition flex items-center justify-center text-slate-400 hover:text-slate-700 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 max-h-[400px]">
                {filteredAirports.length > 0 ? (
                  filteredAirports.map((airport, idx) => {
                    const extractedCode = airport.code || airport.Code || airport.iata || airport.IATA || "";
                    const extractedCity = airport.city || airport.City || "Unknown City";
                    const extractedName = airport.name || airport.Name || "";
                    const extractedCountry = airport.country || airport.Country || "";

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (activeModal === "origin") {
                            setOrigin(extractedCode);
                            setSelectedOriginName(`${extractedCity}${extractedCity && extractedName ? ", " : ""}${extractedName}`);
                          } else {
                            setDestination(extractedCode);
                            setSelectedDestName(`${extractedCity}${extractedCity && extractedName ? ", " : ""}${extractedName}`);
                          }
                          setActiveModal(null);
                        }}
                        className="p-4 hover:bg-blue-50/70 cursor-pointer rounded-2xl transition flex items-center justify-between group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition flex-shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 text-sm">
                              {extractedCity} <span className="text-gray-400 font-bold text-xs">({extractedCountry})</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px] font-medium">
                              {extractedName}
                            </p>
                          </div>
                        </div>
                        <span className="text-blue-600 font-black bg-blue-50 px-2.5 py-1 rounded-lg text-xs tracking-wider border border-blue-100">
                          {extractedCode || "???"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="font-bold text-sm">No airport parameters match</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PASSENGER DETAILED PRE-RESERVATION BOOKING SLOTS FORM */}
      <AnimatePresence>
        {showBookingForm && selectedFlight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Passenger Information ({passengers.length} Required)</h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Please map official passport data down below</p>
                </div>
                <button 
                  onClick={() => setShowBookingForm(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 transition flex items-center justify-center text-slate-400 hover:text-slate-700 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {passengers.map((p, idx) => (
                  <div key={idx} className="p-5 border border-slate-200 rounded-2xl space-y-4 relative bg-slate-50/40">
                    <span className="absolute -top-3 left-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] tracking-wide uppercase px-2.5 py-0.5 rounded-md shadow-sm">
                      Passenger #{idx + 1} — {p.type}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">First Name</label>
                        <input 
                          type="text" 
                          required
                          value={p.firstName}
                          onChange={(e) => updatePassengerField(idx, "firstName", e.target.value)}
                          placeholder="First Name"
                          className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Last Name</label>
                        <input 
                          type="text" 
                          required
                          value={p.lastName}
                          onChange={(e) => updatePassengerField(idx, "lastName", e.target.value)}
                          placeholder="Last Name"
                          className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Date of Birth</label>
                        <input 
                          type="date" 
                          required
                          value={p.dateOfBirth}
                          onChange={(e) => updatePassengerField(idx, "dateOfBirth", e.target.value)}
                          className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition [color-scheme:light]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Gender</label>
                        <select
                          value={p.gender}
                          onChange={(e) => updatePassengerField(idx, "gender", e.target.value)}
                          className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Estimated Total</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      <span className="text-xs text-blue-600 mr-0.5">{selectedFlight.price?.currency || "NGN"}</span>
                      {parseFloat(selectedFlight.price?.total || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    Confirm Booking Reservation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}