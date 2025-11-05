// Booking.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Booking = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedCountry = queryParams.get("country") || "";

  const [country, setCountry] = useState(preselectedCountry);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Booking submitted for ${name}, Country: ${country}, Email: ${email}`);
  };

  return (
    <section className="relative py-20 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
      {/* Animated Background Images */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_France.svg/2560px-Flag_of_France.svg.png"
          className="absolute w-20 animate-float top-10 left-10 opacity-50"
          alt="France"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
          className="absolute w-24 animate-float-slow top-1/2 left-1/4 opacity-40"
          alt="USA"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg"
          className="absolute w-20 animate-float top-3/4 right-20 opacity-50"
          alt="UK"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg"
          className="absolute w-24 animate-float-slow top-1/3 right-10 opacity-40"
          alt="UAE"
        />
      </div>

      {/* Booking Form */}
      <div className="relative max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white">Visa Booking Form</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-90 p-8 rounded-xl shadow-md space-y-4 relative z-10"
        >
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="example@mail.com"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
              readOnly
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Submit Booking
          </button>
        </form>
      </div>

      {/* Tailwind animation classes */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Booking;
