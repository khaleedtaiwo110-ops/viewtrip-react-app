import React from "react";

export default function PrivacyPolicy() {
  return (
    <section className="max-w-5xl mx-auto p-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last updated: {new Date().getFullYear()}</p>

      <p className="mb-4">
        This Privacy Policy describes how ViewTrip Travels (“we”, “our”, “us”)
        collects, uses, and protects your information when you use our website
        and services. We are committed to safeguarding your privacy.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Information We Collect</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Personal details such as your name, email, phone number, and address</li>
        <li>Booking details (flights, hotels, tours, visas)</li>
        <li>Device and browser information</li>
        <li>Cookies for analytics and advertising</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">How We Use Your Information</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Process and confirm bookings</li>
        <li>Improve our services and user experience</li>
        <li>Communicate with you about your inquiries</li>
        <li>Display personalized ads as required by Google AdSense</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Cookies & Third-Party Ads</h2>
      <p className="mb-4">
        We use Google AdSense and Google Analytics. These third-party tools may
        use cookies to deliver targeted advertising and measure performance.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Your Rights</h2>
      <p>You may request access, update, or deletion of your personal data at any time.</p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Contact Us</h2>
      <p className="mb-2">Email: viewtriptravels@gmail.com</p>
      <p className="mb-2">Phone: 08023236840</p>
      <p>Address: Ikeja Plaza, Suit 406</p>
    </section>
  );
}
