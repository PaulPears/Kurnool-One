import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ShieldCheck, Heart, Building, PhoneCall } from 'lucide-react';

export const metadata = {
  title: 'Legal Disclaimers | Kurnool One',
  description: 'Official legal disclaimers, medical emergency notices, and directory platform policies for Kurnool One.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kurnool One Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Official Disclaimers</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Legal Disclaimers & Limitations</h1>
            <p className="text-xs text-slate-500">
              Effective Date: November 2026 | Kurnool One Digital Platform
            </p>
          </div>

          {/* 1. Government Non-Affiliation */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Building className="w-4 h-4 text-amber-700" />
              <span>1. Government Non-Affiliation Statement</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              Kurnool One is an independent, privately-operated civic discovery and local directory platform created by local technology entrepreneurs. Kurnool One is <strong>NOT</strong> affiliated with, operated by, endorsed by, or in any way officially associated with the Government of Andhra Pradesh, the District Collectorate of Kurnool, the Kurnool Municipal Corporation (KMC), Andhra Pradesh Police, or any official government agency.
            </p>
          </div>

          {/* 2. Medical & Emergency Services Notice */}
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <Heart className="w-4 h-4 text-rose-700" />
              <span>2. Voluntary Blood Donors & Medical Emergencies</span>
            </div>
            <p className="text-xs text-rose-950 leading-relaxed">
              The Blood Donor Registry connects voluntary donors with citizens requiring urgent medical support. Kurnool One is <strong>NOT</strong> a blood bank, clinic, hospital, or diagnostic laboratory. We do not test or screen donors for blood type compatibility, viral markers, or medical eligibility. Families, hospitals, and licensed blood banks must perform mandatory pre-transfusion cross-matching and laboratory validation before any blood transfusion takes place.
            </p>
          </div>

          {/* 3. Independent Directory Status */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Independent Merchant & Service Professional Listings</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Businesses and service professionals listed on Kurnool One operate independently. Kurnool One does not employ, certify, or warrant the quality, pricing, safety, or legality of services rendered or goods sold by listed third parties. Any transactions, fee negotiations, or contractual engagements occur solely between the user and the merchant or service provider.
            </p>
          </section>

          {/* 4. Peer-to-Peer Marketplace */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Used Goods & Marketplace Classifieds</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Kurnool One Buy & Sell Marketplace provides peer-to-peer classified advertisements. Buyers and sellers are strictly advised to inspect items in person, verify physical condition, and avoid sending advance bank or UPI payments before receiving products. Kurnool One is not responsible for second-hand product condition, ownership titles, or escrow transactions.
            </p>
          </section>

          {/* 5. Grievance Redressal */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900">5. Grievance Redressal Officer</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Grievance Redressal Officer, Kurnool One</p>
              <p>Email: <a href="mailto:grievance@kurnoolone.com" className="text-blue-600 font-bold hover:underline">grievance@kurnoolone.com</a></p>
              <p>Physical Address: Kurnool One Technology Desk, Kurnool, Andhra Pradesh 518001</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

