'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Calendar,
  Compass,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Plus,
  AlertTriangle,
  Star,
  Phone,
  MapPin,
  Clock,
  Tag,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Landmark,
  Church,
  Lock,
  LogOut,
  Eye,
  Edit3,
  Layers,
  Sparkles,
  Check,
  X,
  Sliders,
  HelpCircle,
  PhoneCall,
  MessageSquare,
  Mail,
  Key,
  ListOrdered,
} from 'lucide-react';
import { db, auth } from '@/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  MASTER_CATEGORIES,
  PROFESSIONAL_CATEGORIES,
  fetchPlatformLeads,
  syncMasterCategoriesToFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  LeadItem,
  CategoryItem,
  BusinessItem,
  ProfessionalItem,
  PlaceItem,
  EventItem,
} from '@/services/directoryService';

type AdminTab =
  | 'overview'
  | 'businesses'
  | 'professionals'
  | 'places'
  | 'worship'
  | 'events'
  | 'leads'
  | 'categories';

const ADMIN_PASSCODE = 'Kurnool@Admin2026'; // Master management passkey

export default function DedicatedAdminConsole() {
  // ─── AUTHENTICATION STATE ──────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  // ─── TAB NAVIGATION ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // ─── DATA STATES ───────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [worshipPlaces, setWorshipPlaces] = useState<PlaceItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(MASTER_CATEGORIES);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'email' | 'passcode'>('email');
  const [showAdminHelpModal, setShowAdminHelpModal] = useState(false);
  const [syncingCategories, setSyncingCategories] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ id: '', name_en: '', name_te: '', icon: 'Tag', color: '#2563EB', subcategories: '' });
  const [showAddSubcatModal, setShowAddSubcatModal] = useState<string | null>(null);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [newSubcatNameTe, setNewSubcatNameTe] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceItem | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    open: boolean;
    type: 'business' | 'professional' | 'place' | 'event';
    id: string;
    title: string;
    phone?: string;
  } | null>(null);

  // Forms
  const [placeForm, setPlaceForm] = useState({
    type: 'landmark' as PlaceItem['type'],
    name_en: '',
    name_te: '',
    description_en: '',
    description_te: '',
    address: '',
    timings: '09:00 AM - 06:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'Morning & Evening',
    dressCodeRules: '',
    photos: '',
    latitude: 15.8281,
    longitude: 78.0373,
    isPromoted: false,
  });

  const [eventForm, setEventForm] = useState({
    title_en: '',
    title_te: '',
    dateStr: '',
    timeStr: '',
    venue: '',
    organizerName: '',
    contactPhone: '',
    posterUrl: '',
    entryType: 'free' as 'free' | 'ticketed',
    ticketUrl: '',
    status: 'approved' as 'approved' | 'pending',
  });

  // ─── AUTH CHECK ON MOUNT ───────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kurnool_admin_session');
      if (stored === 'active') {
        setIsAuthenticated(true);
      }
    } catch {}
    setAuthChecking(false);
  }, []);

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLoginError('Please enter both Email and Password.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, adminEmail.trim(), adminPassword.trim());
      try { localStorage.setItem('kurnool_admin_session', 'active'); } catch {}
      setIsAuthenticated(true);
      setToast('Logged in as Administrator via Firebase Auth');
    } catch (err: any) {
      if (adminPassword.trim() === ADMIN_PASSCODE) {
        try { localStorage.setItem('kurnool_admin_session', 'active'); } catch {}
        setIsAuthenticated(true);
        setToast('Master Passkey Accepted');
        return;
      }
      setLoginError('Authentication failed: ' + (err.message || 'Invalid email or password. You can also use the Master Passkey.'));
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (passcode.trim() === ADMIN_PASSCODE) {
      try {
        localStorage.setItem('kurnool_admin_session', 'active');
      } catch {}
      setIsAuthenticated(true);
      setToast('Welcome to Kurnool One Control Console');
    } else {
      setLoginError('Invalid Administrator Passcode. Access Denied.');
    }
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('kurnool_admin_session');
    } catch {}
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Toast Helper
  const setToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── LOAD DATA FROM FIRESTORE ──────────────────────────────────────────────
  const loadData = async () => {
    setRefreshing(true);
    try {
      // 1. Businesses
      const bizSnap = await getDocs(collection(db, 'businesses'));
      const bizList: BusinessItem[] = [];
      bizSnap.forEach((d) => {
        bizList.push({ id: d.id, ...d.data() } as BusinessItem);
      });
      setBusinesses(bizList);

      // 2. Professionals
      const proSnap = await getDocs(collection(db, 'professionals'));
      const proList: ProfessionalItem[] = [];
      proSnap.forEach((d) => {
        proList.push({ id: d.id, ...d.data() } as ProfessionalItem);
      });
      setProfessionals(proList);

      // 3. Places
      const placeSnap = await getDocs(collection(db, 'places'));
      const placeList: PlaceItem[] = [];
      placeSnap.forEach((d) => {
        placeList.push({ id: d.id, ...d.data() } as PlaceItem);
      });
      setPlaces(placeList);

      // 4. Worship Places
      const worshipSnap = await getDocs(collection(db, 'worship_places'));
      const worshipList: PlaceItem[] = [];
      worshipSnap.forEach((d) => {
        worshipList.push({ id: d.id, ...d.data() } as PlaceItem);
      });
      setWorshipPlaces(worshipList);

      // 5. Events
      const eventSnap = await getDocs(collection(db, 'events'));
      const eventList: EventItem[] = [];
      eventSnap.forEach((d) => {
        eventList.push({ id: d.id, ...d.data() } as EventItem);
      });
      setEvents(eventList);

      // 6. Platform Leads
      try {
        const leadsData = await fetchPlatformLeads(200);
        setLeads(leadsData);
      } catch (e) { console.warn('Could not load leads:', e); }

      // 7. Dynamic Categories
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        if (!catSnap.empty) {
          const items = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as CategoryItem));
          setCategoriesList(items);
        }
      } catch (e) { console.warn('Could not load categories:', e); }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

    // ─── ACTIONS: CATEGORIES ──────────────────────────────────────────────────
  const handleSyncCategories = async () => {
    if (!confirm('This will sync all 36 Master Categories to Firestore so they can be managed dynamically. Proceed?')) return;
    setSyncingCategories(true);
    try {
      const res = await syncMasterCategoriesToFirestore();
      setToast(`Successfully synced ${res.count} Master Categories to Firestore Live!`);
      // Reload categories
      const catSnap = await getDocs(collection(db, 'categories'));
      if (!catSnap.empty) {
        const items = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as CategoryItem));
        setCategoriesList(items);
      }
    } catch (err: any) {
      alert('Failed to sync categories: ' + err.message);
    } finally {
      setSyncingCategories(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatForm.name_en.trim()) return;
    const catId = newCatForm.id.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || newCatForm.name_en.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const subcats = newCatForm.subcategories
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => ({
        id: s.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name_en: s,
        name_te: s,
      }));
    const newCategory: CategoryItem = {
      id: catId,
      name_en: newCatForm.name_en.trim(),
      name_te: newCatForm.name_te.trim() || newCatForm.name_en.trim(),
      icon: newCatForm.icon || 'Tag',
      color: newCatForm.color || '#2563EB',
      bgLight: '#EFF6FF',
      subcategories: subcats,
    };
    try {
      await saveCategoryToFirestore(newCategory);
      setCategoriesList(prev => [...prev.filter(c => c.id !== catId), newCategory]);
      setShowAddCatModal(false);
      setNewCatForm({ id: '', name_en: '', name_te: '', icon: 'Tag', color: '#2563EB', subcategories: '' });
      setToast(`Category "${newCategory.name_en}" saved to Firestore!`);
    } catch (err: any) {
      alert('Error creating category: ' + err.message);
    }
  };

  const handleAddSubcategory = async (catId: string) => {
    if (!newSubcatName.trim()) return;
    const targetCat = categoriesList.find(c => c.id === catId);
    if (!targetCat) return;
    const newSub = {
      id: newSubcatName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name_en: newSubcatName.trim(),
      name_te: newSubcatNameTe.trim() || newSubcatName.trim(),
    };
    const updatedSubcats = [...(targetCat.subcategories || []), newSub];
    const updatedCat: CategoryItem = {
      ...targetCat,
      subcategories: updatedSubcats,
    };
    try {
      await saveCategoryToFirestore(updatedCat);
      setCategoriesList(prev => prev.map(c => c.id === catId ? updatedCat : c));
      setShowAddSubcatModal(null);
      setNewSubcatName('');
      setNewSubcatNameTe('');
      setToast(`Subcategory "${newSub.name_en}" added to ${targetCat.name_en}!`);
    } catch (err: any) {
      alert('Error adding subcategory: ' + err.message);
    }
  };

  const handleDeleteCategory = async (catId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}" from Firestore?`)) return;
    try {
      await deleteCategoryFromFirestore(catId);
      setCategoriesList(prev => prev.filter(c => c.id !== catId));
      setToast(`Category "${name}" deleted from Firestore.`);
    } catch (err: any) {
      alert('Error deleting category: ' + err.message);
    }
  };

  // ─── ACTIONS: BUSINESSES ───────────────────────────────────────────────────
  const updateBusinessStatus = async (id: string, status: 'published' | 'pending_approval' | 'suspended') => {
    try {
      await updateDoc(doc(db, 'businesses', id), {
        status,
        updatedAt: serverTimestamp(),
      });
      setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      setToast(`Business status updated to ${status.toUpperCase()}`);
    } catch (err) {
      alert('Error updating business: ' + err);
    }
  };

  const toggleBusinessTier = async (id: string, currentTier?: string) => {
    const newTier: 'free' | 'featured' = currentTier === 'featured' ? 'free' : 'featured';
    try {
      await updateDoc(doc(db, 'businesses', id), {
        tier: newTier,
        updatedAt: serverTimestamp(),
      });
      setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, tier: newTier } : b)));
      setToast(`Business tier set to ${newTier.toUpperCase()}`);
    } catch (err) {
      alert('Error updating tier: ' + err);
    }
  };

  // ─── ACTIONS: PROFESSIONALS ────────────────────────────────────────────────
  const updateProfessionalStatus = async (id: string, status: 'active' | 'pending' | 'suspended') => {
    try {
      await updateDoc(doc(db, 'professionals', id), {
        status,
        updatedAt: serverTimestamp(),
      });
      setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      setToast(`Professional status set to ${status.toUpperCase()}`);
    } catch (err) {
      alert('Error updating professional: ' + err);
    }
  };

  // ─── ACTIONS: DELETE WITH PHONE UNLINKING ───────────────────────────────────
  const executeDelete = async () => {
    if (!deleteConfirmModal) return;
    const { type, id, phone } = deleteConfirmModal;

    try {
      if (type === 'business') {
        await deleteDoc(doc(db, 'businesses', id));
        setBusinesses((prev) => prev.filter((b) => b.id !== id));
      } else if (type === 'professional') {
        await deleteDoc(doc(db, 'professionals', id));
        setProfessionals((prev) => prev.filter((p) => p.id !== id));
      } else if (type === 'place') {
        await deleteDoc(doc(db, 'places', id));
        setPlaces((prev) => prev.filter((p) => p.id !== id));
        setWorshipPlaces((prev) => prev.filter((p) => p.id !== id));
      } else if (type === 'event') {
        await deleteDoc(doc(db, 'events', id));
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }

      // Automatically release phone in registered_phones index so merchant can re-register if needed
      if (phone) {
        const cleaned = phone.replace(/\D/g, '').slice(-10);
        if (cleaned) {
          try {
            await deleteDoc(doc(db, 'registered_phones', cleaned));
          } catch {}
        }
      }

      setToast(`Record deleted successfully.`);
      setDeleteConfirmModal(null);
    } catch (err) {
      alert('Delete failed: ' + err);
    }
  };

  // ─── ACTIONS: SAVE / EDIT PLACE ────────────────────────────────────────────
  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeForm.name_en || !placeForm.address) {
      alert('Please enter Name and Address');
      return;
    }

    const photosList = placeForm.photos
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const placeData = {
      type: placeForm.type,
      name_en: placeForm.name_en,
      name_te: placeForm.name_te || placeForm.name_en,
      description_en: placeForm.description_en,
      description_te: placeForm.description_te || placeForm.description_en,
      address: placeForm.address,
      timings: placeForm.timings,
      entryFee: placeForm.entryFee,
      bestTimeToVisit: placeForm.bestTimeToVisit,
      dressCodeRules: placeForm.dressCodeRules,
      photos: photosList.length > 0 ? photosList : ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
      latitude: Number(placeForm.latitude) || 15.8281,
      longitude: Number(placeForm.longitude) || 78.0373,
      isPromoted: Boolean(placeForm.isPromoted),
      updatedAt: serverTimestamp(),
    };

    const targetCollection =
      ['temple', 'church', 'masjid'].includes(placeForm.type) ? 'worship_places' : 'places';

    try {
      if (editingPlace) {
        await updateDoc(doc(db, targetCollection, editingPlace.id), placeData);
        setToast('Place updated successfully.');
      } else {
        await addDoc(collection(db, targetCollection), {
          ...placeData,
          createdAt: serverTimestamp(),
        });
        setToast('New Place added successfully.');
      }
      setShowPlaceModal(false);
      setEditingPlace(null);
      loadData();
    } catch (err) {
      alert('Failed to save place: ' + err);
    }
  };

  // ─── ACTIONS: SAVE / EDIT EVENT ────────────────────────────────────────────
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title_en || !eventForm.dateStr || !eventForm.venue) {
      alert('Please fill Title, Date and Venue');
      return;
    }

    const eventData = {
      title_en: eventForm.title_en,
      title_te: eventForm.title_te || eventForm.title_en,
      dateStr: eventForm.dateStr,
      timeStr: eventForm.timeStr || '10:00 AM',
      venue: eventForm.venue,
      organizerName: eventForm.organizerName || 'Kurnool Community',
      contactPhone: eventForm.contactPhone ? eventForm.contactPhone.trim() : '',
      posterUrl: eventForm.posterUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      entryType: eventForm.entryType,
      ticketUrl: eventForm.ticketUrl || '',
      status: eventForm.status,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        setToast('Event updated successfully.');
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: serverTimestamp(),
        });
        setToast('New City Event created successfully.');
      }
      setShowEventModal(false);
      setEditingEvent(null);
      loadData();
    } catch (err) {
      alert('Failed to save event: ' + err);
    }
  };

  // ─── FILTERED BUSINESSES ───────────────────────────────────────────────────
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        !searchQuery ||
        b.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone?.includes(searchQuery) ||
        b.address?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || b.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [businesses, searchQuery, statusFilter, categoryFilter]);

  // ─── FILTERED PROFESSIONALS ────────────────────────────────────────────────
  const filteredPros = useMemo(() => {
    return professionals.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.includes(searchQuery) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [professionals, searchQuery, statusFilter, categoryFilter]);

  // ─── LOGIN SCREEN (WHEN NOT AUTHENTICATED) ──────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Kurnool One Control Console
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Administrator Security Passkey to access the dedicated management platform.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${loginMode === 'email' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Admin Email & Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('passcode')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${loginMode === 'passcode' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Master Passkey
            </button>
          </div>

          {loginMode === 'email' ? (
            <form onSubmit={handleAdminEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="e.g. admin@kurnoolone.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter your admin password..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Log In to Admin Console</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdminHelpModal(true)}
                className="w-full py-2 text-center text-xs text-blue-400 hover:text-blue-300 font-bold transition flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How to create your Admin Email & Password?</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Administrator Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter admin passkey..."
                  className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/30 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Unlock with Passkey</span>
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 transition font-medium inline-flex items-center gap-1.5"
            >
              <span>← Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED DEDICATED ADMIN CONSOLE ──────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* ─── TOAST NOTIFICATION ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black animate-slide-in">
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── SIDEBAR ───────────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-72 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Brand Bar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-600/30">
              K1
            </div>
            <div>
              <span className="block text-sm font-black text-white tracking-wide">
                KURNOOL ONE
              </span>
              <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Admin Console
              </span>
            </div>
          </div>
          <button
            onClick={handleAdminLogout}
            title="Lock & Exit"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('businesses');
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'businesses'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4" />
              <span>Businesses</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {businesses.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('professionals');
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'professionals'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4" />
              <span>Professionals</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {professionals.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('places');
              setSearchQuery('');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'places'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Landmark className="w-4 h-4" />
              <span>Tourist Places & Forts</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {places.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('worship');
              setSearchQuery('');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'worship'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Church className="w-4 h-4" />
              <span>Places of Worship</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {worshipPlaces.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('events');
              setSearchQuery('');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4" />
              <span>City Events</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('leads');
              setSearchQuery('');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'leads'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Customer Leads & Inquiries</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono font-bold">
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" />
              <span>Dynamic Categories ({categoriesList.length})</span>
            </div>
          </button>
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span>Database</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Firestore Live
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEWPORT ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="p-6 bg-slate-900/60 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white capitalize tracking-tight flex items-center gap-2">
              {activeTab === 'overview' && 'System Dashboard & Metrics'}
              {activeTab === 'businesses' && 'Commercial Businesses Management'}
              {activeTab === 'professionals' && 'Skilled Professionals Directory'}
              {activeTab === 'places' && 'Tourist Attractions & Heritage Places'}
              {activeTab === 'leads' && 'Platform Customer Leads & Inquiries'}
              {activeTab === 'categories' && 'Dynamic Category & Subcategory Taxonomy'}
              {activeTab === 'worship' && 'Places of Worship (Temples, Masjids, Churches)'}
              {activeTab === 'events' && 'Kurnool City Events & Festivals'}
              {activeTab === 'categories' && 'Master Categories (36 Business & 30 Pro)'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise management portal for Kurnool One database and real-time app content.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {activeTab === 'places' && (
              <button
                onClick={() => {
                  setEditingPlace(null);
                  setPlaceForm({
                    type: 'landmark',
                    name_en: '',
                    name_te: '',
                    description_en: '',
                    description_te: '',
                    address: '',
                    timings: '09:00 AM - 06:00 PM',
                    entryFee: 'Free',
                    bestTimeToVisit: 'Morning & Evening',
                    dressCodeRules: '',
                    photos: '',
                    latitude: 15.8281,
                    longitude: 78.0373,
                    isPromoted: false,
                  });
                  setShowPlaceModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Heritage Place</span>
              </button>
            )}

            {activeTab === 'worship' && (
              <button
                onClick={() => {
                  setEditingPlace(null);
                  setPlaceForm({
                    type: 'temple',
                    name_en: '',
                    name_te: '',
                    description_en: '',
                    description_te: '',
                    address: '',
                    timings: '06:00 AM - 08:30 PM',
                    entryFee: 'Free',
                    bestTimeToVisit: 'Morning & Evening Puja',
                    dressCodeRules: 'Traditional Attire',
                    photos: '',
                    latitude: 15.8281,
                    longitude: 78.0373,
                    isPromoted: false,
                  });
                  setShowPlaceModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Place of Worship</span>
              </button>
            )}

            {activeTab === 'events' && (
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm({
                    title_en: '',
                    title_te: '',
                    dateStr: '',
                    timeStr: '10:00 AM',
                    venue: '',
                    organizerName: '',
                    contactPhone: '',
                    posterUrl: '',
                    entryType: 'free',
                    ticketUrl: '',
                    status: 'approved',
                  });
                  setShowEventModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create City Event</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* ─── TAB 1: OVERVIEW & ANALYTICS ─────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold text-slate-400">Total Businesses</span>
                  <span className="text-3xl font-black text-white mt-1 block">
                    {businesses.length}
                  </span>
                  <span className="text-[10px] text-blue-400 font-medium mt-1 block">
                    Commercial listings
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold text-slate-400">Skilled Pros</span>
                  <span className="text-3xl font-black text-white mt-1 block">
                    {professionals.length}
                  </span>
                  <span className="text-[10px] text-teal-400 font-medium mt-1 block">
                    Personal profiles
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold text-slate-400">Tourist Places</span>
                  <span className="text-3xl font-black text-white mt-1 block">
                    {places.length}
                  </span>
                  <span className="text-[10px] text-purple-400 font-medium mt-1 block">
                    Forts, Caves, Parks
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold text-slate-400">Places of Worship</span>
                  <span className="text-3xl font-black text-white mt-1 block">
                    {worshipPlaces.length}
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium mt-1 block">
                    Temples, Masjids, Churches
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold text-slate-400">City Events</span>
                  <span className="text-3xl font-black text-white mt-1 block">{events.length}</span>
                  <span className="text-[10px] text-emerald-400 font-medium mt-1 block">
                    Upcoming activities
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-xs font-bold text-slate-400">Categories</span>
                  <span className="text-3xl font-black text-white mt-1 block">
                    {MASTER_CATEGORIES.length}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-medium mt-1 block">
                    36 Master + Subcats
                  </span>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Manage Heritage Places</h4>
                      <p className="text-xs text-slate-400">Add or edit tourist spots in Kurnool</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('places');
                      setShowPlaceModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition"
                  >
                    + Add New Landmark
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                      <Church className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Manage Places of Worship</h4>
                      <p className="text-xs text-slate-400">Temples, Masjids, Churches & Rules</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('worship');
                      setShowPlaceModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition"
                  >
                    + Add Place of Worship
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Publish City Events</h4>
                      <p className="text-xs text-slate-400">Create upcoming events with organizer info</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('events');
                      setShowEventModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition"
                  >
                    + Create Event
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: BUSINESSES ───────────────────────────────────────────── */}
          {activeTab === 'businesses' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by business name, phone, area..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none max-w-xs"
                  >
                    <option value="all">All Categories ({MASTER_CATEGORIES.length})</option>
                    {MASTER_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Business</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Tier</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredBusinesses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No businesses registered yet.
                        </td>
                      </tr>
                    ) : (
                      filteredBusinesses.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4">
                            <span className="block font-bold text-white text-sm">
                              {b.name_en}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {b.name_te || b.address}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {b.categoryId || 'General'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="block font-mono text-slate-300">{b.phone}</span>
                            {b.whatsapp && (
                              <span className="block text-[10px] text-emerald-400 font-mono">
                                WA: {b.whatsapp}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleBusinessTier(b.id, b.tier)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                                b.tier === 'featured'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {b.tier === 'featured' ? '★ Featured' : 'Standard'}
                            </button>
                          </td>
                          <td className="p-4">
                            <select
                              value={b.status || 'published'}
                              onChange={(e) =>
                                updateBusinessStatus(
                                  b.id,
                                  e.target.value as 'published' | 'pending_approval' | 'suspended',
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 outline-none"
                            >
                              <option value="published">Published</option>
                              <option value="pending_approval">Pending Approval</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() =>
                                setDeleteConfirmModal({
                                  open: true,
                                  type: 'business',
                                  id: b.id,
                                  title: b.name_en,
                                  phone: b.phone,
                                })
                              }
                              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Business & Release Phone"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── TAB 3: PROFESSIONALS ────────────────────────────────────────── */}
          {activeTab === 'professionals' && (
            <div className="space-y-4">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search professional by name, skill, phone..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none max-w-xs"
                  >
                    <option value="all">All Skills ({PROFESSIONAL_CATEGORIES.length})</option>
                    {PROFESSIONAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Professional</th>
                      <th className="p-4">Skill Category</th>
                      <th className="p-4">Phone / WhatsApp</th>
                      <th className="p-4">Rate</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredPros.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No professionals registered yet.
                        </td>
                      </tr>
                    ) : (
                      filteredPros.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4">
                            <span className="block font-bold text-white text-sm">{p.fullName}</span>
                            <span className="block text-[11px] text-slate-400">
                              {p.experienceYears ? `${p.experienceYears} Years Exp` : 'Professional'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 font-mono text-[10px] border border-teal-500/20">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="block font-mono text-slate-300">{p.phone}</span>
                            {p.whatsapp && (
                              <span className="block text-[10px] text-emerald-400 font-mono">
                                WA: {p.whatsapp}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-slate-300">
                              {p.hourlyRate || p.visitingCharges || p.startingPrice || 'On Quote'}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={p.status || 'active'}
                              onChange={(e) =>
                                updateProfessionalStatus(
                                  p.id,
                                  e.target.value as 'active' | 'pending' | 'suspended',
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 outline-none"
                            >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() =>
                                setDeleteConfirmModal({
                                  open: true,
                                  type: 'professional',
                                  id: p.id,
                                  title: p.fullName,
                                  phone: p.phone,
                                })
                              }
                              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Professional & Release Phone"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── TAB 4: TOURIST PLACES ───────────────────────────────────────── */}
          {activeTab === 'places' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place) => (
                  <div
                    key={place.id}
                    className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {place.photos && place.photos[0] && (
                        <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={place.photos[0]}
                            alt={place.name_en}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold">
                            {place.type}
                          </span>
                        </div>
                      )}
                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-white text-base">{place.name_en}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{place.description_en}</p>
                        <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                          <div>📍 {place.address}</div>
                          <div>⏰ {place.timings}</div>
                          <div>🎟️ {place.entryFee || 'Free'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPlace(place);
                          setPlaceForm({
                            type: place.type,
                            name_en: place.name_en,
                            name_te: place.name_te,
                            description_en: place.description_en,
                            description_te: place.description_te,
                            address: place.address,
                            timings: place.timings,
                            entryFee: place.entryFee || 'Free',
                            bestTimeToVisit: place.bestTimeToVisit || '',
                            dressCodeRules: place.dressCodeRules || '',
                            photos: place.photos?.join('\n') || '',
                            latitude: place.latitude || 15.8281,
                            longitude: place.longitude || 78.0373,
                            isPromoted: Boolean(place.isPromoted),
                          });
                          setShowPlaceModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmModal({
                            open: true,
                            type: 'place',
                            id: place.id,
                            title: place.name_en,
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 5: PLACES OF WORSHIP ────────────────────────────────────── */}
          {activeTab === 'worship' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {worshipPlaces.map((wp) => (
                  <div
                    key={wp.id}
                    className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {wp.photos && wp.photos[0] && (
                        <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={wp.photos[0]}
                            alt={wp.name_en}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 text-[10px] font-bold uppercase">
                            {wp.type}
                          </span>
                        </div>
                      )}
                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-white text-base">{wp.name_en}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{wp.description_en}</p>
                        <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                          <div>📍 {wp.address}</div>
                          <div>⏰ {wp.timings}</div>
                          {wp.dressCodeRules && <div>👗 Rules: {wp.dressCodeRules}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPlace(wp);
                          setPlaceForm({
                            type: wp.type,
                            name_en: wp.name_en,
                            name_te: wp.name_te,
                            description_en: wp.description_en,
                            description_te: wp.description_te,
                            address: wp.address,
                            timings: wp.timings,
                            entryFee: wp.entryFee || 'Free',
                            bestTimeToVisit: wp.bestTimeToVisit || '',
                            dressCodeRules: wp.dressCodeRules || '',
                            photos: wp.photos?.join('\n') || '',
                            latitude: wp.latitude || 15.8281,
                            longitude: wp.longitude || 78.0373,
                            isPromoted: Boolean(wp.isPromoted),
                          });
                          setShowPlaceModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmModal({
                            open: true,
                            type: 'place',
                            id: wp.id,
                            title: wp.name_en,
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 6: CITY EVENTS ──────────────────────────────────────────── */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {ev.posterUrl && (
                        <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ev.posterUrl}
                            alt={ev.title_en}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              ev.entryType === 'free'
                                ? 'bg-emerald-950/80 text-emerald-300'
                                : 'bg-purple-950/80 text-purple-300'
                            }`}
                          >
                            {ev.entryType}
                          </span>
                        </div>
                      )}
                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-white text-base">{ev.title_en}</h3>
                        <div className="text-[11px] text-slate-400 space-y-1 pt-2">
                          <div>📅 {ev.dateStr} • {ev.timeStr}</div>
                          <div>📍 {ev.venue}</div>
                          <div>📞 {ev.organizerName} ({ev.contactPhone})</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingEvent(ev);
                          setEventForm({
                            title_en: ev.title_en,
                            title_te: ev.title_te || '',
                            dateStr: ev.dateStr,
                            timeStr: ev.timeStr,
                            venue: ev.venue,
                            organizerName: ev.organizerName,
                            contactPhone: ev.contactPhone,
                            posterUrl: ev.posterUrl,
                            entryType: ev.entryType,
                            ticketUrl: ev.ticketUrl || '',
                            status: ev.status,
                          });
                          setShowEventModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmModal({
                            open: true,
                            type: 'event',
                            id: ev.id,
                            title: ev.title_en,
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB: PLATFORM CUSTOMER LEADS ───────────────────────────────── */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {/* Leads Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Total Inquiries
                  </span>
                  <span className="text-2xl font-black text-white">{leads.length}</span>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
                  <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Direct Phone Calls
                  </span>
                  <span className="text-2xl font-black text-emerald-300">
                    {leads.filter(l => l.actionType === 'call').length}
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-teal-950/40 border border-teal-800/40">
                  <span className="block text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">
                    WhatsApp Chats
                  </span>
                  <span className="text-2xl font-black text-teal-300">
                    {leads.filter(l => l.actionType === 'whatsapp').length}
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-800/40">
                  <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                    Profile Views & Quotes
                  </span>
                  <span className="text-2xl font-black text-blue-300">
                    {leads.filter(l => l.actionType === 'view' || l.actionType === 'quote').length}
                  </span>
                </div>
              </div>

              {/* Leads Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PhoneCall className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-black text-white">Live Customer Inquiries</h3>
                      <p className="text-[11px] text-slate-400">Captured when Kurnool citizens call, WhatsApp, or request quotes from listings</p>
                    </div>
                  </div>
                  <button
                    onClick={loadData}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {leads.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No customer leads recorded yet. When users tap Call or WhatsApp on the web or mobile app, leads will appear here in real time.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="px-5 py-3 font-extrabold">Citizen / Customer</th>
                          <th className="px-5 py-3 font-extrabold">Inquiry Type</th>
                          <th className="px-5 py-3 font-extrabold">Target Listing</th>
                          <th className="px-5 py-3 font-extrabold">Area</th>
                          <th className="px-5 py-3 font-extrabold">Timestamp</th>
                          <th className="px-5 py-3 font-extrabold text-right">Direct Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {leads.map((lead) => {
                          const timeStr = lead.createdAt?.toDate
                            ? lead.createdAt.toDate().toLocaleString('en-IN')
                            : (lead.createdAt?.seconds ? new Date(lead.createdAt.seconds * 1000).toLocaleString('en-IN') : 'Just now');
                          return (
                            <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                              <td className="px-5 py-3.5">
                                <span className="block font-bold text-white text-xs">
                                  {lead.citizenName || 'Kurnool Resident'}
                                </span>
                                <span className="block text-[11px] text-slate-400 font-mono">
                                  {lead.citizenPhone || 'Web Visitor'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                  lead.actionType === 'call'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : lead.actionType === 'whatsapp'
                                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                }`}>
                                  {lead.actionType === 'call' && '📞 Phone Call'}
                                  {lead.actionType === 'whatsapp' && '💬 WhatsApp'}
                                  {lead.actionType === 'view' && '👁️ Profile View'}
                                  {lead.actionType === 'quote' && '📝 Quote Request'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="font-bold text-slate-200 block text-xs">
                                  {lead.targetName || lead.targetId}
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                  {lead.targetType}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-slate-400 text-xs">
                                {lead.citizenArea || 'Kurnool City'}
                              </td>
                              <td className="px-5 py-3.5 text-slate-400 text-[11px] font-mono">
                                {timeStr}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                {lead.citizenPhone ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <a
                                      href={`tel:${lead.citizenPhone}`}
                                      className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                                      title="Call Customer"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                    <a
                                      href={`https://wa.me/${lead.citizenPhone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      className="p-1.5 rounded-lg bg-teal-600/20 text-teal-400 hover:bg-teal-600 hover:text-white transition"
                                      title="Chat on WhatsApp"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-600">Online</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB 7: TAXONOMY & CATEGORIES ────────────────────────────────── */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Category Actions Bar */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white">
                    Master Categories & Subcategories ({categoriesList.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage all 36 categories, icons, colors, and subcategories dynamically in Firestore.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSyncCategories}
                    disabled={syncingCategories}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingCategories ? 'animate-spin' : ''}`} />
                    <span>{syncingCategories ? 'Syncing...' : '⚡ Sync 36 Categories to Firestore'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCatModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoriesList.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-inner"
                            style={{
                              backgroundColor: cat.color ? `${cat.color}25` : '#2563EB25',
                              color: cat.color || '#3B82F6',
                              border: `1px solid ${cat.color || '#3B82F6'}40`,
                            }}
                          >
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-black text-white text-xs block">
                              {idx + 1}. {cat.name_en}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">{cat.name_te}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name_en)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subcategories */}
                      <div className="pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            Subcategories ({cat.subcategories?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAddSubcatModal(cat.id)}
                            className="text-[10px] text-blue-400 hover:underline font-bold"
                          >
                            + Add Subcat
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                          {cat.subcategories && cat.subcategories.length > 0 ? (
                            cat.subcategories.map((sub) => (
                              <span
                                key={sub.id}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium"
                              >
                                {sub.name_en}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-600">No subcategories defined</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono">ID: {cat.id}</span>
                      <span className="font-mono" style={{ color: cat.color }}>● {cat.color || '#3B82F6'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Professional Categories Reference */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-base font-black text-white mb-2">
                  Specialized Professional Categories ({PROFESSIONAL_CATEGORIES.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PROFESSIONAL_CATEGORIES.map((pro, idx) => (
                    <div
                      key={pro.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">
                          {idx + 1}. {pro.name_en}
                        </span>
                        <span className="text-[11px] text-slate-400">{pro.name_te}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{pro.placeholderRate || 'Custom'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>


      {/* ─── MODAL: HOW TO CREATE ADMIN EMAIL & PASSWORD ─────────────────── */}
      {showAdminHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Create Your Admin Login</h3>
              </div>
              <button
                onClick={() => setShowAdminHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p className="leading-relaxed">
                You can create a permanent Admin account using your personal email and password directly in Firebase Authentication:
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-black text-blue-400 block">Step 1: Open Firebase Console</span>
                  <p className="text-slate-400 text-[11px]">
                    Go to <a href="https://console.firebase.google.com" target="_blank" className="text-blue-400 underline font-mono">console.firebase.google.com</a> and select project <strong>kurnool-kaburlu</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-black text-blue-400 block">Step 2: Add User in Authentication</span>
                  <p className="text-slate-400 text-[11px]">
                    Click <strong>Authentication</strong> on left menu &rarr; click <strong>Users</strong> tab &rarr; click <strong>"Add user"</strong> button.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-black text-blue-400 block">Step 3: Enter Your Email & Password</span>
                  <p className="text-slate-400 text-[11px]">
                    Type your desired admin email (e.g. <code>admin@kurnoolone.com</code>) and set your secure password, then click <strong>Add user</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                ✓ Once created, you can immediately log into this Admin Console using those exact credentials!
              </div>
            </div>

            <button
              onClick={() => setShowAdminHelpModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow transition"
            >
              Got It, Return to Login
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD CATEGORY ─────────────────────────────────────────── */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Add New Platform Category</h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={newCatForm.name_en}
                    onChange={(e) => setNewCatForm({ ...newCatForm, name_en: e.target.value })}
                    placeholder="e.g. Solar Energy"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category Name (తెలుగు)</label>
                  <input
                    type="text"
                    value={newCatForm.name_te}
                    onChange={(e) => setNewCatForm({ ...newCatForm, name_te: e.target.value })}
                    placeholder="ఉదా: సోలార్ విద్యుత్"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Unique ID (Optional)</label>
                  <input
                    type="text"
                    value={newCatForm.id}
                    onChange={(e) => setNewCatForm({ ...newCatForm, id: e.target.value })}
                    placeholder="e.g. solar_energy"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Brand Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatForm.color}
                      onChange={(e) => setNewCatForm({ ...newCatForm, color: e.target.value })}
                      className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                    />
                    <input
                      type="text"
                      value={newCatForm.color}
                      onChange={(e) => setNewCatForm({ ...newCatForm, color: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Subcategories (Comma Separated)
                </label>
                <textarea
                  rows={2}
                  value={newCatForm.subcategories}
                  onChange={(e) => setNewCatForm({ ...newCatForm, subcategories: e.target.value })}
                  placeholder="e.g. Rooftop Solar, Solar Water Heaters, Inverters, Battery Dealers"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black"
                >
                  Save to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD SUBCATEGORY ───────────────────────────────────────── */}
      {showAddSubcatModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-black text-white">
              Add Subcategory to {categoriesList.find(c => c.id === showAddSubcatModal)?.name_en}
            </h3>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Subcategory Name (English) *</label>
              <input
                type="text"
                value={newSubcatName}
                onChange={(e) => setNewSubcatName(e.target.value)}
                placeholder="e.g. Home Delivery"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Subcategory Name (తెలుగు)</label>
              <input
                type="text"
                value={newSubcatNameTe}
                onChange={(e) => setNewSubcatNameTe(e.target.value)}
                placeholder="ఉదా: హోమ్ డెలివరీ"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSubcatModal(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddSubcategory(showAddSubcatModal)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black"
              >
                Add Subcategory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT PLACE ──────────────────────────────────────── */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 my-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {editingPlace ? 'Edit Place Record' : 'Add New Place / Attraction'}
              </h3>
              <button
                onClick={() => setShowPlaceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Place Type</label>
                  <select
                    value={placeForm.type}
                    onChange={(e) => setPlaceForm({ ...placeForm, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    <option value="landmark">Landmark / Fort</option>
                    <option value="tourist">Tourist Destination</option>
                    <option value="park">Garden / Park</option>
                    <option value="temple">Temple (హిందూ దేవాలయం)</option>
                    <option value="masjid">Masjid (మసీదు)</option>
                    <option value="church">Church (చర్చి)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Entry Fee</label>
                  <input
                    type="text"
                    value={placeForm.entryFee}
                    onChange={(e) => setPlaceForm({ ...placeForm, entryFee: e.target.value })}
                    placeholder="e.g. Free, ₹20"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={placeForm.name_en}
                    onChange={(e) => setPlaceForm({ ...placeForm, name_en: e.target.value })}
                    placeholder="e.g. Konda Reddy Buruju"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Name (తెలుగు)</label>
                  <input
                    type="text"
                    value={placeForm.name_te}
                    onChange={(e) => setPlaceForm({ ...placeForm, name_te: e.target.value })}
                    placeholder="ఉదా: కొండారెడ్డి బురుజు"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Address & Area</label>
                <input
                  type="text"
                  value={placeForm.address}
                  onChange={(e) => setPlaceForm({ ...placeForm, address: e.target.value })}
                  placeholder="e.g. Old City, Kurnool 518001"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Visiting Timings</label>
                  <input
                    type="text"
                    value={placeForm.timings}
                    onChange={(e) => setPlaceForm({ ...placeForm, timings: e.target.value })}
                    placeholder="e.g. 09:00 AM - 06:00 PM"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Dress Code / Rules</label>
                  <input
                    type="text"
                    value={placeForm.dressCodeRules}
                    onChange={(e) => setPlaceForm({ ...placeForm, dressCodeRules: e.target.value })}
                    placeholder="e.g. Traditional attire, photography rules"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={placeForm.description_en}
                  onChange={(e) => setPlaceForm({ ...placeForm, description_en: e.target.value })}
                  placeholder="Historic significance and visitor guide..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Photo URLs (One per line)</label>
                <textarea
                  rows={2}
                  value={placeForm.photos}
                  onChange={(e) => setPlaceForm({ ...placeForm, photos: e.target.value })}
                  placeholder="https://...&#10;https://..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT EVENT ──────────────────────────────────────── */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 my-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {editingEvent ? 'Edit City Event' : 'Create New City Event'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title_en}
                  onChange={(e) => setEventForm({ ...eventForm, title_en: e.target.value })}
                  placeholder="e.g. Kurnool Trade Expo 2026"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Date</label>
                  <input
                    type="text"
                    value={eventForm.dateStr}
                    onChange={(e) => setEventForm({ ...eventForm, dateStr: e.target.value })}
                    placeholder="e.g. 15 Nov 2026, Every Sunday"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Time</label>
                  <input
                    type="text"
                    value={eventForm.timeStr}
                    onChange={(e) => setEventForm({ ...eventForm, timeStr: e.target.value })}
                    placeholder="e.g. 06:00 PM - 09:30 PM"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Venue / Location</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  placeholder="e.g. Municipal Grounds, Kurnool"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Organizer Name</label>
                  <input
                    type="text"
                    value={eventForm.organizerName}
                    onChange={(e) => setEventForm({ ...eventForm, organizerName: e.target.value })}
                    placeholder="e.g. Kurnool Cultural Society"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Organizer Contact Phone</label>
                  <input
                    type="text"
                    value={eventForm.contactPhone}
                    onChange={(e) => setEventForm({ ...eventForm, contactPhone: e.target.value })}
                    placeholder="e.g. +91 98480 12345"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Entry Type</label>
                  <select
                    value={eventForm.entryType}
                    onChange={(e) => setEventForm({ ...eventForm, entryType: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    <option value="free">Free Entry</option>
                    <option value="ticketed">Ticketed Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    <option value="approved">Approved & Published</option>
                    <option value="pending">Pending Moderation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Poster Image URL</label>
                <input
                  type="text"
                  value={eventForm.posterUrl}
                  onChange={(e) => setEventForm({ ...eventForm, posterUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE CONFIRMATION ──────────────────────────────────── */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Confirm Deletion</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <span className="text-white font-bold">&ldquo;{deleteConfirmModal.title}&rdquo;</span>?
              </p>
              {deleteConfirmModal.phone && (
                <p className="text-[11px] text-amber-400 mt-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  Phone number ({deleteConfirmModal.phone}) will be released in the registration index.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
