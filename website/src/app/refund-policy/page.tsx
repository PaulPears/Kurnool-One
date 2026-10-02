import React from 'react';
import Link from 'next/link';
import { CreditCard, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Refund & Cancellation Policy | Kurnool One',
  description: 'Pricing, renewal, and refund policies for Kurnool One directory listings.',
};

export default function RefundPolicyPage() {
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
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Commercial Terms</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Refund & Cancellation Policy</h1>
            <p className="text-xs text-slate-500">
              Applicable to Featured & Verified Business / Professional Listings
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Listing Subscription Fees</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kurnool One offers paid visibility tiers (Monthly, Half-Yearly, and Yearly) for local businesses and professionals wishing to obtain Verified Blue Tick Badges, priority search ranking, and deal publishing privileges. All fees are clearly displayed in Indian Rupees (INR) inclusive of applicable taxes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Cancellation Policy</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Merchants may cancel their subscription at any time via the merchant dashboard. Upon cancellation, your listing will remain active in the paid tier until the end of the current billing cycle, after which it will revert to the standard free tier without auto-debit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. 7-Day Refund Window</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              If a merchant or professional is dissatisfied with the promotional services within <strong>7 days of initial subscription purchase</strong>, they may request a full refund by contacting billing support at <a href="mailto:support@kurnoolone.com" className="text-blue-600 font-bold hover:underline">support@kurnoolone.com</a>.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Refunds will be credited to the original payment method (via Razorpay UPI / Netbanking / Card) within 5–7 business days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Non-Refundable Scenarios</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Refunds will not be issued for listings suspended due to fraud, deceptive advertising, or violation of Kurnool One community terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
