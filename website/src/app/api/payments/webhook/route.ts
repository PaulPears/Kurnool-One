import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !secret) {
      return NextResponse.json(
        { success: false, error: 'Signature or secret missing' },
        { status: 400 }
      );
    }

    // Verify Razorpay HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid Razorpay webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment capture and order paid events
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || {};
      const businessId = notes.businessId;

      if (businessId) {
        try {
          const bizRef = doc(db, 'businesses', businessId);
          await updateDoc(bizRef, {
            paymentStatus: 'paid',
            status: 'published',
            paymentId: paymentId || '',
            orderId: orderId || '',
            updatedAt: serverTimestamp(),
          });
        } catch (bizErr) {
          console.error('Failed to update business status via webhook:', bizErr);
        }
      }

      // Update payment record in Firestore
      if (orderId) {
        try {
          const q = query(collection(db, 'payments'), where('orderId', '==', orderId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const paymentDocRef = doc(db, 'payments', snap.docs[0].id);
            await updateDoc(paymentDocRef, {
              status: 'captured',
              paymentId: paymentId || '',
              updatedAt: serverTimestamp(),
            });
          }
        } catch (payErr) {
          console.error('Failed to update payment record via webhook:', payErr);
        }
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Razorpay webhook handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
