import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Clock,
  Ticket,
  Sun,
  Sparkles,
  Navigation,
  Landmark,
  ShieldAlert,
} from 'lucide-react';
import { fetchPlaces, fetchWorshipPlaces } from '@/services/directoryService';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Explore Kurnool City | Historic Places, Temples & Tourist Attractions',
  description:
    'Complete travel and spiritual heritage guide to Kurnool: Konda Reddy Buruju, Orvakal Rock Gardens, Belum Caves, Mahanandi, Ahobilam, Yaganti, and Mantralayam with timings and directions.',
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { tab = 'tourist' } = await searchParams;
  const isWorship = tab === 'worship';

  const [touristPlaces, worshipPlaces] = await Promise.all([
    fetchPlaces(),
    fetchWorshipPlaces(),
  ]);

  const places = isWorship ? worshipPlaces : touristPlaces;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* ─── Header Banner ─── */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Kurnool Tourism & Spiritual Heritage</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {isWorship ? 'Sacred Temples & Places of Worship' : 'Explore Historic Kurnool'}
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            {isWorship
              ? 'Ancient Dravidian shrines, sacred river bank mutts, and natural cave temples across Kurnool, Nandyal and the Nallamala ranges.'
              : 'The Gateway of Rayalaseema. Discover prehistoric quartz formations, monumental Vijayanagara forts, underground caves, and tranquil bird sanctuaries.'}
          </p>
        </div>
      </div>

      {/* ─── Segment Tab Switcher ─── */}
      <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-2xl w-fit max-w-full overflow-x-auto border border-slate-200">
        <Link
          href="/explore?tab=tourist"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            !isWorship
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Landmark className={`w-4 h-4 ${!isWorship ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>Historic & Tourist Landmarks ({touristPlaces.length})</span>
        </Link>

        <Link
          href="/explore?tab=worship"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            isWorship
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isWorship ? 'text-amber-500' : 'text-slate-400'}`} />
          <span>Temples & Sacred Shrines ({worshipPlaces.length})</span>
        </Link>
      </div>

      {/* ─── Places Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {places.map((place) => (
          <div
            key={place.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                {place.photos?.[0] ? (
                  <img
                    src={place.photos[0]}
                    alt={place.name_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Compass className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {place.type}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-extrabold text-slate-900 text-xl mb-1 group-hover:text-emerald-700 transition">
                  {place.name_en}
                </h3>
                <p className="text-xs font-semibold text-emerald-700 mb-3">{place.name_te}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {place.description_en}
                </p>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{place.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-slate-700">{place.timings}</span>
                  </div>

                  {place.entryFee && (
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{place.entryFee}</span>
                    </div>
                  )}

                  {place.bestTimeToVisit && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Best Season: {place.bestTimeToVisit}</span>
                    </div>
                  )}

                  {place.dressCodeRules && (
                    <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{place.dressCodeRules}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <a
                href={
                  place.latitude && place.longitude
                    ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name_en + ', Kurnool')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Navigate in Google Maps</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
