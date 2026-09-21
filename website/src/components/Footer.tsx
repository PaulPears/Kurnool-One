import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                K1
              </div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Kurnool One</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Kurnool One (కర్నూలు వన్) is the premier digital civic and commercial platform for Kurnool, connecting residents and visitors with verified local businesses, skilled professionals, heritage landmarks, and exclusive city offers.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Local Business Listings</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase mb-5">Quick Explore</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/directory" className="hover:text-blue-600 transition">
                  Browse Businesses
                </Link>
              </li>
              <li>
                <Link href="/directory?tab=professionals" className="hover:text-blue-600 transition">
                  Skilled Professionals & Creators
                </Link>
              </li>
              <li>
                <Link href="/directory?category=food_dining" className="hover:text-blue-600 transition">
                  Top Restaurants & Biryani Centers
                </Link>
              </li>
              <li>
                <Link href="/directory?category=health_wellness" className="hover:text-blue-600 transition">
                  Hospitals & Medical Stores
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-blue-600 transition">
                  Konda Reddy Buruju & Tourism
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-blue-600 transition">
                  City Discounts & Coupons
                </Link>
              </li>
            </ul>
          </div>

          {/* For Merchants */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase mb-5">For Businesses & Pros</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/register-business" className="text-blue-600 hover:text-blue-800 font-semibold transition">
                  + Register Your Business Listing
                </Link>
              </li>
              <li>
                <Link href="/register-professional" className="text-teal-600 hover:text-teal-800 font-semibold transition">
                  + Register Professional Profile
                </Link>
              </li>
              <li>
                <Link href="/business/login" className="text-slate-700 hover:text-blue-600 transition">
                  Business Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/professional/login" className="text-slate-700 hover:text-teal-600 transition">
                  Professional Portal Login
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Verified Blue Tick Badges</span>
              </li>
            </ul>
          </div>

          {/* Contact & City Info */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm tracking-wider uppercase mb-5">Contact & Support</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                <span>Kurnool City, Andhra Pradesh 518001, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>support@kurnoolone.com</span>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">Notice:</p>
              Kurnool One is an independent digital community platform and is not affiliated with or endorsed by the Kurnool Municipal Corporation.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Kurnool One (కర్నూలు వన్). All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for the people of Kurnool & Rayalaseema</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
