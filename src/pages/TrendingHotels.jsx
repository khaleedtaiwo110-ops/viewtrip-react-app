import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdBanner from "../componentss/adsgoogle";

// Static fallback hotels
const defaultHotels = [
  { name: "Grand Palace Hotel", location: "Paris, France", price: 250, image: "/images/hotel6.avif" },
  { name: "Ocean View Resort", location: "Lagos, Nigeria", price: 400, image: "/images/hotel8.jpg" },
  { name: "City Lights Hotel", location: "Dubai, UAE", price: 180, image: "/images/hotel10.jpg" },
];

// Trending cities example
const trendingCities = [
  { cityCode: "PAR", cityName: "Paris" },
  { cityCode: "DXB", cityName: "Dubai" },
  { cityCode: "LOS", cityName: "Lagos" },
  { cityCode: "BKK", cityName: "Bangkok" },
  { cityCode: "NYC", cityName: "New York" },
];

export default function TrendingHotels() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [modalHotel, setModalHotel] = useState(null);
  const [hotels, setHotels] = useState(defaultHotels);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);

  const handleBookNow = (hotelName) => {
    navigate(`/booking?hotel=${encodeURIComponent(hotelName)}`);
  };

  // Fetch live hotels for a given city
  const fetchHotelsForCity = async (city) => {
    try {
      const today = new Date();
      const checkInDate = today.toISOString().split("T")[0];
      const checkOutDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const params = new URLSearchParams({
        cityCode: city.cityCode,
        checkInDate,
        checkOutDate,
        adults: 1,
      });

      const res = await fetch(`https://view-trip-travels-app.onrender.com/api/hotels?${params}`);
      const data = await res.json();

      const liveHotels = data?.data?.slice(0, 5) || [];
      setHotels(liveHotels.length ? liveHotels : defaultHotels);
    } catch (err) {
      console.error("Error loading hotels:", err);
      setHotels(defaultHotels);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchHotelsForCity(trendingCities[currentCityIndex]);
  }, []);

  // Cycle cities every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentCityIndex + 1) % trendingCities.length;
      setCurrentCityIndex(nextIndex);
      fetchHotelsForCity(trendingCities[nextIndex]);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [currentCityIndex]);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cardWidth = container.firstChild?.offsetWidth + 16;
      const visibleCards = Math.floor(container.offsetWidth / cardWidth);
      const newIndex = (index + visibleCards) % hotels.length;

      container.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });

      setIndex(newIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [index, hotels.length]);

  return (
    <section className="py-16 bg-gray-100 w-full">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-semibold text-center text-indigo-600 mb-6">
  Trending Hotels in {trendingCities[currentCityIndex].cityName}
</h3>

        <h2 className="text-3xl font-bold mb-8 text-center">Explore Trending Hotels</h2>

        {/* Carousel */}
        <motion.div
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-4 pb-4 scrollbar-hide cursor-grab"
          whileTap={{ cursor: "grabbing" }}
        >
          {hotels.map((h, i) => {
            const hotelName = h?.hotel?.name || h?.name || "Hotel Name";
            const locationParts = h?.hotel?.address?.cityName
              ? [h.hotel.address.cityName, h.hotel.address.countryCode]
              : h?.location?.split(",") || ["City", "Country"];
            const city = locationParts[0]?.trim() || "City";
            const country = locationParts[1]?.trim() || "Country";
            const price = h?.offers?.[0]?.price?.total || h?.price || "N/A";
            const image =
              h?.hotel?.image || h?.hotel?.media?.[0]?.uri || h?.image || "/images/default-hotel.jpg";

            return (
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
                    src={image}
                    alt={hotelName}
                    className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setModalHotel(h)}
                      className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-100"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleBookNow(hotelName)}
                      className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                    >
                      Book Now
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold">{hotelName}</h3>
                  <p className="text-gray-600 mt-1">{city}, {country}</p>
                  <p className="text-indigo-600 font-bold mt-2">${price}/night</p>
                </div>
              </motion.div>
            );
          })}
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
                <h3 className="text-2xl font-bold mb-4">{modalHotel?.hotel?.name || modalHotel?.name || "Hotel Name"}</h3>
                <p className="text-gray-600 mb-4">
                  {modalHotel?.hotel?.address?.cityName || modalHotel?.location?.split(",")[0] || "City"} | ${modalHotel?.offers?.[0]?.price?.total || modalHotel?.price || "N/A"}/night
                </p>
                <p className="text-gray-700 mb-4">
                  Enjoy a luxurious stay at {modalHotel?.hotel?.name || modalHotel?.name || "this hotel"} with top amenities, comfortable rooms, and breathtaking views.
                </p>
                <button
                  onClick={() => handleBookNow(modalHotel?.hotel?.name || modalHotel?.name)}
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

        <AdBanner />
      </div>
      <AdBanner />
    </section>
  );
}
