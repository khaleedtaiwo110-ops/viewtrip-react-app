import React from "react";

export default function TermsAndConditions() {
  return (
    <section className="max-w-5xl mx-auto p-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

      <p className="mb-4">
        Welcome to ViewTrip Travels. By using our website and services, you agree
        to the following terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Use of Service</h2>
      <p className="mb-4">
        Our platform allows users to search and book flights, hotels, and tour
        packages. All bookings are subject to availability and partner terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">User Responsibilities</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Provide accurate and complete information</li>
        <li>Ensure passport, visa, and travel requirements are valid</li>
        <li>Follow airline and hotel rules</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Payment & Refunds</h2>
      <p className="mb-4">
        Payments must be completed before confirmation. Refund policies depend on
        the airline, hotel, or service provider and may vary.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Limitation of Liability</h2>
      <p>
        ViewTrip Travels is not responsible for losses due to airline delays,
        cancellations, visa denials, or other factors outside our control.
      </p>
    </section>
  );
}
