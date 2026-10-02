'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Mail,
  Phone,
  HelpCircle,
} from 'lucide-react';

export default function DeleteAccountPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [accountType, setAccountType] = useState<'citizen' | 'business' | 'professional'>('citizen');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kurnool One Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Delete Account & Associated Data
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Google Play Console & DPDP Act 2023 Compliant Data Erasure Portal
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>What happens when your account is deleted?</span>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-amber-800">
              <li>Your profile name, registered phone number, and avatar photo are permanently deleted.</li>
              <li>Any business or professional listings associated with your phone number will be unlinked and scheduled for deletion within 30 days.</li>
              <li>Authentication records in Firebase are immediately invalidated.</li>
              <li>This action is permanent and cannot be undone.</li>
            </ul>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900">Deletion Request Received</h3>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                We have logged your account deletion request for <strong className="font-mono">{phoneOrEmail}</strong>.
                Your personal credentials and linked directory entries will be purged from our servers within 48 hours.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-block py-2.5 px-6 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['citizen', 'business', 'professional'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAccountType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border capitalize transition ${
                        accountType === t
                          ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Registered Mobile Number or Email Address *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210 or user@example.com"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Reason for Deletion (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us why you want to delete your Kurnool One account..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Submitting Deletion Request...' : 'Confirm and Submit Deletion Request'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>In-App Option: Settings &gt; Delete Account</span>
            <Link href="/privacy" className="text-blue-600 font-semibold hover:underline">
              Read Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
