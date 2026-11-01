'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Phone,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  ArrowLeft,
  X,
  Share2,
} from 'lucide-react';
import {
  fetchBloodDonors,
  registerBloodDonor,
  BloodDonorItem,
  SEED_BLOOD_DONORS,
} from '@/services/directoryService';
import { useLanguage } from '@/context/LanguageContext';

const BLOOD_GROUPS = ['All', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

export default function BloodDonorsPage() {
  const { language, t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [donors, setDonors] = useState<BloodDonorItem[]>(SEED_BLOOD_DONORS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Register Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    loadDonors();
  }, [selectedGroup]);

  const loadDonors = async () => {
    setLoading(true);
    try {
      const data = await fetchBloodDonors(selectedGroup);
      setDonors(data && data.length > 0 ? data : SEED_BLOOD_DONORS);
    } catch (err) {
      console.error(err);
      setDonors(SEED_BLOOD_DONORS);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !area.trim()) {
      alert(t('Please fill in Name, Phone, and Area.', 'దయచేసి పేరు, ఫోన్ నంబర్ మరియు ప్రాంతాన్ని నమోదు చేయండి.'));
      return;
    }
    if (!dpdpConsent) {
      alert(t('Please accept the voluntary donor consent under DPDP Act 2023.', 'దయచేసి DPDP చట్టం 2023 కింద స్వచ్ఛంద రక్తదాత సమ్మతిని ఆమోదించండి.'));
      return;
    }

    setSubmitting(true);
    try {
      await registerBloodDonor({
        displayName: fullName.trim(),
        bloodGroup,
        phone: phone.trim(),
        showPhonePublicly: true,
        area: area.trim(),
        availability: 'available',
        notes: notes.trim() || 'Available for emergency requests',
        status: 'active',
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setModalOpen(false);
        setFullName('');
        setPhone('');
        setArea('');
        setNotes('');
        setDpdpConsent(false);
        loadDonors();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert(t('Registration failed. Please try again.', 'నమోదు విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDonors = donors.filter((d) => {
    const matchesGroup = selectedGroup === 'All' || d.bloodGroup === selectedGroup;
    const matchesQuery =
      !searchQuery ||
      d.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-700 via-red-600 to-rose-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 text-rose-200 animate-pulse" />
            <span>{t('Kurnool Emergency Blood Network', 'కర్నూలు అత్యవసర రక్తదాతల నెట్‌వర్క్')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {t('Urgent Need for Blood in Kurnool?', 'కర్నూలులో రక్తం అత్యవసరమా?')}
          </h1>

          <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
            {t(
              'Connect directly with volunteer life-savers across Kurnool City by blood group. 100% voluntary, zero middlemen.',
              'రక్త గ్రూపుల వారీగా కర్నూలు నగరంలోని స్వచ్ఛంద దాతలతో నేరుగా సంప్రదించండి. 100% స్వచ్ఛందం, మధ్యవర్తులు లేరు.'
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-sm shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-rose-600" />
              <span>{t('Register as a Volunteer Donor', 'స్వచ్ఛంద రక్తదాతగా నమోదు చేసుకోండి')}</span>
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

        {/* Civic Medical Disclaimer Banner */}
        <div className="mt-8 p-4 bg-rose-950/60 border border-rose-400/30 rounded-2xl flex items-start gap-3 text-xs text-rose-100 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase tracking-wider block mb-0.5">
              {t('Civic Medical Disclaimer & Patient Safety:', 'పౌర వైద్య హెచ్చరిక & రోగుల భద్రత:')}
            </span>
            {t(
              'Kurnool One provides a volunteer contact directory only. We are not a blood bank or clinical authority. Verify donor eligibility, health screenings, and cross-matching directly with certified hospital blood banks (e.g. Kurnool General Hospital / Red Cross) before transfusion.',
              'కర్నూలు వన్ స్వచ్ఛంద సంప్రదింపు డైరెక్టరీని మాత్రమే అందిస్తుంది. మేము బ్లడ్ బ్యాంక్ లేదా క్లినికల్ అథారిటీ కాదు. రక్తం తీసుకునే ముందు సర్టిఫైడ్ హాస్పిటల్ బ్లడ్ బ్యాంకుల ద్వారా దాతల ఆరోగ్యం మరియు సరిపోలికను నిర్ధారించుకోండి.'
            )}
          </div>
        </div>
      </div>

      {/* Blood Group Filter Chips & Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {t('Filter by Blood Group', 'రక్త గ్రూప్ వారీగా ఫిల్టర్ చేయండి')}
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('Search by area, donor name...', 'ప్రాంతం లేదా దాత పేరు శోధించండి...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
            />
          </div>
        </div>

        {/* Group Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BLOOD_GROUPS.map((group) => {
            const isActive = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-100'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>
      </div>

      {/* Donors Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">{t('Finding verified donors in Kurnool...', 'కర్నూలులో రక్తదాతల వివరాలు సేకరిస్తున్నాము...')}</p>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <HeartPulse className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-lg">
            {t('No donors found for this blood group yet.', 'ఈ బ్లడ్ గ్రూప్‌కు ఇంకా దాతలు నమోదు కాలేదు.')}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t(
              'Be the first to step up for your fellow citizens in Kurnool. Register as a life saver today.',
              'కర్నూలు నగర ప్రజలకు సహాయపడేందుకు మీరే మొదటి రక్తదాతగా నమోదు చేసుకోండి.'
            )}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-rose-100"
          >
            {t('Register as a Donor', 'రక్తదాతగా నమోదు చేయండి')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => (
            <div
              key={donor.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{donor.displayName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{donor.area}</span>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-2xl bg-rose-600 text-white font-black text-sm shadow-sm tracking-wide">
                    {donor.bloodGroup}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('Available for Emergency', 'అత్యవసర సమయాల్లో అందుబాటులో')}</span>
                </div>

                {donor.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic">
                    "{donor.notes}"
                  </p>
                )}
              </div>

              {/* Call Action */}
              <div className="pt-3 border-t border-slate-100">
                <a
                  href={`tel:${donor.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('Call Life Saver Directly', 'రక్తదాతకు నేరుగా కాల్ చేయండి')}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volunteer Donor Registration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase">
                <HeartPulse className="w-4 h-4" />
                <span>{t('Save Lives in Kurnool', 'కర్నూలులో ప్రాణాలను కాపాడండి')}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {t('Register as a Volunteer Blood Donor', 'స్వచ్ఛంద రక్తదాతగా నమోదు చేసుకోండి')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'Your contact info will only be shared with verified patients requiring emergency blood transfusions in Kurnool.',
                  'మీ వివరాలు కర్నూలులో అత్యవసర రక్తం అవసరమైన రోగులకు మాత్రమే అందుబాటులో ఉంటాయి.'
                )}
              </p>
            </div>

            {successMsg ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-emerald-900 text-base">
                  {t('Thank You for Registering!', 'నమోదు చేసుకున్నందుకు ధన్యవాదాలు!')}
                </h4>
                <p className="text-xs text-emerald-700">
                  {t('Your volunteer profile is now active on Kurnool One.', 'మీ ప్రొఫైల్ ఇప్పుడు కర్నూలు వన్‌లో ప్రత్యక్షమైంది.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Full Name *', 'పూర్తి పేరు *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('e.g. Praveen Kumar', 'ఉదా: ప్రవీణ్ కుమార్')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Blood Group *', 'రక్త గ్రూప్ *')}
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-rose-500 bg-white"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('Mobile Number *', 'మొబైల్ నంబర్ *')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98480XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Residential Area / Colony in Kurnool *', 'కర్నూలులోని ప్రాంతం / కాలనీ *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('e.g. Gayatri Estate / Nandyal Checkpost', 'ఉదా: గాయత్రి ఎస్టేట్ / నంద్యాల చెక్ పోస్ట్')}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Availability Notes (Optional)', 'అందుబాటు సమయాలు (ఐచ్ఛికం)')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('e.g. Available after 5 PM, weekends, or emergency calls', 'ఉదా: సాయంత్రం 5 తర్వాత లేదా అత్యవసర కాల్స్‌కు అందుబాటులో ఉంటాను')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                {/* Legal DPDP Act Consent */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="dpdp-consent"
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 text-rose-600 rounded-sm cursor-pointer"
                  />
                  <label htmlFor="dpdp-consent" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer">
                    <span className="font-bold text-slate-800 block">
                      {t('Voluntary Donor Consent (DPDP Act 2023):', 'స్వచ్ఛంద రక్తదాత సమ్మతి (DPDP చట్టం 2023):')}
                    </span>
                    {t(
                      'I voluntarily register as a blood donor in Kurnool City. I consent to having my phone number publicly displayed to patients and certified caregivers requiring emergency blood transfusions.',
                      'నేను స్వచ్ఛందంగా రక్తదాతగా నమోదు చేసుకుంటున్నాను. కర్నూలులో రక్తం అత్యవసరమైన రోగుల కోసం నా సంప్రదింపు నంబర్‌ను పబ్లిక్‌గా ప్రదర్శించడానికి నేను సమ్మతిస్తున్నాను.'
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md shadow-rose-200 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? t('Registering...', 'నమోదు అవుతోంది...') : t('Confirm & Submit Donor Registration', 'రక్తదాతగా నమోదును నిర్ధారించండి')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

