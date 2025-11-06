import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const hotels = [
  { name: "Grand Palace Hotel", location: "Paris, France", price: 250, image: "hotel6.avif" },
  { name: "Ocean View Resort", location: "Lagos, Nigeria", price: 400, image: "hotel8.jpg" },
  { name: "City Lights Hotel", location: "Dubai, UAE", price: 180, image: "hotel 10.jpg" },
  { name: "Mountain Escape Lodge", location: "Lagos, Nigeria", price: 320, image: "hotel4.webp" },
  { name: "Seaside Paradise", location: "Maldives", price: 450, image: "hotel6.avif" },
  { name: "Royal Garden Hotel", location: "London, UK", price: 300, image: "hotel5.webp" },
  { name: "Sunset Beach Resort", location: "Hawaii, USA", price: 420, image: "hotel3.webp" },
  { name: "Alpine Retreat", location: "Switzerland", price: 350, image: "hotel2.webp" },
  { name: "Urban Stay", location: "New York, USA", price: 200, image: "hotel9.webp" },
  { name: "Tropical Escape", location: "Thailand", price: 280, image: "hotel7.avif" },
];

export default function TrendingHotels() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [modalHotel, setModalHotel] = useState(null);

  const handleBookNow = (hotelName) => {
    navigate(`/book?hotel=${encodeURIComponent(hotelName)}`);
  };

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cardWidth = container.firstChild?.offsetWidth + 16; // card + gap
      const visibleCards = Math.floor(container.offsetWidth / cardWidth);
      const newIndex = (index + visibleCards) % hotels.length;

      container.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });

      setIndex(newIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <section className="py-16 bg-gray-100 w-full">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Explore Trending Hotels</h2>

        {/* Carousel */}
        <motion.div
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-4 pb-4 scrollbar-hide cursor-grab"
          whileTap={{ cursor: "grabbing" }}
        >
          {hotels.map((hotel, i) => (
            <motion.div
              key={i}
              className="min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%] shrink-0 bg-white rounded-xl shadow-md overflow-hidden snap-center
                hover:shadow-2xl hover:scale-[1.05] transition-transform duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="relative group">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setModalHotel(hotel)}
                    className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-100"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleBookNow(hotel.name)}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold">{hotel.name}</h3>
                <p className="text-gray-600 mt-1">{hotel.location}</p>
                <p className="text-indigo-600 font-bold mt-2">${hotel.price}/night</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {modalHotel && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalHotel(null)}
            >
              <motion.div
                className="bg-white rounded-2xl max-w-lg w-full p-6 relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4">{modalHotel.name}</h3>
                <p className="text-gray-600 mb-4">{modalHotel.location} | ${modalHotel.price}/night</p>
                <p className="text-gray-700 mb-4">
                  Enjoy a luxurious stay at {modalHotel.name} with top amenities, comfortable rooms, and breathtaking views.
                </p>
                <button
                  onClick={() => handleBookNow(modalHotel.name)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition mb-2"
                >
                  Book Now
                </button>
                <button
                  onClick={() => setModalHotel(null)}
                  className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
