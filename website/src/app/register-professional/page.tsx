'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  UploadCloud,
  CheckCircle2,
  MapPin,
  Phone,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Briefcase,
  Star,
  Search,
  Check,
  Crown,
  CreditCard,
} from 'lucide-react';
import {
  PROFESSIONAL_CATEGORIES,
  PROFESSIONAL_PRICING_PLANS,
  registerProfessional,
  uploadProfessionalAvatar,
  KURNOOL_AREAS,
} from '@/services/directoryService';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15"/>
  </svg>
);

export default function RegisterProfessionalPage() {
  const { user, loading: authLoading, loginWithGoogle, loginWithDemo } = useAuth();
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);

  // Plan Selection
  const [selectedPlanId, setSelectedPlanId] = useState<'pro_monthly' | 'pro_half_yearly' | 'pro_yearly'>('pro_half_yearly');

  // Basic Info
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user?.displayName && !fullName) {
      setFullName(user.displayName);
    }
  }, [user]);
  const [selectedCategory, setSelectedCategory] = useState(PROFESSIONAL_CATEGORIES[0].id);
  const [categorySearch, setCategorySearch] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [serviceAreas, setServiceAreas] = useState('All Kurnool City');
  const [selectedArea, setSelectedArea] = useState(KURNOOL_AREAS[0]);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [visitingCharges, setVisitingCharges] = useState('₹150');
  const [hourlyRate, setHourlyRate] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');

  // Media
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId?: string;
    planName?: string;
    amount?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const activePlan = PROFESSIONAL_PRICING_PLANS.find((p) => p.id === selectedPlanId) || PROFESSIONAL_PRICING_PLANS[1];

  const filteredCategories = PROFESSIONAL_CATEGORIES.filter(
    (c) =>
      c.name_en.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.name_te.includes(categorySearch)
  );

  const currentCategoryObj = PROFESSIONAL_CATEGORIES.find((c) => c.id === selectedCategory) || PROFESSIONAL_CATEGORIES[0];

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = PROFESSIONAL_CATEGORIES.find((c) => c.id === catId);
    if (cat?.placeholderRate) {
      setVisitingCharges(cat.placeholderRate);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please provide your Full Name or Creator Handle.');
      return;
    }

    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit Phone Number for client calls.');
      return;
    }

    setLoading(true);

    try {
      let uploadedAvatarUrl = '';
      if (selectedFile) {
        uploadedAvatarUrl = await uploadProfessionalAvatar(selectedFile);
      }

      const areasArray = serviceAreas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const docId = await registerProfessional({
        fullName: fullName.trim(),
        category: currentCategoryObj.name_en,
        categoryName_te: currentCategoryObj.name_te,
        experienceYears: parseInt(experienceYears, 10) || 1,
        serviceAreas: areasArray.length > 0 ? areasArray : [selectedArea, 'All Kurnool'],
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        visitingCharges: visitingCharges.trim(),
        hourlyRate: hourlyRate.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        description: description.trim() || `Professional ${currentCategoryObj.name_en} serving Kurnool.`,
        avatarUrl: uploadedAvatarUrl || avatarUrlInput.trim() || undefined,
        portfolioPhotos: [],
        verifiedProfessional: true,
        status: 'active',
        planId: selectedPlanId === 'pro_yearly' ? 'yearly' : selectedPlanId === 'pro_half_yearly' ? 'half_yearly' : 'monthly',
        userId: user?.uid,
        email: user?.email || undefined,
      });

      // Initiate Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setPaymentDetails({
          planName: activePlan.name,
          amount: activePlan.price,
        });
        setSuccess(true);
        setLoading(false);
        return;
      }

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          professionalId: docId,
          fullName,
          phone,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        setPaymentDetails({
          planName: activePlan.name,
          amount: activePlan.price,
        });
        setSuccess(true);
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Kurnool One',
        description: `${activePlan.name} (${activePlan.duration}) - ${fullName}`,
        order_id: orderData.orderId,
        prefill: {
          name: fullName,
          contact: phone,
        },
        theme: {
          color: '#2563EB',
        },
        handler: async function (response: any) {
          setPaymentDetails({
            paymentId: response.razorpay_payment_id,
            planName: activePlan.name,
            amount: activePlan.price,
          });
          setSuccess(true);
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setPaymentDetails({
              planName: activePlan.name,
              amount: activePlan.price,
            });
            setSuccess(true);
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to list profile. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">Welcome to Kurnool One!</h1>
            <p className="text-slate-600 text-sm">
              Your profile for <span className="font-bold text-slate-900">{fullName}</span> has been activated as a{' '}
              <span className="font-bold text-blue-600">{currentCategoryObj.name_en}</span>.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left text-xs text-emerald-950 space-y-2">
            <div className="flex items-center justify-between font-extrabold text-sm text-emerald-900">
              <span>{paymentDetails?.planName || activePlan.name} Active</span>
              <span className="text-base font-black">₹{paymentDetails?.amount || activePlan.price}</span>
            </div>
            {paymentDetails?.paymentId && (
              <p className="text-[11px] text-emerald-800">
                Payment Reference ID: <span className="font-mono font-bold">{paymentDetails.paymentId}</span>
              </p>
            )}
            <p className="text-emerald-800 text-[11px] pt-1">
              Residents across Kurnool can now discover your services, call you directly, and chat on WhatsApp!
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/directory?tab=professionals"
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>View Public Listing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-2xl transition flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATION REQUIRED GATE ─────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-14 px-4">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto shadow-xs">
            <UserCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Professional Login Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Log In to List Your Profile
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Please sign in to your account before listing as a professional, freelancer, or creator. This links your verified profile to your account for bookings and direct inquiries.
            </p>
          </div>

          {/* Quick Demo Login Option */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Quick Testing (1-Click Demo)</span>
              <span className="text-[10px] text-teal-700 font-semibold">Professional Account</span>
            </div>
            <button
              type="button"
              disabled={demoLoginLoading}
              onClick={async () => {
                setDemoLoginLoading(true);
                try {
                  await loginWithDemo('professional');
                } catch (e) {
                  console.error(e);
                } finally {
                  setDemoLoginLoading(false);
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-teal-700 to-blue-700 hover:from-teal-600 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {demoLoginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>1-Click Demo Professional Login</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue with Google</span>
            </button>

            <Link
              href="/login?returnUrl=/register-professional"
              className="block w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 transition"
            >
              Sign In / Register with Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header - Professional Light Design */}
      <div className="relative overflow-hidden bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Kurnool One Personal & Creator Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            List Your Personal Profile or Creator Channel
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Whether you are a social media influencer, painter, doctor, IT specialist, electrician, advocate, or coach — get discovered by thousands of Kurnool residents with direct client calls & WhatsApp chats.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-10">

        {/* ─── 1. SUBSCRIPTION PLAN SELECTION ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">1. Choose Personal Profile Plan</h2>
              <p className="text-xs text-slate-500">Pick the listing duration that fits your career or freelancing goals.</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Direct Client Contacts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROFESSIONAL_PRICING_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id as any)}
                  className={`relative rounded-2xl p-5 cursor-pointer transition-all border-2 flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{plan.duration}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                      <span className="text-xs font-semibold text-slate-500">/ {plan.duration}</span>
                    </div>
                    {plan.savings && (
                      <span className="inline-block text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <ul className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 2. CATEGORY SELECTION (30 PERSONAL SECTORS) ─── */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-black text-slate-900">
              2. Select Your Profession or Creator Skill <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400 font-semibold">{PROFESSIONAL_CATEGORIES.length} Categories</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category (e.g. Influencer, Painter, Doctor, IT, Advocate...)"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 border border-slate-200 rounded-2xl">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-3 rounded-xl text-left border transition text-xs flex flex-col justify-between cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-black shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <span className="font-bold text-slate-900">{cat.name_en}</span>
                <span className="text-[11px] text-slate-500 mt-1">{cat.name_te}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 3. BASIC PERSONAL INFO ─── */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
          <h2 className="text-sm font-black text-slate-900">3. Profile & Contact Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name / Channel / Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar or Kurnool Food Explorer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Kurnool Area
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900 bg-white"
              >
                {KURNOOL_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Visiting / Consultation Charges
              </label>
              <input
                type="text"
                placeholder="e.g. ₹150, ₹300, or Free Consultation"
                value={visitingCharges}
                onChange={(e) => setVisitingCharges(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hourly / Project Rate (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ₹500/hr or ₹5,000/deal"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number (For Client Calls) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9848012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                WhatsApp Number (For Direct Chats)
              </label>
              <input
                type="tel"
                placeholder="e.g. 9848012345 (Leave empty if same as phone)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Colonies / Localities Covered in Kurnool
            </label>
            <input
              type="text"
              placeholder="e.g. Camp, B-Camp, C-Camp, Budhawarapet, Nandyal Road, All Kurnool"
              value={serviceAreas}
              onChange={(e) => setServiceAreas(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900"
            />
          </div>
        </div>

        {/* ─── 4. SOCIAL MEDIA & PORTFOLIO LINKS (ALL OPTIONAL) ─── */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <InstagramIcon className="w-4 h-4 text-pink-600" />
              <span>Social Media & Web Links</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              All Optional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instagram Profile Link <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/your_handle"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 outline-none text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                YouTube Channel Link <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@yourchannel"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 outline-none text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                LinkedIn Profile Link <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/your_profile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 outline-none text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Twitter / X Profile Link <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://x.com/your_handle"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 outline-none text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Facebook Profile / Page <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://facebook.com/your_page"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 outline-none text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Personal Website / Portfolio <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 outline-none text-sm text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* ─── 5. BIO / DESCRIPTION ─── */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            About You, Skills & Past Work Experience
          </label>
          <textarea
            rows={3}
            placeholder="Tell clients in Kurnool about your skills, past projects, certifications, and why they should choose you..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900"
          />
        </div>

        {/* ─── 6. PROFILE PHOTO / HEADSHOT ─── */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Profile Photo / Headshot <span className="text-blue-600 font-semibold">(Add your photo)</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Upload a picture or paste a photo image URL. A clear photo builds 3x more trust with clients in Kurnool.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option A: File Upload */}
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 text-center cursor-pointer transition bg-slate-50/50 flex flex-col items-center justify-center">
              <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-blue-600">Upload Photo File</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Option B: Image URL Paste */}
            <div className="flex flex-col justify-center space-y-1.5 bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
              <label className="text-xs font-bold text-slate-700">Or Paste Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={avatarUrlInput}
                onChange={(e) => {
                  setAvatarUrlInput(e.target.value);
                  if (e.target.value) setPreviewUrl(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 outline-none text-xs text-slate-900"
              />
              <span className="text-[10px] text-slate-400">Direct link to your portrait or avatar</span>
            </div>
          </div>

          {/* Avatar Preview */}
          {(previewUrl || avatarUrlInput) && (
            <div className="flex items-center gap-3 pt-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                <img
                  src={previewUrl || avatarUrlInput}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Photo Selected
                </span>
                <span className="text-slate-500 text-[11px]">This photo will be displayed on your profile card.</span>
              </div>
            </div>
          )}
        </div>

        {/* ─── 7. SUBMIT & CHECKOUT ─── */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">Selected: {activePlan.name}</span>
              <span className="text-xs font-black text-blue-600">₹{activePlan.price}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Instant activation with client call buttons and local SEO priority.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{activePlan.price} & Activate Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
