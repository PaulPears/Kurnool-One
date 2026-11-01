'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Menu,
  X,
  PlusCircle,
  Search,
  Compass,
  Tag,
  Building2,
  Smartphone,
  UserCheck,
  Calendar,
  Sparkles,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  HeartPulse,
  Home,
  Newspaper,
  Languages,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, hasBusiness, hasProfessional, isAdmin, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Civic Utility Bar - Professional Light Design */}
      <div className="bg-slate-50 text-slate-700 text-xs py-2 px-4 sm:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 font-medium tracking-wide">
              Kurnool One (కర్నూలు వన్) • Premier Digital City Directory & Local Services
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="px-2.5 py-0.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Citizen Profile Hub"
                >
                  <UserIcon className="w-3 h-3 text-blue-600" />
                  <span>{user.displayName || user.email?.split('@')[0]}</span>
                </Link>

                {hasBusiness && (
                  <Link
                    href="/business/dashboard"
                    className="hover:text-emerald-700 transition text-emerald-800 flex items-center gap-1 font-bold"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>My Business</span>
                  </Link>
                )}

                {hasProfessional && (
                  <Link
                    href="/professional/dashboard"
                    className="hover:text-teal-700 transition text-teal-800 flex items-center gap-1 font-bold"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                    <span>My Pro Profile</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hover:text-purple-700 transition text-purple-800 flex items-center gap-1 font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Admin</span>
                  </Link>
                )}

                <span className="text-slate-300">|</span>

                <button
                  onClick={() => logout()}
                  className="hover:text-rose-600 text-slate-500 transition cursor-pointer flex items-center gap-1 font-medium"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hover:text-blue-700 transition text-blue-800 font-bold flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('Sign In', 'లాగిన్')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-white border border-slate-200/80 flex items-center justify-center p-0.5">
            <Image
              src="/logo.png"
              alt="Kurnool One Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl text-slate-900 tracking-tight">
                Kurnool One
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                City Portal
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span>కర్నూలు • Rayalaseema, AP</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
          <Link
            href="/directory"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('Businesses', 'వ్యాపారాలు')}</span>
          </Link>

          <Link
            href="/rent"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Home className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('Rent Houses', 'అద్దె ఇళ్ళు')}</span>
          </Link>

          <Link
            href="/blood-donors"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-rose-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('Blood Donors', 'రక్తదాతలు')}</span>
          </Link>

          <Link
            href="/news"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Newspaper className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('City News', 'నగర వార్తలు')}</span>
          </Link>

          <Link
            href="/offers"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-amber-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('Deals & Classifieds', 'డీల్స్ & అమ్మకాలు')}</span>
          </Link>

          <Link
            href="/explore"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('Explore City', 'దర్శనీయ స్థలాలు')}</span>
          </Link>
        </nav>

        {/* Action Buttons & Language Switcher */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Civic Notification Bell */}
          <NotificationBell />

          {/* 1-Tap Bilingual Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            title="Toggle Language / భాషను మార్చండి"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'en' ? 'తెలుగు' : 'ENG'}</span>
          </button>

          <Link
            href="/register-business"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/20 transition active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-200" />
            <span>{t('+ Add Business', '+ వ్యాపారాన్ని చేర్చండి')}</span>
          </Link>
        </div>

        {/* Mobile Notification & menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition active:scale-95"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-20 left-0 right-0 z-50 bg-white border-b border-slate-200 px-6 py-6 shadow-2xl space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto lg:hidden">
            {/* User Auth Banner in Mobile Drawer */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 space-y-2 mb-2">
              <div className="flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:underline flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">{user.displayName || 'Kurnool Resident'}</span>
                    <span className="block text-[11px] text-blue-700 font-medium">View Profile & Hub →</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Quick Role Links in Mobile Drawer */}
              {(hasBusiness || hasProfessional || isAdmin) && (
                <div className="pt-2 border-t border-blue-200/60 flex flex-wrap gap-1.5">
                  {hasBusiness && (
                    <Link
                      href="/business/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>My Storefront</span>
                    </Link>
                  )}
                  {hasProfessional && (
                    <Link
                      href="/professional/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1 rounded-lg bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <Briefcase className="w-3 h-3" />
                      <span>My Specialist Profile</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin Console</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between transition mb-2"
            >
              <div className="flex items-center gap-2.5">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="block text-slate-900 font-extrabold">{t('Sign In to Kurnool One', 'కర్నూలు వన్ లాగిన్')}</span>
                  <span className="block text-[10px] text-blue-700 font-normal">{t('Single login for citizens, shops & specialists', 'పౌరులు, వ్యాపారులు & నిపుణుల ఉమ్మడి లాగిన్')}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          )}

          {/* Language Switcher in Mobile Drawer */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-700">{t('Display Language', 'భాషను మార్చండి')}:</span>
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs shadow-xs"
            >
              {language === 'en' ? 'తెలుగు' : 'ENG'}
            </button>
          </div>

          <Link
            href="/directory"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{t('Commercial Businesses', 'నగర వ్యాపారాలు')}</span>
          </Link>

          <Link
            href="/rent"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Home className="w-4 h-4 text-teal-600" />
            <span>{t('House Rentals & To-Let', 'అద్దె ఇళ్ళు & టు-లెట్')}</span>
          </Link>

          <Link
            href="/blood-donors"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <span>{t('Emergency Blood Donors', 'అత్యవసర రక్తదాతలు')}</span>
          </Link>

          <Link
            href="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Newspaper className="w-4 h-4 text-indigo-600" />
            <span>{t('Kurnool City News', 'కర్నూలు సిటీ న్యూస్')}</span>
          </Link>

          <Link
            href="/offers"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>{t('Deals & Classifieds (Buy & Sell)', 'డీల్స్ & అమ్మకాలు')}</span>
          </Link>

          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>{t('City Events & Festivals', 'వేడుకలు & ఉత్సవాలు')}</span>
          </Link>

          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Compass className="w-4 h-4 text-slate-600" />
            <span>{t('Explore City Heritage', 'దర్శనీయ స్థలాలు')}</span>
          </Link>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              href="/register-professional"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-center rounded-xl bg-blue-600 text-white text-xs font-black shadow-md"
            >
              + Register Pro
            </Link>
            <Link
              href="/register-business"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-center rounded-xl bg-blue-600 text-white text-xs font-black shadow-md"
            >
              + Add Business
            </Link>
          </div>
        </div>
      </>
    )}
    </header>
  );
}
