'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Plus,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  LogOut,
} from 'lucide-react';
import {
  fetchMyBusinesses,
  updateBusinessProfile,
  createBusinessOffer,
  BusinessItem,
} from '@/services/directoryService';
import { useAuth } from '@/context/AuthContext';

type PortalTab = 'analytics' | 'edit' | 'offers' | 'plan';

export default function BusinessDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, loginWithDemo } = useAuth();
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
  
  // Social media links
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Operating hours Monday to Sunday
  const [operatingHours, setOperatingHours] = useState({
    monday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    tuesday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    wednesday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    thursday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    friday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    saturday: { closed: false, open: '09:00 AM', close: '09:00 PM' },
    sunday: { closed: false, open: '10:00 AM', close: '02:00 PM' },
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New offer form state
  const [offerTitle, setOfferTitle] = useState('');
  const [discountTag, setDiscountTag] = useState('FLAT 20% OFF');
  const [validUntil, setValidUntil] = useState('Valid for next 15 days');
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
    setFacebook(biz.socialLinks?.facebook || '');
    setInstagram(biz.socialLinks?.instagram || '');
    setTwitter(biz.socialLinks?.twitter || '');
    setYoutube(biz.socialLinks?.youtube || '');
    setLinkedin(biz.socialLinks?.linkedin || '');
    if (biz.operatingHours) {
      setOperatingHours({
        ...operatingHours,
        ...biz.operatingHours,
      });
    }
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
        operatingHours,
        socialLinks: {
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          twitter: twitter.trim(),
          youtube: youtube.trim(),
          linkedin: linkedin.trim(),
        },
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
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
      await createBusinessOffer({
        businessId: selectedBiz.id,
        businessName: selectedBiz.name_en,
        title_en: offerTitle.trim(),
        description_en: `Exclusive offer from ${selectedBiz.name_en}. Call or visit to redeem.`,
        discountText: discountTag.trim(),
        validUntil: validUntil.trim(),
        phone: selectedBiz.phone,
        category: selectedBiz.categoryId,
      });
      setOfferTitle('');
      setOfferSuccess(true);
      setTimeout(() => setOfferSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to publish offer');
    } finally {
      setSavingOffer(false);
    }
  };

  // Auth Gate
  if (!user && !authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-blue-100 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Merchant Portal Access</h2>
            <p className="text-slate-600 text-sm mt-1">
              Please sign in with your business credentials to access your store analytics, inquiries, and settings.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/business/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Sign In to Business Portal
            </Link>
            <button
              onClick={() => loginWithDemo('merchant')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              1-Click Demo Merchant Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Merchant Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-600/20 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Merchant Portal
                </span>
                <span className="text-xs text-slate-400 font-medium">• {user?.email}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {selectedBiz?.name_en || 'Business Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/register-business"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Business
            </Link>
            {selectedBiz && (
              <Link
                href={`/business/${selectedBiz.id}`}
                target="_blank"
                className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Public Listing
              </Link>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Business Selector (if multiple) */}
        {businesses.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Switch Shop:</span>
            {businesses.map((b) => (
              <button
                key={b.id}
                onClick={() => selectBusiness(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedBiz?.id === b.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {b.name_en}
              </button>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 overflow-x-auto">
          {[
            { id: 'analytics', label: 'Overview & Leads', icon: Eye },
            { id: 'edit', label: 'Storefront & Hours', icon: Edit3 },
            { id: 'offers', label: 'Deals & Offers', icon: Tag },
            { id: 'plan', label: 'Plan & Verification', icon: Crown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Analytics & Overview */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Impressions</span>
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{selectedBiz?.viewCount || 142}</div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 18% this month</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Customer Calls</span>
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{selectedBiz?.callCount || 28}</div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Direct click-to-call taps</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Inquiries</span>
                  <MessageCircle className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{selectedBiz?.whatsappCount || 19}</div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Customer chats started</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Customer Rating</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
                  {selectedBiz?.ratingAvg || 4.8}
                  <span className="text-xs font-medium text-slate-400">({selectedBiz?.ratingCount || 12} reviews)</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Excellent reputation</p>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    Your Business is Active on Kurnool One
                  </h3>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Customers in Kurnool searching for your category can view your contact info, location on Google Maps, and current operating hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Storefront Details & Monday to Sunday Operating Hours */}
        {activeTab === 'edit' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-6">Storefront Details & Operating Hours</h2>

            {profileSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Business details and operating hours updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Customer Phone Number *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="9848012345"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp Orders Number
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="9848012345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Address (Street / Area / Kurnool) *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Near Old Bus Stand, Kurnool"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="Opposite State Bank"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Website URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="https://mybusiness.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Google Maps Share Link
                  </label>
                  <input
                    type="text"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>
              </div>

              {/* Operating Hours Monday to Sunday */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Operating Hours (Monday – Sunday)
                </h3>
                <p className="text-xs text-slate-500">
                  Specify opening and closing timings for each day of the week so visitors know when your shop is open.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                    <div key={day} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold capitalize text-slate-800 w-24">{day}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={(operatingHours as any)[day]?.open || '09:00 AM'}
                          onChange={(e) => {
                            setOperatingHours({
                              ...operatingHours,
                              [day]: { ...(operatingHours as any)[day], open: e.target.value }
                            });
                          }}
                          className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-medium"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="text"
                          value={(operatingHours as any)[day]?.close || '09:00 PM'}
                          onChange={(e) => {
                            setOperatingHours({
                              ...operatingHours,
                              [day]: { ...(operatingHours as any)[day], close: e.target.value }
                            });
                          }}
                          className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media & Channels (All Optional) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Social Media & Links
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    All Optional
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Facebook Page <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="https://facebook.com/yourbusiness"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Instagram Handle / URL <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="https://instagram.com/yourbusiness"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Twitter / X Profile <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="https://x.com/yourbusiness"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      YouTube Channel <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="https://youtube.com/@yourbusiness"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      LinkedIn Page / Company URL <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="https://linkedin.com/company/yourbusiness"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  About Business / Products Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Describe your specialties, services, and offers..."
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {savingProfile ? 'Saving Changes...' : 'Save & Publish Updates'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Deals & Offers */}
        {activeTab === 'offers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900">Publish Exclusive Coupon / Deal</h2>
              <p className="text-xs text-slate-500">
                Your offers will be featured on the Kurnool One Deals & Offers page to attract footfall.
              </p>

              {offerSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Offer published live on Kurnool One Deals!
                </div>
              )}

              <form onSubmit={handleCreateOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Offer Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    placeholder="e.g. 20% OFF on all Family Dining Orders"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={discountTag}
                      onChange={(e) => setDiscountTag(e.target.value)}
                      placeholder="FLAT 20% OFF"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Validity
                    </label>
                    <input
                      type="text"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      placeholder="Valid for 15 days"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingOffer}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {savingOffer ? 'Publishing...' : 'Publish Offer Live'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">How Deals Work on Kurnool One</h3>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                <li>Your promotions show up immediately on the Kurnool One mobile app & website.</li>
                <li>Verified business listings receive a highlighted top badge on deals.</li>
                <li>Customers can tap directly to call your store or show the coupon at billing.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Plan & Verification */}
        {activeTab === 'plan' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900">Listing Plan & Verification Badge</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Monthly', price: '₹199 / mo', desc: 'Standard business listing on directory' },
                { name: '6 Months', price: '₹999 / 6mo', desc: 'Most popular option for shops & clinics', active: true },
                { name: 'Yearly', price: '₹2,000 / yr', desc: 'Best value listing with maximum visibility' },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    tier.active ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{tier.name}</span>
                    {tier.active && (
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-900 mb-1">{tier.price}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{tier.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold">Verified Business Badge: </span>
                Your store receives an official blue tick badge, verifying your location and identity to customers.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
