'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Home,
  Building2,
  UserCheck,
  Tag,
  Calendar,
  Compass,
} from 'lucide-react';

function MobileBottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Businesses',
      href: '/directory',
      icon: Building2,
      isActive: pathname === '/directory' && currentTab !== 'professionals',
    },
    {
      label: 'Pros & Leads',
      href: '/directory?tab=professionals',
      icon: UserCheck,
      isActive: pathname === '/directory' && currentTab === 'professionals',
    },
    {
      label: 'Offers',
      href: '/offers',
      icon: Tag,
      isActive: pathname === '/offers',
    },
    {
      label: 'Events',
      href: '/events',
      icon: Calendar,
      isActive: pathname === '/events',
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <nav className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 relative ${
                active ? 'text-blue-600 scale-105' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {active && (
                <span className="absolute -top-1 w-6 h-1 bg-blue-600 rounded-full" />
              )}
              <div
                className={`p-1 rounded-xl transition-colors ${
                  active ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  active ? 'font-black text-blue-600' : 'font-semibold text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavContent />
    </Suspense>
  );
}
