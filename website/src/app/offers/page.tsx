import React from 'react';
import { Metadata } from 'next';
import { Tag, Phone, Clock, Sparkles } from 'lucide-react';
import { fetchOffers } from '@/services/directoryService';

export const metadata: Metadata = {
  title: 'City Offers & Local Deals in Kurnool | Kurnool One',
  description: 'Exclusive local deals, restaurant discounts, shopping offers, and festival savings across Kurnool City.',
};

export default async function OffersPage() {
  const offers = await fetchOffers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Exclusive City Discounts</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">
            Kurnool Offers & Deals
          </h1>
          <p className="text-amber-100 text-sm sm:text-base">
            Discover verified promotions, dining coupons, and retail discounts offered by Kurnool merchants.
          </p>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
          >
            <div>
              {offer.bannerUrl && (
                <div className="h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={offer.bannerUrl}
                    alt={offer.title_en}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="inline-block bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3 shadow-xs">
                  {offer.discountText}
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg mb-1">{offer.title_en}</h3>
                <p className="text-xs font-bold text-blue-600 mb-2">{offer.businessName}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{offer.description_en}</p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{offer.validUntil}</span>
                </div>
              </div>
            </div>

            {offer.phone && (
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <a
                  href={`tel:${offer.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call to Claim Offer</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
