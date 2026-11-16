import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_URL = "https://view-trip-travels-app.onrender.com/api/destinations";

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'reviews'

  // Forms
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [reviewForm, setReviewForm] = useState({ userName: "", rating: 5, comment: "" });

  const fetchDestination = async () => {
    try {
      const res = await fetch(`${API_URL}`);
      const data = await res.json();
      const current = data.find((d) => d._id === id);
      setDestination(current);
    } catch (err) {
      console.error("Error fetching destination details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestination();
  }, [id]);

  // Post a chat thought
  const handleSendThought = async (e) => {
    e.preventDefault();
    if (!userName || !message) return;

    try {
      const res = await fetch(`${API_URL}/${id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, message }),
      });
      if (res.ok) {
        setMessage("");
        fetchDestination();
      }
    } catch (err) {
      console.error("Error posting thought:", err);
    }
  };

  // Post a review
  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.userName || !reviewForm.comment) return;

    try {
      const res = await fetch(`${API_URL}/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      if (res.ok) {
        setReviewForm({ userName: "", rating: 5, comment: "" });
        fetchDestination();
      }
    } catch (err) {
      console.error("Error posting review:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 text-lg">Loading community room...</div>;
  }

  if (!destination) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 mb-4">Destination not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const averageRating =
    destination.reviews?.length > 0
      ? (
          destination.reviews.reduce((sum, r) => sum + r.rating, 0) /
          destination.reviews.length
        ).toFixed(1)
      : "New";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
        >
          ← Back to All Destinations
        </button>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100"
        >
          <div className="relative h-72 sm:h-96">
            <img
              src={destination.image}
              alt={destination.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-2">
                ⭐ {averageRating} ({destination.reviews?.length || 0} reviews)
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {destination.title}
              </h1>
              <p className="text-gray-200 text-sm sm:text-base">
                📍 {destination.location} • ⏱ {destination.duration}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
            <div>
              <p className="text-gray-700 text-base leading-relaxed">
                {destination.description}
              </p>
            </div>
            <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
              <span className="text-2xl font-bold text-indigo-600 block">
                {destination.price}
              </span>
              <button
                onClick={() =>
                  navigate(`/booking?tour=${encodeURIComponent(destination.title)}`)
                }
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition shadow"
              >
                Book Package
              </button>
            </div>
          </div>

          {/* Room Switcher Tabs */}
          <div className="flex border-b border-gray-200 px-6 bg-gray-50/50">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-4 px-6 font-semibold text-sm border-b-2 transition ${
                activeTab === "chat"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              💬 Community Group Chat ({destination.discussions?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-6 font-semibold text-sm border-b-2 transition ${
                activeTab === "reviews"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              ⭐ Traveler Reviews ({destination.reviews?.length || 0})
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="p-6 sm:p-8 bg-white">
            {activeTab === "chat" ? (
              <div>
                <div className="mb-6 bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3">
                    🗣 Join the live conversation for this trip
                  </h3>
                  <form onSubmit={handleSendThought} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full sm:w-1/3 px-3 py-2 border rounded-lg text-sm bg-white"
                      required
                    />
                    <textarea
                      placeholder="Ask a question, share travel tips, or talk about this destination..."
                      rows="3"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    >
                      Send Message
                    </button>
                  </form>
                </div>

                {/* Chat Stream */}
                <div className="space-y-4">
                  {destination.discussions?.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">
                      No messages in this room yet. Be the first to spark the conversation!
                    </p>
                  ) : (
                    destination.discussions.map((item) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item._id}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm text-gray-900">
                            {item.userName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{item.message}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 bg-gray-50 border p-4 rounded-2xl">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Leave your star rating & review
                  </h3>
                  <form onSubmit={handlePostReview} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={reviewForm.userName}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, userName: e.target.value })
                        }
                        className="w-full sm:w-2/3 px-3 py-2 border rounded-lg text-sm bg-white"
                        required
                      />
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, rating: e.target.value })
                        }
                        className="w-full sm:w-1/3 px-3 py-2 border rounded-lg text-sm bg-white"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                        <option value="3">⭐⭐⭐ (3 Stars)</option>
                        <option value="2">⭐⭐ (2 Stars)</option>
                        <option value="1">⭐ (1 Star)</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="How was your experience with this destination?"
                      rows="3"
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, comment: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>

                {/* Reviews Stream */}
                <div className="space-y-4">
                  {destination.reviews?.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">
                      No reviews yet. Be the first traveler to rate this place!
                    </p>
                  ) : (
                    destination.reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm text-gray-900">
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
    </div>
  );
};

export default DestinationDetail;