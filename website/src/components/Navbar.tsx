'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Civic Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-medium tracking-wide">
              Kurnool One (కర్నూలు వన్) • Official City Directory & Local Services
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/business/dashboard"
              className="hover:text-white transition text-blue-300 flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Business Portal</span>
            </Link>

            <span className="text-slate-700">|</span>

            <Link
              href="/professional/dashboard"
              className="hover:text-white transition text-teal-300 flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-teal-400" />
              <span>Pro Portal</span>
            </Link>

            <span className="text-slate-700">|</span>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-300">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => logout()}
                  className="hover:text-rose-400 text-slate-400 ml-1 transition cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hover:text-amber-300 transition text-amber-400 font-bold flex items-center gap-1"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Citizen Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-600/20 group-hover:scale-105 transition">
            K1
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
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
          <Link
            href="/directory"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Directory</span>
          </Link>

          <Link
            href="/directory?tab=professionals"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Professionals</span>
          </Link>

          <Link
            href="/events"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Events</span>
          </Link>

          <Link
            href="/offers"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-amber-700 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>Deals & Offers</span>
          </Link>

          <Link
            href="/explore"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition shadow-none hover:shadow-sm"
          >
            <Compass className="w-4 h-4 text-slate-600" />
            <span>Explore City</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/register-professional"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 transition"
          >
            <Briefcase className="w-3.5 h-3.5 text-teal-600" />
            <span>+ List Pro</span>
          </Link>

          <Link
            href="/register-business"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-200" />
            <span>+ Add Business</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 shadow-xl space-y-3">
          {/* User Auth Banner in Mobile Drawer */}
          {user ? (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between mb-2">
              <div>
                <span className="block text-xs font-bold text-slate-900">{user.displayName || 'Kurnool User'}</span>
                <span className="block text-[11px] text-slate-500">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Link
                href="/business/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex flex-col items-center justify-center gap-1"
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Business Login</span>
              </Link>
              <Link
                href="/professional/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex flex-col items-center justify-center gap-1"
              >
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span>Pro Login</span>
              </Link>
            </div>
          )}

          <Link
            href="/directory"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Commercial Business Directory (50 Categories)</span>
          </Link>

          <Link
            href="/directory?tab=professionals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Skilled Pros, Doctors & Creators (30 Categories)</span>
          </Link>

          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Upcoming Kurnool Events & Festivals</span>
          </Link>

          <Link
            href="/offers"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>Local Deals, Coupons & Discounts</span>
          </Link>

          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-slate-800 font-semibold text-sm border-b border-slate-100"
          >
            <Compass className="w-4 h-4 text-slate-600" />
            <span>Explore City Heritage (Konda Reddy Buruju, Orvakal)</span>
          </Link>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              href="/register-professional"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-center rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200"
            >
              + List Pro Profile
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
      )}
    </header>
  );
}
