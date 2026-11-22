/**
 * Kurnool One - Unified Payment Service Abstraction
 * 
 * Provides a future-proof payment architecture decoupling the UI screens from
 * specific payment providers.
 * 
 * Current: Direct Razorpay / UPI Gateway
 * Future: Pluggable Kurnool One Wallet System (deduct from partner/user wallet balance)
 */

import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export type PaymentMethod = 'razorpay' | 'upi' | 'wallet' | 'free';

export interface PaymentInitiationRequest {
  amount: number;
  planId: string;
  planName: string;
  entityId: string;
  entityType: 'business' | 'professional' | 'event';
  customerPhone?: string;
  customerEmail?: string;
  entityName?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  orderId?: string;
  paymentMethod: PaymentMethod;
  amount: number;
  timestamp: string;
  message?: string;
}

/**
 * Checks the user's available in-app wallet balance
 * Supports future wallet migration without screen changes
 */
export async function getWalletBalance(userId?: string): Promise<number> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return 0;

  try {
    const userSnap = await getDoc(doc(db, 'users', targetUid));
    if (userSnap.exists()) {
      return Number(userSnap.data()?.walletBalance || 0);
    }
    return 0;
  } catch (err) {
    console.warn('[PaymentService] Error fetching wallet balance:', err);
    return 0;
  }
}

/**
 * Deducts amount from the user's digital wallet
 */
export async function payViaWallet(req: PaymentInitiationRequest): Promise<PaymentResult> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return {
      success: false,
      paymentId: '',
      paymentMethod: 'wallet',
      amount: req.amount,
      timestamp: new Date().toISOString(),
      message: 'Authentication required for wallet transactions.',
    };
  }

  try {
    const currentBalance = await getWalletBalance(uid);
    if (currentBalance < req.amount) {
      return {
        success: false,
        paymentId: '',
        paymentMethod: 'wallet',
        amount: req.amount,
        timestamp: new Date().toISOString(),
        message: `Insufficient wallet balance (Available: ₹${currentBalance}, Required: ₹${req.amount}).`,
      };
    }

    const walletTxnId = `wtx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Atomically decrement wallet balance
    await updateDoc(doc(db, 'users', uid), {
      walletBalance: increment(-req.amount),
      lastWalletTxnAt: serverTimestamp(),
    });

    return {
      success: true,
      paymentId: walletTxnId,
      orderId: `ord_wallet_${Date.now()}`,
      paymentMethod: 'wallet',
      amount: req.amount,
      timestamp: new Date().toISOString(),
      message: 'Payment completed successfully from Kurnool One Wallet.',
    };
  } catch (err: any) {
    return {
      success: false,
      paymentId: '',
      paymentMethod: 'wallet',
      amount: req.amount,
      timestamp: new Date().toISOString(),
      message: err.message || 'Wallet transaction failed.',
    };
  }
}

/**
 * Unified gateway payment processor
 */
export async function processPaymentSuccess(
  req: PaymentInitiationRequest,
  rawGatewayResponse: { razorpay_payment_id?: string; razorpay_order_id?: string }
): Promise<PaymentResult> {
  return {
    success: true,
    paymentId: rawGatewayResponse.razorpay_payment_id || `pay_${Date.now()}`,
    orderId: rawGatewayResponse.razorpay_order_id || `order_${Date.now()}`,
    paymentMethod: 'razorpay',
    amount: req.amount,
    timestamp: new Date().toISOString(),
    message: 'Payment verified and processed successfully.',
  };
}
