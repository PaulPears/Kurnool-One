'use client';

import React, { useEffect } from 'react';
import { Phone, MessageCircle, Navigation, Globe, Share2, Check } from 'lucide-react';
import { trackBusinessInteraction } from '@/services/directoryService';

interface BusinessActionButtonsProps {
  businessId: string;
  phone: string;
  whatsapp?: string;
  mapsUrl: string;
  website?: string;
  name: string;
}

export default function BusinessActionButtons({
  businessId,
  phone,
  whatsapp,
  mapsUrl,
  website,
  name,
}: BusinessActionButtonsProps) {
  const [copied, setCopied] = React.useState(false);

  // Track profile view on page load (guarded by sessionStorage per business)
  useEffect(() => {
    if (!businessId) return;
    const sessionKey = `viewed_biz_${businessId}`;
    if (!sessionStorage.getItem(sessionKey)) {
      trackBusinessInteraction(businessId, 'view');
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [businessId]);

  const handleCallClick = () => {
    trackBusinessInteraction(businessId, 'call');
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsAppClick = () => {
    trackBusinessInteraction(businessId, 'whatsapp');
    const cleanNumber = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '';
    const waUrl = `https://wa.me/91${cleanNumber}?text=${encodeURIComponent(`Hello ${name}, I found your listing on Kurnool One.`)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | Kurnool One`,
          text: `Check out ${name} on Kurnool One!`,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto max-w-full">
      {/* Call CTA */}
      <button
        type="button"
        onClick={handleCallClick}
        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-3 rounded-2xl shadow-md transition cursor-pointer whitespace-nowrap"
      >
        <Phone className="w-4 h-4 shrink-0" />
        <span>Call Now</span>
      </button>

      {/* WhatsApp CTA */}
      {whatsapp && (
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-3 rounded-2xl shadow-md transition cursor-pointer whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>WhatsApp</span>
        </button>
      )}

      {/* Directions CTA */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-3 rounded-2xl shadow-md transition whitespace-nowrap"
      >
        <Navigation className="w-4 h-4 shrink-0" />
        <span>Directions</span>
      </a>

      {/* Website CTA */}
      {website && (
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-3 rounded-2xl shadow-md transition whitespace-nowrap"
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Website</span>
        </a>
      )}

      {/* Share CTA */}
      <button
        type="button"
        onClick={handleShareClick}
        className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl transition cursor-pointer border border-slate-200"
        title="Share Business Listing"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
