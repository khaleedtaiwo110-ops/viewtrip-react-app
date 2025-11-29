import React from "react";

export default function AboutUs() {
  return (
    <section className="max-w-5xl mx-auto p-6 py-16">
      <h1 className="text-3xl font-bold mb-6">About ViewTrip Travels</h1>

      <p className="mb-4">
        ViewTrip Travels is a leading travel solutions provider founded in 2008.
        We specialize in affordable flight tickets, hotel bookings, tour
        packages, and visa support services.
      </p>

      <p className="mb-4">
        Our mission is simple: make travel easy, accessible, and stress-free for
        individuals, families, and businesses across the world.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Why Choose Us?</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Real-time flight deals</li>
        <li>Trusted hotel partners worldwide</li>
        <li>Secure online bookings</li>
        <li>24/7 customer support</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Company Info</h2>
      <p>Business Name: ViewTrip Travels</p>
      <p>Email: viewtriptravels@gmail.com</p>
      <p>Phone: 08023236840</p>
      <p>Address: Ikeja Plaza, Suit 406</p>
    </section>
  );
}
