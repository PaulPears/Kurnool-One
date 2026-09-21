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
  Share2,
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

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-3 h-3"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

interface DirectoryPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    tab?: string;
  }>;
}

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const { category = 'all', q = '', tab = 'businesses' } = await searchParams;

  const [businesses, professionals] = await Promise.all([
    fetchBusinesses(category, q),
    fetchProfessionals(),
  ]);

  const selectedBusinessCat = MASTER_CATEGORIES.find((c) => c.id === category);
  const selectedProCat = PROFESSIONAL_CATEGORIES.find((c) => c.id === category);

  // Filter professionals client-side by search query and category
  const filteredPros = professionals.filter((p) => {
    const matchesCategory =
      category === 'all' ||
      p.category?.toLowerCase() === selectedProCat?.name_en?.toLowerCase() ||
      p.category?.toLowerCase() === category.toLowerCase();

    const matchesQuery =
      !q ||
      p.fullName.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(q.toLowerCase())) ||
      (p.serviceAreas && p.serviceAreas.some((a) => a.toLowerCase().includes(q.toLowerCase())));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Page Header - Clean Professional Corporate Style */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 text-slate-900 p-8 sm:p-12 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            {tab === 'professionals' ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Kurnool Personal Profiles & Creator Network</span>
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Kurnool Commercial Businesses</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {tab === 'professionals'
              ? selectedProCat
                ? selectedProCat.name_en
                : 'Skilled Professionals & Creators'
              : selectedBusinessCat
              ? selectedBusinessCat.name_en
              : 'Explore All Businesses'}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            {tab === 'professionals'
              ? 'Doctors, influencers, IT professionals, painters, electricians, tutors, and advocates with transparent rates and direct WhatsApp connect.'
              : 'Verified local shops, showrooms, hospitals, hotels, and companies across Kurnool with working hours, direct phone, and Google Maps location.'}
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
                    ? 'Search by name, skill (e.g. Influencer, Painter, Doctor)...'
                    : 'Search by business name, keyword, or area...'
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-900 bg-slate-50 border border-slate-200 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white transition placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition text-xs sm:text-sm shadow-sm cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Switcher: Businesses vs Personal Profiles */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Link
          href={`/directory?tab=businesses${q ? `&q=${encodeURIComponent(q)}` : ''}`}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition ${
            tab !== 'professionals'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Commercial Businesses ({businesses.length})</span>
        </Link>

        <Link
          href={`/directory?tab=professionals${q ? `&q=${encodeURIComponent(q)}` : ''}`}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition ${
            tab === 'professionals'
              ? 'bg-teal-700 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Personal Profiles & Creators ({professionals.length})</span>
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Link
          href={`/directory?tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
            category === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
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
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
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
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.name_en}
              </Link>
            ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="text-xs sm:text-sm font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{tab === 'professionals' ? filteredPros.length : businesses.length}</span> verified listings
          {q && <span> for &ldquo;{q}&rdquo;</span>}
        </div>
        <Link
          href={tab === 'professionals' ? '/register-professional' : '/register-business'}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition"
        >
          <span>{tab === 'professionals' ? '+ List personal profile' : '+ Add your business here'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content: Personal Profiles vs Businesses */}
      {tab === 'professionals' ? (
        /* PERSONAL PROFILES GRID */
        filteredPros.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No personal profiles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              We couldn&apos;t find any professional matching your search. Try another category like &ldquo;Influencers & Content Creators&rdquo;, &ldquo;Artists & Creators&rdquo;, or &ldquo;Doctors & Healthcare&rdquo;.
            </p>
            <Link
              href="/directory?tab=professionals"
              className="bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-teal-800 transition"
            >
              Clear Search
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPros.map((pro) => (
              <div
                key={pro.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs hover:border-teal-400 hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Avatar & Name */}
                  <div className="flex items-start gap-4">
                    {pro.avatarUrl ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs shrink-0 border border-slate-200">
                        <img src={pro.avatarUrl} alt={pro.fullName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-xs shrink-0">
                        {pro.fullName.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                          {pro.fullName}
                        </h2>
                        {pro.verifiedProfessional && (
                          <span title="Verified Professional">
                            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="inline-block bg-teal-50 text-teal-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full mt-1 border border-teal-100">
                        {pro.category}
                      </div>
                      {pro.categoryName_te && (
                        <span className="text-xs text-slate-500 ml-2 font-medium">
                          ({pro.categoryName_te})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ratings & Experience */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-slate-900">{pro.ratingAvg.toFixed(1)}</span>
                      <span className="text-slate-500 font-medium">({pro.reviewCount || pro.ratingCount || 1} reviews)</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700 font-semibold">{pro.experienceYears} Yrs Exp</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {pro.description}
                  </p>

                  {/* Visiting Charges */}
                  {pro.visitingCharges && (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Charges / Fee:</span>
                      <span className="text-emerald-700 font-black">{pro.visitingCharges}</span>
                    </div>
                  )}

                  {/* Service Areas */}
                  {pro.serviceAreas && pro.serviceAreas.length > 0 && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">
                        Areas: {pro.serviceAreas.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Optional Social Accounts */}
                  {(pro.instagramUrl || pro.youtubeUrl || pro.linkedinUrl || pro.websiteUrl) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                      {pro.instagramUrl && (
                        <a
                          href={pro.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 px-2.5 py-1 rounded-lg transition"
                        >
                          <InstagramIcon className="w-3 h-3 text-pink-600" />
                          <span>Instagram ↗</span>
                        </a>
                      )}
                      {pro.youtubeUrl && (
                        <a
                          href={pro.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                        >
                          <YoutubeIcon className="w-3 h-3 text-red-600" />
                          <span>YouTube ↗</span>
                        </a>
                      )}
                      {pro.linkedinUrl && (
                        <a
                          href={pro.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                        >
                          <LinkedinIcon className="w-3 h-3 text-blue-600" />
                          <span>LinkedIn ↗</span>
                        </a>
                      )}
                      {pro.websiteUrl && (
                        <a
                          href={pro.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                        >
                          <Globe className="w-3 h-3 text-slate-600" />
                          <span>Portfolio ↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-5 border-t border-slate-100 grid grid-cols-2 gap-2 mt-4">
                  <a
                    href={`tel:${pro.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>

                  <a
                    href={`https://wa.me/91${(pro.whatsapp || pro.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${pro.fullName}, I found your profile on Kurnool One and need your service.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
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
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No businesses found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              We couldn&apos;t find any businesses matching your search criteria. Try a different keyword or category.
            </p>
            <Link
              href="/directory?tab=businesses"
              className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs hover:bg-blue-700 transition"
            >
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => (
              <div
                key={b.id}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {b.images?.[0] ? (
                      <img
                        src={b.images[0]}
                        alt={b.name_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <Building2 className="w-12 h-12 text-blue-500" />
                      </div>
                    )}
                    {b.verificationBadge === 'verified_business' && (
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    )}
                    {b.tier === 'featured' && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {b.name_en}
                      </h2>
                      {b.name_te && (
                        <p className="text-xs text-slate-500 font-medium truncate">{b.name_te}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-slate-900">{b.ratingAvg.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-500 font-medium">({b.ratingCount} reviews)</span>
                      {b.priceRange && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-700 font-extrabold">{b.priceRange}</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {b.description_en}
                    </p>

                    <div className="space-y-1.5 pt-1 text-xs text-slate-500">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{b.address}</span>
                      </div>

                      {b.timing && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{b.timing}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <a
                      href={`tel:${b.phone}`}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition text-xs font-bold border border-blue-200"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/91${(b.whatsapp || b.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${b.name_en}, I found your listing on Kurnool One.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition text-xs font-bold border border-emerald-200"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Chat</span>
                    </a>

                    <Link
                      href={`/business/${b.id}`}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition text-xs font-bold border border-slate-200"
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
