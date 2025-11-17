import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./componentss/Navbar";
import Footer from "./componentss/Footer";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Tours from "./pages/Tours";
import Gallery from "./pages/Gallery";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import FlightOffers from "./pages/FlightOffers";
import BookingForm from "./components/BookingForm";
import VisaSection from "./pages/visa";
import Blog from "./pages/Blog";
import TrendingHotels from "./pages/TrendingHotels";


function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 pt-16">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/flight-offers" element={<FlightOffers />} />
          <Route path="/book" element={<BookingForm />} />
          <Route path="/visas" element={<VisaSection />} />
          <Route path="/blog" element={<Blog/>} />
          <Route path="/Trendinghotels" element={<TrendingHotels/>} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
// export default function App() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white/80">
//       <h1 className="text-3xl font-bold text-blue-700">Tailwind Works ✅</h1>
//     </div>
//   );
// }



