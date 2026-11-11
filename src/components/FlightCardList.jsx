import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Clock, ShieldCheck, Luggage, ChevronDown, ChevronUp } from "lucide-react";

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
  
  // Track which airlines are currently expanded
  const [expandedAirlines, setExpandedAirlines] = useState({});

  if (offers.length === 0) return null;

  // Group offers by airline carrier code
  const groupedByAirline = offers.reduce((acc, flight) => {
    const carrierCode = flight?.airline || "GDS";
    if (!acc[carrierCode]) {
      acc[carrierCode] = [];
    }
    acc[carrierCode].push(flight);
    return acc;
  }, {});

  // For each airline, sort its flights by price (lowest first)
  Object.keys(groupedByAirline).forEach((carrierCode) => {
    groupedByAirline[carrierCode].sort((a, b) => {
      const priceA = Number(a?.price?.total || 0);
      const priceB = Number(b?.price?.total || 0);
      return priceA - priceB;
    });
  });

  const toggleAirlineExpand = (carrierCode) => {
    setExpandedAirlines((prev) => ({
      ...prev,
      [carrierCode]: !prev[carrierCode],
    }));
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedByAirline).map(([carrierCode, airlineFlights], idx) => {
        const isExpanded = !!expandedAirlines[carrierCode];
        const airlineTitle = getAirlineName(carrierCode);
        const logoUrl = getAirlineLogo(carrierCode);

        // Lowest fare for this airline group
        const lowestFlight = airlineFlights[0];
        const rawLowestTotal = lowestFlight?.price?.total;
        const baseLowestNum = rawLowestTotal ? Number(rawLowestTotal) : 485;
        const currencyCode = lowestFlight?.price?.currency || 'USD';
        const formattedLowestPrice = lowestFlight?.price?.formatted || `${currencyCode} ${baseLowestNum.toLocaleString()}`;
        const perPersonNum = adults > 0 ? Math.round(baseLowestNum / adults) : baseLowestNum;
        const formattedPerPerson = `${currencyCode} ${perPersonNum.toLocaleString()}`;

        return (
          <motion.div
            key={carrierCode}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Airline Summary Header Row */}
            <div 
              onClick={() => toggleAirlineExpand(carrierCode)}
              className="p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-sm">
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
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {airlineTitle}
                    <span className="text-[11px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {carrierCode}
                    </span>
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {airlineFlights.length} flight{airlineFlights.length > 1 ? "s" : ""} listed for this route
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    From Lowest Fare
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {formattedLowestPrice}
                  </div>
                  <div className="text-[10px] font-extrabold text-emerald-600">
                    {formattedPerPerson} / person
                  </div>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-black text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>{isExpanded ? "Hide Flights" : "View Flights"}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expandable Section Containing All Flight Details Under This Airline */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t-2 border-slate-100 bg-slate-50/50 p-4 md:p-6 space-y-4"
                >
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    All Available Options for {airlineTitle} ({airlineFlights.length})
                  </div>

                  {airlineFlights.map((flight, flightIdx) => {
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
                      <div
                        key={flight?.id || flightIdx}
                        className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500 shadow-xs hover:shadow-md transition-all p-4 md:p-5 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 relative overflow-hidden group"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Offer ID: #{flight?.id || flightIdx + 1}</span>
                              <span>•</span>
                              <span className="text-blue-700 font-extrabold uppercase">{cabinClass}</span>
                            </div>

                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full">
                              {flight?.fare?.brandName || "Standard Corporate Fare"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="space-y-0.5">
                              <div className="text-lg font-black text-slate-900">{depTime}</div>
                              <div className="text-[11px] font-black text-slate-500 uppercase">
                                {depAirport} <span className="text-[9px] text-slate-400 font-bold">(Dep)</span>
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
                              <div className="text-lg font-black text-slate-900">{arrTime}</div>
                              <div className="text-[11px] font-black text-slate-500 uppercase">
                                {arrAirport} <span className="text-[9px] text-slate-400 font-bold">(Arr)</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                            <span className="flex items-center gap-1 text-slate-700">
                              <Luggage className="w-3.5 h-3.5 text-blue-600" /> 1 Checked Bag Included
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-extrabold">✓ Instant GDS Ticketing</span>
                          </div>
                        </div>

                        <div className="w-full lg:w-44 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2.5 border-t lg:border-t-0 pt-3 lg:pt-0 lg:pl-4 lg:border-l border-slate-200 shrink-0">
                          <div className="text-left lg:text-right">
                            <div className="text-[10px] font-black uppercase text-slate-400">Total ({adults} Pax)</div>
                            <div className="text-xl font-black text-slate-900">{formattedPrice}</div>
                            <div className="text-[10px] font-extrabold text-emerald-600">{formattedFlightPerPerson} / person</div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedFlight(flight);
                              setShowBookingForm(true);
                            }}
                            className="w-auto lg:w-full px-4 py-2.5 bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span>Select Deal</span>
                            <Plane className="w-3 h-3 rotate-45" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}