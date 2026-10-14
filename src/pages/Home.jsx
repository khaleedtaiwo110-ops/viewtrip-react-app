import React, { useState, useEffect } from "react";
import {
  Plane,
  BedDouble,
  ArrowLeftRight,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Headphones,
  Users,
  CreditCard,
  Briefcase,
  Compass,
  FileText,
  PlusCircle,
  ChevronDown
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
  const [tripType, setTripType] = useState("round");
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hotelResults, setHotelResults] = useState([]);

  // Flight Form State
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
      img: "/images/hotel8.jpg",
      title: "Dubai, UAE",
    },
    {
      img: "/images/hotel7.avif",
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

  // Swap Origin and Destination
  const handleSwapAirports = () => {
    setFlightForm((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
      originLabel: prev.destinationLabel,
      destinationLabel: prev.originLabel,
    }));
  };

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

  const totalPassengers =
    flightForm.passengers.adults +
    flightForm.passengers.children +
    flightForm.passengers.infants;

  return (
    <>
      {loading && <AirplaneLoader />}

      <div className="flex flex-col items-center w-full">
        {/* === HERO SECTION WITH BACKGROUND COLLAGE === */}
        <div className="relative w-full min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-white overflow-hidden">
          
          {/* Background Collage Grid spanning full screen (Crystal Clear) */}
          <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 opacity-80 pointer-events-none scale-105">
            <div className="flex flex-col gap-4">
              <div className="h-64 w-full rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=90" alt="bg" className="w-full h-full object-cover" />
              </div>
              <div className="h-80 w-full rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=90" alt="bg" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-12 hidden md:flex">
              <div className="h-80 w-full rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=90" alt="bg" className="w-full h-full object-cover" />
              </div>
              <div className="h-64 w-full rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=90" alt="bg" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-72 w-full rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=90" alt="bg" className="w-full h-full object-cover" />
              </div>
              <div className="h-72 w-full rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=90" alt="bg" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-16 hidden md:flex">
              <div className="h-64 w-full rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=90" alt="bg" className="w-full h-full object-cover" />
              </div>
              <div className="h-80 w-full rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=90" alt="bg" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Clean dark tint overlay with zero blur filters */}
          <div className="absolute inset-0 bg-black/45"></div>

          {/* === HORIZONTAL FULL-WIDTH FORM CONTAINER === */}
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
            
            {/* Trust Badges Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-xs font-medium text-white/90">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-300" />
                <span><strong className="text-white">2M+</strong> travellers</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-blue-300" />
                <span><strong className="text-white">24/7</strong> support</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-300" />
                <span><strong className="text-white">IATA</strong> certified</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-300" />
                <span><strong className="text-white">Flexible</strong> payment</span>
              </div>
            </div>

            {/* WIDGET BOX */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 text-gray-800">
              
              {/* TOP NAVIGATION TABS */}
              <div className="bg-slate-100/90 border-b border-gray-200 px-4 pt-3 flex flex-wrap gap-1 overflow-x-auto">
                <button
                  onClick={() => setTab("flights")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all ${
                    tab === "flights"
                      ? "bg-white text-blue-600 shadow-sm border-t-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Plane className="w-4 h-4" /> Flights
                </button>
                <button
                  onClick={() => setTab("hotels")}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all ${
                    tab === "hotels"
                      ? "bg-white text-blue-600 shadow-sm border-t-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-slate-200/60"
                  }`}
                >
                  <BedDouble className="w-4 h-4" /> Hotels
                </button>
                <button
                  onClick={() => navigate("/packages")}
                  className="flex items-center gap-2 px-5 py-3 rounded-t-2xl font-semibold text-sm text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Briefcase className="w-4 h-4" /> Packages
                </button>
                <button
                  onClick={() => navigate("/tours")}
                  className="flex items-center gap-2 px-5 py-3 rounded-t-2xl font-semibold text-sm text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Compass className="w-4 h-4" /> Tours
                </button>
                <button
                  onClick={() => navigate("/visa")}
                  className="flex items-center gap-2 px-5 py-3 rounded-t-2xl font-semibold text-sm text-gray-500 hover:text-gray-900 transition-all"
                >
                  <FileText className="w-4 h-4" /> Visa
                </button>
              </div>

              {/* WIDGET BODY */}
              <div className="p-6 md:p-8">
                {tab === "flights" ? (
                  <div className="space-y-6">
                    
                    {/* TRIP TYPE SELECTION */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full w-fit">
                      <button
                        type="button"
                        onClick={() => setTripType("round")}
                        className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                          tripType === "round"
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Round trip
                      </button>
                      <button
                        type="button"
                        onClick={() => setTripType("oneway")}
                        className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                          tripType === "oneway"
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        One way
                      </button>
                    </div>

                    {/* MAIN SEARCH ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                      
                      {/* FROM & TO CONTAINER WITH SWAP BUTTON */}
                      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
                        <div className="border border-gray-300 rounded-2xl p-3 hover:border-blue-500 focus-within:border-blue-600 transition bg-white">
                          <AirportSelector
                            label="FROM"
                            value={flightForm.origin}
                            placeholder="LOS"
                            onChange={(iata, labelText) =>
                              setFlightForm({
                                ...flightForm,
                                origin: iata,
                                originLabel: labelText,
                              })
                            }
                            airportsUrl="/airports.json"
                          />
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {flightForm.originLabel || "Select Origin"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleSwapAirports}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition"
                          title="Swap Origin and Destination"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                        </button>

                        <div className="border border-gray-300 rounded-2xl p-3 hover:border-blue-500 focus-within:border-blue-600 transition bg-white">
                          <AirportSelector
                            label="TO"
                            value={flightForm.destination}
                            placeholder="ACC"
                            onChange={(iata, labelText) =>
                              setFlightForm({
                                ...flightForm,
                                destination: iata,
                                destinationLabel: labelText,
                              })
                            }
                            airportsUrl="/airports.json"
                          />
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {flightForm.destinationLabel || "Select Destination"}
                          </p>
                        </div>
                      </div>

                      {/* DEPARTURE & RETURN DATES */}
                      <div className="lg:col-span-4 border border-gray-300 rounded-2xl p-3 flex items-center divide-x divide-gray-200 hover:border-blue-500 transition bg-white">
                        <div className="flex-1 pr-2">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            DEPARTURE
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                            <input
                              type="date"
                              value={flightForm.date}
                              onChange={(e) =>
                                setFlightForm({ ...flightForm, date: e.target.value })
                              }
                              className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-transparent outline-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {tripType === "round" && (
                          <div className="flex-1 pl-3">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              RETURN
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                              <input
                                type="date"
                                value={flightForm.returnDate}
                                onChange={(e) =>
                                  setFlightForm({
                                    ...flightForm,
                                    returnDate: e.target.value,
                                  })
                                }
                                className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-transparent outline-none cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* TRAVELLERS */}
                      <div className="lg:col-span-3 border border-gray-300 rounded-2xl p-3 relative hover:border-blue-500 transition bg-white">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          TRAVELLERS
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowHomePaxDropdown(!showHomePaxDropdown)}
                          className="w-full text-left flex items-center justify-between mt-0.5"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-xs sm:text-sm font-bold text-gray-900">
                              {totalPassengers} {totalPassengers > 1 ? "Passengers" : "Passenger"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* TRAVELLER POPUP */}
                        <AnimatePresence>
                          {showHomePaxDropdown && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setShowHomePaxDropdown(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 z-30 space-y-4 text-sm text-gray-800"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">Adults</p>
                                    <p className="text-[11px] text-gray-400">12+ years</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      disabled={flightForm.passengers.adults <= 1}
                                      onClick={() =>
                                        setFlightForm({
                                          ...flightForm,
                                          passengers: {
                                            ...flightForm.passengers,
                                            adults: flightForm.passengers.adults - 1,
                                          },
                                        })
                                      }
                                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold disabled:opacity-40"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold w-4 text-center">
                                      {flightForm.passengers.adults}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFlightForm({
                                          ...flightForm,
                                          passengers: {
                                            ...flightForm.passengers,
                                            adults: flightForm.passengers.adults + 1,
                                          },
                                        })
                                      }
                                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">Children</p>
                                    <p className="text-[11px] text-gray-400">2-11 years</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      disabled={flightForm.passengers.children <= 0}
                                      onClick={() =>
                                        setFlightForm({
                                          ...flightForm,
                                          passengers: {
                                            ...flightForm.passengers,
                                            children: flightForm.passengers.children - 1,
                                          },
                                        })
                                      }
                                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold disabled:opacity-40"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold w-4 text-center">
                                      {flightForm.passengers.children}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFlightForm({
                                          ...flightForm,
                                          passengers: {
                                            ...flightForm.passengers,
                                            children: flightForm.passengers.children + 1,
                                          },
                                        })
                                      }
                                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">Infants</p>
                                    <p className="text-[11px] text-gray-400">Under 2 years</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      disabled={flightForm.passengers.infants <= 0}
                                      onClick={() =>
                                        setFlightForm({
                                          ...flightForm,
                                          passengers: {
                                            ...flightForm.passengers,
                                            infants: flightForm.passengers.infants - 1,
                                          },
                                        })
                                      }
                                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold disabled:opacity-40"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold w-4 text-center">
                                      {flightForm.passengers.infants}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFlightForm({
                                          ...flightForm,
                                          passengers: {
                                            ...flightForm.passengers,
                                            infants: flightForm.passengers.infants + 1,
                                          },
                                        })
                                      }
                                      className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setShowHomePaxDropdown(false)}
                                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* BOTTOM CONTROL BAR: CLASS SELECTOR & CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <div className="w-full sm:w-auto flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-2 bg-white">
                        <span className="text-xs font-bold text-gray-500 uppercase">Class:</span>
                        <select
                          value={flightForm.travelClass}
                          onChange={(e) =>
                            setFlightForm({ ...flightForm, travelClass: e.target.value })
                          }
                          className="bg-transparent font-bold text-sm text-gray-800 outline-none cursor-pointer"
                        >
                          <option value="ECONOMY">Economy</option>
                          <option value="PREMIUM_ECONOMY">Premium Economy</option>
                          <option value="BUSINESS">Business</option>
                          <option value="FIRST">First Class</option>
                        </select>
                      </div>

                      <button
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3.5 rounded-2xl text-base shadow-lg transition-all transform active:scale-95"
                        onClick={handleFlightSearch}
                      >
                        Search flights
                      </button>
                    </div>

                  </div>
                ) : (
                  /* === HOTEL SEARCH FORM === */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                      
                      <div className="lg:col-span-5 border border-gray-300 rounded-2xl p-3 bg-white">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          DESTINATION
                        </span>
                        <input
                          placeholder="City (e.g. Dubai)"
                          value={hotelForm.destination}
                          onChange={(e) =>
                            setHotelForm({ ...hotelForm, destination: e.target.value })
                          }
                          className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none mt-0.5"
                        />
                      </div>

                      <div className="lg:col-span-4 border border-gray-300 rounded-2xl p-3 flex items-center divide-x divide-gray-200 bg-white">
                        <div className="flex-1 pr-2">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            CHECK-IN
                          </span>
                          <input
                            type="date"
                            value={hotelForm.checkInDate}
                            onChange={(e) =>
                              setHotelForm({ ...hotelForm, checkInDate: e.target.value })
                            }
                            className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-transparent outline-none cursor-pointer mt-0.5"
                          />
                        </div>

                        <div className="flex-1 pl-3">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            CHECK-OUT
                          </span>
                          <input
                            type="date"
                            value={hotelForm.checkOutDate}
                            onChange={(e) =>
                              setHotelForm({ ...hotelForm, checkOutDate: e.target.value })
                            }
                            className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-transparent outline-none cursor-pointer mt-0.5"
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-3 border border-gray-300 rounded-2xl p-3 flex gap-2 bg-white">
                        <div className="flex-1">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            GUESTS
                          </span>
                          <select
                            value={hotelForm.guests}
                            onChange={(e) =>
                              setHotelForm({ ...hotelForm, guests: Number(e.target.value) })
                            }
                            className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-transparent outline-none mt-0.5 cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <option key={num} value={num}>
                                {num} {num > 1 ? "Guests" : "Guest"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1 border-l border-gray-200 pl-2">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            ROOMS
                          </span>
                          <select
                            value={hotelForm.rooms}
                            onChange={(e) =>
                              setHotelForm({ ...hotelForm, rooms: Number(e.target.value) })
                            }
                            className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-transparent outline-none mt-0.5 cursor-pointer"
                          >
                            {[1, 2, 3, 4].map((num) => (
                              <option key={num} value={num}>
                                {num} {num > 1 ? "Rooms" : "Room"}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3.5 rounded-2xl text-base shadow-lg transition-all transform active:scale-95"
                        onClick={handleHotelSearch}
                      >
                        Search hotels
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
        
        <WhyBookWithUs />
        <TrendingHotels />
        <AdventureActivities />
        <Tours />
      </div>
    </>
  );
}