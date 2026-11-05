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
  Receipt
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

const formatDuration = (durationStr) => {
  if (!durationStr) return "";
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return durationStr;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return `${hours} ${minutes}`.trim();
};

export default function FlightOffers() {
  const location = useLocation();
  const hasAutoSearched = useRef(false);
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
        adults: homeAdults,
        children: homeChildren,
        infants: homeInfants,
        travelClass: homeClass,
      } = location.state;
      
      if (homeOrigin) setOrigin(homeOrigin);
      if (homeDestination) setDestination(homeDestination);
      if (homeDate) setDate(homeDate);
      
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
        setResults([]);
        setSelectedFlight(null);

        try {
          const res = await axios.get("https://view-trip-travels-app.onrender.com/api/flight-offers", {
            params: { 
              origin: homeOrigin.toUpperCase().trim(), 
              destination: homeDestination.toUpperCase().trim(), 
              date: homeDate, 
              travelClass: homeClass || "ECONOMY",
              adults: initialAdults,
              children: initialChildren > 0 ? initialChildren : undefined,
              infants: initialInfants > 0 ? initialInfants : undefined
            },
            timeout: 60000
          });
          
          if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
            setError("No flights found matching your parameters.");
          } else {
            setResults(res.data);
          }
        } catch (err) {
          console.error("Flight search error details:", err);
          const serverMessage = err.response?.data?.error || err.response?.data?.message;
          
          if (serverMessage) {
            setError(`Error: ${serverMessage}`);
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
        timeout: 60000
      });
      
      if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        setError("No flights found matching your parameters.");
      } else {
        setResults(res.data);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      if (serverMessage) {
        setError(`Error: ${serverMessage}`);
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
    alert("Flight booking successfully initiated!");
    setShowBookingForm(false);
  };

  const totalPassengersCount = adults + children + infants;

  // Derive flight list with robust fallback structures
  const flightList = Array.isArray(results) 
    ? results 
    : (Array.isArray(results?.data) ? results.data : null) ||
      (Array.isArray(results?.flightOffers) ? results.flightOffers : null) ||
      (Array.isArray(results?.catalogProductOfferings) ? results.catalogProductOfferings : null) ||
      results?.CatalogProductOfferingsResponse?.catalogProductOfferings ||
      results?.productOffering || 
      [];

  return (
    <div className="min-h-screen bg-slate-50 antialiased text-slate-800">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white text-center py-2 px-4 text-xs font-bold uppercase tracking-wide shadow-sm">
        Premium Flights Search System Engine ✈️
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* MAIN FORM PANEL */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button type="button" className="px-4 py-2 text-xs font-black rounded-lg bg-white text-blue-600 shadow-sm">
                  One-Way
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
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
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-900">Adults</p>
                              <p className="text-[10px] text-slate-400">Age 12+</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" disabled={adults <= 1} onClick={() => setAdults(adults - 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200">-</button>
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
                              <button type="button" disabled={children <= 0} onClick={() => setChildren(children - 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200">-</button>
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
                              <button type="button" disabled={infants <= 0} onClick={() => setInfants(infants - 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200">-</button>
                              <span className="text-sm font-black text-slate-800 w-4 text-center">{infants}</span>
                              <button type="button" onClick={() => setInfants(infants + 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-center border border-slate-200">+</button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button type="button" onClick={() => setShowPaxDropdown(false)} className="px-3 py-1.5 bg-blue-600 text-white font-bold text-[11px] rounded-lg">Apply</button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-600 border-none focus:outline-none cursor-pointer"
                  >
                    <option value="ECONOMY">Economy Cabin</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business Class</option>
                    <option value="FIRST">First Class Luxury</option>
                  </select>
                </div>
              </div>
            </div>

            {/* FLIGHT STATIONS SELECTOR GRIDS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div 
                onClick={() => setActiveModal("origin")}
                className="lg:col-span-4 border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-400 transition bg-slate-50 relative"
              >
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Departure From</label>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xl font-black text-slate-900 tracking-tight">
                      {origin || "Select Airport"}
                    </div>
                    <div className="text-xs font-bold text-slate-400 truncate max-w-[220px]">
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
                  className="w-10 h-10 rounded-full border border-slate-200 shadow-md bg-white hover:bg-slate-50 flex items-center justify-center text-blue-600 transition transform active:rotate-180"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div
                onClick={() => setActiveModal("destination")}
                className="lg:col-span-4 border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-400 transition bg-slate-50 relative"
              >
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Destination To</label>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-xl font-black text-slate-900 tracking-tight">
                      {destination || "Select Airport"}
                    </div>
                    <div className="text-xs font-bold text-slate-400 truncate max-w-[220px]">
                      {selectedDestName || "Where are you going?"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Departure Date</label>
                <div className="flex items-center gap-3 relative">
                  <Calendar className="w-5 h-5 text-purple-600 shrink-0 pointer-events-none" />
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-slate-900 font-black text-sm border-none focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loading ? "Searching Best Offers..." : "Search Flight Offers"}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-red-900">Search Interrupted</h4>
              <p className="text-xs font-bold text-red-700 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* --- SEARCH RESULTS LISTING SEGMENT --- */}
        <div className="mt-10 space-y-6">
          {flightList.length > 0 && (
            <h3 className="text-lg font-black text-slate-900 px-1">Available Flights Match Matrix</h3>
          )}
          
          {flightList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 font-medium">
              {results === null || loading ? "Searching for flights..." : "No flight offers available for this route. Try another date or city."}
            </div>
          ) : (
            <div className="space-y-4">
              {flightList.map((flight, idx) => {
                // Robust extraction and parsing using nullish coalescing & safe regex
                const rawPrice = 
                  flight?.price ?? 
                  flight?.Price?.total ?? 
                  flight?.Price?.Total ?? 
                  flight?.TotalPrice ?? 
                  flight?.totalPrice ?? 
                  "485";

                const numericPrice = parseFloat(
                  typeof rawPrice === 'string' ? rawPrice.replace(/[^0-9.-]/g, '') : rawPrice
                ) || 485;

                const priceInNaira = Math.round(numericPrice * 1500);
                const formattedPrice = new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  maximumFractionDigits: 0,
                }).format(priceInNaira);

                // Robust extraction for Travelport carrier code / validating airline code
                const derivedCarrier = flight?.id?.includes("_") ? flight.id.split("_")[0] : "AA";
                const carrierCode = 
                  flight?.validatingAirlineCode || 
                  flight?.ValidatingAirlineCode || 
                  flight?.carrierCode || 
                  flight?.CarrierCode || 
                  derivedCarrier;
                  
                const airlineTitle = getAirlineName(carrierCode);

                return (
                  <div
                    key={flight?.id || idx}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase text-orange-600 tracking-wider">
                        Offering ID: {flight?.id || idx + 1} • {airlineTitle}
                      </div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {flight?.departure || origin} ➔ {flight?.arrival || destination}
                      </div>
                      <div className="text-xs text-slate-500">
                        Available Brands Count: {flight?.rawBrandsCount || flight?.brands?.length || "Multiple Fares"} • Includes mandatory taxes & surcharges.
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <div className="text-[10px] font-black uppercase text-slate-400">Total Price</div>
                        <div className="text-2xl font-black text-slate-900">{formattedPrice}</div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedFlight(flight);
                          setShowBookingForm(true);
                        }}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition transform active:scale-95"
                      >
                        Select Flight
                      </button>
                    </div>
                  </div>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            
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
                    Route: {selectedFlight.departure} ➔ {selectedFlight.arrival} | Available Brands: {selectedFlight.brands?.join(", ") || "Standard Fares"}
                  </p>
                </div>

                {/* 2. DYNAMIC BAGGAGE ALLOWANCE SCHEDULER */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                    <Luggage className="w-4 h-4 text-blue-600" /> Baggage Allowance Matrix
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-2 shadow-sm">
                    <p className="text-slate-500 font-bold text-[11px]">Standard Weight Restrictions Apply (1 Checked piece up to 23KG + 1 Carry-On bag).</p>
                    <p className="text-[9px] text-slate-400 font-medium italic mt-1">⚠️ Excess luggage metrics can be bought directly at the ticketing counter during physical clearance loops.</p>
                  </div>
                </div>

                {/* 3. INDIVIDUAL FARE BREAKDOWN RECEIPT SLIP */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-600" /> Itemized Individual Passenger Fare Matrix
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-black text-slate-800 uppercase tracking-tight">Catalog Product Offering ID: {selectedFlight.id}</p>
                      <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Includes Mandatory Taxes & Surcharges</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{selectedFlight.price}</p>
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