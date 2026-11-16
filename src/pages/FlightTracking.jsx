
import React, { useState } from "react";
import {
  Plane,
  Search,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  RefreshCw
} from "lucide-react";

export default function FlightTracking() {
  const [form, setForm] = useState({
    carrierCode: "",
    flightNumber: "",
    date: ""
  });

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setFlight(null);

    if (!form.carrierCode || !form.flightNumber || !form.date) {
      setError("Please enter the airline, flight number and departure date.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        carrierCode: form.carrierCode.toUpperCase(),
        flightNumber: form.flightNumber,
        date: form.date
      });

      const response = await fetch(
        `/api/flight-tracking/status?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to retrieve flight information.");
      }

      if (!result.flights?.length) {
        throw new Error("No matching flight was found.");
      }

      setFlight(result.flights[0]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-500/10 mb-5">
            <Plane size={32} className="text-blue-400" />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Flight Tracking
          </h1>

          <p className="text-slate-400 max-w-xl mx-auto">
            Track your flight in real time. Get the latest flight status,
            departure and arrival information.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Airline Code
              </label>
              <input
                name="carrierCode"
                value={form.carrierCode}
                onChange={handleChange}
                placeholder="e.g. P4"
                maxLength={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Flight Number
              </label>
              <input
                name="flightNumber"
                value={form.flightNumber}
                onChange={handleChange}
                placeholder="e.g. 7190"
                inputMode="numeric"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Departure Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={18} />
                Track Flight
              </>
            )}
          </button>
        </form>

        {flight && (
          <section className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
              <div>
                <p className="text-slate-400 text-sm">Flight</p>
                <h2 className="text-2xl font-bold">
                  {flight.airline} {flight.flightNumber}
                </h2>
              </div>

              <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold">
                {flight.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Departure</p>
                <h3 className="text-2xl font-bold">
                  {flight.departure?.airport || "--"}
                </h3>
                <p className="text-slate-300 mt-1">
                  {flight.departure?.scheduledTime || "--"}
                </p>
                <p className="text-slate-500 text-sm">
                  {flight.departure?.scheduledDate || flight.date}
                </p>
                {flight.departure?.actualTakeoff && (
                  <p className="text-green-400 text-sm mt-3">
                    Takeoff: {flight.departure.actualTakeoff}
                  </p>
                )}
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Arrival</p>
                <h3 className="text-2xl font-bold">
                  {flight.arrival?.airport || "--"}
                </h3>
                <p className="text-slate-300 mt-1">
                  {flight.arrival?.scheduledTime || "--"}
                </p>
                <p className="text-slate-500 text-sm">
                  {flight.arrival?.scheduledDate || flight.date}
                </p>
                {flight.arrival?.actualTouchdown && (
                  <p className="text-green-400 text-sm mt-3">
                    Touchdown: {flight.arrival.actualTouchdown}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 mt-6 pt-5">
              <p className="text-slate-400 text-sm">
                Last updated: {flight.lastUpdated || "Not available"}
              </p>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
