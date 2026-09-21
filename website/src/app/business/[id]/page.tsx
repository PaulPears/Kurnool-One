import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Phone,
  MessageCircle,
  Globe,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  Share2,
  Building2,
} from 'lucide-react';
import { fetchBusinessById, SEED_BUSINESSES } from '@/services/directoryService';
import BusinessActionButtons from '@/components/BusinessActionButtons';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const business = await fetchBusinessById(id);

  if (!business) {
    return {
      title: 'Business Not Found | Kurnool One',
      description: 'The requested business listing was not found on Kurnool One.',
    };
  }

  const title = `${business.name_en} - Kurnool | Address, Phone & Reviews | Kurnool One`;
  const description = `${business.name_en} in Kurnool. ${business.description_en.slice(0, 150)}... Contact: ${business.phone}. Address: ${business.address}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://kurnoolone.com/business/${id}`,
      siteName: 'Kurnool One',
      images: business.images?.[0] ? [{ url: business.images[0] }] : [],
      locale: 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: business.images?.[0] ? [business.images[0]] : [],
    },
  };
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const { id } = await params;
  const business = await fetchBusinessById(id);

  if (!business) {
    notFound();
  }

  // Schema.org LocalBusiness JSON-LD for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name_en,
    alternateName: business.name_te,
    description: business.description_en,
    telephone: business.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: 'Kurnool',
      addressRegion: 'Andhra Pradesh',
      postalCode: '518001',
      addressCountry: 'IN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: business.ratingAvg || 4.5,
      reviewCount: business.ratingCount || 10,
    },
    url: business.website || `https://kurnoolone.com/business/${id}`,
    image: business.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  };

  const mapsUrl =
    business.googleMapsUrl ||
    (business.latitude && business.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name_en + ', ' + business.address + ', Kurnool')}`);

  return (
    <>
      {/* Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Directory</span>
          </Link>
          <span className="text-xs text-slate-400 font-medium">Kurnool One Business Profile</span>
        </div>

        {/* Cover Photo & Header */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="relative h-64 sm:h-96 w-full bg-slate-100 overflow-hidden">
            {business.images && business.images.length > 0 ? (
              <img
                src={business.images[0]}
                alt={business.name_en}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                <Building2 className="w-20 h-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {business.verificationBadge === 'verified_business' && (
                  <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VERIFIED BY KURNOOL ONE</span>
                  </span>
                )}
                {business.tier === 'featured' && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase">
                    Featured
                  </span>
                )}
                {business.priceRange && (
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {business.priceRange}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {business.name_en}
              </h1>
              {business.name_te && (
                <p className="text-lg text-slate-200 font-medium mt-1 drop-shadow-sm">
                  {business.name_te}
                </p>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-500">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xl font-black text-slate-900">{business.ratingAvg.toFixed(1)}</span>
              <span className="text-sm text-slate-500">({business.ratingCount} Google & Resident Reviews)</span>
            </div>

            {/* Interactive & Tracked Action Buttons */}
            <BusinessActionButtons
              businessId={business.id}
              phone={business.phone}
              whatsapp={business.whatsapp}
              mapsUrl={mapsUrl}
              website={business.website}
              name={business.name_en}
            />
          </div>

          {/* Details Content Body */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: About & Amenities */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-3">About the Business</h2>
                <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
                  {business.description_en}
                </p>
                {business.description_te && (
                  <p className="text-slate-500 text-sm mt-3 pt-3 border-t border-slate-100">
                    {business.description_te}
                  </p>
                )}
              </div>

              {business.amenities && business.amenities.length > 0 && (
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-3">Amenities & Features</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {business.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Contact & Hours Info Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
                <h3 className="text-base font-black text-slate-900">Contact & Hours</h3>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold text-slate-900">Location</div>
                    <div className="text-slate-600 leading-snug">{business.address}</div>
                    {business.landmark && (
                      <div className="text-xs text-slate-500 mt-1">Landmark: {business.landmark}</div>
                    )}
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 mt-2"
                    >
                      <span>Open in Google Maps App ↗</span>
                    </a>
                  </div>
                </div>

                {business.timing && (
                  <div className="flex items-start gap-3 pt-4 border-t border-slate-200/80">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-bold text-slate-900">Operating Hours</div>
                      <div className="text-slate-600 font-medium">{business.timing}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 pt-4 border-t border-slate-200/80">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold text-slate-900">Customer Helpline</div>
                    <a href={`tel:${business.phone}`} className="text-blue-600 font-bold hover:underline">
                      {business.phone}
                    </a>
                  </div>
                </div>

                {business.website && (
                  <div className="flex items-start gap-3 pt-4 border-t border-slate-200/80">
                    <Globe className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-bold text-slate-900">Official Website</div>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 font-bold hover:underline break-all"
                      >
                        {business.website} ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
