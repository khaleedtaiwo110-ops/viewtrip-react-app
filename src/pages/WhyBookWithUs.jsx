import React from 'react';
import { Plane, Users, MapPin, CheckCircle } from 'lucide-react';
import CountUp from 'react-countup';

const features = [
  { icon: <Plane className="w-12 h-12 text-white mb-2" />, title: '100% Custom Trips', description: 'We tailor each travel plan to fit your preferences and style.' },
  { icon: <Users className="w-12 h-12 text-white mb-4" />, title: 'Local Experts', description: 'Get insights from our local travel experts for a truly authentic experience.' },
  { icon: <MapPin className="w-12 h-12 text-white mb-4" />, title: 'No Hidden Charges', description: 'All prices are transparent — what you see is what you pay.' },
  { icon: <CheckCircle className="w-12 h-12 text-white mb-4" />, title: 'Trusted & Award-Winning', description: 'Our agency is recognized by top travel organizations for excellence.' },
];

const stats = [
  { end: 120, label: 'Destinations', icon: <Plane className="w-6 h-6 text-white mb-2" /> },
  { end: 85, label: 'Hotels', icon: <MapPin className="w-6 h-6 text-white mb-2" /> },
  { end: 45, label: 'Tours', icon: <Users className="w-6 h-6 text-white mb-2" /> },
  { end: 10000, label: 'Happy Travelers', suffix: '+', icon: <CheckCircle className="w-6 h-6 text-white mb-2" /> },
];

export default function WhyBookWithUs() {
  return (
    <section className="py-20 bg-linear-to-r from-blue-500 via-purple-600 to-pink-500 text-white">
      <div className="  mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Why Book With Us</h2>
        <p className="text-lg mb-12">
          Experience the best in travel services. Here’s why travelers love booking with us.
        </p>

        {/* Feature Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-6  bg-opacity-10 backdrop-blur-md rounded-2xl shadow-lg hover:scale-105 transform transition duration-500"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Circular Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {/* Small Icon */}
              {stat.icon}
              {/* Circle with number */}
              <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center mb-4 relative">
                <CountUp
                  start={0}
                  end={stat.end}
                  duration={2}
                  suffix={stat.suffix || ''}
                  className="text-2xl font-bold"
                />
              </div>
              <p className="text-lg font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
