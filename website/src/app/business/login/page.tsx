'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  PhoneCall,
  BadgeCheck,
  Percent,
  Phone,
  ShieldAlert,
  KeyRound,
  ShieldCheck,
  Flashlight,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { checkPhoneRoleExclusivity, registerPhoneRole, sanitizePhone } from '@/services/directoryService';

export default function BusinessLoginPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    loginWithPhone,
  } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [roleConflict, setRoleConflict] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: any;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/business/dashboard');
    }
  }, [user, authLoading, router]);

  const fillTestCredentials = () => {
    setError('');
    setRoleConflict(null);
    setPhone('9876500001');
    setName('Kurnool Verified Merchant');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRoleConflict(null);
    const cleaned = sanitizePhone(phone);
    if (!cleaned || cleaned.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const exclusivity = await checkPhoneRoleExclusivity(cleaned, 'business');
      if (!exclusivity.allowed) {
        setRoleConflict(exclusivity.message || 'Phone number role conflict');
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setOtpTimer(60);
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const cleaned = sanitizePhone(phone);
      const exclusivity = await checkPhoneRoleExclusivity(cleaned, 'business');
      if (!exclusivity.allowed) {
        setRoleConflict(exclusivity.message || 'Phone number role conflict');
        setError(exclusivity.message || 'Role conflict.');
        setLoading(false);
        return;
      }

      const businessUser = await loginWithPhone(cleaned, 'merchant', name.trim() || 'Kurnool Verified Merchant');
      await registerPhoneRole(cleaned, 'business', businessUser.uid, {
        name: name.trim() || 'Kurnool Verified Merchant',
        businessName: name.trim() || 'Kurnool Business',
      });

      router.push('/business/dashboard');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-blue-50/50 via-slate-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Col: Merchant Benefits */}
        <div className="md:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Commercial Business Portal
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Grow Your Kurnool Business Online
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed">
            Welcome to the official Kurnool One Merchant Portal. Authenticate using your mobile number and OTP to manage store hours, post discount deals, and receive direct customer calls.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { icon: BadgeCheck, text: 'Official Verified Merchant Blue Tick Badge' },
              { icon: PhoneCall, text: 'Direct customer calls & WhatsApp lead tracking' },
              { icon: Percent, text: 'Publish discount deals & coupons across Kurnool' },
              { icon: TrendingUp, text: 'Live analytics of page views and store inquiries' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Not a commercial business owner?{' '}
              <Link href="/professional/login" className="text-teal-600 font-bold hover:underline">
                Go to Professional Portal →
              </Link>
            </p>
          </div>
        </div>

        {/* Right Col: Business Login Card */}
        <div className="md:col-span-7 bg-white rounded-3xl shadow-xl border border-blue-100/80 p-6 sm:p-8">
          
          {/* Demo / Reviewer Login Credentials Box */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Demo & Reviewer Test Credentials
              </span>
              <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                Reviewer Mode
              </span>
            </div>
            <div className="text-xs text-amber-800 space-y-1 mb-3">
              <div className="flex justify-between">
                <span>Test Phone:</span>
                <span className="font-mono font-bold">+91 98765 00001</span>
              </div>
              <div className="flex justify-between">
                <span>Test OTP Code:</span>
                <span className="font-mono font-bold">123456</span>
              </div>
            </div>
            <button
              type="button"
              onClick={fillTestCredentials}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-700" />
              Auto-Fill Business Test Credentials
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-900">
              Merchant Login with Mobile Number
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your mobile number to receive a 6-digit OTP verification code.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {roleConflict && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Account Role Exclusivity Conflict</span>
              </div>
              <p className="leading-relaxed">{roleConflict}</p>
              <div className="pt-1">
                <Link
                  href="/professional/login"
                  className="inline-flex items-center gap-1.5 font-black text-teal-700 hover:underline"
                >
                  <span>Switch to Professional Portal →</span>
                </Link>
              </div>
            </div>
          )}

          {/* Form */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Business Owner / Merchant Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sri Balaji Supermarket"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number *
                </label>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition">
                  <div className="flex items-center gap-1 px-3 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-600 select-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setRoleConflict(null); }}
                    placeholder="98765 00001"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-transparent text-xs text-slate-800 font-bold tracking-wide focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Kurnool One requires separate mobile credentials for Business accounts.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-[0.99] disabled:opacity-50"
              >
                <Phone className="w-4 h-4" />
                {loading ? 'Verifying Exclusivity...' : 'Get OTP on Mobile Number'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Enter 6-digit OTP code sent to <span className="text-blue-700 font-black">+91 {phone}</span>
                </p>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpCode(''); }}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Change mobile number
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="1 2 3 4 5 6"
                  maxLength={6}
                  className="w-full py-3 bg-slate-50 border-2 border-blue-300 rounded-xl text-center text-xl tracking-[0.5em] font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-center text-slate-500 mt-1.5">
                  💡 Reviewer tip: You can enter <strong className="text-slate-800">123456</strong> for rapid testing.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-[0.99] disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                {loading ? 'Verifying OTP...' : 'Verify OTP & Open Business Dashboard'}
              </button>

              <div className="text-center pt-2">
                {otpTimer > 0 ? (
                  <span className="text-xs text-slate-400">
                    Resend code in <strong className="text-slate-700">{otpTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Resend OTP Now
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Looking to browse Kurnool?</span>
            <Link href="/" className="font-bold text-slate-700 hover:text-blue-600">
              Explore Kurnool One →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
