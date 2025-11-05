import React from "react";
import { useNavigate } from "react-router-dom";

const tours = [
  {
    name: "Romantic Paris Getaway",
    price: "$799",
    duration: "5 Days",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      "Day 1: Arrival in Paris – Eiffel Tower night tour.",
      "Day 2: Visit the Louvre & Seine River cruise.",
      "Day 3: Explore Montmartre and local cafés.",
      "Day 4: Versailles Palace day trip.",
      "Day 5: Shopping on Champs-Élysées and departure."
    ]
  },
  {
    name: "Dubai Desert Adventure",
    price: "$999",
    duration: "7 Days",
    image: "https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      "Day 1: Arrival and Marina Dhow Cruise.",
      "Day 2: City tour – Burj Khalifa & Dubai Mall.",
      "Day 3: Desert safari with BBQ dinner.",
      "Day 4: Visit Abu Dhabi Grand Mosque.",
      "Day 5: Atlantis Water Park adventure.",
      "Day 6: Beach leisure day.",
      "Day 7: Departure."
    ]
  },
  {
    name: "Bali Tropical Escape",
    price: "$699",
    duration: "6 Days",
    image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      "Day 1: Arrival and sunset dinner at Jimbaran Bay.",
      "Day 2: Ubud rice terraces & monkey forest.",
      "Day 3: Snorkeling at Nusa Penida.",
      "Day 4: Waterfall and temple tour.",
      "Day 5: Free day for beach relaxation.",
      "Day 6: Departure."
    ]
  },
  {
    name: "Tokyo Highlights",
    price: "$899",
    duration: "5 Days",
    image: "https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      "Day 1: Arrival & Shibuya night walk.",
      "Day 2: Tokyo Tower & Asakusa Temple.",
      "Day 3: Mt. Fuji and Lake Kawaguchi trip.",
      "Day 4: Shopping in Shinjuku and Akihabara.",
      "Day 5: Departure."
    ]
  },
  {
    name: "Santorini Bliss",
    price: "$899",
    duration: "6 Days",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    itinerary: [
      "Day 1: Arrival and sunset dinner in Oia.",
      "Day 2: Explore Fira & Amoudi Bay.",
      "Day 3: Volcano cruise and hot springs.",
      "Day 4: Wine tasting and cooking class.",
      "Day 5: Free day for beach relaxation.",
      "Day 6: Departure."
    ]
  }
];

export default function Tours() {
  const navigate = useNavigate();

  const handleBookNow = (tourName) => {
    navigate(`/booking?tour=${encodeURIComponent(tourName)}`);
  };

  return (
    <div
      className="relative bg-cover bg-center py-20"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative z-10 px-6 md:px-12 lg:px-20 text-white">
        <h2 className="text-4xl font-bold mb-10 text-center">
          ✈️ Explore Our Tour Packages
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tours.map((tour, i) => (
            <div
              key={i}
              className="bg-white bg-opacity-90 text-gray-800 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition duration-500"
            >
              <img
                src={tour.image}
                alt={tour.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{tour.name}</h3>
                <p className="text-gray-500 mb-2">{tour.duration}</p>
                <p className="text-blue-600 font-semibold mb-4 text-lg">
                  {tour.price}
                </p>
                <h4 className="font-semibold text-gray-800 mb-2">
                  🗓️ Itinerary:
                </h4>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {tour.itinerary.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleBookNow(tour.name)}
                  className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


