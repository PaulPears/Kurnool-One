'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  IndianRupee,
  ShieldCheck,
  PlusCircle,
  Filter,
  Search,
  CheckCircle2,
  X,
  Droplet,
  Car,
  Users,
  Eye,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  fetchHouseRentals,
  createHouseRental,
  HouseRentalItem,
  SEED_HOUSE_RENTALS,
} from '@/services/directoryService';
import { useLanguage } from '@/context/LanguageContext';

const BHK_FILTERS = ['All', '1 RK', '1 BHK', '2 BHK', '3 BHK', 'Commercial'];

export default function HouseRentPage() {
  const { language, t } = useLanguage();
  const [selectedBhk, setSelectedBhk] = useState('All');
  const [rentals, setRentals] = useState<HouseRentalItem[]>(SEED_HOUSE_RENTALS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Image Viewer Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  // Post Rental Modal State
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [bhk, setBhk] = useState<'1 RK' | '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK' | 'Commercial'>('2 BHK');
  const [propertyType, setPropertyType] = useState('Apartment / Flat');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [tenantPreference, setTenantPreference] = useState<'Family Only' | 'Bachelors' | 'Any / All'>('Family Only');
  const [furnishing, setFurnishing] = useState<'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished'>('Semi-Furnished');
  const [area, setArea] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [waterFacility, setWaterFacility] = useState('24/7 Borewell + Municipal Drinking Tap');
  const [parking, setParking] = useState('Bike & Car Parking Available');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    loadRentals();
  }, [selectedBhk]);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const data = await fetchHouseRentals(selectedBhk);
      setRentals(data && data.length > 0 ? data : SEED_HOUSE_RENTALS);
    } catch (err) {
      console.error(err);
      setRentals(SEED_HOUSE_RENTALS);
    } finally {
      setLoading(false);
    }
  };

  const handlePostRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !monthlyRent.trim() || !area.trim() || !phone.trim()) {
      alert(t('Please fill in Title, Rent, Area, and Phone number.', 'దయచేసి శీర్షిక, అద్దె, ప్రాంతం మరియు ఫోన్ నంబర్‌ను నమోదు చేయండి.'));
      return;
    }

    setSubmitting(true);
    try {
      const images: string[] = [];
      if (imageUrl.trim()) {
        images.push(imageUrl.trim());
      } else {
        images.push('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80');
      }

      await createHouseRental({
        ownerName: 'Property Owner',
        ownerPhone: phone.trim(),
        ownerWhatsapp: whatsapp.trim() || phone.trim(),
        title_en: title.trim(),
        bhk,
        propertyType,
        monthlyRent: Number(monthlyRent) || 0,
        depositAmount: Number(deposit) || 0,
        tenantPreference,
        furnishing,
        area: area.trim(),
        addressDetails: addressDetails.trim(),
        waterFacility,
        parking,
        description: description.trim() || 'Well maintained rental house in Kurnool.',
        images,
        status: 'available',
        postedDate: 'Just now',
      });

      setPostSuccess(true);
      setTimeout(() => {
        setPostSuccess(false);
        setPostModalOpen(false);
        setTitle('');
        setMonthlyRent('');
        setDeposit('');
        setArea('');
        setAddressDetails('');
        setPhone('');
        setWhatsapp('');
        setDescription('');
        setImageUrl('');
        loadRentals();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert(t('Failed to submit listing. Please try again.', 'లిస్టింగ్ సమర్పణ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRentals = rentals.filter((r) => {
    const matchesBhk = selectedBhk === 'All' || r.bhk === selectedBhk;
    const matchesQuery =
      !searchQuery ||
      r.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bhk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBhk && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <Home className="w-4 h-4 text-emerald-200" />
            <span>{t('Kurnool City To-Let & Rentals', 'కర్నూలు టు-లెట్ & అద్దె ఇళ్ళు')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {t('Find Your Next Home in Kurnool', 'కర్నూలులో మీకు సరిపడే అద్దె ఇల్లు పొందండి')}
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            {t(
              'Browse verified 1 RK, 1 BHK, 2 BHK, 3 BHK flats, independent houses, and commercial spaces directly from local landlords without brokerage.',
              'బ్రోకరేజ్ లేకుండా నేరుగా ఇంటి యజమానుల నుండి 1 RK, 1 BHK, 2 BHK, 3 BHK ఫ్లాట్లు మరియు దుకాణాలను కనుగొనండి.'
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPostModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-teal-800 hover:bg-emerald-50 font-bold text-sm shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-teal-700" />
              <span>{t('Post To-Let Property (Landlords)', 'ఇంటి యజమానులు: టు-లెట్ పోస్ట్ చేయండి')}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Back to Home', 'హోమ్‌కు తిరిగి వెళ్లండి')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* BHK Filter Chips & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {t('Filter by Property Size', 'ఇంటి పరిమాణం వారీగా ఫిల్టర్ చేయండి')}
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('Search area, e.g. Gayatri Estate...', 'ప్రాంతాన్ని శోధించండి, ఉదా: గాయత్రి ఎస్టేట్...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BHK_FILTERS.map((bhkVal) => {
            const isActive = selectedBhk === bhkVal;
            return (
              <button
                key={bhkVal}
                onClick={() => setSelectedBhk(bhkVal)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-200'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-100'
                }`}
              >
                {bhkVal}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rentals Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">{t('Loading rental properties in Kurnool...', 'కర్నూలులో అద్దె ఇళ్ళ వివరాలు సేకరిస్తున్నాము...')}</p>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Home className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-lg">
            {t('No rental properties found for this filter.', 'ఈ పరిమాణంలో అద్దె ఇళ్ళు కనుగొనబడలేదు.')}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t(
              'Are you a landlord in Kurnool? Post your rental flat or independent house for free.',
              'మీరు కర్నూలులో ఇంటి యజమానా? మీ ఇంటిని ఉచితంగా టు-లెట్ లిస్ట్ చేయండి.'
            )}
          </p>
          <button
            onClick={() => setPostModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-teal-100"
          >
            {t('Post To-Let Property', 'టు-లెట్ పోస్ట్ చేయండి')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental) => (
            <div
              key={rental.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                {/* Photo Thumbnail */}
                <div
                  onClick={() => {
                    if (rental.images && rental.images.length > 0) {
                      setActiveImage(rental.images[0]);
                      setLightboxOpen(true);
                    }
                  }}
                  className="relative h-48 bg-slate-100 overflow-hidden group cursor-pointer"
                >
                  <img
                    src={rental.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}
                    alt={rental.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full uppercase">
                    {rental.bhk}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <IndianRupee className="w-3 h-3" />
                    <span>{rental.monthlyRent.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{t('View Photos', 'ఫోటోలు')}</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                      {rental.title_en}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{rental.area}</span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                      <Users className="w-3.5 h-3.5 text-teal-600" />
                      <span className="truncate">{rental.tenantPreference}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate">{rental.furnishing}</span>
                    </div>
                  </div>

                  {rental.depositAmount && rental.depositAmount > 0 && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      {t('Deposit / Advance:', 'అడ్వాన్స్:')} <span className="font-bold text-slate-800">₹{rental.depositAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {rental.description}
                  </p>
                </div>
              </div>

              {/* Call & WhatsApp Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${rental.ownerPhone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('Call Landlord', 'కాల్ చేయండి')}</span>
                </a>

                <a
                  href={`https://wa.me/91${rental.ownerWhatsapp?.replace(/[^0-9]/g, '') || rental.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I saw your rental listing "${rental.title_en}" on Kurnool One Web App. Is it still available?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Photo Viewer Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeImage}
              alt="Rental House"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Post Rental Property Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setPostModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase">
                <Home className="w-4 h-4" />
                <span>{t('Landlord Portal', 'ఇంటి యజమానుల పోర్టల్')}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {t('Post To-Let Rental Property', 'అద్దె ఇంటిని టు-లెట్ పోస్ట్ చేయండి')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'Reach thousands of families and tenants searching for rental homes in Kurnool City.',
                  'కర్నూలు నగరంలో అద్దె ఇళ్ల కోసం వెతుకుతున్న వేలాది మందికి మీ ఇంటిని చూపించండి.'
                )}
              </p>
            </div>

            {postSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-emerald-900 text-base">
                  {t('Property Published Successfully!', 'మీ ఇల్లు విజయవంతంగా పబ్లిష్ అయింది!')}
                </h4>
                <p className="text-xs text-emerald-700">
                  {t('Tenants in Kurnool can now view your listing and call you directly.', 'కర్నూలు ప్రజలు ఇప్పుడు మీ ఇంటిని చూసి నేరుగా కాల్ చేయగలరు.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handlePostRental} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Property Title *', 'ఇంటి శీర్షిక *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('e.g. 2 BHK Spacious East Facing Flat on 1st Floor', 'ఉదా: 2 BHK విశాలమైన తూర్పు ముఖం ఫ్లాట్')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Size / BHK *', 'పరిమాణం / BHK *')}
                    </label>
                    <select
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500 bg-white"
                    >
                      {['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Commercial'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Monthly Rent (₹) *', 'నెలవారీ అద్దె (₹) *')}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 9500"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Advance / Deposit (₹)', 'అడ్వాన్స్ / డిపాజిట్ (₹)')}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Tenant Preference', 'ఎవరికి ఇవ్వాలనుకుంటున్నారు?')}
                    </label>
                    <select
                      value={tenantPreference}
                      onChange={(e) => setTenantPreference(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500 bg-white"
                    >
                      <option value="Family Only">Family Only (కుటుంబాలకు మాత్రమే)</option>
                      <option value="Bachelors">Bachelors (బ్యాచిలర్స్)</option>
                      <option value="Any / All">Any / All (ఎవరికైనా)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Area / Locality in Kurnool *', 'కర్నూలులోని ప్రాంతం *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('e.g. Gayatri Estate, B Camp, Nandyal Checkpost', 'ఉదా: గాయత్రి ఎస్టేట్, బి క్యాంప్, చెక్ పోస్ట్')}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Contact Phone *', 'సంప్రదించాల్సిన ఫోన్ నంబర్ *')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98480XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('WhatsApp Number', 'వాట్సాప్ నంబర్')}
                    </label>
                    <input
                      type="tel"
                      placeholder="98480XXXXX"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Photo URL (Optional)', 'ఇంటి ఫోటో లింక్ (ఐచ్ఛికం)')}
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Property Description & Amenities', 'ఇంటి వివరాలు & సదుపాయాలు')}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t('e.g. 24/7 water, bike parking, east facing, near temple, peaceful road', 'ఉదా: 24 గంటల నీటి సరఫరా, పార్కింగ్, శాంతియుత వాతావరణం')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-md shadow-teal-200 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? t('Publishing Property...', 'పబ్లిష్ అవుతోంది...') : t('Publish To-Let Property', 'అద్దె ఇంటిని పబ్లిష్ చేయండి')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

