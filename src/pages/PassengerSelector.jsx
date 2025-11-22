// PassengerSelector.jsx  (or inline)
import React, { useState, useRef, useEffect } from "react";
import { Users } from "lucide-react";

export function PassengerSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    function onDoc(e){ if(ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div className="cursor-pointer" onClick={() => setOpen(!open)}>
        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Passenger</p>
        <div className="text-2xl font-bold text-gray-900">{value} Traveller{value>1?"s":""}</div>
      </div>

      {open && (
        <div className="absolute z-50 right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-48">
          <div className="flex items-center justify-between">
            <div className="text-sm">Adults</div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border" onClick={() => onChange(Math.max(1, value-1))}>-</button>
              <div className="w-8 text-center">{value}</div>
              <button className="w-8 h-8 rounded-full border" onClick={() => onChange(value+1)}>+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
