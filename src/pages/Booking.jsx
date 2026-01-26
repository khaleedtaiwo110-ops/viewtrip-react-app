import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdBanner from "../componentss/adsgoogle";

const Booking = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Extract values from URL
  const preselectedFlight = queryParams.get("flight") || "";
  const preselectedHotel = queryParams.get("hotel") || "";
  const preselectedPrice = queryParams.get("price") || "";
  const checkInParam = queryParams.get("checkIn") || "";
  const checkOutParam = queryParams.get("checkOut") || "";
  const guestsParam = queryParams.get("guests") || 1;
  const preselectedTour = queryParams.get("tour") || "";
  const preselectedCountry = queryParams.get("country") || "";

  const [bookingType, setBookingType] = useState("");
  const [itemName, setItemName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Booking details state
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [checkIn, setCheckIn] = useState(checkInParam);
  const [checkOut, setCheckOut] = useState(checkOutParam);
  const [guests, setGuests] = useState(guestsParam);
  const [travelers, setTravelers] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    if (preselectedFlight) {
      setBookingType("flight");
      setItemName(preselectedFlight);
    } else if (preselectedHotel) {
      setBookingType("hotel");
      setItemName(preselectedHotel);
    } else if (preselectedTour) {
      setBookingType("tour");
      setItemName(preselectedTour);
    } else if (preselectedCountry) {
      setBookingType("visa");
      setItemName(preselectedCountry);
    }
  }, [preselectedFlight, preselectedHotel, preselectedTour, preselectedCountry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const info = { 
      name, 
      email, 
      type: bookingType, 
      itemName, 
      totalPrice: preselectedPrice 
    };

    // Pack data based on type
    if (bookingType === "flight") {
      info.passengers = passengers;
      info.travelClass = travelClass;
    } else if (bookingType === "hotel") {
      info.checkIn = checkIn;
      info.checkOut = checkOut;
      info.guests = guests;
    } else if (bookingType === "tour") {
      info.travelers = travelers;
      info.specialRequests = specialRequests;
    }

    try {
      const res = await fetch("https://view-trip-travels-app.onrender.com/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info),
      });

      const data = await res.json();
      if (data.success) {
        alert("Booking submitted successfully! Our team will contact you shortly.");
      } else {
        alert("Booking failed. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("System error. Please try again later.");
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-600 to-indigo-900 min-h-screen">
      <div className="relative max-w-2xl mx-auto px-4">
        <div className="text-center mb-8 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 uppercase tracking-tight">
            Confirm Your {bookingType}
          </h2>
          {preselectedPrice && (
            <p className="text-xl font-semibold bg-orange-500 inline-block px-4 py-1 rounded-full">
              Total: ₦{Number(preselectedPrice).toLocaleString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-2xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 outline-none transition"
                placeholder="example@mail.com"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <label className="block text-xs font-black text-blue-600 uppercase mb-1">Selected {bookingType}</label>
            <p className="text-lg font-bold text-gray-800">{itemName}</p>
          </div>

          {/* Type Specific Fields */}
          {bookingType === "flight" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Passengers</label>
                <input type="number" min="1" value={passengers} onChange={(e) => setPassengers(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Class</label>
                <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3">
                  <option value="ECONOMY">Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First</option>
                </select>
              </div>
            </div>
          )}

          {bookingType === "hotel" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Check-In</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Check-Out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Number of Guests</label>
                <input type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3" required />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-orange-200 transition transform active:scale-95"
          >
            CONFIRM & SUBMIT
          </button>
        </form>
        <div className="mt-8">
          <AdBanner />
        </div>
      </div>
    </section>
  );
};

export default Booking;