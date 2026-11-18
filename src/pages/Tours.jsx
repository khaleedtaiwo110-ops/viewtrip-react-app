
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, Star, MessageCircle,
  Send, X, Plus, CalendarDays, Users, Image as ImageIcon,
  MessageSquare, ChevronRight, ArrowUpRight, Loader2
} from "lucide-react";
import AdBanner from "../componentss/adsgoogle";

const API_URL = "https://view-trip-travels-app.onrender.com/api/destinations";

const Tours = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [activeTab, setActiveTab] = useState("discussion");
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [thoughtForm, setThoughtForm] = useState({
    userName: "",
    message: "",
  });

  const [reviewForm, setReviewForm] = useState({
    userName: "",
    rating: 5,
    comment: "",
  });

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
  const [posting, setPosting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // FETCH DESTINATIONS
  const fetchDestinations = useCallback(async () => {
    try {
      const res = await fetch(API_URL);

      if (!res.ok) throw new Error("Unable to load destinations");

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.destinations || [];

      setDestinations(list);

      setSelectedDest((previous) => {
        if (!previous) return null;
        return list.find((d) => d._id === previous._id) || null;
      });

      setError("");
    } catch (err) {
      console.error("Destination fetch error:", err);
      setError("We couldn't load destinations. Please try again.");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // PREVENT BACKGROUND SCROLL WHEN DISCUSSION IS OPEN
  useEffect(() => {
    if (selectedDest || showAdminModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDest, showAdminModal]);

  // AVERAGE RATING
  const getAverageRating = (reviews = []) => {
    if (!reviews.length) return null;

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  };

  // BOOKING
  const handleBookNow = (dest) => {
    navigate(`/booking?tour=${encodeURIComponent(dest.title)}`);
  };

  // ADMIN UPLOAD
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
        headers: {
          "x-admin-secret": adminForm.secret,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed. Check your admin credentials.");
      }

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

      await fetchDestinations();
      alert("Destination published successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // POST COMMUNITY MESSAGE
  const handlePostThought = async (e) => {
    e.preventDefault();

    if (!thoughtForm.userName.trim() || !thoughtForm.message.trim()) return;

    setPosting(true);

    try {
      const res = await fetch(
        `${API_URL}/${selectedDest._id}/discussions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: thoughtForm.userName.trim(),
            message: thoughtForm.message.trim(),
          }),
        }
      );

      if (!res.ok) throw new Error("Unable to post your message.");

      setThoughtForm((prev) => ({
        ...prev,
        message: "",
      }));

      await fetchDestinations();
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  // POST REVIEW
  const handlePostReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.userName.trim() || !reviewForm.comment.trim()) return;

    setPosting(true);

    try {
      const res = await fetch(`${API_URL}/${selectedDest._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });

      if (!res.ok) throw new Error("Unable to submit your review.");

      setReviewForm({
        userName: "",
        rating: 5,
        comment: "",
      });

      await fetchDestinations();
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <section className="min-h-screen bg-[#f8f9fc] pt-32 md:pt-36 pb-20">

      {/* HERO HEADER */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

          <div>
            <span className="text-indigo-600 uppercase tracking-[0.2em] text-xs font-bold">
              Discover the world
            </span>

            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mt-3 tracking-tight">
              Find your next <span className="text-indigo-600">adventure.</span>
            </h1>

            <p className="text-gray-500 mt-4 max-w-xl leading-relaxed">
              Explore incredible destinations, discover exciting experiences
              and connect with other travellers before your journey begins.
            </p>
          </div>

          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all shadow-lg"
          >
            <Plus size={19} />
            Add Destination
          </button>

        </div>
      </div>

      {/* DESTINATIONS */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {pageLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDestinations}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl"
            >
              Try again
            </button>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-28 bg-white rounded-3xl border border-gray-100">
            <ImageIcon size={42} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">
              No destinations yet
            </h3>
            <p className="text-gray-500 mt-2">
              New travel experiences will appear here.
            </p>
          </div>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {destinations.map((dest, index) => {
              const average = getAverageRating(dest.reviews || []);

              return (
                <motion.article
                  key={dest._id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >

                  {/* IMAGE */}
                  <div
                    onClick={() => navigate(`/destination/${dest._id}`)}
                    className="relative h-64 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={dest.image}
                      alt={dest.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <MapPin size={13} className="text-indigo-600" />
                      {dest.location}
                    </div>

                    {average && (
                      <div className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={13} fill="#eab308" color="#eab308" />
                        {average}
                        <span className="text-gray-400 font-normal">
                          ({dest.reviews?.length || 0})
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="text-xs uppercase tracking-widest text-white/80 mb-2">
                        Explore destination
                      </p>

                      <h2 className="text-2xl font-bold">
                        {dest.title}
                      </h2>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="p-6 flex flex-col flex-1">

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-indigo-500" />
                        {dest.duration}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MessageCircle size={15} className="text-indigo-500" />
                        {dest.discussions?.length || 0} discussions
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm leading-6 line-clamp-3 mb-6">
                      {dest.description}
                    </p>

                    <div className="mt-auto border-t border-gray-100 pt-5">

                      <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Starting from
                          </p>
                          <p className="text-xl font-bold text-indigo-600">
                            {dest.price}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/destination/${dest._id}`)}
                          className="text-sm font-semibold text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                        >
                          Details <ArrowUpRight size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <button
                          onClick={() => {
                            setActiveTab("discussion");
                            setSelectedDest(dest);
                          }}
                          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-sm hover:bg-indigo-100 transition"
                        >
                          <MessageSquare size={16} />
                          Discuss
                        </button>

                        <button
                          onClick={() => handleBookNow(dest)}
                          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
                        >
                          Book Now
                          <ChevronRight size={17} />
                        </button>

                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}

          </div>
        )}
      </div>

      {/* BOTTOM AD */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-16">
        <AdBanner />
      </div>

      {/* FULL SCREEN COMMUNITY EXPERIENCE */}
      <AnimatePresence>
        {selectedDest && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[10000] bg-white flex flex-col h-[100dvh] overflow-hidden"
          >

            {/* FULL SCREEN HEADER */}
            <header className="shrink-0 border-b border-gray-100 bg-white px-4 sm:px-8 py-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between">

                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedDest(null)}
                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    aria-label="Close discussion"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="min-w-0">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                      Traveller community
                    </p>
                    <h2 className="font-bold text-gray-900 truncate">
                      {selectedDest.title}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDest(null)}
                  className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                >
                  <X size={18} /> Close
                </button>

              </div>
            </header>

            {/* DESTINATION SUMMARY */}
            <div className="shrink-0 bg-[#f8f9fc] border-b border-gray-100">
              <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-4">

                <img
                  src={selectedDest.image}
                  alt={selectedDest.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    {selectedDest.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {selectedDest.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {selectedDest.duration}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookNow(selectedDest)}
                  className="shrink-0 bg-indigo-600 text-white px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-700 transition"
                >
                  Book Trip
                </button>

              </div>
            </div>

            {/* DISCUSSION / REVIEWS TABS */}
            <div className="shrink-0 border-b border-gray-100 bg-white">
              <div className="max-w-6xl mx-auto px-4 sm:px-8 flex gap-8">

                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`py-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
                    activeTab === "discussion"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  <MessageCircle size={17} />
                  Community Chat
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {selectedDest.discussions?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
                    activeTab === "reviews"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  <Star size={17} />
                  Reviews
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {selectedDest.reviews?.length || 0}
                  </span>
                </button>

              </div>
            </div>

            {/* MAIN FULL SCREEN CONTENT */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8f9fc]">

              <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">

                {activeTab === "discussion" ? (
                  <>

                    {/* CHAT INTRO */}
                    <div className="mb-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Talk about this destination
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Ask questions, exchange travel tips and connect with
                        other people interested in this trip.
                      </p>
                    </div>

                    {/* MESSAGES */}
                    <div className="space-y-5 pb-8">

                      {selectedDest.discussions?.length > 0 ? (
                        selectedDest.discussions.map((item) => (
                          <div
                            key={item._id}
                            className="flex gap-3 sm:gap-4"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold uppercase">
                              {item.userName?.charAt(0) || "T"}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-bold text-gray-900 text-sm">
                                  {item.userName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(item.createdAt)}
                                </span>
                              </div>

                              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 sm:p-5">
                                <p className="text-sm sm:text-base text-gray-700 leading-7 whitespace-pre-wrap break-words">
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 text-center py-16 px-6">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5">
                            <MessageCircle size={30} />
                          </div>

                          <h4 className="text-lg font-bold text-gray-900">
                            Start the conversation
                          </h4>

                          <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                            No one has posted here yet. Be the first to ask
                            a question or share a travel tip.
                          </p>
                        </div>
                      )}

                    </div>

                  </>
                ) : (

                  <>
                    {/* REVIEWS */}
                    <div className="mb-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Traveller reviews
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        See what travellers think about this destination.
                      </p>

                      {getAverageRating(selectedDest.reviews || []) && (
                        <div className="mt-5 inline-flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-5 py-3">
                          <span className="text-3xl font-bold text-gray-900">
                            {getAverageRating(selectedDest.reviews || [])}
                          </span>
                          <div>
                            <div className="flex text-yellow-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={15}
                                  fill={
                                    star <= Math.round(
                                      Number(getAverageRating(selectedDest.reviews || []))
                                    )
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {selectedDest.reviews.length} reviews
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {selectedDest.reviews?.length > 0 ? (
                        selectedDest.reviews.map((rev) => (
                          <div
                            key={rev._id}
                            className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-700 flex items-center justify-center font-bold">
                                  {rev.userName?.charAt(0) || "T"}
                                </div>

                                <div>
                                  <h4 className="font-bold text-sm text-gray-900">
                                    {rev.userName}
                                  </h4>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatDate(rev.createdAt)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-0.5 text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    fill={star <= Number(rev.rating) ? "currentColor" : "none"}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-7 mt-4">
                              {rev.comment}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white rounded-3xl text-center py-16 px-6 border border-gray-100">
                          <Star size={34} className="mx-auto text-yellow-400 mb-4" />
                          <h4 className="font-bold text-gray-900">
                            No reviews yet
                          </h4>
                          <p className="text-sm text-gray-500 mt-2">
                            Be the first traveller to review this destination.
                          </p>
                        </div>
                      )}
                    </div>
                  </>

                )}

              </div>
            </div>

            {/* FIXED MESSAGE COMPOSER */}
            <div className="shrink-0 bg-white border-t border-gray-200 px-4 sm:px-8 py-4">
              <div className="max-w-4xl mx-auto">

                {activeTab === "discussion" ? (

                  <form onSubmit={handlePostThought}>
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Your name"
                        value={thoughtForm.userName}
                        onChange={(e) =>
                          setThoughtForm({
                            ...thoughtForm,
                            userName: e.target.value,
                          })
                        }
                        className="w-full sm:w-48 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="flex items-end gap-3">
                      <textarea
                        placeholder="Write a message or ask the community something..."
                        value={thoughtForm.message}
                        onChange={(e) =>
                          setThoughtForm({
                            ...thoughtForm,
                            message: e.target.value,
                          })
                        }
                        rows={2}
                        className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        required
                      />

                      <button
                        type="submit"
                        disabled={posting || !thoughtForm.userName.trim() || !thoughtForm.message.trim()}
                        className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition"
                        aria-label="Send message"
                      >
                        {posting ? (
                          <Loader2 size={19} className="animate-spin" />
                        ) : (
                          <Send size={19} />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-2">
                      Keep conversations respectful and helpful to other travellers.
                    </p>
                  </form>

                ) : (

                  <form onSubmit={handlePostReview}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Your name"
                        value={reviewForm.userName}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            userName: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        required
                      />

                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            rating: Number(e.target.value),
                          })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                      >
                        <option value={5}>★★★★★ - Excellent</option>
                        <option value={4}>★★★★ - Very good</option>
                        <option value={3}>★★★ - Good</option>
                        <option value={2}>★★ - Fair</option>
                        <option value={1}>★ - Poor</option>
                      </select>
                    </div>

                    <div className="flex items-end gap-3">
                      <textarea
                        placeholder="Share your experience..."
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            comment: e.target.value,
                          })
                        }
                        rows={2}
                        className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        required
                      />

                      <button
                        type="submit"
                        disabled={posting || !reviewForm.userName.trim() || !reviewForm.comment.trim()}
                        className="h-12 px-5 shrink-0 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {posting ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <>
                            Submit <Send size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                )}

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN UPLOAD MODAL */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdminModal(false)}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Add destination
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Publish a new travel experience.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleAdminUpload} className="space-y-4">

                <input
                  type="password"
                  placeholder="Admin Secret Password"
                  value={adminForm.secret}
                  onChange={(e) => setAdminForm({
                    ...adminForm,
                    secret: e.target.value,
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  required
                />

                <input
                  type="text"
                  placeholder="Destination title"
                  value={adminForm.title}
                  onChange={(e) => setAdminForm({
                    ...adminForm,
                    title: e.target.value,
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  required
                />

                <input
                  type="text"
                  placeholder="Location (e.g. Kenya)"
                  value={adminForm.location}
                  onChange={(e) => setAdminForm({
                    ...adminForm,
                    location: e.target.value,
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Duration"
                    value={adminForm.duration}
                    onChange={(e) => setAdminForm({
                      ...adminForm,
                      duration: e.target.value,
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Price"
                    value={adminForm.price}
                    onChange={(e) => setAdminForm({
                      ...adminForm,
                      price: e.target.value,
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <textarea
                  placeholder="Description and highlights"
                  rows={4}
                  value={adminForm.description}
                  onChange={(e) => setAdminForm({
                    ...adminForm,
                    description: e.target.value,
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none"
                  required
                />

                <div className="border border-dashed border-gray-300 rounded-xl p-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Destination image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAdminForm({
                      ...adminForm,
                      image: e.target.files?.[0] || null,
                    })}
                    className="w-full text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Destination"
                  )}
                </button>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Tours;
