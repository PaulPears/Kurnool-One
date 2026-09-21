import React from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Globe,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  UserCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  MASTER_CATEGORIES,
  PROFESSIONAL_CATEGORIES,
  fetchBusinesses,
  fetchProfessionals,
  BusinessItem,
  ProfessionalItem,
} from '@/services/directoryService';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-3 h-3"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-3 h-3"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15"/>
  </svg>
);

export const revalidate = 30;

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; tab?: string }>;
}) {
  const { category = 'all', q = '', tab = 'businesses' } = await searchParams;

  const businesses = await fetchBusinesses(category, q);
  const professionals = await fetchProfessionals();

  let filteredPros = professionals;
  if (category && category !== 'all') {
    const selectedProCat = PROFESSIONAL_CATEGORIES.find((c) => c.id === category);
    if (selectedProCat) {
      filteredPros = filteredPros.filter(
        (p) =>
          p.category.toLowerCase().includes(selectedProCat.name_en.toLowerCase()) ||
          (p.categoryName_te && p.categoryName_te.includes(selectedProCat.name_te))
      );
    }
  }

  if (q) {
    filteredPros = filteredPros.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase()) ||
        (p.categoryName_te && p.categoryName_te.includes(q)) ||
        p.serviceAreas.some((a) => a.toLowerCase().includes(q.toLowerCase()))
    );
  }

  const selectedBusinessCat = MASTER_CATEGORIES.find((c) => c.id === category);
  const selectedProCat = PROFESSIONAL_CATEGORIES.find((c) => c.id === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-white/10 text-white p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            {tab === 'professionals' ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Kurnool Personal Profiles & Creator Network</span>
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5" />
                <span>Kurnool Commercial Business Directory</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {tab === 'professionals'
              ? selectedProCat
                ? selectedProCat.name_en
                : 'Skilled Professionals & Creators'
              : selectedBusinessCat
              ? selectedBusinessCat.name_en
              : 'Explore All Businesses'}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            {tab === 'professionals'
              ? 'Social media influencers, doctors, IT experts, painters, electricians, tutors, and advocates with transparent rates & direct WhatsApp.'
              : 'Verified local shops, showrooms, hospitals, hotels, and companies across Kurnool with working hours, phone, and Google Maps routing.'}
          </p>

          {/* Search Box */}
          <form method="GET" action="/directory" className="pt-2 flex gap-2 max-w-xl">
            <input type="hidden" name="tab" value={tab} />
            {category && category !== 'all' && (
              <input type="hidden" name="category" value={category} />
            )}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder={
                  tab === 'professionals'
                    ? 'Search by name, skill (e.g. Influencer, Painter, Electrician)...'
                    : 'Search by business name, keyword, or area...'
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white bg-white/10 border border-white/15 text-sm font-medium outline-none focus:border-blue-500 transition placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-xl transition text-xs sm:text-sm shadow-md cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Directory Type Switcher: Businesses vs Personal Profiles */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Link
          href={`/directory?tab=businesses${q ? `&q=${encodeURIComponent(q)}` : ''}`}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition ${
            tab !== 'professionals'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Shops & Businesses ({businesses.length})</span>
        </Link>

        <Link
          href={`/directory?tab=professionals${q ? `&q=${encodeURIComponent(q)}` : ''}`}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition ${
            tab === 'professionals'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Personal Profiles & Creators ({professionals.length})</span>
        </Link>
      </div>

      {/* Category Filter Pills (Dynamic based on Tab) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Link
          href={`/directory?tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
            category === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          All Categories
        </Link>

        {tab === 'professionals'
          ? PROFESSIONAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/directory?tab=professionals&category=${cat.id}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                  category === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.name_en}
              </Link>
            ))
          : MASTER_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/directory?tab=businesses&category=${cat.id}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                  category === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.name_en}
              </Link>
            ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="text-xs sm:text-sm font-bold text-slate-400">
          Showing <span className="text-white font-black">{tab === 'professionals' ? filteredPros.length : businesses.length}</span> verified listings
          {q && <span> for &ldquo;{q}&rdquo;</span>}
        </div>
        <Link
          href={tab === 'professionals' ? '/register-professional' : '/register-business'}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
        >
          <span>{tab === 'professionals' ? 'List your personal profile' : 'Add your business here'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content: Personal Profiles vs Businesses */}
      {tab === 'professionals' ? (
        /* PERSONAL PROFILES GRID */
        filteredPros.length === 0 ? (
          <div className="text-center py-16 bg-[#0c1222] rounded-3xl border border-white/10 p-8">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No personal profiles found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              We couldn&apos;t find any professional matching your search. Try another category like &ldquo;Influencers & Content Creators&rdquo;, &ldquo;Artists & Creators&rdquo;, or &ldquo;Skilled Technicians&rdquo;.
            </p>
            <Link
              href="/directory?tab=professionals"
              className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
            >
              Clear Search
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPros.map((pro) => (
              <div
                key={pro.id}
                className="rounded-3xl bg-[#0c1222] border border-white/10 p-6 shadow-xl hover:border-blue-500/40 transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Avatar & Name */}
                  <div className="flex items-start gap-4">
                    {pro.avatarUrl ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/10">
                        <img src={pro.avatarUrl} alt={pro.fullName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                        {pro.fullName.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-base sm:text-lg font-black text-white truncate">
                          {pro.fullName}
                        </h2>
                        {pro.verifiedProfessional && (
                          <span title="Verified Professional">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="inline-block bg-blue-500/20 text-blue-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full mt-1 border border-blue-400/20">
                        {pro.category}
                      </div>
                      {pro.categoryName_te && (
                        <span className="text-xs text-slate-400 ml-2 font-medium">
                          ({pro.categoryName_te})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ratings & Experience */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-white">{pro.ratingAvg.toFixed(1)}</span>
                      <span className="text-slate-400 font-medium">({pro.reviewCount} reviews)</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-medium">{pro.experienceYears} Yrs Exp</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {pro.description}
                  </p>

                  {/* Visiting Charges */}
                  {pro.visitingCharges && (
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Charges / Fee:</span>
                      <span className="text-emerald-400 font-black">{pro.visitingCharges}</span>
                    </div>
                  )}

                  {/* Service Areas */}
                  {pro.serviceAreas && pro.serviceAreas.length > 0 && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">
                        Areas: {pro.serviceAreas.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Social Handles */}
                  {(pro.instagramUrl || pro.youtubeUrl) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      {pro.instagramUrl && (
                        <a
                          href={pro.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 px-2.5 py-1 rounded-lg transition"
                        >
                          <InstagramIcon className="w-3 h-3 text-pink-400" />
                          <span>Instagram ↗</span>
                        </a>
                      )}
                      {pro.youtubeUrl && (
                        <a
                          href={pro.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-2.5 py-1 rounded-lg transition"
                        >
                          <YoutubeIcon className="w-3 h-3 text-red-400" />
                          <span>YouTube ↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-5 border-t border-white/10 grid grid-cols-2 gap-2 mt-4">
                  <a
                    href={`tel:${pro.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>

                  <a
                    href={`https://wa.me/91${(pro.whatsapp || pro.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${pro.fullName}, I found your profile on Kurnool One and need your service.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* BUSINESSES GRID */
        businesses.length === 0 ? (
          <div className="text-center py-16 bg-[#0c1222] rounded-3xl border border-white/10 p-8">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No businesses found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              We couldn&apos;t find any businesses matching your search criteria. Try a different keyword or category.
            </p>
            <Link
              href="/directory?tab=businesses"
              className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
            >
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => (
              <div
                key={b.id}
                className="rounded-3xl bg-[#0c1222] border border-white/10 overflow-hidden shadow-xl hover:border-blue-500/40 transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    {b.images?.[0] ? (
                      <img
                        src={b.images[0]}
                        alt={b.name_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                        <Building2 className="w-12 h-12 text-blue-500" />
                      </div>
                    )}
                    {b.verificationBadge === 'verified_business' && (
                      <span className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <ShieldCheck className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    )}
                    {b.tier === 'featured' && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-md">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition truncate">
                        {b.name_en}
                      </h2>
                      {b.name_te && (
                        <p className="text-xs text-slate-400 font-medium truncate">{b.name_te}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-white">{b.ratingAvg.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-400">({b.ratingCount} reviews)</span>
                      {b.priceRange && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-amber-300 font-extrabold">{b.priceRange}</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {b.description_en}
                    </p>

                    <div className="space-y-1.5 pt-1 text-xs text-slate-400">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{b.address}</span>
                      </div>

                      {b.timing && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{b.timing}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
                    <a
                      href={`tel:${b.phone}`}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition text-xs font-black border border-blue-500/30"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/91${(b.whatsapp || b.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${b.name_en}, I found your listing on Kurnool One.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition text-xs font-black border border-emerald-500/30"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Chat</span>
                    </a>

                    <Link
                      href={`/business/${b.id}`}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-black border border-white/10"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
