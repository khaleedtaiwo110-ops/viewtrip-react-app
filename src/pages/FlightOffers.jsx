import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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
  ChevronDown,
  AlertCircle,
  Luggage,
  Receipt,
  Plane,
  Clock,
  ShieldCheck
} from "lucide-react";

// Helper dictionary to convert common carrier codes to Airline Names
const getAirlineName = (code) => {
  if (!code) return "GDS Carrier";
  const dictionary = {
    "EK": "Emirates",
    "QR": "Qatar Airways",
    "TK": "Turkish Airlines",
    "LH": "Lufthansa",
    "BA": "British Airways",
    "AF": "Air France",
    "MS": "EgyptAir",
    "ET": "Ethiopian Airlines",
    "AT": "Royal Air Maroc",
    "WB": "RwandAir",
    "KQ": "Kenya Airways",
    "P4": "Air Peace",
    "DL": "Delta Air Lines",
    "UA": "United Airlines",
    "AA": "American Airlines",
    "KL": "KLM Royal Dutch Airlines",
    "WY": "Oman Air",
    "EY": "Etihad Airways",
    "SV": "Saudia",
    "VS": "Virgin Atlantic"
  };
  return dictionary[code.toUpperCase().trim()] || `Airline (${code})`;
};

// Helper to retrieve airline logo icon from a reliable CDN
const getAirlineLogo = (code) => {
  if (!code) return "https://images.kiwi.com/airlines/64/default.png";
  return `https://assets.duffel.com/img/airlines/for-floor/sq/${code.toUpperCase().trim()}.png`;
};

const formatDuration = (durationStr) => {
  if (!durationStr) return "N/A";
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return durationStr;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return `${hours} ${minutes}`.trim();
};

export default function FlightOffers() {
  const location = useLocation();
  const hasAutoSearched = useRef(false);
  const [tripType, setTripType] = useState("oneway"); // "oneway" or "return"
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [results, setResults] = useState(null);
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
  const [activeModal, setActiveModal] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOriginName, setSelectedOriginName] = useState("");
  const [selectedDestName, setSelectedDestName] = useState("");

  // --- Passenger Dynamic Form array ---
  const [passengers, setPassengers] = useState([]);

  // === 🔄 AUTOMATIC HOME SEARCH INTERCEPTOR ===
  useEffect(() => {
    if (location.state && !hasAutoSearched.current) {
      const {
        origin: homeOrigin,
        destination: homeDestination,
        date: homeDate,
        returnDate: homeReturnDate,
        adults: homeAdults,
        children: homeChildren,
        infants: homeInfants,
        travelClass: homeClass,
      } = location.state;
      
      if (homeOrigin) setOrigin(homeOrigin);
      if (homeDestination) setDestination(homeDestination);
      if (homeDate) setDate(homeDate);
      if (homeReturnDate) {
        setReturnDate(homeReturnDate);
        setTripType("return");
      }
      
      const initialAdults = homeAdults !== undefined ? Number(homeAdults) : 1;
      const initialChildren = homeChildren !== undefined ? Number(homeChildren) : 0;
      const initialInfants = homeInfants !== undefined ? Number(homeInfants) : 0;

      setAdults(initialAdults);
      setChildren(initialChildren);
      setInfants(initialInfants);
      if (homeClass) setTravelClass(homeClass);

      hasAutoSearched.current = true;

      const triggerAutoSearch = async () => {
        setError("");
        setLoading(true);
        setResults(null);
        setSelectedFlight(null);

        try {
          const params = { 
            origin: homeOrigin.toUpperCase().trim(), 
            destination: homeDestination.toUpperCase().trim(), 
            date: homeDate, 
            travelClass: homeClass || "ECONOMY",
            adults: initialAdults,
            children: initialChildren > 0 ? initialChildren : undefined,
            infants: initialInfants > 0 ? initialInfants : undefined,
            tripType: homeReturnDate ? "return" : "oneway"
          };

          if (homeReturnDate) {
            params.returnDate = homeReturnDate;
          }

          const res = await axios.get("https://view-trip-travels-app.onrender.com/api/flight-offers", {
            params,
            timeout: 60000
          });
          
          setResults(res.data);
        } catch (err) {
          console.error("Flight search error details:", err);
          const serverMessage = err.response?.data?.error || err.response?.data?.message;
          
          if (serverMessage) {
            setError(`Error: ${typeof serverMessage === 'object' ? JSON.stringify(serverMessage) : serverMessage}`);
          } else if (err.code === "ECONNABORTED") {
            setError("The server timed out. It might still be waking up, please try running the search loop one more time.");
          } else if (err.code === "ERR_NETWORK") {
            setError("Network Connection Failed. Backend server spinning up, please wait a moment and try again.");
          } else {
            setError("Failed to fetch flight offers. Please check your connection and try again.");
          }
        } finally {
          setLoading(false);
        }
      };

      if (homeOrigin && homeDestination && homeDate) {
        triggerAutoSearch();
      }
    }
  }, [location.state]);

  // Load Airports Metadata
  useEffect(() => {
    axios.get("/airports.json")
      .then((res) => setAirportsList(res.data || []))
      .catch((err) => console.error("Failed to load airports file:", err));
  }, []);

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
    setResults(null);
    setSelectedFlight(null);

    if (!origin || !destination || !date) {
      setError("Please ensure Origin, Destination, and Departure Date are selected.");
      setLoading(false);
      return;
    }

    if (tripType === "return" && !returnDate) {
      setError("Please select a return date for round-trip travel.");
      setLoading(false);
      return;
    }

    try {
      const params = { 
        origin: origin.toUpperCase().trim(), 
        destination: destination.toUpperCase().trim(), 
        date, 
        travelClass,
        adults,
        children: children > 0 ? children : undefined,
        infants: infants > 0 ? infants : undefined,
        tripType
      };

      if (tripType === "return" && returnDate) {
        params.returnDate = returnDate;
      }

      const res = await axios.get("https://view-trip-travels-app.onrender.com/api/flight-offers", {
        params,
        timeout: 60000
      });
      
      // Ensure we replace results cleanly with incoming data array/object
      setResults(res.data);
    } catch (err) {
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      if (serverMessage) {
        setError(`Error: ${typeof serverMessage === 'object' ? JSON.stringify(serverMessage) : serverMessage}`);
      } else if (err.code === "ECONNABORTED") {
        setError("The server timed out. It might still be waking up, please try running the search loop one more time.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Network Connection Failed. Backend server spinning up, please wait a moment and try again.");
      } else {
        setError("Failed to fetch flight offers. Please check your connection and try again.");
      }
    } finally {
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
    try {
      const payload = {
        flight: selectedFlight,
        passenger: passengers
      };
      const res = await axios.post("https://view-trip-travels-app.onrender.com/api/book-flight", payload);
      if (res.data.success) {
        alert("Flight booking payload verified and ready for GDS ticket issuance!");
        setShowBookingForm(false);
      }
    } catch (err) {
      alert("Booking transmission failed.");
    }
  };

  const totalPassengersCount = adults + children + infants;
  const flightList = Array.isArray(results?.offers) ? results.offers : (Array.isArray(results) ? results : []);

  return (
    <div className="min-h-screen bg-slate-100/70 antialiased text-slate-800">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white text-center py-2.5 px-4 text-xs font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2">
        <Plane className="w-4 h-4 text-orange-400" /> Viewtrip Travels GDS Corporate Matrix Engine ✈️
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* MAIN SEARCH PANEL */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500" />
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setTripType("oneway")}
                  className={`px-4 py-2 text-xs font-black rounded-lg transition ${tripType === "oneway" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  One-Way
                </button>
                <button 
                  type="button" 
                  onClick={() => setTripType("return")}
                  className={`px-4 py-2 text-xs font-black rounded-lg transition ${tripType === "return" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Round-Trip
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPaxDropdown(!showPaxDropdown)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition"
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>
                      {totalPassengersCount} Traveler{totalPassengersCount > 1 ? "s" : ""} ({adults}A{children > 0 ? `, ${children}C` : ""}{infants > 0 ? `, ${infants}I` : ""})
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
                          className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-64 z-20 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-900">Adults</p>
                              <p className="text-[10px] text-slate-400">Age 12+</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" disabled={adults <= 1} onClick={() => setAdults(adults - 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200 disabled:opacity-40">-</button>
                              <span className="text-sm font-black text-slate-800 w-4 text-center">{adults}</span>
                              <button type="button" onClick={() => setAdults(adults + 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200">+</button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-900">Children</p>
                              <p className="text-[10px] text-slate-400">Age 2-11</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" disabled={children <= 0} onClick={() => setChildren(children - 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200 disabled:opacity-40">-</button>
                              <span className="text-sm font-black text-slate-800 w-4 text-center">{children}</span>
                              <button type="button" onClick={() => setChildren(children + 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200">+</button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-900">Infants</p>
                              <p className="text-[10px] text-slate-400">Under 2</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" disabled={infants <= 0} onClick={() => setInfants(infants - 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200 disabled:opacity-40">-</button>
                              <span className="text-sm font-black text-slate-800 w-4 text-center">{infants}</span>
                              <button type="button" onClick={() => setInfants(infants + 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200">+</button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button type="button" onClick={() => setShowPaxDropdown(false)} className="px-3.5 py-1.5 bg-blue-600 text-white font-bold text-[11px] rounded-lg">Apply</button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 border-none focus:outline-none cursor-pointer"
                  >
                    <option value="ECONOMY">Economy Cabin</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business Class</option>
                    <option value="FIRST">First Class Luxury</option>
                  </select>
                </div>
              </div>
            </div>

            {/* FLIGHT STATIONS & DATES SELECTOR GRIDS */}
            <div className={`grid grid-cols-1 ${tripType === "return" ? "lg:grid-cols-12" : "lg:grid-cols-11"} gap-4 items-center`}>
              <div 
                onClick={() => setActiveModal("origin")}
                className={`${tripType === "return" ? "lg:col-span-3" : "lg:col-span-4"} border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-500 transition bg-slate-50/70 relative group`}
              >
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Departure From</label>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 group-hover:scale-110 transition" />
                  <div>
                    <div className="text-xl font-black text-slate-900 tracking-tight">
                      {origin || "Select Airport"}
                    </div>
                    <div className="text-xs font-bold text-slate-400 truncate max-w-[180px]">
                      {selectedOriginName || "Where are you flying from?"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:col-span-1">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    const tempCode = origin;
                    const tempName = selectedOriginName;
                    setOrigin(destination);
                    setSelectedOriginName(selectedDestName);
                    setDestination(tempCode);
                    setSelectedDestName(tempName);
                  }}
                  className="w-10 h-10 rounded-full border border-slate-200 shadow-md bg-white hover:bg-slate-50 flex items-center justify-center text-blue-600 transition transform active:rotate-180 hover:scale-105"
                  title="Swap Origin & Destination"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div
                onClick={() => setActiveModal("destination")}
                className={`${tripType === "return" ? "lg:col-span-3" : "lg:col-span-4"} border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-500 transition bg-slate-50/70 relative group`}
              >
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Destination To</label>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 shrink-0 group-hover:scale-110 transition" />
                  <div>
                    <div className="text-xl font-black text-slate-900 tracking-tight">
                      {destination || "Select Airport"}
                    </div>
                    <div className="text-xs font-bold text-slate-400 truncate max-w-[180px]">
                      {selectedDestName || "Where are you going?"}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${tripType === "return" ? "lg:col-span-2" : "lg:col-span-3"} border border-slate-200 rounded-2xl p-4 bg-slate-50/70`}>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Departure Date</label>
                <div className="flex items-center gap-2 relative">
                  <Calendar className="w-4 h-4 text-purple-600 shrink-0 pointer-events-none" />
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-slate-900 font-black text-xs border-none focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {tripType === "return" && (
                <div className="lg:col-span-2 border border-blue-200 rounded-2xl p-4 bg-blue-50/50">
                  <label className="block text-[10px] font-black uppercase text-blue-600 mb-1">Return Date</label>
                  <div className="flex items-center gap-2 relative">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0 pointer-events-none" />
                    <input 
                      type="date"
                      required={tripType === "return"}
                      min={date || undefined}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-transparent text-slate-900 font-black text-xs border-none focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loading ? "Searching Live GDS..." : "Search Flight Offers"}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-red-900">Search Interrupted</h4>
              <p className="text-xs font-bold text-red-700 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* --- KAYAK-INSPIRED PREMIUM RESULT CARDS MATRIX --- */}
        <div className="mt-10 space-y-6">
          {flightList.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black text-slate-900">Available Flights Match Matrix</h3>
              <span className="text-xs font-black uppercase px-3 py-1 bg-blue-100 text-blue-700 rounded-full tracking-wider">
                {flightList.length} Offer{flightList.length > 1 ? "s" : ""} Found
              </span>
            </div>
          )}
          
          {results === null ? (
            loading ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-600">Querying Travelport GDS live data feeds...</p>
              </div>
            ) : null
          ) : flightList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-slate-500 font-medium">
              No live flight offers found matching your criteria. Try adjusting your dates or airports.
            </div>
          ) : (
            <div className="space-y-4">
              {flightList.map((flight, idx) => {
                const formattedPrice = flight?.price?.formatted || `${flight?.price?.currency || 'USD'} ${flight?.price?.total || '0.00'}`;
                const rawTotal = flight?.price?.total;
                const baseTotalNum = rawTotal ? Number(rawTotal) : 485;
                const perPersonNum = adults > 0 ? Math.round(baseTotalNum / adults) : baseTotalNum;
                const currencyCode = flight?.price?.currency || 'USD';
                
                const formattedPerPerson = `${currencyCode} ${perPersonNum.toLocaleString()}`;
                const carrierCode = flight?.airline || "GDS";
                const airlineTitle = getAirlineName(carrierCode);
                const logoUrl = getAirlineLogo(carrierCode);
                
                const firstFlight = flight?.flights?.[0] || {};
                const depTime = firstFlight.departure?.time || "07:05";
                const depAirport = firstFlight.departure?.airport || origin || "LOS";
                
                const lastFlight = flight?.flights?.[flight.flights.length - 1] || {};
                const arrTime = lastFlight.arrival?.time || "18:30";
                const arrAirport = lastFlight.arrival?.airport || destination || "LON";
                
                const stopsCount = flight?.stops ?? 0;
                const durationFormatted = formatDuration(flight?.duration || "PT8H");
                const cabinClass = flight?.fare?.products?.[0]?.cabin || travelClass;

                return (
                  <motion.div
                    key={flight?.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-3xl border-2 border-slate-200/90 hover:border-blue-500 shadow-md hover:shadow-2xl transition-all duration-300 p-5 md:p-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 group relative overflow-hidden"
                  >
                    {/* Left Color Accent Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-600 via-indigo-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Flight Info & Timeline Section */}
                    <div className="flex-1 space-y-4">
                      
                      {/* Airline Header & Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Airline Logo Box */}
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            <img 
                              src={logoUrl} 
                              alt={airlineTitle}
                              className="w-full h-full object-contain rounded-xl"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.kiwi.com/airlines/64/default.png";
                              }}
                            />
                          </div>

                          <div>
                            <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                              {airlineTitle}
                              <span className="text-[11px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                {carrierCode}
                              </span>
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mt-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Offer ID: #{flight?.id || idx + 1}</span>
                              <span>•</span>
                              <span className="text-blue-700 font-extrabold uppercase">{cabinClass}</span>
                            </div>
                          </div>
                        </div>

                        {/* Fare Brand / Tag */}
                        <span className="text-[10px] font-black uppercase px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full tracking-wider shadow-sm">
                          {flight?.fare?.brandName || "Standard Corporate Fare"}
                        </span>
                      </div>

                      {/* Flight Schedule Bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 py-3 px-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                        {/* Departure */}
                        <div className="space-y-0.5">
                          <div className="text-xl font-black text-slate-900 tracking-tight">
                            {depTime}
                          </div>
                          <div className="text-xs font-black text-slate-500 uppercase">
                            {depAirport} <span className="text-[10px] text-slate-400 font-bold">(Departure)</span>
                          </div>
                        </div>

                        {/* Flight Visual Timeline */}
                        <div className="space-y-1 text-center flex flex-col items-center">
                          <div className="text-[11px] font-black text-slate-700 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" /> {durationFormatted}
                          </div>
                          
                          <div className="w-full flex items-center gap-1 my-1 px-2">
                            <div className="h-[2px] flex-1 bg-slate-300 rounded-full" />
                            <Plane className="w-4 h-4 text-blue-600 shrink-0 transform rotate-90" />
                            <div className="h-[2px] flex-1 bg-slate-300 rounded-full" />
                          </div>

                          <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${stopsCount === 0 ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"}`}>
                            {stopsCount === 0 ? "Direct Flight" : `${stopsCount} Stop(s)`}
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="space-y-0.5 sm:text-right">
                          <div className="text-xl font-black text-slate-900 tracking-tight">
                            {arrTime}
                          </div>
                          <div className="text-xs font-black text-slate-500 uppercase">
                            {arrAirport} <span className="text-[10px] text-slate-400 font-bold">(Arrival)</span>
                          </div>
                        </div>
                      </div>

                      {/* Key Inclusions Footer */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-600 pt-1">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <Luggage className="w-3.5 h-3.5 text-blue-600" /> 1 Checked Bag Included
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                          ✓ Instant GDS Ticketing
                        </span>
                      </div>
                    </div>

                    {/* Pricing & CTA Action Column */}
                    <div className="w-full lg:w-48 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 lg:pl-6 lg:border-l-2 border-slate-100 shrink-0">
                      <div className="text-left lg:text-right">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Total ({totalPassengersCount} Pax)
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          {formattedPrice}
                        </div>
                        <div className="text-[11px] font-extrabold text-emerald-600 mt-0.5">
                          {formattedPerPerson} / person
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedFlight(flight);
                          setShowBookingForm(true);
                        }}
                        className="w-auto lg:w-full px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-orange-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span>Select Deal</span>
                        <Plane className="w-3.5 h-3.5 rotate-45" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AIRPORT SELECTOR MODAL */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Select {activeModal === "origin" ? "Departure Base" : "Arrival Base"}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search by city, name, country or airport code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
                {filteredAirports.length > 0 ? (
                  filteredAirports.map((airport, index) => {
                    const code = airport.code || airport.Code || airport.iata || airport.IATA || "";
                    const name = airport.name || airport.Name || "";
                    const city = airport.city || airport.City || "";
                    const country = airport.country || airport.Country || "";

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (activeModal === "origin") {
                            setOrigin(code);
                            setSelectedOriginName(`${city} (${name})`);
                          } else {
                            setDestination(code);
                            setSelectedDestName(`${city} (${name})`);
                          }
                          setSearchQuery("");
                          setActiveModal(null);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 flex items-center justify-between transition group"
                      >
                        <div className="max-w-[80%]">
                          <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition">{city}, {country}</p>
                          <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">{name}</p>
                        </div>
                        <span className="text-xs font-black px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition uppercase tracking-wider">{code}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs font-bold text-slate-400">No airport metrics match your query keyword.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC PASSENGER METADATA FILL & DETAILED FLIGHT MATRIX BOOKING MODAL */}
      <AnimatePresence>
        {showBookingForm && selectedFlight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBookingForm(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden z-10 flex flex-col my-8 max-h-[90vh]"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Review Flight Details & Manifest</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Please check allowance metrics and enter official credentials below.</p>
                </div>
                <button onClick={() => setShowBookingForm(false)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. COMPREHENSIVE JOURNEY BREAKDOWN CARD */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
                  <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                    ✈️ Offering Reference: {selectedFlight.id}
                  </h4>
                  <p className="text-xs text-slate-600 font-bold">
                    Route: {origin} ➔ {destination} | Airline: {getAirlineName(selectedFlight.airline)}
                  </p>
                </div>

                {/* 2. DYNAMIC BAGGAGE ALLOWANCE SCHEDULER */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                    <Luggage className="w-4 h-4 text-blue-600" /> Baggage Allowance Matrix
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-2 shadow-sm">
                    {selectedFlight.fare?.baggage?.length > 0 ? (
                      selectedFlight.fare.baggage.map((bag, i) => (
                        <div key={i}>
                          <p className="font-bold text-slate-800">{bag.type}: {bag.items?.[0]?.description || "Standard pieces included"}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 font-bold text-[11px]">Standard Weight Restrictions Apply (1 Checked piece up to 23KG + 1 Carry-On bag).</p>
                    )}
                  </div>
                </div>

                {/* 3. INDIVIDUAL FARE BREAKDOWN RECEIPT SLIP */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-600" /> Itemized Individual Passenger Fare Matrix
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-black text-slate-800 uppercase tracking-tight">Catalog Offering ID: {selectedFlight.id}</p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Includes Mandatory Taxes & Surcharges</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{selectedFlight.price?.formatted}</p>
                    </div>
                  </div>
                </div>

                {/* 4. DYNAMIC PASSENGER FORM MANIFEST REGISTRY */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-1">Travelers Registry Credentials ({passengers.length})</h4>
                  
                  <div className="space-y-4 max-h-[35vh] overflow-auto pr-1">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/40 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-slate-800">Passenger #{idx + 1} Personal Data</span>
                          <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-wider">{p.type}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">First / Given Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. JOHN"
                              value={p.firstName}
                              onChange={(e) => updatePassengerField(idx, "firstName", e.target.value.toUpperCase())}
                              className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition uppercase"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Last / Surname</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. DOE"
                              value={p.lastName}
                              onChange={(e) => updatePassengerField(idx, "lastName", e.target.value.toUpperCase())}
                              className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition uppercase"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Date of Birth</label>
                            <input
                              type="date"
                              required
                              value={p.dateOfBirth}
                              onChange={(e) => updatePassengerField(idx, "dateOfBirth", e.target.value)}
                              className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
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
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="submit"
                  onClick={handleBookingSubmit}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Confirm Booking Reservation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}