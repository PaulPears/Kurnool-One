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
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Call CTA */}
      <button
        type="button"
        onClick={handleCallClick}
        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md transition cursor-pointer"
      >
        <Phone className="w-4 h-4" />
        <span>Call {phone}</span>
      </button>

      {/* WhatsApp CTA */}
      {whatsapp && (
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>
      )}

      {/* Directions CTA */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md transition"
      >
        <Navigation className="w-4 h-4" />
        <span>Directions</span>
      </a>

      {/* Website CTA */}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md transition"
        >
          <Globe className="w-4 h-4" />
          <span>Website</span>
        </a>
      )}

      {/* Share CTA */}
      <button
        type="button"
        onClick={handleShareClick}
        className="flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-sm px-4 py-3 rounded-2xl border border-slate-200 transition cursor-pointer"
        title="Share Business Profile"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-xs">Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Share</span>
          </>
        )}
      </button>
    </div>
  );
}
