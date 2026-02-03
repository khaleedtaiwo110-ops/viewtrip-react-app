import React from "react";

export default function AboutUs() {
  const bgImage = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2074";

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Corporate Background */}
      <section 
        className="relative h-[60vh] flex items-center justify-center text-white bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url(${bgImage})` }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Beyond Travel. <br/>
            <span className="text-blue-400">We Build Mobility Engines.</span>
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto text-slate-200">
            Architecting the logistics tracks that allow institutional visions to run without friction.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-5xl mx-auto p-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Evolution</h2>
            <p className="text-lg leading-relaxed mb-6 text-slate-700">
              Since 2008, **ViewTrip Travels** has evolved from a ticketing agency into a 
              strategic mobility partner for institutional leaders and growing enterprises. 
              We don't just book trips; we solve the "Hidden Friction" that costs your 
              business time and momentum.
            </p>
            <p className="text-lg leading-relaxed text-slate-700">
              In a volatile market, operational resilience is your greatest asset. 
              We eliminate bottlenecks in transit and timing so your analysts land 
              ready to execute, not recover.
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-slate-800">The ViewTrip Standard</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  <h4 className="font-bold text-slate-900">Operational Agility</h4>
                  <p className="text-sm text-slate-600">Real-time adaptation to regional flight shifts to protect your man-hours.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <h4 className="font-bold text-slate-900">Zero-Friction Logistics</h4>
                  <p className="text-sm text-slate-600">Seamless airport-to-site transit designed for the corporate occupier.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <h4 className="font-bold text-slate-900">Sovereign Service</h4>
                  <p className="text-sm text-slate-600">A managed mobility engine that runs effectively without the need for micromanagement.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Contact Info */}
        <div className="mt-20 border-t pt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-800">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">Strategic Inquiries</p>
            <p className="font-medium">viewtriptravels.co@gmail.com</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">Logistics Desk</p>
            <p className="font-medium">08023236840</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">Operations Hub</p>
            <p className="font-medium">Suite 406, Ikeja Plaza, Lagos.</p>
          </div>
        </div>
      </section>
    </main>
  );
}