import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdBanner from "../componentss/adsgoogle";

const API_URL = "https://view-trip-travels-app.onrender.com/api/destinations"; // Update to your live backend URL in production

const Tours = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [activeTab, setActiveTab] = useState("discussion"); // 'discussion' | 'reviews'
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Forms State
  const [thoughtForm, setThoughtForm] = useState({ userName: "", message: "" });
  const [reviewForm, setReviewForm] = useState({ userName: "", rating: 5, comment: "" });
  const [adminForm, setAdminForm] = useState({
    secret: "",
    title: "",
    location: "",
    duration: "",
    price: "",
    description: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch destinations from backend
  const fetchDestinations = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDestinations(data);
      // Keep modal synced if open
      if (selectedDest) {
        const updated = data.find((d) => d._id === selectedDest._id);
        if (updated) setSelectedDest(updated);
      }
    } catch (err) {
      console.error("Error loading destinations:", err);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Initialize AdSense
  useEffect(() => {
    if (window.adsbygoogle && destinations.length > 0) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn("AdSense push error:", e);
      }
    }
  }, [destinations]);

  // Calculate Average Star Rating
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return "New";
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  // Handle Admin Upload
  const handleAdminUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", adminForm.title);
    formData.append("location", adminForm.location);
    formData.append("duration", adminForm.duration);
    formData.append("price", adminForm.price);
    formData.append("description", adminForm.description);
    formData.append("image", adminForm.image);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "x-admin-secret": adminForm.secret },
        body: formData,
      });

      if (!res.ok) {
        alert("Failed to upload. Check your Admin Secret password.");
      } else {
        setShowAdminModal(false);
        setAdminForm({
          secret: "",
          title: "",
          location: "",
          duration: "",
          price: "",
          description: "",
          image: null,
        });
        fetchDestinations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Community Discussion Submit
  const handlePostThought = async (e) => {
    e.preventDefault();
    if (!thoughtForm.userName || !thoughtForm.message) return;

    const res = await fetch(`${API_URL}/${selectedDest._id}/discussions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(thoughtForm),
    });

    if (res.ok) {
      setThoughtForm({ userName: "", message: "" });
      fetchDestinations();
    }
  };

  // Handle Review Submit
  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.userName || !reviewForm.comment) return;

    const res = await fetch(`${API_URL}/${selectedDest._id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewForm),
    });

    if (res.ok) {
      setReviewForm({ userName: "", rating: 5, comment: "" });
      fetchDestinations();
    }
  };

  const handleBookNow = (e, dest) => {
    e.stopPropagation();
    navigate(`/booking?tour=${encodeURIComponent(dest.title)}`);
  };

  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      {/* Header + Admin Upload Trigger */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Explore & Discuss Destinations
          </h2>
          <p className="text-gray-600 text-lg">
            Click any destination to share your thoughts, ask questions, or leave a review.
          </p>
        </div>
        <button
          onClick={() => setShowAdminModal(true)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition shadow-sm"
        >
          + Upload Destination
        </button>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((dest, index) => (
          <React.Fragment key={dest._id}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              onClick={() => navigate(`/destination/${dest._id}`)}
              className="cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-gray-100"
            >
              <div>
                <div className="relative">
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="w-full h-56 object-cover"
                  />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow">
                    ⭐ {getAverageRating(dest.reviews)} ({dest.reviews?.length || 0})
                  </span>
                </div>

                <div className="p-6 text-left">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {dest.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">
                    📍 {dest.location} | ⏱ {dest.duration}
                  </p>
                  <p className="text-gray-600 text-base line-clamp-3 mb-4">
                    {dest.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-indigo-600 font-bold text-lg block">
                    {dest.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    💬 {dest.discussions?.length || 0} thoughts
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDest(dest)}
                    className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
                  >
                    Discuss
                  </button>
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    onClick={(e) => handleBookNow(e, dest)}
                  >
                    Book
                  </button>
                </div>
              </div>
            </motion.div>

            {/* AdSense every 3 cards */}
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

      {/* COMMUNITY DISCUSSION & REVIEWS MODAL */}
      <AnimatePresence>
        {selectedDest && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedDest(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="relative h-64">
                <img
                  src={selectedDest.image}
                  alt={selectedDest.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedDest(null)}
                  className="absolute top-4 right-4 bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedDest.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      📍 {selectedDest.location} • ⏱ {selectedDest.duration}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleBookNow(e, selectedDest)}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Book ({selectedDest.price})
                  </button>
                </div>

                <p className="text-gray-700 mb-6">{selectedDest.description}</p>

                {/* Tabs: Community Thoughts vs Reviews */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab("discussion")}
                    className={`pb-3 px-4 font-semibold text-sm border-b-2 transition ${
                      activeTab === "discussion"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    💬 Community Thoughts ({selectedDest.discussions?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-3 px-4 font-semibold text-sm border-b-2 transition ${
                      activeTab === "reviews"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ⭐ Reviews ({selectedDest.reviews?.length || 0})
                  </button>
                </div>

                {/* TAB 1: COMMUNITY DISCUSSION */}
                {activeTab === "discussion" && (
                  <div>
                    <form onSubmit={handlePostThought} className="mb-6 bg-gray-50 p-4 rounded-xl">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={thoughtForm.userName}
                        onChange={(e) =>
                          setThoughtForm({ ...thoughtForm, userName: e.target.value })
                        }
                        className="w-full mb-3 px-3 py-2 border rounded-lg text-sm"
                        required
                      />
                      <textarea
                        placeholder="Share your thoughts, tips, or ask the community about this destination..."
                        rows="3"
                        value={thoughtForm.message}
                        onChange={(e) =>
                          setThoughtForm({ ...thoughtForm, message: e.target.value })
                        }
                        className="w-full mb-3 px-3 py-2 border rounded-lg text-sm"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                      >
                        Post Thought
                      </button>
                    </form>

                    <div className="space-y-4">
                      {selectedDest.discussions?.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No thoughts yet. Start the conversation!
                        </p>
                      ) : (
                        selectedDest.discussions.map((item) => (
                          <div key={item._id} className="border-b pb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm text-gray-800">
                                {item.userName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{item.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: STAR REVIEWS */}
                {activeTab === "reviews" && (
                  <div>
                    <form onSubmit={handlePostReview} className="mb-6 bg-gray-50 p-4 rounded-xl">
                      <div className="flex gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={reviewForm.userName}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, userName: e.target.value })
                          }
                          className="w-2/3 px-3 py-2 border rounded-lg text-sm"
                          required
                        />
                        <select
                          value={reviewForm.rating}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, rating: e.target.value })
                          }
                          className="w-1/3 px-3 py-2 border rounded-lg text-sm bg-white"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                          <option value="4">⭐⭐⭐⭐ (4)</option>
                          <option value="3">⭐⭐⭐ (3)</option>
                          <option value="2">⭐⭐ (2)</option>
                          <option value="1">⭐ (1)</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="Write your review of this trip/destination..."
                        rows="3"
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, comment: e.target.value })
                        }
                        className="w-full mb-3 px-3 py-2 border rounded-lg text-sm"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                      >
                        Submit Review
                      </button>
                    </form>

                    <div className="space-y-4">
                      {selectedDest.reviews?.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No reviews yet. Be the first to rate this destination!
                        </p>
                      ) : (
                        selectedDest.reviews.map((rev) => (
                          <div key={rev._id} className="border-b pb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm text-gray-800">
                                {rev.userName}{" "}
                                <span className="text-yellow-500 ml-1">
                                  {"★".repeat(rev.rating)}
                                </span>
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{rev.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN UPLOAD MODAL */}
      {showAdminModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAdminModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Upload New Destination</h3>
            <form onSubmit={handleAdminUpload} className="space-y-3">
              <input
                type="password"
                placeholder="Admin Secret Password"
                value={adminForm.secret}
                onChange={(e) => setAdminForm({ ...adminForm, secret: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
              <input
                type="text"
                placeholder="Destination Title (e.g., Zanzibar Escape)"
                value={adminForm.title}
                onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g., Tanzania)"
                value={adminForm.location}
                onChange={(e) => setAdminForm({ ...adminForm, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Duration (e.g., 5 Days)"
                  value={adminForm.duration}
                  onChange={(e) => setAdminForm({ ...adminForm, duration: e.target.value })}
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Price (e.g., $1,200)"
                  value={adminForm.price}
                  onChange={(e) => setAdminForm({ ...adminForm, price: e.target.value })}
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <textarea
                placeholder="Description & Highlights"
                rows="3"
                value={adminForm.description}
                onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAdminForm({ ...adminForm, image: e.target.files[0] })}
                className="w-full text-sm"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  {loading ? "Uploading..." : "Publish Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdBanner />
    </section>
  );
};

export default Tours;