'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  Building2,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '@/context/AuthContext';

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

  const { user, loginWithGoogle, loginWithEmail, signupWithEmail, loginWithDemo, loginAsGuest, logout } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    try {
      await loginWithGoogle();
      router.push(returnUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, displayName);
      }
      router.push(returnUrl);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickDemo = async (role: 'merchant' | 'professional' | 'user') => {
    setErrorMsg('');
    setActiveDemoRole(role);
    try {
      await loginWithDemo(role);
      if (returnUrl && returnUrl !== '/') {
        router.push(returnUrl);
      } else if (role === 'merchant') {
        router.push('/business/dashboard');
      } else if (role === 'professional') {
        router.push('/professional/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Demo sign-in failed.');
    } finally {
      setActiveDemoRole(null);
    }
  };

  // If already signed in
  if (user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#0c1222] border border-white/10 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">You are Signed In</h2>
          <p className="text-slate-400 text-sm mt-1">
            Logged in as <span className="font-bold text-white">{user.displayName || user.email}</span>
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Link
            href={returnUrl}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Continue to Destination</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => logout()}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl border border-white/10 transition"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-10 px-4">
      {/* Container Card */}
      <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-7 sm:p-10 shadow-2xl space-y-7 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kurnool One Profile Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {mode === 'signin' ? 'Sign In to Your Account' : 'Create Your Account'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-normal">
            Sign in to your Kurnool One citizen account or jump to your specialized portal:
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Link
              href="/business/login"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/20 text-blue-300 text-xs font-bold transition text-left"
            >
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="block text-white font-bold text-xs">Business Portal</span>
                <span className="text-[10px] text-blue-200/70 font-normal">For Shop Owners →</span>
              </div>
            </Link>

            <Link
              href="/professional/login"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-500/10 border border-teal-400/30 hover:bg-teal-500/20 text-teal-300 text-xs font-bold transition text-left"
            >
              <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <span className="block text-white font-bold text-xs">Pro Portal</span>
                <span className="text-[10px] text-teal-200/70 font-normal">For Experts/Creators →</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Demo Credentials Section (Highlighted for User Testing) */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-400/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Instant 1-Click Demo Login</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Test Ready</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Click any demo profile below to test without typing credentials:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* Merchant Demo */}
            <button
              type="button"
              disabled={loading || activeDemoRole !== null}
              onClick={() => handle1ClickDemo('merchant')}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-left transition flex flex-col justify-between cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <Building2 className="w-4 h-4 text-amber-400" />
                {activeDemoRole === 'merchant' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
              </div>
              <span className="font-bold text-xs text-white">Merchant</span>
              <span className="text-[10px] text-slate-400">Shop Owner</span>
            </button>

            {/* Pro Demo */}
            <button
              type="button"
              disabled={loading || activeDemoRole !== null}
              onClick={() => handle1ClickDemo('professional')}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 text-left transition flex flex-col justify-between cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <UserCheck className="w-4 h-4 text-blue-400" />
                {activeDemoRole === 'professional' && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
              </div>
              <span className="font-bold text-xs text-white">Professional</span>
              <span className="text-[10px] text-slate-400">Creator/Specialist</span>
            </button>

            {/* Citizen Demo */}
            <button
              type="button"
              disabled={loading || activeDemoRole !== null}
              onClick={() => handle1ClickDemo('user')}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 text-left transition flex flex-col justify-between cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                {activeDemoRole === 'user' && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
              </div>
              <span className="font-bold text-xs text-white">Citizen</span>
              <span className="text-[10px] text-slate-400">Regular User</span>
            </button>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-98"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0c1222] px-3 text-xs text-slate-500 uppercase tracking-widest font-semibold">
            or with email
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 text-white text-xs font-medium outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 text-white text-xs font-medium outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 text-white text-xs font-medium outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In with Email' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Skip Login / Guest Mode */}
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              await loginAsGuest('user');
              router.push(returnUrl || '/');
            } finally {
              setLoading(false);
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition border border-white/10 flex items-center justify-center gap-1.5"
        >
          <span>Skip Login (Explore Kurnool One as Guest)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-slate-400">
          {mode === 'signin' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="text-amber-300 font-bold hover:underline cursor-pointer ml-1"
              >
                Create Account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                }}
                className="text-blue-400 font-bold hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
