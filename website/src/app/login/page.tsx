'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Building2,
  Briefcase,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Compass,
  Phone,
  ShieldCheck,
  User,
  HeartPulse,
  Home,
  Newspaper,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { sanitizePhone } from '@/services/directoryService';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const {
    user,
    hasBusiness,
    hasProfessional,
    hasBloodDonor,
    isAdmin,
    loginWithGoogle,
    loginWithPhone,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'phone'>('google');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(returnUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleaned = sanitizePhone(phoneNumber);
    if (!cleaned || cleaned.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const cleaned = sanitizePhone(phoneNumber);
      await loginWithPhone(cleaned, 'user', phoneName.trim() || 'Kurnool Resident');
      router.push(returnUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // If already signed in:
  if (user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">You are Signed In</h2>
          <p className="text-slate-500 text-sm mt-1">
            Logged in as <span className="font-bold text-slate-900">{user.displayName || user.email}</span>
          </p>
        </div>

        {/* Dynamic Role Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
            Citizen Account
          </span>
          {hasBusiness && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              🏪 Verified Business Owner
            </span>
          )}
          {hasProfessional && (
            <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              🛠️ Professional Specialist
            </span>
          )}
          {hasBloodDonor && (
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
              🩸 Blood Donor
            </span>
          )}
          {isAdmin && (
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
              🛡️ Administrator
            </span>
          )}
        </div>

        {/* Quick Nav Actions */}
        <div className="space-y-2.5 pt-2">
          {hasBusiness && (
            <Link
              href="/business/dashboard"
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Go to My Business Dashboard</span>
            </Link>
          )}

          {hasProfessional && (
            <Link
              href="/professional/dashboard"
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Go to My Professional Profile</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Admin Control Console</span>
            </Link>
          )}

          <Link
            href={returnUrl}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Continue to Destination</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="rounded-3xl bg-white border border-slate-200 p-7 sm:p-10 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Kurnool One Unified Sign-In</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign in to Kurnool One
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            One single account for citizens, shop owners, doctors, and specialists. All your services and dashboards in one place.
          </p>
        </div>

        {/* Method Toggle: Google vs Mobile Phone */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => { setActiveTab('google'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google (1-Tap)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('phone'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mobile Number (OTP)
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google 1-Tap Tab */}
        {activeTab === 'google' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-98"
            >
              <GoogleIcon />
              <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed text-center">
              Works seamlessly with your Google Account across phone and web. Automatically links your registered businesses and specialist profiles.
            </div>
          </div>
        )}

        {/* Phone OTP Tab */}
        {activeTab === 'phone' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">10-Digit Mobile Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 text-xs font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98480 12345"
                      maxLength={10}
                      className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Send OTP Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  OTP sent to <strong>+91 {phoneNumber}</strong>.
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-center tracking-widest text-lg font-black text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs text-slate-500 hover:underline pt-1"
                >
                  Change mobile number
                </button>
              </form>
            )}
          </div>
        )}

        {/* Guest Exploration Option */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>Continue as Guest (No Login Required) →</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
