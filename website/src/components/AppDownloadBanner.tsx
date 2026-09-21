import React from 'react';
import { Smartphone, Download, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function AppDownloadBanner() {
  return (
    <section className="my-16 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-blue-500/20">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Native Mobile Experience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
              Download the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">Kurnool One Mobile App</span>
            </h2>
            <p className="text-slate-300 text-base max-w-2xl mb-6 leading-relaxed">
              Experience lightning-fast local search, instant WhatsApp chats with Kurnool merchants, one-tap Google Maps directions, and urgent city announcements directly on your Android device.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-sm">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-tap WhatsApp Connect</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant Offline Directory</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>100% Verified Local Shops</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#download"
                className="flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-6 py-3.5 rounded-2xl shadow-xl transition hover:scale-105"
              >
                <Download className="w-5 h-5 text-blue-600" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Available For Android</div>
                  <div className="text-sm font-black">Download APK / Play Store</div>
                </div>
              </a>
              <span className="text-xs text-slate-400">Available on Google Play & Web • Free</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-64 h-72 bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 rounded-3xl p-6 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-xl">
              <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg mb-4 flex items-center justify-center">
                <Smartphone className="w-12 h-12 text-blue-600" />
              </div>
              <div className="font-extrabold text-white text-lg">Kurnool One App</div>
              <div className="text-xs text-blue-200 mt-1">Version 1.0 (Android & Web)</div>
              <div className="mt-4 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                ⚡ 100% Free for Residents
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
