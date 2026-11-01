'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MessageSquarePlus, X, CheckCircle2, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { fetchBusinessReviews, addBusinessReview, BusinessReview } from '@/services/directoryService';

interface BusinessReviewsProps {
  businessId: string;
  businessName: string;
  initialRatingAvg: number;
  initialRatingCount: number;
}

export default function BusinessReviews({
  businessId,
  businessName,
  initialRatingAvg,
  initialRatingCount,
}: BusinessReviewsProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        const revs = await fetchBusinessReviews(businessId);
        if (isMounted) {
          setReviews(revs);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) {
      setError('Please write a short comment about your experience.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addBusinessReview(
        businessId,
        user.uid,
        user.displayName || 'Kurnool Resident',
        user.photoURL || '',
        rating,
        comment.trim()
      );

      const newReview: BusinessReview = {
        id: `temp-${Date.now()}`,
        businessId,
        userId: user.uid,
        userName: user.displayName || 'Kurnool Resident',
        userPhoto: user.photoURL || '',
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      setReviews((prev) => [newReview, ...prev]);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setModalOpen(false);
        setComment('');
        setRating(5);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('Customer Reviews & Ratings', 'కస్టమర్ సమీక్షలు & రేటింగ్‌లు')}</span>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {reviews.length > 0 ? reviews.length : initialRatingCount}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t(
              'Verified citizen feedback from Kurnool community members.',
              'కర్నూలు ప్రజల ద్వారా ధృవీకరించబడిన అనుభవాలు మరియు సమీక్షలు.'
            )}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition active:scale-[0.98] cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{t('Write a Review', 'సమీక్ష రాయండి')}</span>
        </button>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="py-8 flex items-center justify-center text-slate-400 gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>{t('Loading resident reviews...', 'సమీక్షలను లోడ్ చేస్తోంది...')}</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
          <Star className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-slate-700">
            {t('No customer reviews written yet.', 'ఇంకా ఎలాంటి సమీక్షలు నమోదు కాలేదు.')}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {t(
              `Have you availed services from ${businessName}? Share your genuine rating to help fellow Kurnool citizens!`,
              `మీరు ఈ వ్యాపారం ద్వారా సేవలందించుకున్నారా? మీ నిజాయితీ సమీక్షను ఇతరులతో పంచుకోండి!`
            )}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            {t('Be the first to review', 'మొదటి సమీక్ష రాయండి')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-black">
                      {(rev.userName || 'R')[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">{rev.userName}</span>
                      <span className="block text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {!user ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {t('Sign in to leave a review', 'సమీక్ష రాయడానికి లాగిన్ అవ్వండి')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {t(
                      'To maintain authentic and spam-free ratings, a verified Kurnool One citizen account is required.',
                      'నిజమైన మరియు సురక్షితమైన రేటింగ్‌ల కోసం, మీ ఉమ్మడి కర్నూలు వన్ ఖాతా ద్వారా లాగిన్ అవ్వండి.'
                    )}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition"
                >
                  {t('Sign In Now', 'ఇప్పుడే లాగిన్ అవ్వండి')}
                </Link>
              </div>
            ) : submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-black text-slate-900">
                  {t('Thank you for your review!', 'మీ సమీక్షకు ధన్యవాదాలు!')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Your rating helps everyone in Kurnool make informed choices.', 'మీ రేటింగ్ కర్నూలు వాసులకు సరైన వ్యాపారాలను ఎంచుకోవడంలో సహాయపడుతుంది.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                    {businessName}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {t('Rate your Experience', 'మీ అనుభవాన్ని రేట్ చేయండి')}
                  </h3>
                </div>

                {/* Interactive Star Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('Overall Rating', 'మొత్తం రేటింగ్')}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-black text-slate-700">
                      {hoverRating || rating} / 5
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('Your Review / Feedback', 'మీ సమీక్ష / అభిప్రాయం')}
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t(
                      'Describe service quality, pricing, speed, staff behavior...',
                      'సేవ నాణ్యత, ధరలు, స్పందన మరియు మీ అనుభవాన్ని వివరించండి...'
                    )}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-xs text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                {error && (
                  <p className="text-xs text-rose-600 font-medium">{error}</p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{submitting ? 'Submitting...' : t('Submit Review', 'సమీక్ష సమర్పించండి')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

