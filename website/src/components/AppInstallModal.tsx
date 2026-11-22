'use client';

import React from 'react';
import Image from 'next/image';
import { X, Smartphone, Download, Star, ShieldCheck, Zap, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionName?: string;
}

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kurnoolone.app';

export default function AppInstallModal({
  isOpen,
  onClose,
  title,
  description,
  actionName,
}: AppInstallModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* App Logo */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-lg shadow-blue-500/25 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Kurnool One Logo"
              width={72}
              height={72}
              className="rounded-xl object-contain bg-white"
            />
            <div className="absolute -bottom-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Star className="w-2.5 h-2.5 fill-slate-950" />
              <span>4.9</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {title || (language === 'te' ? 'కర్నూలు వన్ యాప్‌ను ఇన్‌స్టాల్ చేసుకోండి' : 'Install Kurnool One App')}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {description || (language === 'te'
                ? `${actionName ? `${actionName} చేయడానికి` : 'కాల్, వాట్సాప్ మరియు ప్రత్యక్ష ఫీచర్లు పొందడానికి'} అధికారిక ఆండ్రాయిడ్ యాప్‌ను ఇన్‌స్టాల్ చేయండి.`
                : `To ${actionName || 'call, chat on WhatsApp, post listings, and unlock full city benefits'}, open or install the official Kurnool One Android App.`)}
            </p>
          </div>

          {/* Value props */}
          <div className="w-full bg-slate-50 rounded-2xl p-3.5 space-y-2 text-left text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-semibold">{language === 'te' ? 'వేగవంతమైన వన్-ట్యాప్ కాల్ & వాట్సాప్ కనెక్ట్' : 'Instant 1-Tap Call & Direct WhatsApp'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{language === 'te' ? '100% ధృవీకరించబడిన స్థానిక షాపులు & నిపుణులు' : '100% Verified Local Shops & Pros'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <MessageCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold">{language === 'te' ? 'ఫ్లాష్ ఆఫర్లు & నగర ప్రకటనల నోటిఫికేషన్లు' : 'Flash Deals, Discounts & City Alerts'}</span>
            </div>
          </div>

          {/* Primary CTA: Google Play */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
          >
            <Smartphone className="w-5 h-5" />
            <div className="text-left leading-tight">
              <div className="text-[10px] uppercase font-bold text-blue-200">Get It On</div>
              <div className="text-sm font-black">Google Play Store</div>
            </div>
          </a>

          {/* Secondary CTA: Direct Web / Continue */}
          <div className="flex items-center justify-between w-full pt-1 text-xs">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'డౌన్‌లోడ్ APK' : 'Download APK'}</span>
            </a>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
            >
              {language === 'te' ? 'వెబ్ ప్రివ్యూ మాత్రమే' : 'Continue preview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
