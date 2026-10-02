import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Kurnool One',
  description: 'Terms and conditions governing the use of Kurnool One city platform and directory.',
};

export default function TermsPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>User Agreement</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
            <p className="text-xs text-slate-500">
              Last Updated: September 2026 | Kurnool One Platform
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">Notice to All Users & Merchants:</p>
            <p>
              By accessing or registering on Kurnool One (via mobile application or website), you agree to comply with and be bound by the following terms and conditions. If you disagree with any part of these terms, please discontinue use of the platform.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Account Types & Role Exclusivity</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kurnool One distinguishes between commercial Businesses and individual Professionals. A mobile phone number registered under one role cannot simultaneously hold credentials for the opposite role. Commercial establishments must list under Business, and solo specialists (Doctors, Advocates, Freelancers, Technicians) must list under Professional.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Accuracy of Listing Information</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Merchants and Professionals represent that all posted details—including business addresses, phone numbers, trade licenses, visiting fees, and operational hours—are genuine and accurate. Kurnool One reserves the right to suspend any listing found providing misleading, predatory, or unlawful information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Independent Directory Status</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kurnool One operates solely as a discovery index connecting Kurnool residents with independent merchants and service providers. Kurnool One is not a party to any commercial contracts, warranties, or transactions between users and listed merchants.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Prohibited Content</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Users and merchants may not upload unlawful, obscene, defamatory, or fraudulent content. Impersonation of government officials, civic bodies, or other businesses is strictly prohibited and results in immediate account termination.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900">5. Jurisdiction</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              These terms are governed by the laws of India. Any disputes arising from the use of Kurnool One shall be subject to the exclusive jurisdiction of the competent courts in Kurnool, Andhra Pradesh.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
