'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  UploadCloud,
  CheckCircle2,
  MapPin,
  Globe,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  CreditCard,
  Crown,
  Check,
  Star,
  Calendar,
  Share2,
  Video,
  Image as ImageIcon,
  Tag,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  Info,
  MessageCircle,
} from 'lucide-react';
import {
  MASTER_CATEGORIES,
  KURNOOL_AREAS,
  BUSINESS_PRICING_PLANS,
  registerBusiness,
  uploadBusinessImage,
  BusinessItem,
  DayOperatingHours,
} from '@/services/directoryService';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, LogIn } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const COMMON_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'card_payment', label: 'Card Payment', icon: '💳' },
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: '♿' },
  { id: 'restrooms', label: 'Restrooms', icon: '🚻' },
  { id: 'delivery', label: 'Delivery', icon: '🛵' },
  { id: 'takeaway', label: 'Takeaway', icon: '🛍️' },
  { id: 'dine_in', label: 'Dine-in', icon: '🍽️' },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: '🐾' },
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export default function RegisterBusinessPage() {
  const { user, loading: authLoading, loginWithGoogle, loginWithDemo } = useAuth();
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);

  // ─── PLAN SELECTION ────────────────────────────────────────────────────────
  const [selectedPlanId, setSelectedPlanId] = useState<'biz_monthly' | 'biz_half_yearly' | 'biz_yearly'>('biz_yearly');

  // ─── BASIC INFO ────────────────────────────────────────────────────────────
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categoryId, setCategoryId] = useState(MASTER_CATEGORIES[0].id);
  const [catFilter, setCatFilter] = useState('');
  const [area, setArea] = useState(KURNOOL_AREAS[0]);
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');

  // Auto-slugify when name changes (unless user typed a custom slug)
  useEffect(() => {
    if (!slugManuallyEdited && nameEn) {
      setSlug(
        nameEn
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      );
    }
  }, [nameEn, slugManuallyEdited]);

  // ─── LOCATION & CONTACT ───────────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsLocation, setGoogleMapsLocation] = useState('');

  // ─── BUSINESS HOURS (MONDAY TO SUNDAY) ────────────────────────────────────
  const [operatingHours, setOperatingHours] = useState<Record<string, DayOperatingHours>>({
    monday: { closed: false, open: '09:30 AM', close: '09:00 PM' },
    tuesday: { closed: false, open: '09:30 AM', close: '09:00 PM' },
    wednesday: { closed: false, open: '09:30 AM', close: '09:00 PM' },
    thursday: { closed: false, open: '09:30 AM', close: '09:00 PM' },
    friday: { closed: false, open: '09:30 AM', close: '09:00 PM' },
    saturday: { closed: false, open: '09:30 AM', close: '09:00 PM' },
    sunday: { closed: false, open: '10:00 AM', close: '08:00 PM' },
  });

  const updateDayHours = (day: string, field: keyof DayOperatingHours, value: any) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const applyMondayToAllDays = () => {
    const mondayVal = operatingHours.monday;
    const updated: Record<string, DayOperatingHours> = {};
    DAYS_OF_WEEK.forEach(({ key }) => {
      updated[key] = { ...mondayVal };
    });
    setOperatingHours(updated);
  };

  // ─── SOCIAL MEDIA & LINKS ─────────────────────────────────────────────────
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');

  // ─── MEDIA MANAGEMENT ─────────────────────────────────────────────────────
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryPhoto = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── SEO & DETAILS ────────────────────────────────────────────────────────
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // ─── FEATURES & AMENITIES ─────────────────────────────────────────────────
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['parking', 'card_payment']);
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  const toggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  const addCustomFeature = () => {
    if (customFeatureInput.trim() && !customFeatures.includes(customFeatureInput.trim())) {
      setCustomFeatures((prev) => [...prev, customFeatureInput.trim()]);
      setCustomFeatureInput('');
    }
  };

  const removeCustomFeature = (feat: string) => {
    setCustomFeatures((prev) => prev.filter((f) => f !== feat));
  };

  // ─── SUBMISSION & PAYMENT ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdBizId, setCreatedBizId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId?: string;
    planName?: string;
    amount?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const activePlan = BUSINESS_PRICING_PLANS.find((p) => p.id === selectedPlanId) || BUSINESS_PRICING_PLANS[2];

  // Load Razorpay checkout script
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

    if (!nameEn.trim()) {
      setErrorMsg('Please enter the Business Name');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter a primary Phone Number for customer calls');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your full street/commercial address');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload media assets if provided
      let thumbUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
      if (thumbFile) {
        thumbUrl = await uploadBusinessImage(thumbFile);
      }

      let logoUploadedUrl = '';
      if (logoFile) {
        logoUploadedUrl = await uploadBusinessImage(logoFile);
      }

      let bannerUploadedUrl = '';
      if (bannerFile) {
        bannerUploadedUrl = await uploadBusinessImage(bannerFile);
      }

      const galleryUploadedUrls: string[] = [];
      for (const gf of galleryFiles) {
        const gu = await uploadBusinessImage(gf);
        galleryUploadedUrls.push(gu);
      }

      // Generate timing summary string for backward compatibility
      const timingSummary = `${operatingHours.monday.open} - ${operatingHours.monday.close}`;

      // 2. Register Business in Firestore
      const newBizData: Partial<BusinessItem> = {
        name_en: nameEn.trim(),
        name_te: nameTe.trim(),
        slug: slug.trim() || nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        categoryId,
        area,
        tagline: tagline.trim(),
        description_en: description.trim() || `${nameEn} is located in ${area}, Kurnool, offering quality service.`,
        description_te: nameTe ? `${nameTe} కర్నూలులో ప్రముఖ వ్యాపార సంస్థ.` : '',
        address: address.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        website: website.trim(),
        googleMapsLocation: googleMapsLocation.trim(),
        googleMapsEmbed: googleMapsLocation.trim(),
        operatingHours: operatingHours as any,
        timing: timingSummary,
        socialLinks: {
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          twitter: twitter.trim(),
          youtube: youtube.trim(),
        },
        logoUrl: logoUploadedUrl,
        thumbnailUrl: thumbUrl,
        bannerUrl: bannerUploadedUrl,
        galleryUrls: galleryUploadedUrls,
        youtubeVideoUrl: youtubeVideoUrl.trim(),
        seoTitle: metaTitle.trim() || `${nameEn} - Best in ${area}, Kurnool | Kurnool One`,
        seoDescription: metaDescription.trim() || `Visit ${nameEn} in ${area}, Kurnool. Phone: ${phone}. Verified city business on Kurnool One.`,
        images: [thumbUrl, ...galleryUploadedUrls],
        coverImage: bannerUploadedUrl || thumbUrl,
        amenities: [...selectedAmenities, ...customFeatures],
        customFeatures,
        planId: selectedPlanId === 'biz_yearly' ? 'yearly' : selectedPlanId === 'biz_half_yearly' ? 'half_yearly' : 'monthly',
        paymentStatus: 'unpaid',
        status: 'published',
        tier: selectedPlanId === 'biz_yearly' ? 'premium' : 'featured',
        verificationBadge: 'verified_business',
        ownerUid: user?.uid,
        claimStatus: 'verified',
      };

      const docId = await registerBusiness(newBizData);
      setCreatedBizId(docId);

      // 3. Initiate Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        // Fallback: Success without immediate modal
        setPaymentDetails({
          planName: activePlan.name,
          amount: activePlan.price,
        });
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Create Order via server API
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          businessId: docId,
          businessName: nameEn,
          phone,
          email,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        // In local test/demo environment, complete gracefully
        setPaymentDetails({
          planName: activePlan.name,
          amount: activePlan.price,
        });
        setSuccess(true);
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_kurnool_one',
        amount: orderData.amount,
        currency: 'INR',
        name: 'Kurnool One',
        description: `${activePlan.name} Subscription`,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment on server
          try {
            await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                businessId: docId,
                planId: selectedPlanId,
              }),
            });
          } catch (e) {
            console.error('Verify call error:', e);
          }

          setPaymentDetails({
            paymentId: response.razorpay_payment_id,
            planName: activePlan.name,
            amount: activePlan.price,
          });
          setSuccess(true);
          setLoading(false);
        },
        prefill: {
          name: nameEn,
          email: email || 'merchant@kurnoolone.in',
          contact: phone,
        },
        theme: {
          color: '#1E3A8A',
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
      setErrorMsg(err.message || 'Something went wrong while submitting. Please try again.');
      setLoading(false);
    }
  };

  // ─── SUCCESS STATE ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Listing • Verified Merchant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {nameEn} is Officially Listed!
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
            Your storefront, 7-day operating hours, and contact channels are now live for Kurnool residents to discover.
          </p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Selected Plan:</span>
              <span className="font-extrabold text-slate-900">{paymentDetails?.planName || activePlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Subscription Fee:</span>
              <span className="font-extrabold text-blue-600">₹{paymentDetails?.amount || activePlan.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Colony / Area:</span>
              <span className="font-extrabold text-slate-800">{area}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Listing Status:</span>
              <span className="font-extrabold text-emerald-600">● Published & Searchable</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {createdBizId && (
              <Link
                href={`/business/${createdBizId}`}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>View Live Business Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              href="/directory"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center"
            >
              Back to Directory
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
        <div className="rounded-3xl bg-[#0c1222] border border-white/10 p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/20 flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Merchant Login Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Log In to Register Your Business
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Please sign in to your profile before registering a business listing. This links your store to your Merchant Portal to edit timings and view customer calls.
            </p>
          </div>

          {/* Quick Demo Login Option */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300">Quick Testing (1-Click Demo)</span>
              <span className="text-[10px] text-slate-400">Merchant Account</span>
            </div>
            <button
              type="button"
              disabled={demoLoginLoading}
              onClick={async () => {
                setDemoLoginLoading(true);
                try {
                  await loginWithDemo('merchant');
                } catch (e) {
                  console.error(e);
                } finally {
                  setDemoLoginLoading(false);
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {demoLoginLoading ? (
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
              href="/login?returnUrl=/register-business"
              className="block w-full py-3.5 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/10 transition"
            >
              Sign In / Register with Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* ─── LUXURY HEADER BANNER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-4 border border-white/10">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Kurnool One • Merchant Growth Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            Add Your Business in Kurnool
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Join Kurnool's verified city network. Reach 100,000+ local residents, receive direct customer phone calls, WhatsApp inquiries, and showcase your storefront with 7-day operating hours.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ─── SECTION 1: SUBSCRIPTION PRICING PLANS ─────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-blue-600 font-black text-xs uppercase tracking-wider">Step 1 of 6</span>
              <h2 className="text-xl font-black text-slate-900">Choose Business Listing Plan</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">Transparent & No Hidden Fees</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {BUSINESS_PRICING_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id as any)}
                  className={`p-6 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-lg ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{plan.name}</h3>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                      <span className="text-xs text-slate-500 ml-1.5">/{plan.period}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 mb-6">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? 'Selected Plan' : 'Choose Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── SECTION 2: BASIC INFO ─────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-blue-600 font-black text-xs uppercase tracking-wider">Step 2 of 6</span>
            <h2 className="text-xl font-black text-slate-900">Basic Info</h2>
            <p className="text-xs text-slate-500">Provide the official name, category, and locality of your store</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Name * (English)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mourya Inn Restaurant & Hotel"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Name (Telugu - Optional)
              </label>
              <input
                type="text"
                placeholder="ఉదా: మౌర్య ఇన్ రెస్టారెంట్"
                value={nameTe}
                onChange={(e) => setNameTe(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Slug (URL Identifier) *
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <span className="text-slate-400 font-medium">kurnoolone.in/business/</span>
                <input
                  type="text"
                  required
                  placeholder="mourya-inn"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full bg-transparent text-slate-900 font-bold focus:outline-none pl-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Kurnool Area / Locality *
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {KURNOOL_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 50 Categories Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Category * (50 Business Categories)
              </label>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Selected: {MASTER_CATEGORIES.find((c) => c.id === categoryId)?.name_en}
              </span>
            </div>

            <input
              type="text"
              placeholder="Search category (e.g. Restaurants, Hotels, Supermarkets, Hospitals, Jewellery)..."
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full px-4 py-2.5 mb-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 border border-slate-100 p-2.5 rounded-2xl bg-slate-50/50">
              {MASTER_CATEGORIES.filter(
                (cat) =>
                  !catFilter ||
                  cat.name_en.toLowerCase().includes(catFilter.toLowerCase()) ||
                  cat.name_te.includes(catFilter)
              ).map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`py-2 px-3 rounded-xl border text-left text-xs font-bold transition flex flex-col justify-center ${
                    categoryId === cat.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${categoryId === cat.id ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    <span className="truncate">{cat.name_en}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 pl-3.5 font-normal truncate">{cat.name_te}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Tagline (Short Punchy Slogan)
            </label>
            <input
              type="text"
              placeholder="e.g. Authentic Rayalaseema Delicacies & Family Dining Since 1995"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe your specialties, services offered, customer experience, and history..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* ─── SECTION 3: LOCATION & CONTACT ─────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-blue-600 font-black text-xs uppercase tracking-wider">Step 3 of 6</span>
            <h2 className="text-xl font-black text-slate-900">Location & Contact</h2>
            <p className="text-xs text-slate-500">Enable direct phone calls, WhatsApp inquiries, and Google Maps directions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Phone Number (For Customer Calls) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08518224999 or 9848012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                WhatsApp Number (For Instant Leads)
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="e.g. 9848012345"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. info@mouryainn.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  placeholder="https://yourbusiness.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Physical Store Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Door No. 40/321, Opp. Old Bus Stand, Raj Vihar Road, Kurnool, AP 518001"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Google Maps Location (Paste Embed &lt;iframe&gt; or Coordinates lat,lng or Map URL)
            </label>
            <input
              type="text"
              placeholder="e.g. 15.8281, 78.0373 or <iframe src='https://maps.google.com/...'></iframe> or maps.app.goo.gl/..."
              value={googleMapsLocation}
              onChange={(e) => setGoogleMapsLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* ─── SECTION 4: BUSINESS HOURS (MONDAY TO SUNDAY) ─────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-blue-600 font-black text-xs uppercase tracking-wider">Step 4 of 6</span>
              <h2 className="text-xl font-black text-slate-900">Operating Hours (Monday to Sunday)</h2>
              <p className="text-xs text-slate-500">Set opening and closing timings for each day of the week</p>
            </div>
            <button
              type="button"
              onClick={applyMondayToAllDays}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Apply Monday Hours to All Days</span>
            </button>
          </div>

          <div className="space-y-3">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const dayConfig = operatingHours[key] || { closed: false, open: '09:30 AM', close: '09:00 PM' };
              return (
                <div
                  key={key}
                  className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    dayConfig.closed
                      ? 'bg-slate-50 border-slate-200/70 opacity-70'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 w-36">
                    <span className="font-extrabold text-slate-900 text-sm">{label}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Closed Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={dayConfig.closed}
                        onChange={(e) => updateDayHours(key, 'closed', e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                      />
                      <span className={`text-xs font-bold ${dayConfig.closed ? 'text-rose-600' : 'text-slate-500'}`}>
                        {dayConfig.closed ? 'Closed Today' : 'Open'}
                      </span>
                    </label>

                    {/* Open & Close time selectors */}
                    {!dayConfig.closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={dayConfig.open}
                          onChange={(e) => updateDayHours(key, 'open', e.target.value)}
                          placeholder="09:00 AM"
                          className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">to</span>
                        <input
                          type="text"
                          value={dayConfig.close}
                          onChange={(e) => updateDayHours(key, 'close', e.target.value)}
                          placeholder="09:30 PM"
                          className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── SECTION 5: SOCIAL MEDIA & MEDIA MANAGEMENT ────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-blue-600 font-black text-xs uppercase tracking-wider">Step 5 of 6</span>
            <h2 className="text-xl font-black text-slate-900">Social Media & Media Management</h2>
            <p className="text-xs text-slate-500">Upload your logo, storefront photos, and connect social handles</p>
          </div>

          {/* Social Media Inputs */}
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">Social Media & Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourbusiness"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Handle / URL</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/yourbusiness"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X</label>
                <input
                  type="text"
                  placeholder="https://x.com/yourbusiness"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Channel</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@yourbusiness"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Media Uploads */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">Media Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Logo Upload */}
              <div className="border border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50">
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2">
                  Logo (Square)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer min-h-[130px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-600">Upload Logo</span>
                    </>
                  )}
                </div>
              </div>

              {/* Featured Image (Thumbnail) * */}
              <div className="border border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50">
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2">
                  Featured Thumbnail *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer min-h-[130px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {thumbPreview ? (
                    <img src={thumbPreview} alt="Thumbnail" className="w-24 h-16 object-cover rounded-lg" />
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-blue-500 mb-1" />
                      <span className="text-xs font-bold text-blue-600">Upload Thumbnail</span>
                    </>
                  )}
                </div>
              </div>

              {/* Banner Image (Top of Page) */}
              <div className="border border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50">
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2">
                  Top Page Banner
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer min-h-[130px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-24 h-16 object-cover rounded-lg" />
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-600">Upload Banner</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Gallery Multi-Upload */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2">
                Gallery Images (Photo Gallery)
              </label>
              <div className="flex flex-wrap gap-3 items-center">
                {galleryPreviews.map((src, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={src} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryPhoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
                  <Plus className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 mt-1">Add Photo</span>
                </label>
              </div>
            </div>

            {/* YouTube Video URL */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                YouTube Video URL (Store tour or promo video)
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-red-500 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeVideoUrl}
                  onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 6: SEO & DETAILS + AMENITIES ──────────────────────── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-blue-600 font-black text-xs uppercase tracking-wider">Step 6 of 6</span>
            <h2 className="text-xl font-black text-slate-900">SEO & Features & Amenities</h2>
            <p className="text-xs text-slate-500">Add search engine metadata and customer convenience amenities</p>
          </div>

          {/* SEO Inputs */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">SEO & Details</h3>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Meta Title (SEO)</label>
                <span className="text-[11px] text-slate-400">{metaTitle.length}/60 characters</span>
              </div>
              <input
                type="text"
                placeholder={`e.g. Best Restaurant in ${area}, Kurnool | Royal Dining`}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Meta Description (SEO)</label>
                <span className="text-[11px] text-slate-400">{metaDescription.length}/160 characters</span>
              </div>
              <textarea
                rows={2}
                placeholder={`e.g. Discover ${nameEn || 'our business'} located in ${area}, Kurnool. Book tables, call directly, or get directions on Kurnool One.`}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={160}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Common Amenities Checklist */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Common Features & Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {COMMON_AMENITIES.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity.label);
                return (
                  <button
                    type="button"
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.label)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-2 text-left ${
                      isChecked
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{amenity.icon}</span>
                    <span className="truncate">{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Property Features / Custom Tags */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Property Features (Add Custom)</h3>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="e.g. Valet Parking, Rooftop Seating, Garden Area..."
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={addCustomFeature}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Add
              </button>
            </div>

            {customFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {customFeatures.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomFeature(feat)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── ERROR MESSAGE & SUBMISSION BAR ────────────────────────────── */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
              Ready to Publish in Kurnool
            </div>
            <div className="text-xl sm:text-2xl font-black">
              Total: ₹{activePlan.price}{' '}
              <span className="text-xs font-normal text-slate-400">({activePlan.name} • {activePlan.period})</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Secure payments via Razorpay (UPI, Credit/Debit Cards, NetBanking)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30 transition transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Storefront...</span>
              </>
            ) : (
              <>
                <span>Publish Business & Pay ₹{activePlan.price}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
