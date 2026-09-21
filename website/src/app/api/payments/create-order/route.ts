import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  // Business Plans
  biz_monthly: { amount: 19900, name: 'Business Listing (Monthly - ₹199)' },
  biz_half_yearly: { amount: 99900, name: 'Business Listing (6 Months - ₹999)' },
  biz_yearly: { amount: 200000, name: 'Business Listing (1 Year - ₹2,000)' },

  // Personal Profile Plans
  pro_monthly: { amount: 9900, name: 'Personal Profile (Monthly - ₹99)' },
  pro_half_yearly: { amount: 50000, name: 'Personal Profile (6 Months - ₹500)' },
  pro_yearly: { amount: 90000, name: 'Personal Profile (1 Year - ₹900)' },

  // Event Promotion Plan
  event_listing: { amount: 299900, name: 'Kurnool Event Listing (Flat ₹2,999)' },

  // Backward compatibility mappings
  monthly: { amount: 19900, name: 'Business Listing (Monthly - ₹199)' },
  half_yearly: { amount: 99900, name: 'Business Listing (6 Months - ₹999)' },
  yearly: { amount: 200000, name: 'Business Listing (1 Year - ₹2,000)' },
  verified: { amount: 99900, name: 'Business Listing (6 Months - ₹999)' },
  premium: { amount: 200000, name: 'Business Listing (1 Year - ₹2,000)' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, businessId, businessName, phone, email } = body;

    if (!planId || !PLAN_PRICES[planId]) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const plan = PLAN_PRICES[planId];
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_kurnool_one';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_kurnool_one';

    let orderId = '';

    // If live/test credentials exist, call Razorpay API
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: plan.amount,
        currency: 'INR',
        receipt: `rcpt_${businessId ? businessId.slice(-8) : Date.now().toString().slice(-8)}`,
        notes: {
          businessId: businessId || '',
          businessName: businessName || '',
          planId: planId,
        },
      });
      orderId = order.id;
    } else {
      // Test/Demo fallback order ID
      orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    // Record order initiation in Firestore
    try {
      await addDoc(collection(db, 'payments'), {
        orderId,
        businessId: businessId || '',
        businessName: businessName || '',
        planId,
        planName: plan.name,
        amount: plan.amount / 100,
        currency: 'INR',
        status: 'created',
        phone: phone || '',
        email: email || '',
        createdAt: serverTimestamp(),
      });
    } catch (dbErr) {
      console.warn('Could not log payment order to Firestore:', dbErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: plan.amount,
      currency: 'INR',
      keyId,
      planName: plan.name,
    });
  } catch (error: any) {
    console.error('create-order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
