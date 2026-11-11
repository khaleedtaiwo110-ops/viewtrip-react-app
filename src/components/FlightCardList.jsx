import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plane, Clock, ShieldCheck, Luggage, ChevronDown, ChevronUp } from "lucide-react";

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
  const scrollRef = React.useRef(null);

  if (offers.length === 0) return null;

  // 1. Extract unique airlines from flights
  const uniqueCarriers = Array.from(new Set(offers.map((f) => f?.airline || "GDS")));

  // Helper to get stop category
  const getStopCategory = (stops) => {
    if (stops === 0) return "nonStop";
    if (stops === 1) return "oneStop";
    return "twoPlusStops";
  };

  // 2. Build Matrix: { [carrierCode]: { nonStop: [], oneStop: [], twoPlusStops: [] } }
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

  // Sort each cell by price (lowest first)
  Object.keys(matrixData).forEach((carrier) => {
    ["nonStop", "oneStop", "twoPlusStops"].forEach((cat) => {
      matrixData[carrier][cat].sort((a, b) => (Number(a?.price?.total || 0) - Number(b?.price?.total || 0)));
    });
  });

  // Helper to format lowest price for a matrix cell
  const renderCellContent = (carrierCode, cat) => {
    const flights = matrixData[carrierCode]?.[cat] || [];
    if (flights.length === 0) {
      return <span className="text-slate-300 font-bold">—</span>;
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
        className={`w-full h-full py-3 px-2 text-xs font-black rounded-lg transition-all flex flex-col items-center justify-center ${
          isSelected 
            ? "bg-blue-600 text-white shadow-md scale-95" 
            : "hover:bg-blue-50 text-slate-800 hover:text-blue-600"
        }`}
      >
        <span>{priceFormatted}</span>
      </button>
    );
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Filter flights displayed below matrix if a cell is selected
  const displayedFlights = selectedCellFilter
    ? offers.filter((f) => {
        const carrier = f?.airline || "GDS";
        const cat = getStopCategory(f?.stops ?? 0);
        return carrier === selectedCellFilter.carrierCode && cat === selectedCellFilter.stopType;
      })
    : offers;

  return (
    <div className="space-y-6">
      {/* Best Deals Matrix Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 md:p-6 space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Best Deals by Airline</h2>
          <p className="text-xs font-bold text-slate-400 mt-0.5">
            {origin || "LOS"} → {destination || "CPT"} · Cheapest fares at a glance
          </p>
        </div>

        {/* Matrix Table */}
        <div className="relative group">
          {/* Scroll Left Button */}
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-28 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white border border-slate-200 rounded-full shadow-md text-slate-600 hover:bg-slate-50 transition-all hidden md:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white border border-slate-200 rounded-full shadow-md text-slate-600 hover:bg-slate-50 transition-all hidden md:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="overflow-x-auto scrollbar-none" ref={scrollRef}>
            <table className="w-full min-w-[700px] border-collapse text-center">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="w-32 p-3 text-left bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]" />
                  {uniqueCarriers.map((carrierCode) => (
                    <th key={carrierCode} className="p-3 min-w-[120px] align-bottom">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={getAirlineLogo(carrierCode)}
                            alt={getAirlineName(carrierCode)}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.kiwi.com/airlines/64/default.png";
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-700 leading-tight">
                          {getAirlineName(carrierCode)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Non stop Row */}
                <tr className="border-b border-slate-100">
                  <td className="p-4 text-xs font-black text-slate-900 text-left bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    Non stop
                  </td>
                  {uniqueCarriers.map((carrier) => (
                    <td key={carrier} className="p-1">
                      {renderCellContent(carrier, "nonStop")}
                    </td>
                  ))}
                </tr>

                {/* 1 Stop Row */}
                <tr className="border-b border-slate-100">
                  <td className="p-4 text-xs font-black text-slate-900 text-left bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    1 Stop
                  </td>
                  {uniqueCarriers.map((carrier) => (
                    <td key={carrier} className="p-1">
                      {renderCellContent(carrier, "oneStop")}
                    </td>
                  ))}
                </tr>

                {/* 2+ Stops Row */}
                <tr>
                  <td className="p-4 text-xs font-black text-slate-900 text-left bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    2+ Stops
                  </td>
                  {uniqueCarriers.map((carrier) => (
                    <td key={carrier} className="p-1">
                      {renderCellContent(carrier, "twoPlusStops")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Filter Reset Prompt if matrix cell active */}
      {selectedCellFilter && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs font-bold text-blue-900">
          <span>
            Filtering for <strong>{getAirlineName(selectedCellFilter.carrierCode)}</strong> ({selectedCellFilter.stopType})
          </span>
          <button
            onClick={() => setSelectedCellFilter(null)}
            className="text-blue-600 hover:text-blue-800 underline font-black"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Flight Deals List */}
      <div className="space-y-4">
        {displayedFlights.map((flight, flightIdx) => {
          const carrierCode = flight?.airline || "GDS";
          const airlineTitle = getAirlineName(carrierCode);
          const logoUrl = getAirlineLogo(carrierCode);

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

          return (
            <motion.div
              key={flight?.id || flightIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: flightIdx * 0.03 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-5 md:p-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-5 relative overflow-hidden group"
            >
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl}
                      alt={airlineTitle}
                      className="w-8 h-8 object-contain rounded-lg border border-slate-100 p-0.5"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.kiwi.com/airlines/64/default.png";
                      }}
                    />
                    <span className="font-black text-slate-900 text-sm">{airlineTitle}</span>
                    <span className="text-xs font-bold text-slate-400">•</span>
                    <span className="text-xs font-extrabold uppercase text-blue-600">{cabinClass}</span>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full">
                    {flight?.fare?.brandName || "Standard Corporate Fare"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 py-3 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <div className="text-xl font-black text-slate-900">{depTime}</div>
                    <div className="text-xs font-black text-slate-500 uppercase">
                      {depAirport} <span className="text-[10px] text-slate-400 font-bold">(Dep)</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-center flex flex-col items-center">
                    <div className="text-[10px] font-black text-slate-700 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" /> {durationFormatted}
                    </div>
                    <div className="w-full flex items-center gap-1 my-0.5 px-2">
                      <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                      <Plane className="w-3.5 h-3.5 text-blue-600 shrink-0 transform rotate-90" />
                      <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                    </div>
                    <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${stopsCount === 0 ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"}`}>
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

                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Luggage className="w-3.5 h-3.5 text-blue-600" /> 1 Checked Bag Included
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-extrabold">✓ Instant GDS Ticketing</span>
                </div>
              </div>

              <div className="w-full lg:w-44 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 lg:pl-5 lg:border-l border-slate-200 shrink-0">
                <div className="text-left lg:text-right">
                  <div className="text-[10px] font-black uppercase text-slate-400">Total ({adults} Pax)</div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{formattedPrice}</div>
                  <div className="text-[10px] font-extrabold text-emerald-600">{formattedFlightPerPerson} / person</div>
                </div>

                <button
                  onClick={() => {
                    setSelectedFlight(flight);
                    setShowBookingForm(true);
                  }}
                  className="w-auto lg:w-full px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Select Deal</span>
                  <Plane className="w-3.5 h-3.5 rotate-45" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}