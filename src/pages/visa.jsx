import React from "react";
import { useNavigate } from "react-router-dom";

const visaOptions = [
  {
    id: 1,
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    price: "$150",
    duration: "Tourist Visa - 90 days",
  },
  {
    id: 2,
    country: "USA",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    price: "$200",
    duration: "Tourist Visa - 180 days",
  },
  {
    id: 3,
    country: "United Kingdom",
    image: "https://images.unsplash.com/photo-1587132137054-0a8d4b9f093d?auto=format&fit=crop&w=600&q=80",
    price: "$180",
    duration: "Tourist Visa - 90 days",
  },
  {
    id: 4,
    country: "UAE",
    image: "https://images.unsplash.com/photo-1564501043661-1b1d44c69f43?auto=format&fit=crop&w=600&q=80",
    price: "$120",
    duration: "Tourist Visa - 30 days",
  },
];

const VisaPricing = () => {
  const navigate = useNavigate();

  const handleApply = (country) => {
    navigate(`/booking?country=${encodeURIComponent(country)}`);
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

      <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
        <h2 className="text-4xl font-bold mb-8">Visa Pricing & Apply</h2>
        <p className="text-lg mb-12">
          Check out visa options and prices for popular destinations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {visaOptions.map((visa) => (
            <div
              key={visa.id}
              className="bg-white text-black rounded-xl shadow-lg overflow-hidden transform transition-transform hover:-translate-y-2 hover:scale-105"
            >
              <img
                src={visa.image}
                alt={visa.country}
                className="h-40 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2">{visa.country}</h3>
                <p className="text-gray-700 mb-2">{visa.duration}</p>
                <p className="text-orange-500 font-semibold text-lg mb-4">{visa.price}</p>
                <button
                  onClick={() => handleApply(visa.country)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium w-full transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
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

export default VisaPricing;
