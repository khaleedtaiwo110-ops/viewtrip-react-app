import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plane, Clock, ShieldCheck, Luggage, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Info } from "lucide-react";

const getAirlineName = (code) => {
  if (!code) return "GDS Carrier";
  const dictionary = {
    "EK": "Emirates", "QR": "Qatar Airways", "TK": "Turkish Airlines",
    "LH": "Lufthansa", "BA": "British Airways", "AF": "Air France",
    "MS": "EgyptAir", "ET": "Ethiopian Airlines", "AT": "Royal Air Maroc",
    "WB": "RwandAir", "KQ": "Kenya Airways", "P4": "Air Peace",
    "DL": "Delta Air Lines", "UA": "United Airlines", "AA": "American Airlines",
    "KL": "KLM", "WY": "Oman Air", "EY": "Etihad Airways", "SV": "Saudia", "VS": "Virgin Atlantic",
    "A1": "United Nigeria", "5N": "Arik Air", "2B": "Ibom Air", "W3": "Air Burkina", "9U": "Air Moldova",
    "FZ": "Flydubai", "3L": "Air Arabia", "G9": "Air Arabia Egypt", "I5": "IndiGo", "SG": "SpiceJet",
    "UG": "Uganda Airlines",
  };
  return dictionary[code.toUpperCase().trim()] || `Airline (${code})`;
};

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

export default function FlightCardList({ 
  flightList, 
  adults, 
  travelClass, 
  origin, 
  destination, 
  setSelectedFlight, 
  setShowBookingForm 
}) {
  const offers = Array.isArray(flightList) ? flightList : [];
  const [selectedCellFilter, setSelectedCellFilter] = useState(null); // { carrierCode, stopType }
  const [expandedFlightId, setExpandedFlightId] = useState(null); // Track which specific card's details are open
  const scrollRef = React.useRef(null);

  if (offers.length === 0) return null;

  const uniqueCarriers = Array.from(new Set(offers.map((f) => f?.airline || "GDS")));

  const getStopCategory = (stops) => {
    if (stops === 0) return "nonStop";
    if (stops === 1) return "oneStop";
    return "twoPlusStops";
  };

  const matrixData = {};
  uniqueCarriers.forEach((carrier) => {
    matrixData[carrier] = { nonStop: [], oneStop: [], twoPlusStops: [] };
  });

  offers.forEach((flight) => {
    const carrier = flight?.airline || "GDS";
    const stops = flight?.stops ?? 0;
    const cat = getStopCategory(stops);
    if (matrixData[carrier] && matrixData[carrier][cat]) {
      matrixData[carrier][cat].push(flight);
    }
  });

  Object.keys(matrixData).forEach((carrier) => {
    ["nonStop", "oneStop", "twoPlusStops"].forEach((cat) => {
      matrixData[carrier][cat].sort((a, b) => (Number(a?.price?.total || 0) - Number(b?.price?.total || 0)));
    });
  });

  const renderCellContent = (carrierCode, cat) => {
    const flights = matrixData[carrierCode]?.[cat] || [];
    if (flights.length === 0) {
      return <span className="text-slate-300 font-bold text-xs">—</span>;
    }

    const lowest = flights[0];
    const priceFormatted = lowest?.price?.formatted || `${lowest?.price?.currency || '₦'}${Number(lowest?.price?.total || 0).toLocaleString()}`;
    const isSelected = selectedCellFilter?.carrierCode === carrierCode && selectedCellFilter?.stopType === cat;

    return (
      <button
        onClick={() => {
          if (isSelected) {
            setSelectedCellFilter(null);
          } else {
            setSelectedCellFilter({ carrierCode, stopType: cat });
          }
        }}
        className={`w-full h-full py-3 px-2 text-xs font-black rounded-xl transition-all flex flex-col items-center justify-center ${
          isSelected 
            ? "bg-orange-600 text-white shadow-md scale-95 ring-2 ring-orange-300" 
            : "hover:bg-slate-100/80 text-slate-900 hover:text-orange-600"
        }`}
      >
        <span>{priceFormatted}</span>
        <span className="text-[9px] font-bold opacity-75">{flights.length} option{flights.length > 1 ? 's' : ''}</span>
      </button>
    );
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const displayedFlights = selectedCellFilter
    ? offers.filter((f) => {
        const carrier = f?.airline || "GDS";
        const cat = getStopCategory(f?.stops ?? 0);
        return carrier === selectedCellFilter.carrierCode && cat === selectedCellFilter.stopType;
      })
    : offers;

  return (
    <div className="space-y-6">
      {/* Enhanced Viewtrip Matrix Container */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider">
                GDS Live Matrix
              </span>
              <h2 className="text-xl font-black tracking-tight">Best Deals by Airline</h2>
            </div>
            <p className="text-xs font-medium text-slate-400 mt-1">
              {origin || "LOS"} → {destination || "CPT"} · Select a cell to filter options instantly
            </p>
          </div>
          <div className="text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            {offers.length} Total Fares Found
          </div>
        </div>

        {/* Matrix Table */}
        <div className="relative p-2 md:p-4">
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-700 hover:bg-slate-50 transition-all hidden md:flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleScroll("right")}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white border border-slate-200 rounded-full shadow-lg text-slate-700 hover:bg-slate-50 transition-all hidden md:flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="overflow-x-auto scrollbar-none" ref={scrollRef}>
            <table className="w-full min-w-[750px] border-collapse text-center">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="w-36 p-4 text-left bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs font-black uppercase tracking-wider text-slate-400">
                    Routing
                  </th>
                  {uniqueCarriers.map((carrierCode) => (
                    <th key={carrierCode} className="p-3 min-w-[130px] align-bottom bg-white">
                      <div className="flex flex-col items-center space-y-2 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shadow-xs">
                          <img
                            src={getAirlineLogo(carrierCode)}
                            alt={getAirlineName(carrierCode)}
                            className="w-full h-full object-contain rounded-xl"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.kiwi.com/airlines/64/default.png";
                            }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-900 leading-tight truncate max-w-[110px]">
                          {getAirlineName(carrierCode)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 text-xs font-black text-slate-900 text-left bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Non-Stop
                  </td>
                  {uniqueCarriers.map((carrier) => (
                    <td key={carrier} className="p-1.5 bg-slate-50/40">
                      {renderCellContent(carrier, "nonStop")}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-black text-slate-900 text-left bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> 1 Stop
                  </td>
                  {uniqueCarriers.map((carrier) => (
                    <td key={carrier} className="p-1.5 bg-slate-50/40">
                      {renderCellContent(carrier, "oneStop")}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs font-black text-slate-900 text-left bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> 2+ Stops
                  </td>
                  {uniqueCarriers.map((carrier) => (
                    <td key={carrier} className="p-1.5 bg-slate-50/40">
                      {renderCellContent(carrier, "twoPlusStops")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Active Filter Notification Bar */}
      {selectedCellFilter && (
        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 text-xs font-bold text-orange-900 shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              Showing results for <strong>{getAirlineName(selectedCellFilter.carrierCode)}</strong> ({selectedCellFilter.stopType})
            </span>
          </div>
          <button
            onClick={() => setSelectedCellFilter(null)}
            className="text-orange-600 hover:text-orange-800 uppercase tracking-wider font-black text-[11px] bg-white px-3 py-1 rounded-lg border border-orange-200 shadow-xs transition-all"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Flight Cards List with Interactive Detail Dropdown */}
      <div className="space-y-4">
        {displayedFlights.map((flight, flightIdx) => {
          const carrierCode = flight?.airline || "GDS";
          const airlineTitle = getAirlineName(carrierCode);
          const logoUrl = getAirlineLogo(carrierCode);
          const flightUniqueId = flight?.id || `flight-${flightIdx}`;
          const isDetailsOpen = expandedFlightId === flightUniqueId;

          const formattedPrice = flight?.price?.formatted || `${flight?.price?.currency || 'USD'} ${flight?.price?.total || '0.00'}`;
          const rawTotal = flight?.price?.total;
          const baseTotalNum = rawTotal ? Number(rawTotal) : 485;
          const flightPerPersonNum = adults > 0 ? Math.round(baseTotalNum / adults) : baseTotalNum;
          const flightCurrencyCode = flight?.price?.currency || 'USD';
          const formattedFlightPerPerson = `${flightCurrencyCode} ${flightPerPersonNum.toLocaleString()}`;

          const firstFlight = flight?.flights?.[0] || {};
          const depTime = firstFlight.departure?.time || "07:05";
          const depAirport = firstFlight.departure?.airport || origin || "LOS";

          const lastFlight = flight?.flights?.[flight.flights.length - 1] || {};
          const arrTime = lastFlight.arrival?.time || "18:30";
          const arrAirport = lastFlight.arrival?.airport || destination || "LON";

          const stopsCount = flight?.stops ?? 0;
          const durationFormatted = formatDuration(flight?.duration || "PT8H");
          const cabinClass = flight?.fare?.products?.[0]?.cabin || travelClass;
          
          // Simulated fare policy details (customizable via GDS data if present)
          const isRefundable = flight?.fare?.refundable ?? true;
          const baggageAllowance = flight?.baggage || "2x 23kg Checked Bags + 7kg Cabin";
          const changePolicy = isRefundable ? "Changes allowed with fee" : "Non-changeable fare";

          return (
            <motion.div
              key={flightUniqueId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: flightIdx * 0.03 }}
              className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Main Ticket Summary Card */}
              <div className="p-5 md:p-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-5 relative">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500" />

                <div className="flex-1 space-y-4 pl-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                        <img
                          src={logoUrl}
                          alt={airlineTitle}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.kiwi.com/airlines/64/default.png";
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                          {airlineTitle}
                          <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {carrierCode}
                          </span>
                        </div>
                        <div className="text-[11px] font-extrabold uppercase text-blue-600">{cabinClass} Class</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                      {flight?.fare?.brandName || "Corporate Flex Fare"}
                    </span>
                  </div>

                  {/* Route Timing Visualizer */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 py-3 px-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <div className="text-xl font-black text-slate-900">{depTime}</div>
                      <div className="text-xs font-black text-slate-500 uppercase">
                        {depAirport} <span className="text-[10px] text-slate-400 font-bold">(Dep)</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-center flex flex-col items-center">
                      <div className="text-[10px] font-black text-slate-700 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-orange-600" /> {durationFormatted}
                      </div>
                      <div className="w-full flex items-center gap-1 my-0.5 px-2">
                        <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                        <Plane className="w-3.5 h-3.5 text-orange-600 shrink-0 transform rotate-90" />
                        <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                      </div>
                      <div className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md ${stopsCount === 0 ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"}`}>
                        {stopsCount === 0 ? "Direct Flight" : `${stopsCount} Stop(s)`}
                      </div>
                    </div>

                    <div className="space-y-0.5 sm:text-right">
                      <div className="text-xl font-black text-slate-900">{arrTime}</div>
                      <div className="text-xs font-black text-slate-500 uppercase">
                        {arrAirport} <span className="text-[10px] text-slate-400 font-bold">(Arr)</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Perks Bar */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Luggage className="w-3.5 h-3.5 text-orange-600" /> {baggageAllowance}
                    </span>
                    <span>•</span>
                    <span className={`flex items-center gap-1 ${isRefundable ? "text-emerald-700 font-black" : "text-slate-500"}`}>
                      {isRefundable ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
                      {isRefundable ? "Fully Refundable" : "Non-Refundable"}
                    </span>
                  </div>
                </div>

                {/* Pricing and Action Buttons */}
                <div className="w-full lg:w-48 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 lg:pl-5 lg:border-l border-slate-200 shrink-0">
                  <div className="text-left lg:text-right">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total ({adults} Pax)</div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">{formattedPrice}</div>
                    <div className="text-[10px] font-extrabold text-emerald-600">{formattedFlightPerPerson} / person</div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col w-full gap-2">
                    <button
                      onClick={() => setExpandedFlightId(isDetailsOpen ? null : flightUniqueId)}
                      type="button"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <span>{isDetailsOpen ? "Hide Details" : "View Details"}</span>
                      {isDetailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedFlight(flight);
                        setShowBookingForm(true);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>Select Deal</span>
                      <Plane className="w-3.5 h-3.5 rotate-45" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Detailed Itinerary & Policy Drawer */}
              <AnimatePresence>
                {isDetailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t-2 border-slate-100 bg-slate-50/70 p-5 md:p-6 space-y-6"
                  >
                    {/* Itinerary Segments Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-orange-600" /> Detailed Flight Itinerary Segments
                      </h4>
                      
                      <div className="space-y-3">
                        {(flight?.flights && flight.flights.length > 0 ? flight.flights : [firstFlight]).map((seg, segIdx) => (
                          <div key={segIdx} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-black text-xs">
                                {segIdx + 1}
                              </div>
                              <div>
                                <div className="text-xs font-black text-slate-900">
                                  {seg.departure?.airport || origin} → {seg.arrival?.airport || destination}
                                </div>
                                <div className="text-[11px] font-bold text-slate-500">
                                  Flight #{seg.flightNumber || `VT-${Math.floor(100 + Math.random() * 900)}`} • Operates by {airlineTitle}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs font-bold text-slate-700">
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-black">Departure</span>
                                <span className="text-slate-900 font-black">{seg.departure?.time || depTime}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-black">Arrival</span>
                                <span className="text-slate-900 font-black">{seg.arrival?.time || arrTime}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-black">Class</span>
                                <span className="text-blue-600 font-black uppercase">{cabinClass}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fare Rules, Baggage & Refundability Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-black uppercase text-slate-400">Refundability & Changes</div>
                        <div className={`text-xs font-black ${isRefundable ? "text-emerald-700" : "text-amber-700"}`}>
                          {isRefundable ? "✓ Refundable Ticket" : "⚠️ Non-Refundable Fare"}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {changePolicy}. Subject to GDS airline fare conditions and penalty rules.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-black uppercase text-slate-400">Baggage Allowance</div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                          <Luggage className="w-3.5 h-3.5 text-orange-600" /> Checked & Cabin Bags
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {baggageAllowance} included in this corporate fare tier.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-black uppercase text-slate-400">GDS Ticketing & Support</div>
                        <div className="text-xs font-black text-emerald-600 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant PNR Generation
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Priority support, seat selection assistance, and corporate desk coordination included.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}