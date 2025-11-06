import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdBanner from "../componentss/adsgoogle";

const tours = [
  {
    name: "Romantic Paris Getaway",
    price: "$799",
    duration: "5 Days",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      "Day 1: Arrival in Paris – Eiffel Tower night tour.",
      "Day 2: Visit the Louvre & Seine River cruise.",
      "Day 3: Explore Montmartre and local cafés.",
      "Day 4: Versailles Palace day trip.",
      "Day 5: Shopping on Champs-Élysées and departure.",
    ],
  },
  {
    name: "Dubai Desert Adventure",
    price: "$999",
    duration: "7 Days",
    image: "https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      "Day 1: Arrival and Marina Dhow Cruise.",
      "Day 2: City tour – Burj Khalifa & Dubai Mall.",
      "Day 3: Desert safari with BBQ dinner.",
      "Day 4: Visit Abu Dhabi Grand Mosque.",
      "Day 5: Atlantis Water Park adventure.",
      "Day 6: Beach leisure day.",
      "Day 7: Departure.",
    ],
  },
  {
    name: "Bali Tropical Escape",
    price: "$699",
    duration: "6 Days",
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      "Day 1: Arrival and sunset dinner at Jimbaran Bay.",
      "Day 2: Ubud rice terraces & monkey forest.",
      "Day 3: Snorkeling at Nusa Penida.",
      "Day 4: Waterfall and temple tour.",
      "Day 5: Free day for beach relaxation.",
      "Day 6: Departure.",
    ],
  },
];

export default function Tours() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const [modalTour, setModalTour] = useState(null); // Tour selected for modal

  const handleBookNow = (tourName) => {
    navigate(`/booking?tour=${encodeURIComponent(tourName)}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cardWidth = container.firstChild?.offsetWidth + 16;
      const visibleCards = Math.floor(container.offsetWidth / cardWidth);
      const newIndex = (index + visibleCards) % tours.length;

      container.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });

      setIndex(newIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <section className="py-16 bg-gray-50 w-full">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <h2 className="text-4xl font-bold mb-10 text-center">
           Explore Our Tour Packages
        </h2>

        {/* Carousel */}
        <motion.div
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-6 pb-4 scrollbar-hide cursor-grab"
          whileTap={{ cursor: "grabbing" }}
        >
          {tours.map((tour, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl shadow-md flex-shrink-0
                min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%] snap-center
                hover:shadow-2xl hover:scale-[1.05] transition-transform duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="relative group">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setModalTour(tour)}
                    className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-100"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleBookNow(tour.name)}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">{tour.name}</h3>
                <p className="text-gray-600 mb-1">{tour.duration}</p>
                <p className="text-blue-600 font-semibold text-lg">{tour.price}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {modalTour && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalTour(null)}
            >
              <motion.div
                className="bg-white rounded-2xl max-w-lg w-full p-6 relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4">{modalTour.name}</h3>
                <p className="text-gray-600 mb-4">{modalTour.duration} | {modalTour.price}</p>
                <h4 className="font-semibold mb-2">Itinerary:</h4>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  {modalTour.itinerary.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleBookNow(modalTour.name)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-2"
                >
                  Book Now
                </button>
                <button
                  onClick={() => setModalTour(null)}
                  className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AdBanner />
      </div>
      <AdBanner />
      <AdBanner />
    </section>
  );
}


