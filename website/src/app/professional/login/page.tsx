'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Award,
  PhoneCall,
  DollarSign,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfessionalLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, loginWithEmail, signupWithEmail, loginWithGoogle, loginWithDemo, loginAsGuest } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/professional/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Please enter your Full Name or Creator Handle');
        }
        await signupWithEmail(email, password, name.trim());
      } else {
        await loginWithEmail(email, password);
      }
      router.push('/professional/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/professional/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPro = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await loginWithDemo('professional');
      router.push('/professional/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-teal-50/50 via-slate-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Col: Pro Benefits */}
        <div className="md:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5 text-teal-600" />
            Professional & Creator Portal
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Showcase Your Expertise in Kurnool
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed">
            Dedicated portal for Doctors, Influencers, Software Engineers, Lawyers, Skilled Technicians, Tutors, and Freelancers in Kurnool.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { icon: Award, text: 'Verified Professional Profile with 30 distinct categories' },
              { icon: DollarSign, text: 'Transparent upfront consultation and hourly rates' },
              { icon: Share2, text: 'Showcase Instagram creator handle & YouTube channel' },
              { icon: PhoneCall, text: 'Direct client calls & booking WhatsApp inquiries' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Are you a shop or business owner?{' '}
              <Link href="/business/login" className="text-blue-600 font-bold hover:underline">
                Go to Business Portal →
              </Link>
            </p>
          </div>
        </div>

        {/* Right Col: Pro Login Card */}
        <div className="md:col-span-7 bg-white rounded-3xl shadow-xl border border-teal-100/80 p-6 sm:p-8">
          {/* 1-Click Demo Login Box */}
          <div className="mb-6 p-4 rounded-2xl bg-teal-50/80 border border-teal-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-teal-900 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Instant Demo Professional (1-Click)
              </span>
              <span className="text-[10px] bg-teal-200/70 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                Testing
              </span>
            </div>
            <p className="text-xs text-teal-800 mb-3 leading-relaxed">
              Login immediately with pre-configured professional credentials (<code className="font-mono bg-teal-100 px-1 py-0.5 rounded text-teal-900">pro@kurnoolone.com</code>):
            </p>
            <button
              onClick={handleDemoPro}
              disabled={demoLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Briefcase className="w-4 h-4" />
              {demoLoading ? 'Logging In...' : 'Launch Professional Dashboard as Demo Pro'}
            </button>
          </div>

          {/* Toggle: Sign In vs Register */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Professional Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Pro Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Full Name / Creator Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Srinivas Rao or Ramesh Photography"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Professional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="pro@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Create Professional Account' : 'Sign In to Pro Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Or Continue With
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold text-xs shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Continue with Google
          </button>

          {/* Skip Login / Guest Mode */}
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                await loginAsGuest('professional');
                router.push('/professional/dashboard');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Skip Login (Explore Pro Dashboard as Guest)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/register-professional" className="hover:text-teal-600 font-bold">
              + Register Pro Profile
            </Link>
            <Link href="/login" className="hover:text-slate-800 font-medium">
              Citizen Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
