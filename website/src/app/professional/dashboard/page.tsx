'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Eye,
  Phone,
  MessageCircle,
  Star,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  MapPin,
  Globe,
  Plus,
  Loader2,
  ExternalLink,
  Sparkles,
  LogOut,
  Share2,
  Video,
  DollarSign,
  Award,
} from 'lucide-react';
import {
  fetchMyProfessionalProfile,
  updateProfessionalProfile,
  ProfessionalItem,
  PROFESSIONAL_CATEGORIES,
} from '@/services/directoryService';
import { useAuth } from '@/context/AuthContext';

type ProTab = 'overview' | 'rates' | 'plan';

export default function ProfessionalDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, loginWithDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<ProTab>('overview');
  const [profile, setProfile] = useState<ProfessionalItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [serviceAreas, setServiceAreas] = useState('');
  const [visitingCharges, setVisitingCharges] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile(user.uid);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadProfile = async (uid: string) => {
    setLoading(true);
    try {
      const p = await fetchMyProfessionalProfile(uid);
      if (p) {
        setProfile(p);
        setFullName(p.fullName || '');
        setPhone(p.phone || '');
        setWhatsapp(p.whatsapp || '');
        setExperienceYears(p.experienceYears || 3);
        setServiceAreas(Array.isArray(p.serviceAreas) ? p.serviceAreas.join(', ') : 'All Kurnool');
        setVisitingCharges(p.visitingCharges || '₹150');
        setHourlyRate(p.hourlyRate || '');
        setInstagramUrl(p.instagramUrl || '');
        setYoutubeUrl(p.youtubeUrl || '');
        setDescription(p.description || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const areas = serviceAreas.split(',').map((s) => s.trim()).filter(Boolean);
      await updateProfessionalProfile(profile.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        experienceYears: Number(experienceYears) || 1,
        serviceAreas: areas.length > 0 ? areas : ['All Kurnool'],
        visitingCharges: visitingCharges.trim(),
        hourlyRate: hourlyRate.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        description: description.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to update professional profile');
    } finally {
      setSaving(false);
    }
  };

  // Auth Gate
  if (!user && !authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-teal-100 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Professional Portal Access</h2>
            <p className="text-slate-600 text-sm mt-1">
              Please sign in with your professional account to manage your profile, rates, and client leads.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/professional/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Sign In to Professional Portal
            </Link>
            <button
              onClick={() => loginWithDemo('professional')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold text-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              1-Click Demo Professional Login
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
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Professional Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-600/20 shrink-0">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  Professional Portal
                </span>
                <span className="text-xs text-slate-400 font-medium">• {user?.email}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {profile?.fullName || user?.displayName || 'Professional Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {profile?.category || 'Expert Professional'} • Kurnool, AP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/register-professional"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {profile ? 'Update Listing' : 'Create Profile'}
            </Link>
            <Link
              href="/directory?tab=professionals"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Browse Pro Directory
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* If no profile yet */}
        {!profile && (
          <div className="bg-teal-50/60 border border-teal-200 rounded-3xl p-6 text-center space-y-3">
            <h3 className="text-sm font-bold text-teal-950">You have not published your Professional Profile yet</h3>
            <p className="text-xs text-teal-700 max-w-lg mx-auto">
              Join Kurnool&apos;s leading network of verified doctors, software engineers, lawyers, teachers, and skilled creators.
            </p>
            <Link
              href="/register-professional"
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all"
            >
              + List Your Professional Profile Now
            </Link>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Leads & Performance', icon: Eye },
            { id: 'rates', label: 'Profile, Rates & Links', icon: Edit3 },
            { id: 'plan', label: 'Subscription Plan', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Leads & Performance */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Profile Views</span>
                  <Eye className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">86</div>
                <p className="text-[11px] text-teal-600 font-semibold mt-1">Direct search appearances</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Phone Inquiries</span>
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">14</div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Client phone taps</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Consults</span>
                  <MessageCircle className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">11</div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Bookings initiated</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Client Rating</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
                  {profile?.ratingAvg || 5.0}
                  <span className="text-xs font-medium text-slate-400">({profile?.ratingCount || 1} review)</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Top rated expert</p>
              </div>
            </div>

            {/* Category Banner */}
            <div className="bg-teal-50/70 border border-teal-100 rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-teal-950">
                    Listed in Kurnool One Professional Directory
                  </h3>
                  <p className="text-xs text-teal-700 mt-0.5">
                    Your services are discoverable by residents across all Kurnool mandals and localities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Profile, Rates & Links Editor */}
        {activeTab === 'rates' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900">Profile Details, Rates & Social Links</h2>

            {saveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Professional profile and rates updated successfully!
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name / Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    placeholder="e.g. Dr. Srinivas Rao"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Experience in Years
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Call Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    placeholder="9848012345"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp Booking Number
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    placeholder="9848012345"
                  />
                </div>
              </div>

              {/* Pricing & Fees Card */}
              <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-teal-600" />
                  Client Fees & Hourly Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
                      Visiting / Consultation Fee
                    </label>
                    <input
                      type="text"
                      value={visitingCharges}
                      onChange={(e) => setVisitingCharges(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      placeholder="e.g. ₹150 or ₹500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
                      Hourly / Package Rate (Optional)
                    </label>
                    <input
                      type="text"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      placeholder="e.g. ₹250/hr or ₹3,000/mo"
                    />
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Service Localities (Comma separated)
                </label>
                <input
                  type="text"
                  value={serviceAreas}
                  onChange={(e) => setServiceAreas(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. Camp Area, C-Camp, Budhawarapet, All Kurnool"
                />
              </div>

              {/* Social Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-pink-600" />
                    Instagram Handle / URL
                  </label>
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    placeholder="https://instagram.com/your_handle"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-red-600" />
                    YouTube Channel URL
                  </label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    placeholder="https://youtube.com/@channel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  About Your Skills & Expertise
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  placeholder="Describe your qualifications, past client work, awards, and why clients should choose you..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {saving ? 'Saving Changes...' : 'Save & Publish Updates'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Subscription Plan */}
        {activeTab === 'plan' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900">Personal Profile Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Monthly', price: '₹99 / mo', desc: 'Standard professional profile in city directory' },
                { name: '6 Months', price: '₹500 / 6mo', desc: 'Most popular option for freelancers & creators', active: true },
                { name: 'Yearly', price: '₹900 / yr', desc: 'Best value listing with priority client leads' },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    tier.active ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-600/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{tier.name}</span>
                    {tier.active && (
                      <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-900 mb-1">{tier.price}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{tier.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <div className="text-xs text-teal-900">
                <span className="font-bold">Verified Professional Badge: </span>
                Your profile displays the verified pro badge, giving Kurnool clients confidence in your credentials.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
