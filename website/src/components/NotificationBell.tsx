'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Megaphone, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { fetchBroadcastNotifications, BroadcastNotificationItem } from '@/services/directoryService';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<BroadcastNotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBroadcastNotifications()
      .then((data) => {
        setNotifications(data);
        const lastRead = localStorage.getItem('kurnool_last_read_notif');
        if (data.length > 0) {
          const newestTime = data[0].createdAt?.seconds || 0;
          if (!lastRead || Number(lastRead) < newestTime) {
            setHasUnread(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && notifications.length > 0) {
      const newestTime = notifications[0].createdAt?.seconds || Date.now() / 1000;
      localStorage.setItem('kurnool_last_read_notif', String(newestTime));
      setHasUnread(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition relative active:scale-95"
        title="City Announcements"
        aria-label="City Announcements"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in text-slate-900">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">
                City Bulletins & Alerts
              </h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">No New Notifications</p>
                <p>You are all caught up with Kurnool updates.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {notif.category || 'Announcement'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {notif.createdAt ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'Recent'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{notif.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{notif.body}</p>
                  {notif.actionUrl && (
                    <Link
                      href={notif.actionUrl}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

