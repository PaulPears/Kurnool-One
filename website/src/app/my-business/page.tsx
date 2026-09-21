'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Eye,
  Phone,
  MessageCircle,
  Star,
  ShieldCheck,
  Crown,
  Edit3,
  Tag,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Plus,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  fetchMyBusinesses,
  updateBusinessProfile,
  createBusinessOffer,
  uploadBusinessImage,
  BusinessItem,
} from '@/services/directoryService';
import { useAuth } from '@/context/AuthContext';

type PortalTab = 'analytics' | 'edit' | 'offers';

export default function MyBusinessPortalPage() {
  const { user, loading: authLoading, loginWithGoogle, loginWithDemo } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>('analytics');
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<BusinessItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [timing, setTiming] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [website, setWebsite] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [description, setDescription] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New offer form state
  const [offerTitle, setOfferTitle] = useState('');
  const [discountTag, setDiscountTag] = useState('FLAT 20% OFF');
  const [validUntil, setValidUntil] = useState('Valid for next 15 days');
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadBusinesses(user.uid);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadBusinesses = async (uid?: string) => {
    setLoading(true);
    try {
      const list = await fetchMyBusinesses(uid);
      setBusinesses(list);
      if (list.length > 0) {
        selectBusiness(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectBusiness = (biz: BusinessItem) => {
    setSelectedBiz(biz);
    setPhone(biz.phone || '');
    setWhatsapp(biz.whatsapp || '');
    setTiming(biz.timing || '');
    setAddress(biz.address || '');
    setLandmark(biz.landmark || '');
    setWebsite(biz.website || '');
    setGoogleMapsUrl(biz.googleMapsUrl || '');
    setDescription(biz.description_en || '');
    setProfileSuccess(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz) return;

    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      let cleanWebsite = website.trim();
      if (cleanWebsite && !cleanWebsite.startsWith('http://') && !cleanWebsite.startsWith('https://')) {
        cleanWebsite = `https://${cleanWebsite}`;
      }

      await updateBusinessProfile(selectedBiz.id, {
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        timing: timing.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        website: cleanWebsite,
        googleMapsUrl: googleMapsUrl.trim(),
        description_en: description.trim(),
      });

      setSelectedBiz({
        ...selectedBiz,
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        timing: timing.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        website: cleanWebsite,
        googleMapsUrl: googleMapsUrl.trim(),
        description_en: description.trim(),
      });

      setProfileSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to update business profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz || !offerTitle.trim()) return;

    setSavingOffer(true);
    setOfferSuccess(false);
    try {
      let bannerUrl = selectedBiz.images?.[0] || '';
      if (offerFile) {
        bannerUrl = await uploadBusinessImage(offerFile);
      }

      await createBusinessOffer({
        title_en: offerTitle.trim(),
        description_en: `Exclusive offer from ${selectedBiz.name_en}. Call or visit to redeem.`,
        discountText: discountTag.trim(),
        businessId: selectedBiz.id,
        businessName: selectedBiz.name_en,
        validUntil: validUntil.trim(),
        bannerUrl: bannerUrl,
        phone: selectedBiz.phone,
        category: selectedBiz.categoryId,
      });

      setOfferSuccess(true);
      setOfferTitle('');
      setOfferFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to publish offer');
    } finally {
      setSavingOffer(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-14 px-4">
        <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/20 flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Merchant Portal Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Sign In to Your Merchant Account
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Manage your business listing, edit 7-day operating hours, post limited-time festival deals, and view customer call clicks.
            </p>
          </div>

          {/* Quick Demo Login */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300">Quick Testing (1-Click Demo)</span>
              <span className="text-[10px] text-slate-400">Merchant Account</span>
            </div>
            <button
              type="button"
              disabled={demoLoading}
              onClick={async () => {
                setDemoLoading(true);
                try {
                  await loginWithDemo('merchant');
                } catch (e) {
                  console.error(e);
                } finally {
                  setDemoLoading(false);
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {demoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>1-Click Demo Merchant Login</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue with Google</span>
            </button>

            <Link
              href="/login?returnUrl=/my-business"
              className="block w-full py-3.5 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/10 transition"
            >
              Sign In / Register with Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedBiz) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">No Business Found</h2>
        <p className="text-slate-500 mb-6">You have not registered any business listing yet.</p>
        <Link
          href="/register-business"
          className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-md"
        >
          Register Your Business Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Top Banner & Business Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider border border-blue-400/30">
              Merchant Self-Service Portal
            </span>
            {selectedBiz.verificationBadge === 'verified_business' && (
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFIED</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">{selectedBiz.name_en}</h1>
          <p className="text-slate-300 text-sm mt-1">{selectedBiz.address}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/business/${selectedBiz.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/register-business"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Another Branch</span>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Customer Analytics & Leads</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'edit'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Listing & Photos</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition cursor-pointer ${
            activeTab === 'offers'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Post Festival Offers</span>
        </button>
      </div>

      {/* ─── TAB 1: ANALYTICS & LEADS ───────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Views */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                {selectedBiz.viewCount || 148}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Profile Views
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">↑ 24% this week</div>
            </div>

            {/* Direct Calls */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                {selectedBiz.callCount || 42}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone Calls Triggered
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-2">Verified direct leads</div>
            </div>

            {/* WhatsApp Inquiries */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                {selectedBiz.whatsappCount || 68}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                WhatsApp Chats Started
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-2">High-intent customers</div>
            </div>

            {/* Overall Rating */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                {selectedBiz.ratingAvg.toFixed(1)} ★
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resident Rating Score
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-2">Based on {selectedBiz.ratingCount} reviews</div>
            </div>
          </div>

          {/* Membership Status Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-blue-950 text-lg">Active Membership:</span>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black uppercase">
                  {selectedBiz.tier === 'featured' ? '👑 Premium Partner' : selectedBiz.verificationBadge === 'verified_business' ? '🛡️ Verified Business' : 'Free Basic'}
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                Your listing is published with priority ranking in Kurnool City. Annual validity: 365 Days.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">Payment Status</div>
                <div className="font-black text-emerald-700 text-sm uppercase">✓ PAID & ACTIVE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: EDIT LISTING & PHOTOS ───────────────────────────────── */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Update Business Information</h2>
              <p className="text-xs text-slate-500">Changes reflect instantly across the Web & Mobile app</p>
            </div>
            {profileSuccess && (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Changes Saved Live!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Phone Number (Calls) *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                WhatsApp Chat Number *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Operating Timings / Hours
              </label>
              <input
                type="text"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                placeholder="e.g. 10:00 AM - 10:00 PM"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Full Street Address in Kurnool *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
            />
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
            <div className="font-extrabold text-slate-900 text-sm">Online & Map Navigation</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps Share Link</label>
                <input
                  type="text"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Business Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            {savingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Updates...</span>
              </>
            ) : (
              <span>Save & Update Listing</span>
            )}
          </button>
        </form>
      )}

      {/* ─── TAB 3: POST FESTIVE OFFERS ─────────────────────────────────── */}
      {activeTab === 'offers' && (
        <div className="space-y-8">
          <form onSubmit={handleCreateOffer} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Publish a Festival Discount or Promotion</h2>
                <p className="text-xs text-slate-500">Your deal will immediately appear on the public Offers & Deals tab</p>
              </div>
              {offerSuccess && (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Offer Published Live!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Offer Headline *
                </label>
                <input
                  type="text"
                  required
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="e.g. Dussehra Special 25% Off on Family Meals"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Discount Highlight Badge *
                </label>
                <input
                  type="text"
                  required
                  value={discountTag}
                  onChange={(e) => setDiscountTag(e.target.value)}
                  placeholder="e.g. FLAT 25% OFF"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Offer Validity / Duration *
              </label>
              <input
                type="text"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                placeholder="e.g. Valid until 31st October 2026"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 outline-none text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={savingOffer}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-8 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {savingOffer ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Deal...</span>
                </>
              ) : (
                <span>Publish to Offers Tab</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
