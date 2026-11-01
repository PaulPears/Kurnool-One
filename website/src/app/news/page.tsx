'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  MapPin,
  Share2,
  PlusCircle,
  CheckCircle2,
  Filter,
  Search,
  X,
  User,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Clock,
} from 'lucide-react';
import {
  fetchNews,
  submitNewsStory,
  NewsItem,
  SEED_NEWS,
} from '@/services/directoryService';
import { useLanguage } from '@/context/LanguageContext';

const NEWS_CATEGORIES = ['All', 'Development', 'Civic', 'Traffic', 'Culture & Tourism', 'Energy', 'General'];

export default function NewsPage() {
  const { language, t } = useLanguage();
  const [selectedCat, setSelectedCat] = useState('All');
  const [newsList, setNewsList] = useState<NewsItem[]>(SEED_NEWS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Story Reader Modal State
  const [readerModalOpen, setReaderModalOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<NewsItem | null>(null);

  // Submit News Modal State (Citizen Journalism)
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [headlineEn, setHeadlineEn] = useState('');
  const [headlineTe, setHeadlineTe] = useState('');
  const [category, setCategory] = useState('Civic');
  const [area, setArea] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentTe, setContentTe] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [truthConfirmed, setTruthConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchNews();
      setNewsList(data && data.length > 0 ? data : SEED_NEWS);
    } catch (err) {
      console.error(err);
      setNewsList(SEED_NEWS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headlineEn.trim() || !contentEn.trim() || !reporterName.trim() || !reporterPhone.trim()) {
      alert(t('Please fill in Headline, Content, Reporter Name, and Phone.', 'దయచేసి శీర్షిక, వార్తా వివరాలు, మీ పేరు మరియు ఫోన్ నంబర్‌ను నమోదు చేయండి.'));
      return;
    }
    if (!truthConfirmed) {
      alert(t('Please confirm the accuracy of your news report.', 'దయచేసి మీ వార్తా వివరాలు నిజమైనవని ధృవీకరించండి.'));
      return;
    }

    setSubmitting(true);
    try {
      await submitNewsStory({
        title_en: headlineEn.trim(),
        title_te: headlineTe.trim() || headlineEn.trim(),
        category,
        area: area.trim() || 'Kurnool City',
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
        content_en: contentEn.trim(),
        content_te: contentTe.trim() || contentEn.trim(),
        source: `${reporterName.trim()} (Citizen Reporter)`,
        authorName: reporterName.trim(),
        authorPhone: reporterPhone.trim(),
        publishedAt: new Date().toISOString().split('T')[0],
        status: 'pending_approval',
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSubmitModalOpen(false);
        setHeadlineEn('');
        setHeadlineTe('');
        setContentEn('');
        setContentTe('');
        setArea('');
        setImageUrl('');
        setReporterName('');
        setReporterPhone('');
        setTruthConfirmed(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      alert(t('Failed to submit news story. Please try again.', 'వార్త సమర్పణ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNews = newsList.filter((item) => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesQuery =
      !searchQuery ||
      item.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title_te && item.title_te.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.area && item.area.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <Newspaper className="w-4 h-4 text-blue-200" />
            <span>{t('Kurnool City News Bulletin', 'కర్నూలు సిటీ న్యూస్ బులెటిన్')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {t('Local Kurnool News & Updates', 'కర్నూలు స్థానిక వార్తలు & తాజా విశేషాలు')}
          </h1>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            {t(
              'Stay informed with verified city infrastructure updates, civic alerts, cultural events, and verified citizen journalism stories from across Kurnool.',
              'కర్నూలు నగర అభివృద్ధి, మౌలిక వసతులు, పౌర విశేషాలు మరియు పౌర పాత్రికేయ వార్తలను ఎప్పటికప్పుడు తెలుసుకోండి.'
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-700" />
              <span>{t('Submit a Local News Story', 'స్థానిక వార్తను సమర్పించండి (సిటిజెన్ జర్నలిజం)')}</span>
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

      {/* Categories & Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {t('Browse News by Category', 'వర్గం వారీగా వార్తలు')}
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('Search city news, area...', 'వార్తలు లేదా ప్రాంతం శోధించండి...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {NEWS_CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-200'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">{t('Loading city news...', 'తాజా వార్తలు సేకరిస్తున్నాము...')}</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-lg">
            {t('No news stories found in this category.', 'ఈ విభాగంలో వార్తలు లేవు.')}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t(
              'Know something happening in Kurnool? Submit the first story.',
              'కర్నూలులో ఏదైనా విశేషం జరిగిందా? మొదటి వార్తను మీరే సమర్పించండి.'
            )}
          </p>
          <button
            onClick={() => setSubmitModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-100"
          >
            {t('Submit News Story', 'వార్తను సమర్పించండి')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveStory(item);
                setReaderModalOpen(true);
              }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {item.imageUrl && (
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {item.category && (
                      <div className="absolute top-3 left-3 bg-blue-700/90 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full uppercase">
                        {item.category}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.publishedAt}</span>
                    </div>

                    {item.area && (
                      <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[120px]">{item.area}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition line-clamp-2">
                    {language === 'te' && item.title_te ? item.title_te : item.title_en}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {language === 'te' && item.content_te ? item.content_te : item.content_en}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>{item.source || t('Kurnool One News', 'కర్నూలు వన్ న్యూస్')}</span>
                <span className="flex items-center gap-1 text-slate-500 group-hover:text-blue-700 transition">
                  {t('Read Full Story', 'పూర్తి వివరాలు')} →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Reader Full Modal */}
      {readerModalOpen && activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setReaderModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {activeStory.imageUrl && (
              <div className="h-64 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={activeStory.imageUrl}
                  alt={activeStory.title_en}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {activeStory.category && (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                    {activeStory.category}
                  </span>
                )}
                {activeStory.area && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{activeStory.area}</span>
                  </span>
                )}
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{activeStory.publishedAt}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {language === 'te' && activeStory.title_te ? activeStory.title_te : activeStory.title_en}
              </h2>

              <div className="text-xs text-slate-500 font-semibold border-b border-slate-100 pb-3">
                {t('Reported by:', 'విలేకరి:')} <span className="text-slate-800 font-bold">{activeStory.source || 'Citizen Reporter'}</span>
              </div>

              <div className="text-slate-700 text-sm leading-relaxed space-y-4 whitespace-pre-line pt-2">
                {language === 'te' && activeStory.content_te ? activeStory.content_te : activeStory.content_en}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Journalism: Submit News Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSubmitModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase">
                <Newspaper className="w-4 h-4" />
                <span>{t('Citizen Reporter Desk', 'పౌర పాత్రికేయ విభాగం')}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {t('Submit a Local News Story', 'స్థానిక వార్తను సమర్పించండి')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'Your story will be verified by our editorial desk and published live across Kurnool One.',
                  'మీ వార్త మా సంపాదక బృందం పరిశీలించిన తర్వాత కర్నూలు వన్‌లో లైవ్ చేయబడుతుంది.'
                )}
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-emerald-900 text-base">
                  {t('News Story Submitted for Review!', 'వార్త సమీక్ష కోసం సమర్పించబడింది!')}
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {t(
                    'Thank you for reporting. Once verified by our admin desk, your story will appear live on the website and mobile app.',
                    'వార్తను అందించినందుకు ధన్యవాదాలు. నిర్ధారణ అనంతరం వెబ్‌సైట్ మరియు మొబైల్ యాప్‌లో లైవ్ అవుతుంది.'
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitNews} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('News Headline (English) *', 'వార్తా శీర్షిక (ఇంగ్లీష్) *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traffic Diverted at Raj Vihar Center for Road Repair"
                    value={headlineEn}
                    onChange={(e) => setHeadlineEn(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('News Headline (Telugu - Optional)', 'వార్తా శీర్షిక (తెలుగు - ఐచ్ఛికం)')}
                  </label>
                  <input
                    type="text"
                    placeholder="ఉదా: రాజ్ విహార్ సెంటర్ వద్ద ట్రాఫిక్ మళ్లింపు"
                    value={headlineTe}
                    onChange={(e) => setHeadlineTe(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Category *', 'వర్గం *')}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                    >
                      {['Civic', 'Development', 'Traffic', 'Culture & Tourism', 'Energy', 'General'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Location / Area in Kurnool *', 'ప్రాంతం / కూడలి *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Raj Vihar, Collectorate, C-Camp"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Photo URL (Optional)', 'వార్తా ఫోటో లింక్ (ఐచ్ఛికం)')}
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Detailed News Story (English) *', 'వార్తా వివరాలు (ఇంగ్లీష్) *')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full factual details of what occurred..."
                    value={contentEn}
                    onChange={(e) => setContentEn(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Reporter Name *', 'మీ పేరు (విలేకరి) *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. S. Srinivas"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Reporter Phone *', 'సంప్రదించాల్సిన ఫోన్ నంబర్ *')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98480XXXXX"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Accuracy Declaration */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="truth-confirm"
                    checked={truthConfirmed}
                    onChange={(e) => setTruthConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded-sm cursor-pointer"
                  />
                  <label htmlFor="truth-confirm" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer">
                    <span className="font-bold text-slate-800 block">
                      {t('Citizen Reporting Truth Declaration:', 'పౌర పాత్రికేయ నిజాయితీ ప్రకటన:')}
                    </span>
                    {t(
                      'I declare that this news report is factual and accurate to the best of my knowledge. I understand defamatory, misleading, or plagiarized content will be rejected.',
                      'ఈ వార్త వాస్తవమైనదని మరియు నా పరిజ్ఞానం మేరకు నిజమైనదని ధృవీకరిస్తున్నాను. అసత్య లేదా తప్పుదోవ పట్టించే సమాచారం తిరస్కరించబడుతుందని నేను అర్థం చేసుకున్నాను.'
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? t('Submitting Story...', 'సమర్పించబడుతోంది...') : t('Submit News for Editorial Review', 'సంపాదకీయ పరిశీలన కోసం వార్తను సమర్పించండి')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

