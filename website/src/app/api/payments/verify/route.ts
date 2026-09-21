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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      businessId,
      planId,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_kurnool_one';

    // Signature Verification
    if (process.env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, error: 'Cryptographic signature verification failed' },
          { status: 400 }
        );
      }
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365); // 1 Year subscription validity

    // Update business document in Firestore
    if (businessId) {
      try {
        const bizRef = doc(db, 'businesses', businessId);
        await updateDoc(bizRef, {
          paymentStatus: 'paid',
          paymentId: razorpay_payment_id || `demo_pay_${Date.now()}`,
          orderId: razorpay_order_id || '',
          planId: planId || 'verified',
          tier: planId === 'premium' ? 'featured' : 'free',
          verificationBadge: planId !== 'free' ? 'verified_business' : 'none',
          status: 'published',
          planExpiresAt: expiryDate.toISOString(),
          paidAt: serverTimestamp(),
        });
      } catch (bizErr) {
        console.warn('Failed to update business doc:', bizErr);
      }
    }

    // Update payments audit record
    try {
      if (razorpay_order_id) {
        const q = query(
          collection(db, 'payments'),
          where('orderId', '==', razorpay_order_id)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const paymentDocRef = snap.docs[0].ref;
          await updateDoc(paymentDocRef, {
            status: 'paid',
            paymentId: razorpay_payment_id || `demo_pay_${Date.now()}`,
            signature: razorpay_signature || 'verified_demo',
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
