import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { MapPin, Phone, Mail } from "lucide-react";

const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("Sending...");

    emailjs
      .sendForm(
        "service_6rg5lut",
        "template_4y2a6ql",
        form.current,
        "lLB9-YAepWDRTXH6k"
      )
      .then(
        () => {
          setStatus("✅ Message sent successfully!");
          form.current.reset();
          setTimeout(() => setStatus(""), 3000);
        },
        (error) => {
          console.error(error.text);
          setStatus("❌ Failed to send. Try again later.");
        }
      );
  };

  return (
    <div className="relative">
      {/* Contact Section with Background */}
      <section
        className="relative flex flex-col md:flex-row items-center justify-center gap-10 py-20 px-6 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Floating icons */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png" // plane
          alt="Plane"
          className="absolute w-12 top-10 left-0 animate-float-horizontal opacity-60"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/414/414927.png" // cloud
          alt="Cloud"
          className="absolute w-24 top-20 right-10 animate-float-slow opacity-50"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/414/414927.png" // cloud
          alt="Cloud"
          className="absolute w-32 bottom-20 left-10 animate-float-slower opacity-40"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 w-full max-w-6xl">
          {/* Contact Info */}
          <div className="flex-1 max-w-md space-y-6 text-white">
            <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="mb-6">
              Have questions about bookings, tours, or destinations? Send us a message — we’ll get back to you quickly.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-400" />
                <span>Ikeja, Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-blue-400" />
                <span>+234 8023236840</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-blue-400" />
                <span>Khaleedtaiwo110@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            ref={form}
            onSubmit={sendEmail}
            className="flex-1 max-w-md bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg space-y-4 w-full"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Send a Message</h3>

            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="email"
              name="user_email"
              placeholder="Your Email"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Send Message
            </button>

            {status && (
              <p className="text-center text-sm mt-2 text-blue-600 font-medium">
                {status}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Google Maps Embed */}
      <section className="w-full h-[400px] -mt-8 relative z-10">
        <iframe
          title="Ikeja Office Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.326148512258!2d3.353096175008688!3d6.601712495249466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bfec1f7b5c5e3%3A0x4f21e407bd773b91!2sIkeja%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1696442000000!5m2!1sen!2sng"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-none"
        ></iframe>
      </section>

      {/* Tailwind animation classes */}
      <style jsx>{`
        @keyframes float-horizontal {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(100vw); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
        @keyframes float-slower {
          0% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
          100% { transform: translateY(0); }
        }

        .animate-float-horizontal {
          animation: float-horizontal 20s linear infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Contact;
