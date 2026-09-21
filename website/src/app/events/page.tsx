'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Tag,
  Sparkles,
  Plus,
  Ticket,
  Users,
  CheckCircle2,
  Share2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  fetchEvents,
  registerEvent,
  EventItem,
  EVENT_PRICING_PLANS,
  PROFESSIONAL_PRICING_PLANS,
} from '@/services/directoryService';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Form State for Event Submission
  const [titleEn, setTitleEn] = useState('');
  const [titleTe, setTitleTe] = useState('');
  const [category, setCategory] = useState<'cultural' | 'expo' | 'sports' | 'devotional' | 'general'>('cultural');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [venue, setVenue] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [entryType, setEntryType] = useState<'free' | 'ticketed'>('free');
  const [ticketPrice, setTicketPrice] = useState('');
  const [tier, setTier] = useState<'standard' | 'free'>('standard');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadEvents();
  }, [activeCategory]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents(activeCategory);
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !dateStr || !venue || !contactPhone) {
      alert('Please fill in Event Title, Date, Venue, and Contact Phone.');
      return;
    }

    setSubmitting(true);
    try {
      const eventDocId = await registerEvent({
        title_en: titleEn,
        title_te: titleTe,
        category,
        dateStr,
        timeStr: timeStr || 'Timings TBA',
        venue,
        organizerName: organizerName || 'Kurnool Organizer',
        contactPhone,
        posterUrl: posterUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        entryType,
        ticketPrice: entryType === 'ticketed' ? ticketPrice : undefined,
        tier: tier === 'standard' ? 'featured' : 'free',
        status: 'approved',
      });

      if (tier === 'standard') {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded) {
          try {
            const orderRes = await fetch('/api/payments/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                planId: 'event_listing',
                businessId: eventDocId,
                businessName: titleEn,
                phone: contactPhone,
              }),
            });
            const orderData = await orderRes.json();
            if (orderData.success) {
              const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Kurnool One Events',
                description: `Event Listing Pass (₹2,999) - ${titleEn}`,
                order_id: orderData.orderId,
                prefill: {
                  contact: contactPhone,
                },
                theme: {
                  color: '#2563EB',
                },
                handler: function () {
                  setSubmitSuccess(true);
                  setTimeout(() => {
                    setSubmitSuccess(false);
                    setShowSubmitModal(false);
                    loadEvents();
                  }, 2500);
                },
              };
              const rzp = new (window as any).Razorpay(options);
              rzp.open();
              setSubmitting(false);
              return;
            }
          } catch (payErr) {
            console.warn('Payment order fallback:', payErr);
          }
        }
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSubmitModal(false);
        loadEvents();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Error submitting event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* ─── HERO HEADER ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kurnool City Happenings & Festivals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            Upcoming Events in Kurnool
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Stay updated with cultural celebrations at Tungabhadra Ghat, handloom expos, sports tournaments, food festivals, and temple fairs across Kurnool district.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List Your Event (Free & Sponsored)</span>
            </button>
            <button
              onClick={() => setShowPricingModal(true)}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>View Promotion Pricing</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── CATEGORY FILTER PILLS ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'cultural', label: 'Cultural & Devotional' },
          { id: 'expo', label: 'Expos & Trade Fairs' },
          { id: 'sports', label: 'Sports & Fitness' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shrink-0 transition cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── EVENTS GRID ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-lg">No events found</h3>
          <p className="text-slate-500 text-sm mt-1">Be the first to list an event in this category!</p>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-500 transition"
          >
            List Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Poster Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={item.posterUrl}
                    alt={item.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                        item.entryType === 'free'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {item.entryType === 'free' ? 'Free Entry' : item.ticketPrice || 'Ticketed'}
                    </span>
                    {item.tier === 'mega' && (
                      <span className="bg-purple-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Mega Fest
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition leading-snug mb-1">
                    {item.title_en}
                  </h3>
                  {item.title_te && (
                    <p className="text-xs text-slate-500 font-medium mb-3">{item.title_te}</p>
                  )}

                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{item.dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.timeStr}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{item.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 pt-1">
                      <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Organized by: <strong className="text-slate-700">{item.organizerName}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${item.contactPhone}`}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Organizer</span>
                </a>
                <a
                  href={`https://wa.me/91${item.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I saw your event "${item.title_en}" on Kurnool One. Can I get more details?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center transition"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── PRICING TIERS SECTION (MONETIZATION CLARITY) ────────────────── */}
      <section className="bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-3xl p-8 sm:p-12 border border-blue-100">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1 text-blue-600 text-xs font-black uppercase tracking-wider mb-2">
            <Ticket className="w-4 h-4" />
            <span>Transparent Pricing Models</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Pricing is Set for Events & Profiles
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Kurnool One offers 100% free community access alongside high-impact paid promotion packages.
          </p>
        </div>

        {/* Two Columns: Events Pricing & Personal Profiles Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events Pricing Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Event Listing Packages</h3>
                <p className="text-xs text-slate-500">For expos, college fests, concerts & cultural aartis</p>
              </div>
            </div>

            <div className="space-y-4">
              {EVENT_PRICING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border transition ${
                    plan.recommended
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{plan.name}</h4>
                        {plan.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{plan.name_te}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">
                        {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                      </div>
                      <div className="text-[10px] text-slate-500">{plan.period}</div>
                    </div>
                  </div>

                  <ul className="space-y-1 text-xs text-slate-600 mt-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Event Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Personal Profiles Pricing Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Personal Profile Pricing</h3>
                <p className="text-xs text-slate-500">For electricians, doctors, advocates, influencers & freelancers</p>
              </div>
            </div>

            <div className="space-y-4">
              {PROFESSIONAL_PRICING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border transition ${
                    plan.recommended
                      ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{plan.name}</h4>
                        {plan.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{plan.name_te}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">
                        {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                      </div>
                      <div className="text-[10px] text-slate-500">{plan.period}</div>
                    </div>
                  </div>

                  <ul className="space-y-1 text-xs text-slate-600 mt-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <a
              href="/register-professional"
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Register as Pro / Creator</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── EVENT SUBMISSION MODAL ──────────────────────────────────────── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">List Your Event</h3>
                <p className="text-xs text-slate-500">Publish your event to thousands of Kurnool residents</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-lg">Event Submitted Successfully!</h4>
                <p className="text-xs text-slate-500">Your event has been recorded and published on Kurnool One.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    Event Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kurnool Handloom & Food Festival"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    Event Title (Telugu)
                  </label>
                  <input
                    type="text"
                    placeholder="ఉదా: కర్నూలు చేనేత మరియు ఆహార ఉత్సవం"
                    value={titleTe}
                    onChange={(e) => setTitleTe(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Event Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="cultural">Cultural & Devotional</option>
                      <option value="expo">Expo & Trade Fair</option>
                      <option value="sports">Sports & Youth</option>
                      <option value="general">General City Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Listing Tier *
                    </label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="standard">Standard Event Pass — ₹2,999 (Launch Offer, Reg ₹4,000)</option>
                      <option value="free">Community Event (Basic Free)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Date *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oct 25 - Oct 28, 2026"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM - 09:00 PM"
                      value={timeStr}
                      onChange={(e) => setTimeStr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                    Venue / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Municipal Grounds, Near Collectorate, Kurnool"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Organizer Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kurnool Youth Club"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9848012345"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Entry Type
                    </label>
                    <select
                      value={entryType}
                      onChange={(e) => setEntryType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="free">Free Entry</option>
                      <option value="ticketed">Ticketed / Paid Entry</option>
                    </select>
                  </div>

                  {entryType === 'ticketed' && (
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                        Ticket Price
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹50 / person"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : tier === 'free' ? 'Publish Community Event (Free)' : 'Pay ₹2,999 & Publish Event'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── PRICING DETAILS MODAL ───────────────────────────────────────── */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Official Event Listing Pass</h3>
                <p className="text-xs text-slate-500">Promote your festival, exhibition, tournament or concert to all Kurnool</p>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-5 rounded-2xl border-2 border-blue-600 bg-blue-50/40 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Official City Pass</span>
                    <h4 className="font-black text-slate-900 text-base">Standard Event Listing</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through mr-1.5 font-bold">₹4,000</span>
                    <span className="text-2xl font-black text-blue-600">₹2,999</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Dedicated Full-Page Event Showcase with High-Res Poster</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Exact Date, Timings & Google Maps Navigation for Attendees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Direct Call Organizer & WhatsApp Inquiries Buttons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Free Passes or Ticket Booking link integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Social Media & Kurnool One City App Blast</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPricingModal(false);
                setShowSubmitModal(true);
              }}
              className="mt-5 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20"
            >
              List an Event for ₹2,999 Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
