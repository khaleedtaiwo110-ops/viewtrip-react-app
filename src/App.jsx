import React from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // Added useLocation
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
import AboutUs from "./pages/AboutUs";
import Disclaimer from "./pages/Disclaimer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

function App() {
  const location = useLocation();

  // Check if the current page is the home page
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 relative">
      <Navbar />

      {/* 💡 SMART CONDITIONAL PADDING:
        - If on Home Page: pt-0 (allows hero image to sit behind the transparent/fixed navbar beautifully)
        - If on any OTHER page: pt-24 md:pt-28 (safely pushes internal content downwards so it's never covered)
      */}
      <main 
        className={`flex-grow transition-all duration-300 ${
          isHomePage ? "pt-0" : "pt-24 md:pt-28"
        }`}
      >
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
          <Route path="/blog" element={<Blog />} />
          <Route path="/Trendinghotels" element={<TrendingHotels />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
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



