'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Star, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { BusinessItem } from '@/services/directoryService';

interface FeaturedBusinessTickerProps {
  businesses: BusinessItem[];
}

export default function FeaturedBusinessTicker({ businesses }: FeaturedBusinessTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!businesses || businesses.length === 0) return null;

  // Duplicate list to give seamless infinite continuous scroll
  const displayList = [...businesses, ...businesses];

  return (
    <div className="w-full overflow-hidden py-4 select-none group">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Featured Spotlight</span>
          </span>
        </div>
        <Link
          href="/directory"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <style jsx>{`
        @keyframes scrollHorizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: scrollHorizontal 38s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 p-2 border border-slate-200">
        <div ref={scrollRef} className="ticker-track flex gap-4">
          {displayList.map((biz, idx) => (
            <Link
              key={`${biz.id}-${idx}`}
              href={`/business/${biz.id}`}
              className="w-72 sm:w-80 shrink-0 bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-3 shadow-xs hover:shadow-md transition flex items-center gap-3.5"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                {biz.images && biz.images[0] ? (
                  <Image
                    src={biz.images[0]}
                    alt={biz.name_en}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Building2 className="w-7 h-7" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide truncate max-w-[120px]">
                    {(biz.categoryId || 'General').replace(/_/g, ' ')}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 ml-auto">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{Number(biz.ratingAvg || 4.9).toFixed(1)}</span>
                  </span>
                </div>

                <h4 className="text-xs font-black text-slate-900 truncate tracking-tight">
                  {biz.name_en}
                </h4>

                <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{biz.address || 'Kurnool'}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
