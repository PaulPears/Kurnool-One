'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Building2,
  Briefcase,
  HeartPulse,
  ShieldCheck,
  Home,
  Newspaper,
  LogOut,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CitizenProfilePage() {
  const { user, profile, hasBusiness, hasProfessional, hasBloodDonor, isAdmin, myBusinessId, myProfessionalId, logout, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {t('Sign In to View Profile', 'ప్రొఫైల్ చూడటానికి లాగిన్ అవ్వండి')}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t(
              'Sign in with your Google account or phone number to view your registered businesses, professional profiles, and voluntary donor status.',
              'మీ వ్యాపారాలు, ప్రొఫెషనల్ వివరాలు మరియు రక్తదాత సమాచారం చూడటానికి లాగిన్ అవ్వండి.'
            )}
          </p>
          <Link
            href="/login?returnUrl=/profile"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
          >
            <span>{t('Continue to Sign In', 'లాగిన్ చేయండి')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ─── 1. USER IDENTITY CARD ─── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0">
              {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'K'}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {user.displayName || 'Kurnool Citizen'}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Citizen
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-1">
                {user.email && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phoneNumber && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Badges of Registered Roles */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                {hasBusiness && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Business Owner
                  </span>
                )}
                {hasProfessional && (
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-bold inline-flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Service Specialist
                  </span>
                )}
                {hasBloodDonor && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold inline-flex items-center gap-1">
                    <HeartPulse className="w-3 h-3" /> Blood Donor
                  </span>
                )}
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Administrator
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition border border-red-200 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ─── 2. MY MANAGEMENT PORTALS ─── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            {t('My Dashboards & Portals', 'నా డాష్‌బోర్డులు')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Dashboard Portal */}
            {hasBusiness ? (
              <Link
                href="/business/dashboard"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                      Business Dashboard
                    </h3>
                    <p className="text-xs text-slate-500">Manage shop profile, leads & offers</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </Link>
            ) : (
              <Link
                href="/register-business"
                className="p-5 rounded-2xl bg-white border border-slate-200 border-dashed hover:border-blue-500 hover:bg-blue-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                      Register Your Shop / Business
                    </h3>
                    <p className="text-xs text-slate-500">Get listed on Kurnool One directory</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </Link>
            )}

            {/* Professional Portal */}
            {hasProfessional ? (
              <Link
                href="/professional/dashboard"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-600 transition">
                      Professional Dashboard
                    </h3>
                    <p className="text-xs text-slate-500">Manage service rates & customer leads</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
              </Link>
            ) : (
              <Link
                href="/register-professional"
                className="p-5 rounded-2xl bg-white border border-slate-200 border-dashed hover:border-teal-500 hover:bg-teal-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-600 transition">
                      Register as Service Specialist
                    </h3>
                    <p className="text-xs text-slate-500">Electrician, Plumber, Creator, Doctor, etc.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
              </Link>
            )}

            {/* Blood Donor Directory Link */}
            <Link
              href="/blood-donors"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:shadow-md transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition">
                    Voluntary Blood Donors
                  </h3>
                  <p className="text-xs text-slate-500">
                    {hasBloodDonor ? 'You are registered as a life saver' : 'Join volunteer lifesavers directory'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition" />
            </Link>

            {/* Admin Console Link (if admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="p-5 rounded-2xl bg-white border border-purple-200 hover:border-purple-500 hover:shadow-md transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-purple-900 group-hover:text-purple-600 transition">
                      Administrator Console
                    </h3>
                    <p className="text-xs text-slate-500">Full central management & moderation</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" />
              </Link>
            )}
          </div>
        </div>

        {/* ─── 3. CIVIC SHORTCUTS ─── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            {t('Civic Actions & Posts', 'పౌర సేవలు')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/rent"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900">Post House for Rent / To-Let</h4>
                <p className="text-[11px] text-slate-500 truncate">Connect with tenants with zero brokerage</p>
              </div>
            </Link>

            <Link
              href="/news"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 transition flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Newspaper className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900">Submit Local News Story</h4>
                <p className="text-[11px] text-slate-500 truncate">Report community news & local issues</p>
              </div>
            </Link>
          </div>
        </div>

        {/* ─── 4. LEGAL & ACCOUNT REMOVAL COMPLIANCE ─── */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/delete-account" className="text-red-600 hover:underline inline-flex items-center gap-1 font-semibold">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </Link>
          </div>
          <p>© 2026 Kurnool One. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

