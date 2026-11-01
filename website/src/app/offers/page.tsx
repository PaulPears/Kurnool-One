'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tag,
  Phone,
  Clock,
  Sparkles,
  ShoppingBag,
  Calendar,
  PlusCircle,
  MapPin,
  MessageCircle,
  IndianRupee,
  CheckCircle2,
  X,
  Filter,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  fetchOffers,
  fetchMarketplaceItems,
  createMarketplaceItem,
  deleteMarketplaceItem,
  fetchEvents,
  OfferItem,
  MarketplaceItem,
  EventItem,
  SEED_OFFERS,
  SEED_MARKET_ITEMS,
} from '@/services/directoryService';
import { useLanguage } from '@/context/LanguageContext';

export default function OffersPage() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'deals' | 'market' | 'events'>('deals');

  const [offers, setOffers] = useState<OfferItem[]>(SEED_OFFERS);
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>(SEED_MARKET_ITEMS);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Lightbox Viewer
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');

  // Post Marketplace Item Modal
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Two-Wheelers');
  const [postPrice, setPostPrice] = useState('');
  const [postCondition, setPostCondition] = useState('');
  const [postArea, setPostArea] = useState('');
  const [postPhone, setPostPhone] = useState('');
  const [postWhatsapp, setPostWhatsapp] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'deals') {
        const data = await fetchOffers();
        setOffers(data && data.length > 0 ? data : SEED_OFFERS);
      } else if (activeTab === 'market') {
        const data = await fetchMarketplaceItems();
        setMarketItems(data && data.length > 0 ? data : SEED_MARKET_ITEMS);
      } else if (activeTab === 'events') {
        const data = await fetchEvents();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postPrice.trim() || !postArea.trim() || !postPhone.trim()) {
      alert(t('Please fill in Title, Price, Area, and Contact Phone.', 'దయచేసి శీర్షిక, ధర, ప్రాంతం మరియు ఫోన్ నంబర్‌ను నమోదు చేయండి.'));
      return;
    }

    setSubmitting(true);
    try {
      const images: string[] = [];
      if (postImageUrl.trim()) {
        images.push(postImageUrl.trim());
      } else {
        images.push('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800');
      }

      await createMarketplaceItem({
        title_en: postTitle.trim(),
        title_te: postTitle.trim(),
        price: postPrice.startsWith('₹') ? postPrice : `₹${postPrice}`,
        category: postCategory,
        sellerName: 'Citizen Seller',
        sellerPhone: postPhone.trim(),
        sellerWhatsapp: postWhatsapp.trim() || postPhone.trim(),
        area: postArea.trim(),
        condition: postCondition.trim() || 'Good Condition',
        postedDate: 'Just now',
        imageUrl: images[0],
        images,
        description: postDesc.trim() || 'Pre-owned item for sale in Kurnool.',
        status: 'active',
      });

      setPostSuccess(true);
      setTimeout(() => {
        setPostSuccess(false);
        setPostModalOpen(false);
        setPostTitle('');
        setPostPrice('');
        setPostCondition('');
        setPostArea('');
        setPostPhone('');
        setPostWhatsapp('');
        setPostDesc('');
        setPostImageUrl('');
        loadData();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert(t('Failed to post item. Please try again.', 'పోస్ట్ చేయడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{t('City Savings & Classifieds', 'నగర ఆఫర్లు & సిటిజెన్ క్లాసిఫైడ్స్')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {t('Kurnool Deals, Classifieds & Events', 'కర్నూలు డీల్స్, అమ్మకాలు & నగర వేడుకలు')}
          </h1>

          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            {t(
              'Explore exclusive merchant discounts, buy & sell pre-owned items directly from citizens, and discover upcoming city festivals in Kurnool.',
              'ప్రత్యేక వ్యాపార డిస్కౌంట్లు, పౌరుల సెకండ్-హ్యాండ్ వస్తువుల అమ్మకాలు మరియు కర్నూలు వేడుకలను ఇక్కడ తెలుసుకోండి.'
            )}
          </p>

          {activeTab === 'market' && (
            <div className="pt-2">
              <button
                onClick={() => setPostModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-orange-700 hover:bg-amber-50 font-bold text-sm shadow-lg transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-orange-600" />
                <span>{t('Post an Item to Sell (Free)', 'వస్తువును అమ్మకానికి పెట్టండి (ఉచితం)')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3-Tab Navigator matching mobile OffersScreen */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner gap-1">
          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>{t('Hot Deals', 'హాట్ డీల్స్')}</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'market'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-orange-600" />
            <span>{t('Citizen Classifieds (Buy & Sell)', 'సిటిజెన్ క్లాసిఫైడ్స్ (అమ్మకాలు)')}</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'events'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-600" />
            <span>{t('City Events', 'నగర వేడుకలు')}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Merchant Deals */}
      {activeTab === 'deals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                {offer.bannerUrl && (
                  <div className="h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={offer.bannerUrl}
                      alt={offer.title_en}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="inline-block bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3 shadow-xs">
                    {offer.discountText}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg mb-1">{offer.title_en}</h3>
                  <p className="text-xs font-bold text-blue-600 mb-2">{offer.businessName}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{offer.description_en}</p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{offer.validUntil}</span>
                  </div>
                </div>
              </div>

              {offer.phone && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <a
                    href={`tel:${offer.phone}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t('Call to Claim Offer', 'ఆఫర్ కోసం కాల్ చేయండి')}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Citizen Classifieds (Buy & Sell) */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              {t('Pre-owned vehicles, mobiles, electronics & furniture in Kurnool', 'కర్నూలులో సెకండ్-హ్యాండ్ బైక్‌లు, మొబైల్స్, ఫర్నిచర్ అమ్మకాలు')}
            </span>
            <button
              onClick={() => setPostModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('Post Item', 'వస్తువును అమ్మండి')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => {
                      if (item.images && item.images.length > 0) {
                        setLightboxImage(item.images[0]);
                        setLightboxOpen(true);
                      }
                    }}
                    className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={item.imageUrl || item.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800'}
                      alt={item.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full uppercase">
                      {item.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                      {item.price}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                        {language === 'te' && item.title_te ? item.title_te : item.title_en}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{item.area}</span>
                      </div>
                    </div>

                    {item.condition && (
                      <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                        {item.condition}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                      {t('Seller:', 'అమ్మకందారు:')} <span className="font-bold text-slate-800">{item.sellerName}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${item.sellerPhone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t('Call Seller', 'కాల్ చేయండి')}</span>
                  </a>

                  <a
                    href={`https://wa.me/91${item.sellerWhatsapp?.replace(/[^0-9]/g, '') || item.sellerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I saw your classified item "${item.title_en}" on Kurnool One. Is it still available?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: City Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                {event.posterUrl && (
                  <div className="h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={event.posterUrl}
                      alt={event.title_en}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-black uppercase">
                      {event.category || 'City Event'}
                    </span>
                    {event.entryType === 'free' ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {t('Free Entry', 'ఉచిత ప్రవేశం')}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {event.ticketPrice || 'Ticketed'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {language === 'te' && event.title_te ? event.title_te : event.title_en}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.dateStr} • {event.timeStr || 'All Day'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-700">{t('Organizer:', 'నిర్వాహకులు:')}</span> {event.organizerName}
                  </p>
                </div>
              </div>

              {event.contactPhone && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t('Contact Organizer', 'నిర్వాహకుడిని సంప్రదించండి')}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Classified Item"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Post Classified Item Modal */}
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
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase">
                <ShoppingBag className="w-4 h-4" />
                <span>{t('Citizen Marketplace', 'సిటిజెన్ మార్కెట్‌ప్లేస్')}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {t('Post Item to Sell in Kurnool', 'వస్తువును అమ్మకానికి పెట్టండి')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'Sell pre-owned bikes, phones, electronics, or furniture to verified buyers across Kurnool.',
                  'మీ సెకండ్-హ్యాండ్ వస్తువులను కర్నూలు ప్రజలకు నేరుగా అమ్మండి.'
                )}
              </p>
            </div>

            {postSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-emerald-900 text-base">
                  {t('Item Posted Successfully!', 'వస్తువు విజయవంతంగా లిస్ట్ చేయబడింది!')}
                </h4>
                <p className="text-xs text-emerald-700">
                  {t('Buyers in Kurnool can now view your listing and contact you directly.', 'కర్నూలు కొనుగోలుదారులు మీ వస్తువును చూసి నేరుగా కాల్ చేయగలరు.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handlePostItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Item Title *', 'వస్తువు పేరు *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda Activa 5G (Single Owner, Kurnool Reg)"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Category *', 'వర్గం *')}
                    </label>
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500 bg-white"
                    >
                      {['Two-Wheelers', 'Mobiles & Tablets', 'Electronics & Appliances', 'Home & Furniture', 'Commercial Equipment', 'Other'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Selling Price (₹) *', 'ధర (₹) *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 38500"
                      value={postPrice}
                      onChange={(e) => setPostPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Condition', 'పరిస్థితి')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Excellent • 24,000 KM"
                      value={postCondition}
                      onChange={(e) => setPostCondition(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Area in Kurnool *', 'ప్రాంతం *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abbas Nagar, Gayatri Estate"
                      value={postArea}
                      onChange={(e) => setPostArea(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Contact Phone *', 'సంప్రదించాల్సిన ఫోన్ *')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98480XXXXX"
                      value={postPhone}
                      onChange={(e) => setPostPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('WhatsApp Number', 'వాట్సాప్ నంబర్')}
                    </label>
                    <input
                      type="tel"
                      placeholder="98480XXXXX"
                      value={postWhatsapp}
                      onChange={(e) => setPostWhatsapp(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Photo URL (Optional)', 'ఫోటో లింక్ (ఐచ్ఛికం)')}
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={postImageUrl}
                    onChange={(e) => setPostImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Item Description', 'వస్తువు వివరణ')}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about condition, bills, warranty, etc."
                    value={postDesc}
                    onChange={(e) => setPostDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-md shadow-orange-200 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? t('Posting Item...', 'పోస్ట్ అవుతోంది...') : t('Publish Item for Sale', 'వస్తువును పబ్లిష్ చేయండి')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
