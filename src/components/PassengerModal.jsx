import React from "react";
import { motion } from "framer-motion";
import { X, Luggage, Receipt } from "lucide-react";

export default function PassengerModal({
  showBookingForm,
  setShowBookingForm,
  selectedFlight,
  origin,
  destination,
  passengers,
  updatePassengerField,
  handleBookingSubmit
}) {
  if (!showBookingForm || !selectedFlight) return null;

  return (
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
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
              ✈️ Offering Reference: {selectedFlight.id}
            </h4>
            <p className="text-xs text-slate-600 font-bold">
              Route: {origin} ➔ {destination}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
              <Luggage className="w-4 h-4 text-blue-600" /> Baggage Allowance Matrix
            </h4>
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-2 shadow-sm">
              <p className="text-slate-500 font-bold text-[11px]">Standard Weight Restrictions Apply (1 Checked piece up to 23KG + 1 Carry-On bag).</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-blue-600" /> Itemized Individual Passenger Fare Matrix
            </h4>
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm font-black text-slate-900">{selectedFlight.price?.formatted}</p>
              </div>
            </div>
          </div>

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
                        className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold uppercase"
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
                        className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold uppercase"
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
                        className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Gender</label>
                      <select
                        value={p.gender}
                        onChange={(e) => updatePassengerField(idx, "gender", e.target.value)}
                        className="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-900 font-bold cursor-pointer"
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
  );
}