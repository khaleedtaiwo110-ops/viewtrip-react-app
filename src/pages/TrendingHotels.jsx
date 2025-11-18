import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdBanner from "../componentss/adsgoogle";

/**
 * TrendingHotels.jsx
 * Fully featured trending hotels widget:
 * - auto-rotates trending cities every 60s
 * - geolocation -> maps.co reverse lookup fallback
 * - fetch up to N hotels per city (slice to 5 for carousel)
 * - images, skeletons, modal "view all", pagination, filters, sort
 * - star ratings, amenity badges (api -> fallback generation)
 * - saves preferred city to localStorage
 */

// ---------- Config ----------
const defaultHotels = [
  { name: "Grand Palace Hotel", location: "Paris, France", price: 250, image: "/images/hotel6.avif", rating: 4.6 },
  { name: "Ocean View Resort", location: "Lagos, Nigeria", price: 400, image: "/images/hotel8.jpg", rating: 4.4 },
  { name: "City Lights Hotel", location: "Dubai, UAE", price: 180, image: "/images/hotel10.jpg", rating: 4.2 },
];

const trendingCities = [
  { cityCode: "PAR", cityName: "Paris" },
  { cityCode: "DXB", cityName: "Dubai" },
  { cityCode: "LOS", cityName: "Lagos" },
  { cityCode: "BKK", cityName: "Bangkok" },
  { cityCode: "NYC", cityName: "New York" },
];

const CAROUSEL_DISPLAY_COUNT = 10; // how many cards shown from fetched data
const AUTO_ROTATE_MS = 60000; // 60s rotate
const CAROUSEL_AUTOSCROLL_MS = 5000; // card auto-scroll inside carousel container

// ---------- Helpers ----------
const formatPrice = (p) => (p === "N/A" ? "N/A" : `$${p}`);
const safe = (v, fallback) => (v === undefined || v === null ? fallback : v);

// generate realistic fallback rating 3.5-4.9
const generateRating = () => {
  return +(3.5 + Math.random() * 1.4).toFixed(1);
};

// generate amenity badges fallback
const sampleAmenities = ["Free WiFi", "Free Breakfast", "Pool", "Gym", "Airport Shuttle", "Spa"];
const genAmenities = () => {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = sampleAmenities.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// default fallback image
const DEFAULT_IMG = "/images/default-hotel.jpg";

// format dates (yyyy-mm-dd)
const isoDate = (d = new Date()) => d.toISOString().split("T")[0];

// ---------- Small UI subcomponents ----------
function StarRating({ value }) {
  const v = Math.min(5, Math.max(0, value || generateRating()));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {Array.from({ length: full }).map((_, i) => <span key={"f"+i}>★</span>)}
      {half && <span>☆</span>}
      {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => <span key={"e"+i} className="text-gray-300">★</span>)}
      <span className="text-sm text-gray-600 ml-2"> {v.toFixed(1)}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%] bg-white rounded-xl shadow p-0 animate-pulse">
      <div className="h-52 bg-gray-200 rounded-t-xl" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
        <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
      </div>
    </div>
  );
}

// ---------- Main Component ----------
export default function TrendingHotels() {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [hotels, setHotels] = useState(defaultHotels);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalHotels, setModalHotels] = useState([]); // full "view all" set
  const [currentCityIndex, setCurrentCityIndex] = useState(() => {
    const saved = localStorage.getItem("vt_preferred_city_index");
    return saved ? Number(saved) : 0;
  });
  const [autoRotate, setAutoRotate] = useState(true);
  const [sortBy, setSortBy] = useState("popular"); // popular | price_asc | price_desc | rating
  const [priceFilterMax, setPriceFilterMax] = useState(null); // null = no filter
  const [amenityFilter, setAmenityFilter] = useState(""); // amenity string or empty
  const [page, setPage] = useState(1);
  const [perPage] = useState(5); // view-all pagination size
  const [fadeKey, setFadeKey] = useState(0);

  // fetch hotels for a city (limit can be larger for view-all)
  const fetchHotelsForCity = async (city, { limit = 20 } = {}) => {
    setLoading(true);
    try {
      const today = new Date();
      const checkIn = isoDate(today);
      const checkOut = isoDate(new Date(today.getTime() + 3 * 86400000)); // +3 days
      const params = new URLSearchParams({
        cityCode: city.cityCode,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: 1,
        limit, // even if backend ignores, we'll slice
      });

      const url = `https://view-trip-travels-app.onrender.com/api/hotels?${params}`;
      const res = await fetch(url);
      const data = await res.json();

      // Normalize: many backends wrap results in data.data or return array directly
      const raw = Array.isArray(data) ? data : data?.data || data?.results || [];
      // Map to normalized hotel objects used in UI (preserve original as well)
      const normalized = raw.map((h, idx) => {
        // try common shapes used earlier; fallback to generic fields
        const hotelObj = h?.hotel || {};
        const name = hotelObj?.name || h?.name || h?.hotelName || "Hotel";
        const cityName = hotelObj?.address?.cityName || (h?.location?.split ? h.location.split(",")[0] : "") || city.cityName;
        const country = hotelObj?.address?.countryCode || (h?.location?.split ? (h.location.split(",")[1] || "").trim() : "");
        const price = h?.offers?.[0]?.price?.total || h?.price || (h?.rate && h.rate.amount) || "N/A";
        // common places images can appear: hotel.media[0].uri or hotel.image or h.image
        const image = hotelObj?.media?.[0]?.uri || hotelObj?.image || h?.image || DEFAULT_IMG;
        const rating = hotelObj?.rating || h?.rating || generateRating();
        const amenities = hotelObj?.amenities || h?.amenities || genAmenities();

        return {
          __raw: h,
          id: h?.id || hotelObj?.id || `${city.cityCode}-${idx}`,
          name,
          cityName,
          country,
          price,
          image,
          rating,
          amenities,
        };
      });

      // save for modal "view all"
      setModalHotels(normalized);

      // choose top N for the carousel
      const top = normalized.slice(0, CAROUSEL_DISPLAY_COUNT);
      setHotels(top.length ? top : defaultHotels.map((d) => ({
        ...d,
        rating: d.rating || generateRating(),
        amenities: genAmenities(),
        image: d.image || DEFAULT_IMG
      })));

      setFadeKey((k) => k + 1);
    } catch (err) {
      console.error("TrendingHotels fetch error:", err);
      // fallback
      setHotels(defaultHotels.map((d) => ({
        ...d,
        rating: d.rating || generateRating(),
        amenities: genAmenities(),
        image: d.image || DEFAULT_IMG
      })));
      setModalHotels([]);
    } finally {
      setLoading(false);
    }
  };

  // reverse geocode using maps.co (public) if geolocation is allowed
  useEffect(() => {
    const detectLocation = async () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // maps.co reverse geocoding
          const r = await fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`);
          if (!r.ok) return;
          const json = await r.json();
          const cityName = json?.address?.city || json?.address?.town || json?.address?.village || json?.address?.county;
          if (!cityName) return;
          // try to match to trendingCities by substring
          const idx = trendingCities.findIndex((c) => cityName.toLowerCase().includes(c.cityName.toLowerCase()));
          if (idx >= 0) {
            setCurrentCityIndex(idx);
            localStorage.setItem("vt_preferred_city_index", String(idx));
          }
        } catch (e) {
          // ignore geolocation/reverse lookup failures silently
        }
      }, (err) => {
        // user denied or error -> ignore
      }, { timeout: 5000 });
    };
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // initial fetch & restore preferred
  useEffect(() => {
    const savedIndex = localStorage.getItem("vt_preferred_city_index");
    if (savedIndex) setCurrentCityIndex(Number(savedIndex));
    fetchHotelsForCity(trendingCities[currentCityIndex], { limit: 30 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-rotate cities
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      const next = (currentCityIndex + 1) % trendingCities.length;
      setCurrentCityIndex(next);
      localStorage.setItem("vt_preferred_city_index", String(next));
      fetchHotelsForCity(trendingCities[next], { limit: 30 });
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCityIndex, autoRotate]);

  // carousel auto-scroll (horizontal)
  useEffect(() => {
    const interval = setInterval(() => {
      const container = carouselRef.current;
      if (!container) return;
      const first = container.firstElementChild;
      if (!first) return;
      const cardWidth = first.offsetWidth + 16;
      container.scrollBy({ left: cardWidth, behavior: "smooth" });
    }, CAROUSEL_AUTOSCROLL_MS);
    return () => clearInterval(interval);
  }, [hotels]);

  // ---------- Sorting & Filtering ----------
  const filteredHotels = useMemo(() => {
    let list = modalHotels.length ? modalHotels.slice() : hotels.slice();

    // price filter
    if (priceFilterMax !== null && priceFilterMax !== "") {
      list = list.filter((h) => {
        const p = Number(h.price);
        return isNaN(p) ? true : p <= Number(priceFilterMax);
      });
    }

    // amenity filter
    if (amenityFilter) {
      list = list.filter((h) => (h.amenities || []).some(a => a.toLowerCase().includes(amenityFilter.toLowerCase())));
    }

    // sort
    if (sortBy === "price_asc") list.sort((a,b) => Number(a.price||0) - Number(b.price||0));
    if (sortBy === "price_desc") list.sort((a,b) => Number(b.price||0) - Number(a.price||0));
    if (sortBy === "rating") list.sort((a,b) => (b.rating||0) - (a.rating||0));
    // "popular" fallback keep original order

    return list;
  }, [modalHotels, hotels, priceFilterMax, amenityFilter, sortBy]);

  // pagination for view-all modal
  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / perPage));
  const currentPageItems = filteredHotels.slice((page-1)*perPage, page*perPage);

  // ---------- Handlers ----------
  const handleManualCitySelect = (idx) => {
    setAutoRotate(false);
    setCurrentCityIndex(idx);
    localStorage.setItem("vt_preferred_city_index", String(idx));
    fetchHotelsForCity(trendingCities[idx], { limit: 30 });
  };

  const openViewAll = () => {
    // modalHotels already set from last fetch; if empty try fetch again with more limit
    if (!modalHotels.length) fetchHotelsForCity(trendingCities[currentCityIndex], { limit: 50 });
    setModalOpen(true);
    setPage(1);
  };

  const clearFilters = () => {
    setPriceFilterMax(null);
    setAmenityFilter("");
    setSortBy("popular");
  };

  // ---------- Render ----------
  return (
    <section className="py-12 bg-gray-100 w-full">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">Explore Trending Hotels</h2>

        <motion.h3
          key={fadeKey}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-xl text-center text-indigo-600 mb-4 font-semibold"
        >
          Trending Hotels in {trendingCities[currentCityIndex].cityName}
        </motion.h3>

        {/* controls: city select, auto-rotate toggle, view-all */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            <select
              className="px-3 py-2 rounded border bg-white shadow-sm"
              value={currentCityIndex}
              onChange={(e) => handleManualCitySelect(Number(e.target.value))}
            >
              {trendingCities.map((c, i) => <option key={c.cityCode} value={i}>{c.cityName}</option>)}
            </select>

            <button
              className={`px-3 py-2 rounded ${autoRotate ? "bg-indigo-600 text-white" : "bg-white"} border`}
              onClick={() => setAutoRotate(prev => !prev)}
              title="Toggle auto-rotate cities"
            >
              {autoRotate ? "Auto Rotate: ON" : "Auto Rotate: OFF"}
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={openViewAll}
              className="px-4 py-2 bg-indigo-600 text-white rounded shadow"
            >
              View All Hotels
            </button>
          </div>
        </div>

        {/* carousel area */}
        <div className="relative">
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {Array.from({ length: CAROUSEL_DISPLAY_COUNT }).map((_,i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <motion.div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {hotels.map((h, idx) => {
                const name = h?.name || h?.hotel?.name || "Hotel";
                const city = h?.cityName || h?.hotel?.address?.cityName || "City";
                const country = h?.country || h?.hotel?.address?.countryCode || "";
                const price = h?.price || "N/A";
                const image = h?.image || DEFAULT_IMG;
                const rating = h?.rating || generateRating();
                const amenities = h?.amenities || genAmenities();

                return (
                  <motion.article
                    key={h.id || idx}
                    className="min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%] bg-white rounded-xl shadow overflow-hidden snap-center"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative group">
                      <img src={image} alt={name} className="w-full h-52 object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          onClick={() => setModalHotels([h]) || setModalOpen(true)}
                          className="bg-white px-3 py-2 rounded shadow text-indigo-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/booking?hotel=${encodeURIComponent(name)}`)}
                          className="bg-indigo-600 text-white px-3 py-2 rounded shadow"
                        >
                          Book
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{name}</h4>
                        <div className="text-sm text-gray-500">{city}{country ? `, ${country}` : ""}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <StarRating value={rating} />
                        <div className="text-indigo-600 font-bold">{formatPrice(price)}/night</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {amenities.slice(0,3).map((a, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{a}</span>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>

        <AdBanner />

        {/* ===== VIEW-ALL MODAL / PAGE ===== */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-6 overflow-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                className="bg-white w-full max-w-5xl rounded-2xl p-6"
                initial={{ scale: 0.95, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* header + filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Hotels in {trendingCities[currentCityIndex].cityName}</h3>
                    <p className="text-sm text-gray-500">{filteredHotels.length} results</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded">
                      <option value="popular">Sort: Popular</option>
                      <option value="price_asc">Price: Low → High</option>
                      <option value="price_desc">Price: High → Low</option>
                      <option value="rating">Rating</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Max price"
                      value={priceFilterMax ?? ""}
                      onChange={(e) => setPriceFilterMax(e.target.value ? Number(e.target.value) : null)}
                      className="px-3 py-2 border rounded w-28"
                    />

                    <select value={amenityFilter} onChange={(e) => setAmenityFilter(e.target.value)} className="px-3 py-2 border rounded">
                      <option value="">All amenities</option>
                      <option value="free wifi">Free WiFi</option>
                      <option value="pool">Pool</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="gym">Gym</option>
                    </select>

                    <button onClick={clearFilters} className="px-3 py-2 border rounded">Clear</button>
                  </div>
                </div>

                {/* results grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPageItems.length === 0 && <div className="col-span-full text-center py-8">No hotels found.</div>}
                  {currentPageItems.map((h, idx) => (
                    <div key={h.id || idx} className="flex gap-4 bg-white rounded shadow p-3">
                      <img src={h.image} alt={h.name} className="w-28 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{h.name}</h4>
                            <div className="text-sm text-gray-500">{h.cityName}{h.country ? `, ${h.country}` : ""}</div>
                          </div>
                          <div className="text-indigo-600 font-bold">{formatPrice(h.price)}</div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <StarRating value={h.rating} />
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/booking?hotel=${encodeURIComponent(h.name)}`)} className="bg-indigo-600 text-white px-3 py-1 rounded">Book</button>
                            <button onClick={() => { setModalHotels([h]); setModalOpen(true); }} className="border px-3 py-1 rounded">Details</button>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {(h.amenities || []).map((a, i) => <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{a}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Showing page {page} of {totalPages}</div>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded">Prev</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p+1))} className="px-3 py-1 border rounded">Next</button>
                    <button onClick={() => { setPage(1); setModalOpen(false); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Close</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
