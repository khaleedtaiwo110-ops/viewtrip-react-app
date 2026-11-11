import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, AlertCircle, Plane } from "lucide-react";
import FlightSearchForm from "../components/FlightSearchForm";
import FlightCardList from "../components/FlightCardList";
import PassengerModal from "../components/PassengerModal";

export default function FlightOffers() {
  const location = useLocation();
  const hasAutoSearched = useRef(false);
  const [tripType, setTripType] = useState("oneway");
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

          if (homeReturnDate) params.returnDate = homeReturnDate;

          const res = await axios.get("https://view-trip-travels-app.onrender.com/api/flight-offers", {
            params,
            timeout: 60000
          });

          setResults(res.data);
        } catch (err) {
          setError("Failed to fetch flight offers on auto-search.");
        } finally {
          setLoading(false);
        }
      };

      if (homeOrigin && homeDestination && homeDate) {
        triggerAutoSearch();
      }
    }
  }, [location.state]);


  useEffect(() => {
    axios.get("/airports.json")
      .then((res) => setAirportsList(res.data || []))
      .catch((err) => console.error("Failed to load airports file:", err));
  }, []);

  useEffect(() => {
    const newPaxRows = [];
    for (let i = 0; i < adults; i++) newPaxRows.push({ type: "ADULT", firstName: "", lastName: "", dateOfBirth: "", gender: "MALE" });
    for (let i = 0; i < children; i++) newPaxRows.push({ type: "CHILD", firstName: "", lastName: "", dateOfBirth: "", gender: "MALE" });
    for (let i = 0; i < infants; i++) newPaxRows.push({ type: "INFANT", firstName: "", lastName: "", dateOfBirth: "", gender: "MALE" });
    setPassengers(newPaxRows);
  }, [adults, children, infants]);

  const filteredAirports = airportsList.filter((item) => {
    if (!item) return false;
    const code = (item.code || item.Code || item.iata || item.IATA || "").toLowerCase();
    const city = (item.city || item.City || "").toLowerCase();
    const name = (item.name || item.Name || "").toLowerCase();
    const country = (item.country || item.Country || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return code.includes(query) || city.includes(query) || name.includes(query) || country.includes(query);
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

      if (tripType === "return" && returnDate) params.returnDate = returnDate;

      const res = await axios.get("https://view-trip-travels-app.onrender.com/api/flight-offers", {
        params,
        timeout: 60000
      });
      

      setResults(res.data);
    } catch (err) {
      setError("Failed to fetch flight offers. Please check your connection and try again.");
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
      const payload = { flight: selectedFlight, passenger: passengers };
      const res = await axios.post("https://view-trip-travels-app.onrender.com/api/book-flight", payload);
      if (res.data.success) {
        alert("Flight booking payload verified and ready for GDS ticket issuance!");
        setShowBookingForm(false);
      }
    } catch (err) {
      alert("Booking transmission failed.");
    }
  };


  const flightList = Array.isArray(results?.offers) ? results.offers : (Array.isArray(results) ? results : []);

  return (
    <div className="min-h-screen bg-slate-100/70 antialiased text-slate-800">

      <div className="bg-linear-to-r from-blue-700 via-indigo-800 to-slate-900 text-white text-center py-2.5 px-4 text-xs font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2">
        <Plane className="w-4 h-4 text-orange-400" /> Viewtrip Travels GDS Corporate Matrix Engine ✈️
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FlightSearchForm
          tripType={tripType}
          setTripType={setTripType}
          origin={origin}
          setOrigin={setOrigin}
          destination={destination}
          setDestination={setDestination}
          date={date}
          setDate={setDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
          travelClass={travelClass}
          setTravelClass={setTravelClass}
          adults={adults}
          setAdults={setAdults}
          children={children}
          setChildren={setChildren}
          infants={infants}
          setInfants={setInfants}
          showPaxDropdown={showPaxDropdown}
          setShowPaxDropdown={setShowPaxDropdown}
          setActiveModal={setActiveModal}
          selectedOriginName={selectedOriginName}
          selectedDestName={selectedDestName}
          setSelectedOriginName={setSelectedOriginName}
          setSelectedDestName={setSelectedDestName}
          handleSearch={handleSearch}
          loading={loading}
        />

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-red-900">Search Interrupted</h4>
              <p className="text-xs font-bold text-red-700 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}


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
            <FlightCardList
              flightList={flightList}
              adults={adults}
              travelClass={travelClass}
              origin={origin}
              destination={destination}
              setSelectedFlight={setSelectedFlight}
              setShowBookingForm={setShowBookingForm}
            />
          )}
        </div>
      </div>

      {/* AIRPORT SELECTOR MODAL */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden z-10 flex flex-col max-h-[85vh]">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Select {activeModal === "origin" ? "Departure Base" : "Arrival Base"}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search by city, name, country or airport code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800"
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

      <PassengerModal
        showBookingForm={showBookingForm}
        setShowBookingForm={setShowBookingForm}
        selectedFlight={selectedFlight}
        origin={origin}
        destination={destination}
        passengers={passengers}
        updatePassengerField={updatePassengerField}
        handleBookingSubmit={handleBookingSubmit}
      />
    </div>
  );
}