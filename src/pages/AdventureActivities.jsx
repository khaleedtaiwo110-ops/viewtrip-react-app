import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "../componentss/adsgoogle";

const activities = [
  {
    id: 1,
    title: "Mountain Hiking",
 
    image: "public/images/hiking.webp",
    price: "$120",
    duration: "6 hours",
  },
  {
    id: 2,
    title: "Paragliding",
 
    image: "public/images/paragliding-wide.webp",
    price: "$200",
    duration: "3 hours",
  },
  {
    id: 3,
    title: "Safari Adventure",
    location: "Kenya",
    image: "/images/adventure3.jpg",
    price: "$350",
    duration: "Full Day",
  },
  {
    id: 4,
    title: "Skiing",
 
    image: " public/images/Ski_Famille_-_Family_Ski_Holidays.jpg",
    price: "$400",
    duration: "2 hours",
  },
  {
    id: 5,
    title: "Water Rafting",
 
    image: "public/images/white-water-rafting_6afd0ee9-f184-49fc-ad68-d0b46afcd69c.webp",
    price: "$400",
    duration: "2 hours",
  },
];

export default function AdventureActivities() {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cardWidth = container.firstChild?.offsetWidth + 16; // card + gap
      const visibleCards = Math.floor(container.offsetWidth / cardWidth);
      const newIndex = (index + visibleCards) % activities.length;

      container.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });

      setIndex(newIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Adventure Activities
        </h2>
        <p className="text-gray-600 text-lg">
          Explore thrilling experiences around the world and make unforgettable memories.
        </p>
      </div>

      <motion.div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-4 pb-4 scrollbar-hide cursor-grab"
        whileTap={{ cursor: "grabbing" }}
      >
        {activities.map((activity, i) => (
          <motion.div
  key={activity.id}
  className="flex-shrink-0 w-[80%] sm:w-[45%] md:w-[35%] lg:w-[28%] rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.05] transition-transform duration-300 relative snap-center group"
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: i * 0.1 }}
>
  {/* Image */}
  <img
    src={activity.image}
    alt={activity.title}
    className="w-full h-80 md:h-96 lg:h-[28rem] object-cover"
  />

  {/* Overlay main */}
  <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 space-y-2">
    <h3 className="text-xl font-bold text-white">{activity.title}</h3>
    <p className="text-sm text-gray-200">📍 {activity.location}</p>
    <p className="text-sm text-gray-200">⏱ {activity.duration}</p>
    <span className="text-lg font-bold text-indigo-400">{activity.price}</span>

    <button className="mt-2 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-100 w-max">
      View Details
    </button>
  </div>

  {/* Hover extra detail */}
  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-4 text-center text-white">
    <p className="text-sm">
      {activity.shortDescription || "Experience the thrill and adventure with this activity!"}
    </p>
  </div>
</motion.div>

        ))}
      </motion.div>
      <AdBanner />
    </section>
  );
}
