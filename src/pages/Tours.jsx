import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Tours = () => {
  const [tours, setTours] = useState([]);
  const navigate = useNavigate();

  // Fetch tour packages from JSON file
  useEffect(() => {
    fetch("/tour.json")
      .then((res) => res.json())
      .then((data) => setTours(data))
      .catch((err) => console.error("Error loading tours:", err));
  }, []);

  // Initialize AdSense when tours load
  useEffect(() => {
    if (window.adsbygoogle && tours.length > 0) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn("AdSense push error:", e);
      }
    }
  }, [tours]);

  // Handle booking redirect
  const handleBookNow = (tour) => {
  const url = `/booking?tour=${encodeURIComponent(tour.title)}`;
  navigate(url);
};


  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Explore Our Tour Packages
        </h2>
        <p className="text-gray-600 text-lg">
          Discover handpicked travel experiences around the world — from luxury
          escapes to cultural adventures.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour, index) => (
          <React.Fragment key={tour.id}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={tour.image}
                alt={tour.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6 text-left">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {tour.title}
                </h3>
                <p className="text-gray-500 text-sm mb-2">
                  📍 {tour.location} | ⏱ {tour.duration}
                </p>
                <p className="text-gray-600 text-base mb-4">
                  {tour.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-600 font-bold text-lg">
                    {tour.price}
                  </span>
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    onClick={() => handleBookNow(tour)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Show Ad after every 3 tours */}
            {(index + 1) % 3 === 0 && (
              <div className="col-span-full my-6 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-client="ca-pub-2543320626959498"
                  data-ad-slot="4228761916"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Final Ad at bottom */}
      <div className="mt-10 flex justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-2543320626959498"
          data-ad-slot="4228761916"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>

      {/* AdSense Script */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2543320626959498"
        crossOrigin="anonymous"
      ></script>
    </section>
  );
};

export default Tours;
