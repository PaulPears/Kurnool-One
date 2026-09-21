import React from 'react';
import { Metadata } from 'next';
import {
  Compass,
  MapPin,
  Clock,
  ExternalLink,
  Navigation,
  Ticket,
  Sun,
} from 'lucide-react';
import { fetchPlaces, SEED_PLACES } from '@/services/directoryService';

export const metadata: Metadata = {
  title: 'Explore Kurnool City | Historic Places, Temples & Tourist Attractions',
  description: 'Complete travel and heritage guide to Kurnool: Konda Reddy Buruju, Orvakal Rock Garden, Ahobilam, Belum Caves, and famous temples with timings and directions.',
};

export default async function ExplorePage() {
  const places = await fetchPlaces();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Kurnool Tourism & Spiritual Heritage</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Explore Historic Kurnool
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            The Gateway of Rayalaseema. Discover prehistoric rock formations, magnificent forts, sacred hill temples, and natural wonders in and around Kurnool.
          </p>
        </div>
      </div>

      {/* Places Grid */}
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
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {place.type}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-extrabold text-slate-900 text-xl mb-1">{place.name_en}</h3>
                <p className="text-xs font-medium text-emerald-700 mb-3">{place.name_te}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{place.description_en}</p>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{place.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{place.timings}</span>
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
                      <span>Best time: {place.bestTimeToVisit}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
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
