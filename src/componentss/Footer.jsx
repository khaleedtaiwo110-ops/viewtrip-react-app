import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto py-10 px-6 grid md:grid-cols-3 gap-8">
        {/* 🧭 Company Info */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">ViewTrip</h2>
          <p className="text-sm leading-relaxed">
            Making travel easier, faster, and more enjoyable.
            We help you discover destinations, book flights, and explore the world — all in one place.
          </p>
          <div className="flex items-center mt-4 space-x-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* 🔗 Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/destinations" className="hover:text-white">Destinations</Link></li>
            <li><Link to="/tours" className="hover:text-white">Tours</Link></li>
            <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link to="/booking" className="hover:text-white">Booking</Link></li>
              <a href="/privacy-policy" className="block hover:text-white">Privacy Policy</a>
  <a href="/terms" className="block hover:text-white">Terms & Conditions</a>
  <a href="/about-us" className="block hover:text-white">About Us</a>
 
  <a href="/disclaimer" className="block hover:text-white">Disclaimer</a>
          </ul>
        </div>

        {/* 📞 Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-blue-400" /> 
              <span>09134490422 | 08023236840</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-blue-400" /> 
              <span>support@viewtrip.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-400" /> 
              <span>Lagos, Nigeria</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-4 space-y-2">

</div>
{/* 🌍 Accreditation Logos – Styled */}
<div className="w-full mt-10  justify-center">
  <div className="backdrop-blur-md  border border-white/10  p-6 flex flex-wrap items-center justify-center gap-10 ">
    
    {/* IATA */}
    <div className="flex flex-col items-center group">
      <img
        src="/images/logo/iata.png"
        alt="IATA"
        className="h-12 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-lg"
      />
      <p className="text-gray-400 text-xs mt-2 group-hover:text-white transition">
        IATA Accredited
      </p>
    </div>

    {/* NANTA */}
    <div className="flex flex-col items-center group">
      <img
        src=" /images/logo/nanta.png"
        alt="NANTA"
        className="h-12 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-lg"
      />
      <p className="text-gray-400 text-xs mt-2 group-hover:text-white transition">
        NANTA Certified
      </p>
    </div>

    {/* NCAA */}
    <div className="flex flex-col items-center group">
      <img
        src=" /images/logo/ncaa.png"
        alt="NCAA"
        className="h-12 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-lg"
      />
      <p className="text-gray-400 text-xs mt-2 group-hover:text-white transition">
        NCAA Approved
      </p>
    </div>

  </div>
</div>



      {/* 🧾 Bottom Bar */}
      <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} ViewTrip. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;

