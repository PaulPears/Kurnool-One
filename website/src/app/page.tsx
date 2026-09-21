import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Utensils,
  HeartPulse,
  ShoppingBag,
  Wrench,
  GraduationCap,
  Car,
  Hotel,
  Shirt,
  Smartphone,
  Pill,
  Building2,
  Compass,
  Tag,
  Clock,
  UserCheck,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Briefcase,
  ChevronRight,
  Percent,
} from 'lucide-react';
import {
  MASTER_CATEGORIES,
  PROFESSIONAL_CATEGORIES,
  fetchBusinesses,
  fetchProfessionals,
  fetchPlaces,
  fetchOffers,
  fetchEvents,
} from '@/services/directoryService';
import AppDownloadBanner from '@/components/AppDownloadBanner';

export const revalidate = 60; // ISR cache for 60 seconds

export default async function HomePage() {
  const [businesses, professionals, places, offers, events] = await Promise.all([
    fetchBusinesses(),
    fetchProfessionals(),
    fetchPlaces(),
    fetchOffers(),
    fetchEvents(),
  ]);

  const categoryIcons: Record<string, React.ReactNode> = {
    restaurants_cafes: <Utensils className="w-5 h-5 text-amber-600" />,
    hotels_lodges: <Hotel className="w-5 h-5 text-indigo-600" />,
    supermarkets_groceries: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
    clothing_fashion: <Shirt className="w-5 h-5 text-pink-600" />,
    electronics_mobiles: <Smartphone className="w-5 h-5 text-blue-600" />,
    hospitals_clinics: <HeartPulse className="w-5 h-5 text-rose-600" />,
    pharmacies_medical: <Pill className="w-5 h-5 text-red-600" />,
    educational_institutions: <GraduationCap className="w-5 h-5 text-cyan-600" />,
    automobile_dealers: <Car className="w-5 h-5 text-orange-600" />,
    automobile_service: <Wrench className="w-5 h-5 text-amber-600" />,
    real_estate: <Building2 className="w-5 h-5 text-teal-600" />,
    home_services_repairs: <Wrench className="w-5 h-5 text-sky-600" />,
  };

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* ─── 1. AUTHENTIC HERO SECTION ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 text-white pt-16 pb-24 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          {/* Civic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Kurnool City&apos;s Verified Digital Platform • కర్నూలు వన్</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Find Anything in Kurnool.{' '}
            <span className="text-amber-400">Direct & Verified.</span>
          </h1>

          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Search 50 commercial sectors, connect with 30+ verified doctors, technicians & creators, explore Rayalaseema heritage, and get exclusive city deals.
          </p>

          {/* Practical Search Box */}
          <div className="pt-2 max-w-3xl mx-auto">
            <form
              action="/directory"
              method="GET"
              className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200"
            >
              <div className="flex items-center gap-3 w-full px-3 py-2 sm:py-0">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search Biryani, Sarees, Hospital, Electrician, Influencer..."
                  className="w-full text-slate-900 placeholder-slate-400 text-sm font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black rounded-xl transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Searches */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-4 text-xs">
              <span className="text-blue-300 font-bold">Popular:</span>
              {[
                { label: 'Rayalaseema Biryani', q: 'biryani' },
                { label: 'Hospitals & Clinics', q: 'hospital' },
                { label: 'Electricians & AC Repair', q: 'electrician' },
                { label: 'Sarees & Clothing', q: 'saree' },
                { label: 'Konda Reddy Buruju', q: 'konda reddy' },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={`/directory?q=${encodeURIComponent(item.q)}`}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Civic Trust Strip */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { count: '50', label: 'Commercial Categories' },
            { count: '30', label: 'Professional Skills' },
            { count: '100%', label: 'Verified Phone Numbers' },
            { count: '₹0', label: 'Commission to Middlemen' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{stat.count}</div>
              <div className="text-[11px] text-blue-200 font-semibold mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 2. QUICK EXPLORE CATEGORIES ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Local Directory
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Commercial Businesses & Services
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Browse top verified stores, restaurants, hospitals and agencies in Kurnool.
            </p>
          </div>

          <Link
            href="/directory"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            <span>View All 50 Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {MASTER_CATEGORIES.slice(0, 12).map((cat) => (
            <Link
              key={cat.id}
              href={`/directory?category=${cat.id}`}
              className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-400 hover:shadow-md transition group text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition">
                {categoryIcons[cat.id] || <Building2 className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                  {cat.name_en}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                  {cat.name_te}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 3. FEATURED VERIFIED BUSINESSES ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Listings
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Featured Businesses in Kurnool
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Locally verified stores with real operating hours and direct contact numbers.
            </p>
          </div>

          <Link
            href="/directory"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            <span>Explore Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.slice(0, 6).map((biz) => (
            <div
              key={biz.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Image / Banner */}
                <div className="relative h-48 w-full bg-slate-100">
                  {biz.images && biz.images[0] ? (
                    <Image
                      src={biz.images[0]}
                      alt={biz.name_en}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 className="w-12 h-12" />
                    </div>
                  )}

                  {/* Verification Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-700 flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Verified</span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{biz.ratingAvg || 4.8}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      {biz.categoryId.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {biz.timing || 'Open Today'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight line-clamp-1">
                    {biz.name_en}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{biz.address}</span>
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                    {biz.description_en}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-100 flex items-center gap-2 mt-4">
                <a
                  href={`tel:${biz.phone}`}
                  className="flex-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
                </a>

                {biz.whatsapp && (
                  <a
                    href={`https://wa.me/91${biz.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <Link
                  href={`/business/${biz.id}`}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  title="View Profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. SKILLED PROFESSIONALS & CREATORS ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-teal-900 text-white rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-bold tracking-wide mb-2">
                <Briefcase className="w-3.5 h-3.5 text-teal-300" />
                <span>Professional & Creator Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Connect with Kurnool&apos;s Skilled Specialists
              </h2>
              <p className="text-teal-200 text-xs sm:text-sm mt-1 max-w-xl">
                Doctors, Lawyers, IT Developers, Influencers, Teachers, and Technicians serving Kurnool.
              </p>
            </div>

            <Link
              href="/directory?tab=professionals"
              className="py-2.5 px-5 rounded-xl bg-white hover:bg-teal-50 text-teal-900 text-xs font-black shadow-sm transition shrink-0"
            >
              Browse All 30 Pro Categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {professionals.slice(0, 4).map((pro) => (
              <div
                key={pro.id}
                className="bg-white text-slate-900 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg shrink-0">
                      {pro.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{pro.fullName}</h4>
                      <p className="text-[11px] text-teal-700 font-semibold line-clamp-1">{pro.category}</p>
                    </div>
                  </div>

                  <div className="pt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Starting Fee:</span>
                      <span className="font-bold text-slate-900">{pro.visitingCharges || '₹150'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Experience:</span>
                      <span className="font-bold text-slate-900">{pro.experienceYears || 3}+ Years</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`tel:${pro.phone}`}
                    className="flex-1 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold text-center transition flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  {pro.whatsapp && (
                    <a
                      href={`https://wa.me/91${pro.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center transition flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. EXCLUSIVE CITY DEALS & OFFERS ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Special Discounts
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Active Offers & Savings in Kurnool
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Verified local deals and festival coupons from Kurnool stores.
            </p>
          </div>

          <Link
            href="/offers"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-800 transition"
          >
            <span>View All Deals</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.slice(0, 3).map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                  {offer.discountText}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {offer.validUntil}
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-base">{offer.title_en}</h3>
                <p className="text-xs font-bold text-blue-600 mt-0.5">{offer.businessName}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{offer.description_en}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Show coupon at billing</span>
                <Link
                  href={`/business/${offer.businessId}`}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Visit Store →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. HERITAGE & TOURISM ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Historic Rayalaseema
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Explore Kurnool Landmarks
              </h2>
            </div>
            <Link
              href="/explore"
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0"
            >
              Discover All Places →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {places.slice(0, 4).map((place) => (
              <div
                key={place.id}
                className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 space-y-3 pb-4"
              >
                <div className="relative h-36 w-full bg-slate-700">
                  <Image
                    src={place.image_url}
                    alt={place.title_en}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="px-4">
                  <h4 className="font-bold text-sm text-white line-clamp-1">{place.title_en}</h4>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">{place.tagline_en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. APP DOWNLOAD BANNER ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <AppDownloadBanner />
      </section>
    </div>
  );
}
