import React from "react";

const reviews = [
  { name: "Sarah Johnson", text: "Amazing experience! Highly recommend ViewTrip." },
  { name: "Ayodeji Salami", text: "Professional team and great packages." },
  { name: "Amina Bello", text: "I loved every moment of my trip. Smooth booking!" },
];

export default function Testimonials() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 text-center">
      <h2 className="text-3xl font-bold mb-8">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white shadow-lg p-6 rounded-xl">
            <p className="text-gray-600 italic mb-4">"{r.text}"</p>
            <h4 className="text-lg font-semibold text-blue-600">- {r.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

