'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  Image as ImageIcon,
  Layers,
  Bell,
  AlertTriangle,
  Check,
  X,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  Lock,
  Plus,
  RefreshCw,
  Star,
  Crown,
  LogOut,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  BusinessItem,
  ProfessionalItem,
  BUSINESS_CATEGORIES,
  PROFESSIONAL_CATEGORIES,
} from '@/services/directoryService';

type AdminTab =
  | 'overview'
  | 'businesses'
  | 'professionals'
  | 'banners'
  | 'users'
  | 'categories'
  | 'reports';

interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  position?: number;
  createdAt?: any;
}

interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'merchant' | 'professional' | 'admin' | 'super_admin';
  isBanned?: boolean;
  createdAt?: any;
}

interface ReportItem {
  id: string;
  targetId: string;
  targetType: 'business' | 'professional' | 'post';
  reason: string;
  reportedByUid: string;
  createdAt?: any;
  status: 'pending' | 'resolved' | 'dismissed';
}

export default function AdminPanelPage() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Stats state
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingBusinesses: 0,
    totalProfessionals: 0,
    totalUsers: 0,
    activeBanners: 0,
    pendingReports: 0,
  });

  // Entities state
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // New Banner state
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Admin access check: user is logged in and their profile.role is admin/super_admin or official kurnoolone admin
  const isAdmin =
    user &&
    (profile?.role === 'admin' ||
      (profile as any)?.role === 'super_admin' ||
      user.email === 'admin@kurnoolone.com');

  useEffect(() => {
    if (isAdmin) {
      loadTabData(activeTab);
    }
  }, [isAdmin, activeTab]);

  const loadTabData = async (tab: AdminTab) => {
    setLoadingData(true);
    try {
      if (tab === 'overview') {
        const [bizSnap, proSnap, userSnap, banSnap, repSnap] = await Promise.all([
          getDocs(collection(db, 'businesses')),
          getDocs(collection(db, 'professionals')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'promotionBanners')),
          getDocs(collection(db, 'reports')),
        ]);

        const bizDocs = bizSnap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessItem));
        const pendingBiz = bizDocs.filter(b => b.status === 'pending_approval' || b.claimStatus === 'pending').length;

        setStats({
          totalBusinesses: bizSnap.size,
          pendingBusinesses: pendingBiz,
          totalProfessionals: proSnap.size,
          totalUsers: userSnap.size,
          activeBanners: banSnap.size,
          pendingReports: repSnap.size,
        });
      } else if (tab === 'businesses') {
        const snap = await getDocs(query(collection(db, 'businesses'), limit(150)));
        setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessItem)));
      } else if (tab === 'professionals') {
        const snap = await getDocs(query(collection(db, 'professionals'), limit(150)));
        setProfessionals(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProfessionalItem)));
      } else if (tab === 'banners') {
        const snap = await getDocs(collection(db, 'promotionBanners'));
        setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as BannerItem)));
      } else if (tab === 'users') {
        const snap = await getDocs(query(collection(db, 'users'), limit(150)));
        setUsersList(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserRecord)));
      } else if (tab === 'reports') {
        const snap = await getDocs(query(collection(db, 'reports'), limit(100)));
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportItem)));
      }
    } catch (err) {
      console.error('Failed to load admin tab data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // ─── BUSINESS ACTIONS ───────────────────────────────────────────────────────
  const handleUpdateBusinessStatus = async (
    id: string,
    status: 'published' | 'pending_approval' | 'suspended',
    verificationBadge?: 'verified_business' | 'none'
  ) => {
    setActionLoadingId(id);
    try {
      const updates: any = { status };
      if (verificationBadge) {
        updates.verificationBadge = verificationBadge;
      }
      await updateDoc(doc(db, 'businesses', id), updates);
      setBusinesses(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    } catch (err) {
      console.error(err);
      alert('Failed to update business status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleBusinessFeatured = async (id: string, currentTier: string) => {
    setActionLoadingId(id);
    const newTier = currentTier === 'featured' || currentTier === 'premium' ? 'free' : 'featured';
    try {
      await updateDoc(doc(db, 'businesses', id), { tier: newTier });
      setBusinesses(prev => prev.map(b => (b.id === id ? { ...b, tier: newTier as any } : b)));
    } catch (err) {
      console.error(err);
      alert('Failed to update featured status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteBusiness = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    setActionLoadingId(id);
    try {
      await deleteDoc(doc(db, 'businesses', id));
      setBusinesses(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete business');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── PROFESSIONAL ACTIONS ──────────────────────────────────────────────────
  const handleUpdateProStatus = async (id: string, status: 'active' | 'suspended' | 'pending') => {
    setActionLoadingId(id);
    try {
      await updateDoc(doc(db, 'professionals', id), { status });
      setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
    } catch (err) {
      console.error(err);
      alert('Failed to update professional status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleProVerified = async (id: string, currentVerified: boolean) => {
    setActionLoadingId(id);
    const newVerified = !currentVerified;
    try {
      await updateDoc(doc(db, 'professionals', id), { verifiedProfessional: newVerified });
      setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, verifiedProfessional: newVerified } : p)));
    } catch (err) {
      console.error(err);
      alert('Failed to update verified badge');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteProfessional = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete profile for "${name}"?`)) return;
    setActionLoadingId(id);
    try {
      await deleteDoc(doc(db, 'professionals', id));
      setProfessionals(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete professional');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── BANNER ACTIONS ────────────────────────────────────────────────────────
  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFile || !bannerTitle.trim()) {
      alert('Please provide banner title and select an image');
      return;
    }

    setUploadingBanner(true);
    try {
      const filename = `banner_${Date.now()}_${bannerFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `banners/${filename}`);
      const uploadTask = await uploadBytesResumable(storageRef, bannerFile);
      const downloadUrl = await getDownloadURL(uploadTask.ref);

      const newDoc = await addDoc(collection(db, 'promotionBanners'), {
        title: bannerTitle.trim(),
        imageUrl: downloadUrl,
        linkUrl: bannerLink.trim() || '',
        active: true,
        createdAt: serverTimestamp(),
      });

      setBanners(prev => [
        {
          id: newDoc.id,
          title: bannerTitle.trim(),
          imageUrl: downloadUrl,
          linkUrl: bannerLink.trim(),
          active: true,
        },
        ...prev,
      ]);

      setBannerTitle('');
      setBannerLink('');
      setBannerFile(null);
      setBannerPreview(null);
      alert('Banner uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'promotionBanners', id));
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete banner');
    }
  };

  // ─── USER ACTIONS ──────────────────────────────────────────────────────────
  const handleToggleUserBan = async (uid: string, currentBanned?: boolean) => {
    const isBanned = !currentBanned;
    try {
      await updateDoc(doc(db, 'users', uid), { isBanned });
      setUsersList(prev => prev.map(u => (u.uid === uid ? { ...u, isBanned } : u)));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle ban status');
    }
  };

  const handleChangeRole = async (uid: string, role: UserRecord['role']) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
      setUsersList(prev => prev.map(u => (u.uid === uid ? { ...u, role } : u)));
      alert(`User role updated to ${role}`);
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  // ─── AUTH / ACCESS CHECK ───────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Verifying Administrator Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Kurnool One Admin Console</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Restricted Area. This console manages the live production database, business verifications, mobile app banners, and user accounts for Kurnool One.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-2">
            <p className="text-xs font-bold text-slate-300">Signed in as:</p>
            <p className="text-xs font-mono text-blue-400 truncate">{user ? user.email : 'Not Signed In'}</p>
            <p className="text-[11px] text-amber-400">
              {user ? 'This account lacks administrator privileges.' : 'Sign in with an Administrator account.'}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              Sign In with Admin Account
            </Link>
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── FILTERED LISTS ────────────────────────────────────────────────────────
  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch =
      b.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.includes(searchQuery) ||
      b.categoryId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && (b.status === 'pending_approval' || b.claimStatus === 'pending');
    if (statusFilter === 'published') return matchesSearch && b.status === 'published';
    if (statusFilter === 'featured') return matchesSearch && (b.tier === 'featured' || b.tier === 'premium');
    if (statusFilter === 'suspended') return matchesSearch && b.status === 'suspended';
    return matchesSearch;
  });

  const filteredProfessionals = professionals.filter(p => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery);

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'verified') return matchesSearch && p.verifiedProfessional;
    if (statusFilter === 'active') return matchesSearch && p.status === 'active';
    if (statusFilter === 'suspended') return matchesSearch && p.status === 'suspended';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* ─── SIDEBAR NAVIGATION ────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight">Kurnool One</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Master Control Center</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview & KPIs', icon: Layers },
              { id: 'businesses', label: 'Business Listings', icon: Building2, badge: stats.pendingBusinesses },
              { id: 'professionals', label: 'Professional Profiles', icon: Briefcase },
              { id: 'banners', label: 'App Banners', icon: ImageIcon },
              { id: 'categories', label: 'Categories Master', icon: Filter },
              { id: 'users', label: 'Users & Roles', icon: Users },
              { id: 'reports', label: 'Moderation Reports', icon: AlertTriangle, badge: stats.pendingReports },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as AdminTab);
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge ? (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <p className="text-[11px] text-slate-500 font-medium">Logged In Admin:</p>
            <p className="text-xs font-bold text-slate-300 truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold text-center transition"
            >
              Public Site
            </Link>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ADMIN CONTENT ────────────────────────────────────────────── */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto space-y-6 max-h-screen">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight capitalize">
              {activeTab === 'overview'
                ? 'System Overview'
                : activeTab === 'businesses'
                ? 'Business Listings Directory'
                : activeTab === 'professionals'
                ? 'Personal & Professional Profiles'
                : activeTab === 'banners'
                ? 'App & Web Banners'
                : activeTab === 'categories'
                ? 'Master Category Taxonomy'
                : activeTab === 'users'
                ? 'User Accounts Management'
                : 'Safety & Moderation Reports'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live updates applied directly to Kurnool One Mobile App & Website.
            </p>
          </div>

          <button
            onClick={() => loadTabData(activeTab)}
            disabled={loadingData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* ─── TAB 1: OVERVIEW ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-white">{stats.totalBusinesses}</p>
                <p className="text-xs font-bold text-slate-400">Total Business Listings</p>
                {stats.pendingBusinesses > 0 && (
                  <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                    {stats.pendingBusinesses} Pending Approval
                  </span>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-white">{stats.totalProfessionals}</p>
                <p className="text-xs font-bold text-slate-400">Skilled Professionals</p>
                <span className="inline-block text-[10px] font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-md">
                  Active Directory
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
                <p className="text-xs font-bold text-slate-400">Registered Citizen Accounts</p>
                <span className="inline-block text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md">
                  Firebase Live Auth
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black text-white">{stats.activeBanners}</p>
                <p className="text-xs font-bold text-slate-400">Promotion Banners</p>
                <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                  Live in Mobile & Web
                </span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Administrator Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('businesses');
                    setStatusFilter('pending');
                  }}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Review Pending Businesses</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Approve new merchant requests</p>
                  </div>
                  <Building2 className="w-5 h-5 text-blue-400" />
                </button>

                <button
                  onClick={() => setActiveTab('banners')}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Add Promotional Banner</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Publish header banners</p>
                  </div>
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Manage Roles & Permissions</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Grant admin & merchant roles</p>
                  </div>
                  <Users className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: BUSINESS LISTINGS ────────────────────────────────────── */}
        {activeTab === 'businesses' && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by business name, phone, area, or category..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending Approval' },
                  { id: 'published', label: 'Published' },
                  { id: 'featured', label: 'Featured' },
                  { id: 'suspended', label: 'Suspended' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      statusFilter === f.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Cards / Table */}
            {loadingData ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">No businesses found matching query</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBusinesses.map(biz => (
                  <div
                    key={biz.id}
                    className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start gap-4">
                      {/* Logo or Cover Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        {biz.logoUrl || biz.coverImage || biz.thumbnailUrl || (biz.images && biz.images[0]) ? (
                          <img
                            src={biz.logoUrl || biz.coverImage || biz.thumbnailUrl || biz.images[0]}
                            alt={biz.name_en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Building2 className="w-6 h-6" />
                          </div>
                        )}
                        {biz.logoUrl && (
                          <span className="absolute bottom-0 right-0 bg-blue-600 text-[8px] font-black uppercase text-white px-1 rounded-tl">
                            Logo
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-white">{biz.name_en}</h3>
                          {biz.name_te && (
                            <span className="text-xs text-slate-400 font-medium">({biz.name_te})</span>
                          )}
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              biz.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : biz.status === 'suspended'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {biz.status || 'pending'}
                          </span>
                          {biz.verificationBadge === 'verified_business' && (
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                          {(biz.tier === 'featured' || biz.tier === 'premium') && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {biz.address || biz.area || 'Kurnool'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {biz.phone}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            ID: {biz.id}
                          </span>
                        </div>

                        {biz.coverImage && (
                          <div className="flex items-center gap-1 text-[11px] text-blue-400">
                            <span className="text-slate-500">Cover Image:</span>
                            <a
                              href={biz.coverImage}
                              target="_blank"
                              rel="noreferrer"
                              className="underline truncate max-w-xs"
                            >
                              View Cover
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                      {biz.status !== 'published' ? (
                        <button
                          onClick={() => handleUpdateBusinessStatus(biz.id, 'published', 'verified_business')}
                          disabled={actionLoadingId === biz.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateBusinessStatus(biz.id, 'suspended')}
                          disabled={actionLoadingId === biz.id}
                          className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Suspend
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleBusinessFeatured(biz.id, biz.tier)}
                        disabled={actionLoadingId === biz.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          biz.tier === 'featured' || biz.tier === 'premium'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title="Toggle Featured Badge"
                      >
                        <Star className="w-3.5 h-3.5" />
                        {biz.tier === 'featured' || biz.tier === 'premium' ? 'Featured' : 'Make Featured'}
                      </button>

                      <Link
                        href={`/business/${biz.id}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Open Public Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDeleteBusiness(biz.id, biz.name_en)}
                        disabled={actionLoadingId === biz.id}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Delete Listing Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: PROFESSIONAL PROFILES ────────────────────────────────── */}
        {activeTab === 'professionals' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by professional name, profession, or phone..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'verified', label: 'Verified' },
                  { id: 'active', label: 'Active' },
                  { id: 'suspended', label: 'Suspended' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      statusFilter === f.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingData ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">No professionals found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProfessionals.map(pro => (
                  <div
                    key={pro.id}
                    className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        {pro.avatarUrl ? (
                          <img
                            src={pro.avatarUrl}
                            alt={pro.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-teal-400 font-black text-lg">
                            {pro.fullName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-white">{pro.fullName}</h3>
                          <span className="text-xs text-teal-400 font-semibold bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">
                            {pro.category}
                          </span>
                          {pro.verifiedProfessional && (
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified Pro
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span>Phone: {pro.phone}</span>
                          <span>• Visiting: {pro.visitingCharges || '₹150'}</span>
                          <span>• Areas: {Array.isArray(pro.serviceAreas) ? pro.serviceAreas.join(', ') : 'All Kurnool'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleToggleProVerified(pro.id, pro.verifiedProfessional ?? false)}
                        disabled={actionLoadingId === pro.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          pro.verifiedProfessional
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {pro.verifiedProfessional ? 'Verified' : 'Verify'}
                      </button>

                      {pro.status !== 'active' ? (
                        <button
                          onClick={() => handleUpdateProStatus(pro.id, 'active')}
                          disabled={actionLoadingId === pro.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateProStatus(pro.id, 'suspended')}
                          disabled={actionLoadingId === pro.id}
                          className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold transition"
                        >
                          Suspend
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteProfessional(pro.id, pro.fullName)}
                        disabled={actionLoadingId === pro.id}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: APP BANNERS ──────────────────────────────────────────── */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Upload New Banner Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Upload New App / Web Banner
              </h2>

              <form onSubmit={handleUploadBanner} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Banner Title / Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerTitle}
                      onChange={e => setBannerTitle(e.target.value)}
                      placeholder="e.g. Grand Festive Shopping Offers in Kurnool"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Link / URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={bannerLink}
                      onChange={e => setBannerLink(e.target.value)}
                      placeholder="e.g. /offers or /directory?category=restaurants_cafes"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Banner Graphic Image (16:9 or 21:9 Landscape) *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setBannerFile(file);
                        setBannerPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                  {bannerPreview && (
                    <div className="mt-3 w-full max-w-md h-36 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploadingBanner}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Publish Live Banner
                </button>
              </form>
            </div>

            {/* Existing Banners */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Promotional Banners</h3>
              {banners.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No custom banners published yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map(banner => (
                    <div
                      key={banner.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-white">{banner.title}</p>
                          {banner.linkUrl && (
                            <p className="text-[11px] text-blue-400 truncate max-w-xs">{banner.linkUrl}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 5: CATEGORIES TAXONOMY ──────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">
                    Official 50 Business Categories
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Structured classification for Kurnool district merchants, shops, and institutions.
                  </p>
                </div>
                <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {BUSINESS_CATEGORIES.length} Active Categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BUSINESS_CATEGORIES.map((cat: any) => (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{cat.name_en}</span>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">#{cat.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">{cat.name_te}</p>
                    <p className="text-[10px] text-blue-400 font-semibold">
                      {cat.subcategories.length} Subcategories
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">
                    Official 30 Professional Categories
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Personal and skilled services classification.
                  </p>
                </div>
                <span className="text-xs font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                  {PROFESSIONAL_CATEGORIES.length} Active Categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PROFESSIONAL_CATEGORIES.map(pro => (
                  <div
                    key={pro.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <span className="text-xs font-black text-white">{pro.name_en}</span>
                    <p className="text-[11px] text-teal-400">{pro.name_te}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 6: USERS MANAGEMENT ─────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Registered Users ({usersList.length})
              </p>
            </div>

            {loadingData ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : usersList.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">No users found</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {usersList.map(u => (
                  <div
                    key={u.uid}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          {u.displayName || 'Kurnool Resident'}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            u.role === 'admin' || (u.role as any) === 'super_admin'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : u.role === 'merchant'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : u.role === 'professional'
                              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.role || 'user'}
                        </span>
                        {u.isBanned && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            Banned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{u.email || u.uid}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <select
                        value={u.role || 'user'}
                        onChange={e => handleChangeRole(u.uid, e.target.value as any)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none"
                      >
                        <option value="user">User</option>
                        <option value="merchant">Merchant</option>
                        <option value="professional">Professional</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => handleToggleUserBan(u.uid, u.isBanned)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          u.isBanned
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                        }`}
                      >
                        {u.isBanned ? 'Unban' : 'Ban User'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 7: MODERATION REPORTS ───────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Reported Listings & Profiles
            </h2>

            {reports.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">All Clear! No Active Reports</p>
                <p className="text-xs text-slate-400 mt-1">There are no flagged items needing review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(rep => (
                  <div
                    key={rep.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {rep.targetType}
                      </span>
                      <p className="text-xs font-bold text-white mt-1">Reason: {rep.reason}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Target ID: {rep.targetId}</p>
                    </div>

                    <button
                      onClick={async () => {
                        await deleteDoc(doc(db, 'reports', rep.id));
                        setReports(prev => prev.filter(r => r.id !== rep.id));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                    >
                      Dismiss Report
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
