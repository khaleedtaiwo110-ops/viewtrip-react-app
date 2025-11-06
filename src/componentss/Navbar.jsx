import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Plane } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
    { name: "Tours", path: "/tours" },
    { name: "Gallery", path: "/gallery" },
    { name: "Testimonials", path: "/testimonials" },
    { name: "Contact", path: "/contact" },
    { name: "Search Flights", path: "/flight-offers" },
    // { name: "Booking", path: "/booking" },
    { name: "Visas", path: "/visas" },
  ];

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center text-2xl font-bold text-blue-600 hover:text-blue-700"
          >
            {/* <Plane className="mr-2 text-blue-500" size={24} /> */}
            View Trip Travels
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="flex flex-col items-center py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                {link.name}
              </Link>
            ))}
            <div className="text-sm text-gray-500 pt-2 border-t w-full text-center border-gray-200">
              📞 09134490422 | 08023236840
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
