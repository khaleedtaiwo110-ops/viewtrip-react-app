import React, { useState } from 'react';

const countriesData = [
  {
    name: 'Ghana',
    flag: '🇬🇭',
    region: 'West Africa',
    status: 'visa-free',
    stayDuration: '90 Days',
    processing: 'Instant on Arrival',
    fee: 'Free (ECOWAS)',
    note: 'Visa-free entry under ECOWAS protocol. Simply present your valid Nigerian passport at the border.',
    documents: ['Valid Passport (6+ months)', 'Yellow Fever Card', 'Return/Onward Ticket'],
  },
  {
    name: 'Rwanda',
    flag: '🇷🇼',
    region: 'East Africa',
    status: 'visa-free',
    stayDuration: '30 Days',
    processing: 'Instant on Arrival',
    fee: 'Free',
    note: 'Visa-free entry for African Union citizens with zero prior paperwork or visa fees required.',
    documents: ['Valid Passport (6+ months)', 'Hotel Reservation', 'Return Flight Itinerary'],
  },
  {
    name: 'Barbados',
    flag: '🇧🇧',
    region: 'Caribbean',
    status: 'visa-free',
    stayDuration: '6 Months',
    processing: 'Instant on Arrival',
    fee: 'Free',
    note: 'Enjoy extended visa-free tourist and business stays upon presenting proof of accommodation and funds.',
    documents: ['Valid Passport', 'Proof of Accommodation', 'Sufficient Funds & Return Ticket'],
  },
  {
    name: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    status: 'embassy',
    stayDuration: 'Up to 6 Months',
    processing: '3 Weeks Avg.',
    fee: 'From £115',
    note: 'Standard Visitor Visa requires an online application followed by biometrics at TLScontact or VFS.',
    documents: ['Valid Passport', '6-Month Bank Statement', 'Employment/Business Letter', 'Travel Itinerary'],
  },
  {
    name: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    status: 'embassy',
    stayDuration: 'B1/B2 Validity',
    processing: 'Interview Required',
    fee: '$185 MRV Fee',
    note: 'Requires DS-160 online form completion, MRV fee payment, and an in-person consular interview.',
    documents: ['DS-160 Confirmation', 'Valid Passport', 'SEVIS/MRV Fee Receipt', 'Ties & Financial Proof'],
  },
  {
    name: 'Canada',
    flag: '🇨🇦',
    region: 'North America',
    status: 'embassy',
    stayDuration: 'Up to 6 Months',
    processing: '4–8 Weeks Avg.',
    fee: 'CAD $185 (incl. Biometrics)',
    note: 'Temporary Resident Visa (TRV) filed online via IRCC portal with mandatory biometrics enrollment.',
    documents: ['Valid Passport', 'IRCC Application Forms', 'Proof of Funds', 'Purpose of Travel Letter'],
  },
];

export default function VisaDirectory() {
  const [inputValue, setInputValue] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCheckRequirement = (e) => {
    e.preventDefault();
    setActiveSearch(inputValue.trim());
  };

  const handleReset = () => {
    setInputValue('');
    setActiveSearch('');
  };

  const filteredCountries = countriesData.filter((country) =>
    country.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
    country.region.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const visaFreeList = filteredCountries.filter((c) => c.status === 'visa-free');
  const embassyList = filteredCountries.filter((c) => c.status === 'embassy');

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* SECTION 1: Hero Search Form */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-800">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sky-300 text-xs font-semibold tracking-wide uppercase mb-4">
              <span>✈️</span> Global Visa & Entry Checker
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              Which country are you traveling to?
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
              Enter your destination to instantly see whether you enjoy visa-free access or need to schedule an embassy application.
            </p>
          </div>

          <form onSubmit={handleCheckRequirement} className="relative z-10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (e.target.value === '') setActiveSearch('');
                }}
                placeholder="Type a country or region (e.g., Rwanda, United Kingdom, Europe...)"
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 text-base font-medium"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-4 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              Check Requirement
            </button>

            {(inputValue || activeSearch) && (
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-4 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-2xl border border-white/10 transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
        </section>

        {/* SECTION 2: Visa-Free Countries */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shadow-xs">
                🛂
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Visa-Free Countries</h2>
                <p className="text-sm text-slate-500">Pack your bags—no prior embassy visit or visa sticker required.</p>
              </div>
            </div>
            <span className="self-start sm:self-center bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-xs font-bold px-3.5 py-1.5 rounded-full">
              {visaFreeList.length} {visaFreeList.length === 1 ? 'Destination' : 'Destinations'}
            </span>
          </div>

          {visaFreeList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visaFreeList.map((country) => (
                <div
                  key={country.name}
                  className="group relative bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Accent Strip */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

                  <div>
                    <div className="flex items-start justify-between mb-4 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl leading-none">{country.flag}</span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {country.name}
                          </h3>
                          <span className="text-xs font-medium text-slate-400">{country.region}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Visa-Free
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-5">
                      {country.note}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block">Max Stay</span>
                        <span className="font-bold text-slate-800">{country.stayDuration}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Visa Fee</span>
                        <span className="font-bold text-emerald-700">{country.fee}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCountry(country)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      View Entry Checklist →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center text-slate-500 text-sm">
              No visa-free countries matched <span className="font-semibold text-slate-700">"{activeSearch}"</span>.
            </div>
          )}
        </section>

        {/* SECTION 3: Apply in Embassy */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shadow-xs">
                🏛️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Apply in Embassy</h2>
                <p className="text-sm text-slate-500">Advance visa filing, supporting documents, and biometrics required.</p>
              </div>
            </div>
            <span className="self-start sm:self-center bg-amber-100/80 text-amber-800 border border-amber-200 text-xs font-bold px-3.5 py-1.5 rounded-full">
              {embassyList.length} {embassyList.length === 1 ? 'Destination' : 'Destinations'}
            </span>
          </div>

          {embassyList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {embassyList.map((country) => (
                <div
                  key={country.name}
                  className="group relative bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Accent Strip */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />

                  <div>
                    <div className="flex items-start justify-between mb-4 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl leading-none">{country.flag}</span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {country.name}
                          </h3>
                          <span className="text-xs font-medium text-slate-400">{country.region}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Embassy Visa
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-5">
                      {country.note}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block">Processing</span>
                        <span className="font-bold text-slate-800">{country.processing}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Est. Fee</span>
                        <span className="font-bold text-amber-700">{country.fee}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCountry(country)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Check Visa Requirements →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center text-slate-500 text-sm">
              No embassy-application countries matched <span className="font-semibold text-slate-700">"{activeSearch}"</span>.
            </div>
          )}
        </section>

      </div>

      {/* Requirement Details Modal */}
      {selectedCountry && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedCountry(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedCountry.flag}</span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCountry.name}</h3>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {selectedCountry.status === 'visa-free' ? 'Visa-Free Entry' : 'Embassy Application Required'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{selectedCountry.note}</p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Required Documents
              </h4>
              <ul className="space-y-2">
                {selectedCountry.documents.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 font-bold">✓</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedCountry(null)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}