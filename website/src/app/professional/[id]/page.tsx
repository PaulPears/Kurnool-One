import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Award,
} from 'lucide-react';
import { fetchProfessionalById } from '@/services/directoryService';
import ProfessionalActionButtons from '@/components/ProfessionalActionButtons';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pro = await fetchProfessionalById(id);

  if (!pro) {
    return {
      title: 'Professional Not Found | Kurnool One',
      description: 'The requested service professional was not found on Kurnool One.',
    };
  }

  const title = `${pro.fullName} - ${pro.category} in Kurnool | Kurnool One`;
  const description = `${pro.fullName} (${pro.category}) in Kurnool. Experience: ${pro.experienceYears} Years. Charges: ${pro.visitingCharges || 'Affordable'}. Contact: ${pro.phone}. Serving: ${pro.serviceAreas?.join(', ') || 'Kurnool City'}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://kurnool-one.web.app/professional/${id}`,
      siteName: 'Kurnool One',
      images: pro.avatarUrl ? [{ url: pro.avatarUrl }] : [],
      locale: 'en_IN',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: pro.avatarUrl ? [pro.avatarUrl] : [],
    },
  };
}

export default async function ProfessionalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pro = await fetchProfessionalById(id);

  if (!pro) {
    notFound();
  }

  // Schema.org JSON-LD for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: pro.fullName,
    description: pro.description || `${pro.category} services in Kurnool`,
    telephone: pro.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kurnool',
      addressRegion: 'Andhra Pradesh',
      postalCode: '518001',
      addressCountry: 'IN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: pro.ratingAvg || 4.8,
      reviewCount: pro.ratingCount || 10,
    },
    url: `https://kurnool-one.web.app/professional/${id}`,
    image: pro.avatarUrl || undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumbs & Back Link */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
          <Link
            href="/directory?tab=professionals"
            className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Professionals</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link href="/directory?tab=professionals" className="hover:underline">Directory</Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-[180px]">{pro.fullName}</span>
          </div>
        </div>

        {/* ─── 1. MAIN PROFILE CARD ─── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar Photo */}
            <div className="relative shrink-0">
              {pro.avatarUrl ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-slate-100 shadow-md">
                  <Image
                    src={pro.avatarUrl}
                    alt={pro.fullName}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-4xl shadow-md ring-4 ring-slate-100">
                  {pro.fullName.charAt(0)}
                </div>
              )}
              {pro.verifiedProfessional && (
                <div
                  className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md"
                  title="Verified Professional"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {pro.fullName}
                </h1>
                {pro.verifiedProfessional && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-block bg-blue-50 text-blue-800 font-bold text-xs px-3 py-1 rounded-full border border-blue-200">
                  {pro.category}
                </span>
                {pro.categoryName_te && (
                  <span className="text-xs font-medium text-slate-500">
                    ({pro.categoryName_te})
                  </span>
                )}
              </div>

              {/* Rating & Experience */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-slate-600 pt-1">
                <div className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="text-slate-900">{(pro.ratingAvg || 4.8).toFixed(1)}</span>
                  <span className="text-slate-500 font-medium">({pro.ratingCount || 12} ratings)</span>
                </div>

                <span className="text-slate-300">•</span>

                <div className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>{pro.experienceYears} Years Experience</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100">
            <ProfessionalActionButtons
              proId={pro.id}
              phone={pro.phone}
              whatsapp={pro.whatsapp}
              fullName={pro.fullName}
              category={pro.category}
              targetOwnerUid={pro.userId}
            />
          </div>
        </div>

        {/* ─── 2. SERVICE CHARGES & RATES ─── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Service Charges & Fees</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Visiting / Inspection Fee</p>
                <p className="text-xs text-slate-400 mt-0.5">Payable upon arrival & diagnosis</p>
              </div>
              <span className="text-xl font-black text-emerald-700">
                {pro.visitingCharges || '₹150'}
              </span>
            </div>

            {pro.hourlyRate && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Standard Service Rate</p>
                  <p className="text-xs text-slate-400 mt-0.5">Base labor / hourly charge</p>
                </div>
                <span className="text-xl font-black text-blue-700">
                  {pro.hourlyRate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ─── 3. SERVICE LOCATIONS IN KURNOOL ─── */}
        {pro.serviceAreas && pro.serviceAreas.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Service Areas Covered in Kurnool</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {pro.serviceAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 4. ABOUT & SPECIALIZATION ─── */}
        {pro.description && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-600" />
              <span>About Services & Experience</span>
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {pro.description}
            </p>
          </div>
        )}

        {/* ─── 5. WORK & PORTFOLIO PHOTOS ─── */}
        {pro.portfolioPhotos && pro.portfolioPhotos.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Portfolio & Work Samples</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pro.portfolioPhotos.map((photoUrl, idx) => (
                <a
                  key={idx}
                  href={photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative"
                >
                  <Image
                    src={photoUrl}
                    alt={`${pro.fullName} work sample ${idx + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ─── 6. SOCIAL & ONLINE PRESENCE ─── */}
        {(pro.instagramUrl || pro.youtubeUrl || pro.linkedinUrl || pro.twitterUrl || pro.facebookUrl || pro.websiteUrl) && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Social Media & Online Profiles
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {pro.instagramUrl && (
                <a
                  href={pro.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold hover:bg-pink-100 transition"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {pro.youtubeUrl && (
                <a
                  href={pro.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 transition"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {pro.linkedinUrl && (
                <a
                  href={pro.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {pro.twitterUrl && (
                <a
                  href={pro.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-200 transition"
                >
                  <span>Twitter / X</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {pro.facebookUrl && (
                <a
                  href={pro.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {pro.websiteUrl && (
                <a
                  href={pro.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  <span>Website / Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* ─── 7. DIRECT CONNECT ADVISORY ─── */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/60 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              Kurnool One Direct Citizen Connect
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kurnool One charges 0% commission on service jobs. You connect directly with the professional via phone or WhatsApp. We advise discussing service scope and pricing before work starts.
            </p>
          </div>
        </div>

        {/* ─── 8. PRO OWNER MANAGEMENT CTA ─── */}
        <div className="text-center py-4 text-xs text-slate-500">
          <span>Are you {pro.fullName}? </span>
          <Link
            href="/login?returnUrl=/professional/dashboard"
            className="font-bold text-blue-600 hover:underline"
          >
            Manage your profile, leads & visiting rates →
          </Link>
        </div>
      </div>
    </div>
  );
}

