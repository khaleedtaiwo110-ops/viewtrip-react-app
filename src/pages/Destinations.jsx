import React from "react";

const destinations = [
  { name: "Paris", img: "/paris.jpg" },
  { name: "Dubai", img: "/dubai.jpg" },
  { name: "Cape Town", img: "/cape.jpg" },
  { name: "Nairobi", img: "/nairobi.jpg" },
  { name: "Tokyo", img: "/tokyo.jpg" },
  { name: "Bali", img: "/bali.jpg" },
  { name: "Santorini", img: "/santorini.jpg" },
  { name: "New York", img: "/newyork.jpg" },
  { name: "Rome", img: "/rome.jpg" },
  { name: "London", img: "/london.jpg" },
];

const Destinations = () => {
  return (
    <section
      className="relative px-6 md:px-12 py-20 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Floating icons */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/616/616408.png" // plane
        alt="Plane"
        className="absolute w-12 top-10 left-0 animate-float-horizontal opacity-60"
      />
      <img
        src="https://cdn-icons-png.flaticon.com/512/414/414927.png" // cloud
        alt="Cloud"
        className="absolute w-24 top-20 right-10 animate-float-slow opacity-50"
      />
      <img
        src="https://cdn-icons-png.flaticon.com/512/414/414927.png" // cloud
        alt="Cloud"
        className="absolute w-32 bottom-20 left-10 animate-float-slower opacity-40"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Popular Destinations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {destinations.map((d) => (
            <div
              key={d.name}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition transform hover:scale-105"
            >
              <img
                src={d.img}
                alt={d.name}
                className="w-full h-56 object-cover"
              />
              <h3 className="text-center text-lg font-semibold py-3 text-gray-800 bg-white bg-opacity-70">
                {d.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Tailwind animation classes */}
      <style jsx>{`
        @keyframes float-horizontal {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(100vw); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
        @keyframes float-slower {
          0% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
          100% { transform: translateY(0); }
        }

        .animate-float-horizontal {
          animation: float-horizontal 20s linear infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 12s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Destinations;
