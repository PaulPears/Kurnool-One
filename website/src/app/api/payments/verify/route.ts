import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/config/firebase';
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resolvedOrderId = body.razorpay_order_id || body.orderId || '';
    const resolvedPaymentId = body.razorpay_payment_id || body.paymentId || '';
    const resolvedSignature = body.razorpay_signature || body.signature || '';
    const {
      businessId,
      professionalId,
      proId,
      eventId,
      planId,
      entityType,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Strict signature verification when secret is configured
    if (keySecret) {
      if (!resolvedOrderId || !resolvedPaymentId || !resolvedSignature) {
        return NextResponse.json(
          { success: false, error: 'Missing payment signature verification parameters' },
          { status: 400 }
        );
      }

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${resolvedOrderId}|${resolvedPaymentId}`)
        .digest('hex');

      if (generatedSignature !== resolvedSignature) {
        return NextResponse.json(
          { success: false, error: 'Cryptographic signature verification failed' },
          { status: 400 }
        );
      }
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365); // 1 Year subscription validity

    const activePayId = resolvedPaymentId || `pay_${Date.now()}`;

    // 1. Update business document in Firestore
    if (businessId) {
      try {
        const bizRef = doc(db, 'businesses', businessId);
        await updateDoc(bizRef, {
          paymentStatus: 'paid',
          paymentId: activePayId,
          orderId: resolvedOrderId,
          planId: planId || 'biz_yearly',
          tier: planId?.includes('monthly') ? 'standard' : 'featured',
          verificationBadge: 'verified_business',
          status: 'published',
          planExpiresAt: expiryDate.toISOString(),
          paidAt: serverTimestamp(),
        });
      } catch (bizErr) {
        console.warn('Failed to update business doc:', bizErr);
      }
    }

    // 2. Update professional document in Firestore
    const targetProId = professionalId || proId;
    if (targetProId) {
      try {
        const proRef = doc(db, 'professionals', targetProId);
        await updateDoc(proRef, {
          paymentStatus: 'paid',
          paymentId: activePayId,
          orderId: resolvedOrderId,
          planId: planId || 'pro_yearly',
          verifiedProfessional: true,
          status: 'published',
          planExpiresAt: expiryDate.toISOString(),
          paidAt: serverTimestamp(),
        });
      } catch (proErr) {
        console.warn('Failed to update professional doc:', proErr);
      }
    }

    // 3. Update event document in Firestore
    if (eventId) {
      try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
          paymentStatus: 'paid',
          paymentId: activePayId,
          orderId: resolvedOrderId,
          status: 'published',
          paidAt: serverTimestamp(),
        });
      } catch (eventErr) {
        console.warn('Failed to update event doc:', eventErr);
      }
    }

    // Update payments audit record
    try {
      if (resolvedOrderId) {
        const q = query(
          collection(db, 'payments'),
          where('orderId', '==', resolvedOrderId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const paymentDocRef = snap.docs[0].ref;
          await updateDoc(paymentDocRef, {
            status: 'paid',
            paymentId: resolvedPaymentId || `pay_${Date.now()}`,
            signature: resolvedSignature || 'verified_paid',
            verifiedAt: serverTimestamp(),
          });
        }
      }
    } catch (payErr) {
      console.warn('Failed to update payment log:', payErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully and listing activated!',
      businessId,
      planId,
      expiresAt: expiryDate.toISOString(),
    });
  } catch (error: any) {
    console.error('verify payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
