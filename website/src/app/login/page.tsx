'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  UserCheck,
  Building2,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
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

  const { user, loginWithGoogle, logout } = useAuth();
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

  // If already signed in
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
        <div className="space-y-3 pt-2">
          <Link
            href={returnUrl}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Continue to Destination</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => logout()}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-12 px-4">
      {/* Container Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-7 sm:p-10 shadow-xl space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Kurnool One Citizen Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign In with Google
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            For residents, citizens, and tourists. Access verified local directories, exclusive city discounts, and bookmarks in 1 tap.
          </p>
        </div>

        {/* Portal Switcher for Business & Pro */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/business/login"
            className="flex items-center gap-2 p-3 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100/70 text-blue-800 text-xs font-bold transition text-left"
          >
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="block text-slate-900 font-bold text-xs">Business Portal</span>
              <span className="text-[10px] text-blue-600 font-normal">Phone OTP Login →</span>
            </div>
          </Link>

          <Link
            href="/professional/login"
            className="flex items-center gap-2 p-3 rounded-2xl bg-teal-50 border border-teal-200 hover:bg-teal-100/70 text-teal-800 text-xs font-bold transition text-left"
          >
            <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <span className="block text-slate-900 font-bold text-xs">Pro Portal</span>
              <span className="text-[10px] text-teal-600 font-normal">Phone OTP Login →</span>
            </div>
          </Link>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-98"
          >
            <GoogleIcon />
            <span>{loading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Explore as Guest Option */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>Explore Kurnool One as Guest (No Login Required) →</span>
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
