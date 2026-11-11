import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeftRight, 
  Calendar, 
  Users, 
  Briefcase, 
  MapPin, 
  Search, 
  ChevronDown 
} from "lucide-react";

export default function FlightSearchForm({
  tripType,
  setTripType,
  origin,
  setOrigin,
  destination,
  setDestination,
  date,
  setDate,
  returnDate,
  setReturnDate,
  travelClass,
  setTravelClass,
  adults,
  setAdults,
  children,
  setChildren,
  infants,
  setInfants,
  showPaxDropdown,
  setShowPaxDropdown,
  setActiveModal,
  selectedOriginName,
  selectedDestName,
  setSelectedOriginName,
  setSelectedDestName,
  handleSearch,
  loading
}) {
  const totalPassengersCount = adults + children + infants;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-orange-500" />
      
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
            className="w-full sm:w-auto px-10 py-4 bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? "Searching Live GDS..." : "Search Flight Offers"}
          </button>
        </div>
      </form>
    </div>
  );
}