'use client';

import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, Share2, Check } from 'lucide-react';
import { recordCustomerLead } from '@/services/directoryService';
import { useAuth } from '@/context/AuthContext';

interface ProfessionalActionButtonsProps {
  proId: string;
  phone: string;
  whatsapp?: string;
  fullName: string;
  category: string;
  targetOwnerUid?: string;
}

export default function ProfessionalActionButtons({
  proId,
  phone,
  whatsapp,
  fullName,
  category,
  targetOwnerUid,
}: ProfessionalActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!proId) return;
    const sessionKey = `viewed_pro_${proId}`;
    if (!sessionStorage.getItem(sessionKey)) {
      recordCustomerLead({
        targetId: proId,
        targetType: 'professional',
        targetOwnerUid,
        targetName: fullName,
        actionType: 'view',
        citizenUid: user?.uid,
        citizenName: user?.displayName || 'Kurnool Resident',
        citizenPhone: user?.phoneNumber || '',
      });
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [proId, fullName, targetOwnerUid, user]);

  const handleCall = () => {
    recordCustomerLead({
      targetId: proId,
      targetType: 'professional',
      targetOwnerUid,
      targetName: fullName,
      actionType: 'call',
      citizenUid: user?.uid,
      citizenName: user?.displayName || 'Kurnool Resident',
      citizenPhone: user?.phoneNumber || '',
    });
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = () => {
    recordCustomerLead({
      targetId: proId,
      targetType: 'professional',
      targetOwnerUid,
      targetName: fullName,
      actionType: 'whatsapp',
      citizenUid: user?.uid,
      citizenName: user?.displayName || 'Kurnool Resident',
      citizenPhone: user?.phoneNumber || '',
    });
    const cleanNumber = (whatsapp || phone).replace(/[^0-9]/g, '');
    const waNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
      `Hello ${fullName}, I found your ${category} profile on Kurnool One and would like to inquire about your services.`
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fullName} - ${category} in Kurnool | Kurnool One`,
          text: `Need a ${category} in Kurnool? Check out ${fullName} on Kurnool One!`,
          url,
        });
      } catch {
        // Share cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Clipboard error
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
      <button
        onClick={handleCall}
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-95 transition"
      >
        <Phone className="w-4 h-4 fill-current" />
        <span>Call Directly ({phone})</span>
      </button>

      <button
        onClick={handleWhatsApp}
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition"
      >
        <MessageCircle className="w-4 h-4 fill-current" />
        <span>WhatsApp Connect</span>
      </button>

      <button
        onClick={handleShare}
        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm active:scale-95 transition"
        title="Share Profile"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-slate-600" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}

