import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "../componentss/adsgoogle";

const images = [
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    title: "Maldives Beach",
  },
  {
    url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1400&q=80",
    title: "Paris, France",
  },
  {
    url: "https://images.unsplash.com/photo-1543352634-9e4c8e97a3d5?auto=format&fit=crop&w=1400&q=80",
    title: "Swiss Alps, Switzerland",
  },
  {
    url: "https://images.unsplash.com/photo-1558981001-6f0c94958bb6?auto=format&fit=crop&w=1400&q=80",
    title: "Dubai Skyline, UAE",
  },
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    title: "Safari, Kenya",
  },
  {
    url: "https://images.unsplash.com/photo-1533681704173-2f8b1e5aa97b?auto=format&fit=crop&w=1400&q=80",
    title: "Bali, Indonesia",
  },
  {
    url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1400&q=80",
    title: "Paris, France",
  },
  {
    url: "https://images.unsplash.com/photo-1549887535-2d1d5d76b780?auto=format&fit=crop&w=1400&q=80",
    title: "Tokyo, Japan",
  },
];

export default function Gallery() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">
        🌍 Explore Destinations Around the World
      </h2>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {images.map((img, i) => (
          <motion.div
            key={i}
            className="relative cursor-pointer rounded-lg overflow-hidden shadow-lg"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelected(img)}
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-60 object-cover transition-opacity duration-300"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-2 text-sm font-semibold text-center">
              {img.title}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.img
              src={selected.url}
              alt={selected.title}
              className="max-h-[90%] max-w-[90%] rounded-xl shadow-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AdBanner />
      <AdBanner />
    </div>
  );
}

