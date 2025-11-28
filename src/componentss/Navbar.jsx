import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Detect scroll depth
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Detect if user is on Home page
  const isHome = location.pathname === "/";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Tours", path: "/tours" },
    { name: "Testimonials", path: "/testimonials" },
    { name: "Contact", path: "/contact" },
    { name: "Search Flights", path: "/flight-offers" },
    { name: "Visas", path: "/visas" },
    { name: "Travel Blog", path: "/blog" },
    { name: "Trending Hotels", path: "/Trendinghotels" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-9999">

      {/* ============ TOP BAR — show only on Home + not scrolled ============ */}
      {!isHome && ( 
        <div className="px-6 py-2 bg-black/40 text-white text-sm flex justify-between transition-all duration-500">
          <div className="flex items-center gap-6">
            <span>📞 09134490422</span>
            <span>✉️ info@viewtriptravels.com</span>
          </div>

          <div className="flex items-center gap-4 text-lg">
            <a href="#" className="hover:text-orange-300">🌐</a>
            <a href="#" className="hover:text-orange-300">📘</a>
            <a href="#" className="hover:text-orange-300">📸</a>
            <a href="#" className="hover:text-orange-300">🐦</a>
          </div>
        </div>
      )}

{/* ============ LOGO ROW FOR HOME PAGE ============ */}
{!scrolled && isHome && (
  <div className="px-6 py-4 bg-white/10 backdrop-blur-md transition-all duration-500">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link to="/" className="text-3xl font-extrabold text-white">
        ViewTrip<span className="text-orange-400">Travels</span>
      </Link>

      <div className="hidden md:flex flex-col text-right text-white">
        <span className="text-sm opacity-90">📞 Call Us</span>
        <span className="font-bold text-lg">08023236840</span>
        <span className="text-xs opacity-80">We're open 24/7</span>
      </div>

      <button onClick={toggleMenu} className="md:hidden text-white p-2">
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>
    </div>
  </div>
)}

{/* ============ LOGO ROW FOR OTHER PAGES ============ */}
{ scrolled && isHome && (
  <div className="px-6 py-2 bg-white shadow-sm">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-gray-900">
        ViewTrip<span className="text-orange-500">Travels</span>
      </Link>

      <button onClick={toggleMenu} className="md:hidden text-gray-900 p-2">
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>
    </div>
  </div>
)}


      {/* ============ NAV LINKS ROW ============ */}
      <nav
        className={`w-full transition-all duration-500 ${
          scrolled
            ? "bg-white shadow-md"
            : isHome
            ? "bg-white/20 backdrop-blur-md"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">

          {/* Desktop menu */}
          <ul className="hidden md:flex justify-center gap-10 text-lg font-medium">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;

              const textColor = isHome
                ? scrolled
                  ? "text-gray-700"
                  : "text-white"
                : "text-gray-700";

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    ${textColor}
                    transition-all duration-300
                    ${
                      active
                        ? "text-orange-500 border-b-2 border-orange-500 pb-1"
                        : "hover:text-orange-500"
                    }
                  `}
                >
                  {link.name}
                </Link>
              );
            })}
          </ul>

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden absolute left-0 w-full bg-white shadow-xl border-t p-5 animate-slide-down z-[99999]">
              <ul className="flex flex-col gap-5 text-gray-800 font-semibold text-lg">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="hover:text-orange-500"
                  >
                    {link.name}
                  </Link>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t text-center">
                <p className="text-xl font-bold text-blue-700">📞 08023236840</p>
                <p className="text-sm text-gray-600">We're open 24/7</p>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
