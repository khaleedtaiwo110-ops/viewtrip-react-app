// AirportSelector.jsx  (or paste inside Home.jsx above the component)
import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";

export function AirportSelector({ value, onChange, label, placeholder, airportsUrl="/airports.json" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [list, setList] = useState([]);
  const ref = useRef();

  useEffect(() => {
    fetch(airportsUrl)
      .then(r => r.json())
      .then(d => setList(d || []))
      .catch(() => setList([]));
  }, [airportsUrl]);

  useEffect(() => {
    function onDoc(e){ if(ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const filtered = query
    ? list.filter(a =>
        (a.city + " " + a.airport + " " + a.iata).toLowerCase().includes(query.toLowerCase())
      ).slice(0, 12)
    : list.slice(0, 12);

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => { setOpen(!open); setQuery(""); }}
        className="cursor-pointer"
      >
        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{label}</p>
        <div className="text-2xl font-bold text-gray-900 w-full bg-transparent outline-none flex items-center justify-between">
          <span>{value || placeholder}</span>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-72 overflow-auto p-3">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, airport or IATA (e.g. LOS)"
              className="w-full p-2 border rounded-lg text-sm"
            />
          </div>

          <ul>
            {filtered.map((a, i) => (
              <li
                key={i}
                className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => { onChange(a.iata, `${a.city} — ${a.airport}`); setOpen(false); }}
              >
                <div className="font-semibold">{a.city} <span className="text-gray-500">({a.iata})</span></div>
                <div className="text-sm text-gray-500">{a.airport}</div>
              </li>
            ))}
            {filtered.length === 0 && <li className="p-2 text-sm text-gray-500">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
