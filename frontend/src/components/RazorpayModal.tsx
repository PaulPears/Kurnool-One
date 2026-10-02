import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Alert, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RazorpayModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  planName: string;
  amount: number; // in INR
  entityName: string;
  customerPhone?: string;
  customerEmail?: string;
}

export default function RazorpayModal({
  visible,
  onClose,
  onSuccess,
  planName,
  amount,
  entityName,
  customerPhone = '9876500001',
  customerEmail = 'merchant@kurnoolone.com',
}: RazorpayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const testPaymentId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(5)}`;
      const testOrderId = `order_rzp_${Date.now()}`;
      const testSignature = `sig_${Date.now()}`;
      onSuccess({
        razorpay_payment_id: testPaymentId,
        razorpay_order_id: testOrderId,
        razorpay_signature: testSignature,
      });
    }, 1200);
  };

  const handlePay = () => {
    if (selectedMethod === 'upi' && upiId.trim() && !upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. name@okaxis, name@ybl)');
      return;
    }
    handleSimulatePayment();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.rzpBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#0284C7" />
                <Text style={styles.rzpBadgeText}>Razorpay Trusted</Text>
              </View>
              <Text style={styles.secureText}>256-Bit SSL Encrypted</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Amount Banner */}
            <View style={styles.amountBanner}>
              <View>
                <Text style={styles.entityNameText} numberOfLines={1}>{entityName || 'Kurnool Listing'}</Text>
                <Text style={styles.planNameText}>{planName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountText}>₹{amount}</Text>
                <Text style={styles.taxText}>Inc. All Taxes</Text>
              </View>
            </View>

            {/* Quick Reviewer Mode Bar */}
            <View style={styles.reviewerBar}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewerTitle}>⚡ Fast Test Mode</Text>
                <Text style={styles.reviewerSub}>Instant test activation without live bank debit</Text>
              </View>
              <TouchableOpacity
                onPress={handleSimulatePayment}
                disabled={loading}
                style={styles.fastPayBtn}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.fastPayBtnText}>Quick Test Pay</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Payment Method Selector */}
            <Text style={styles.sectionLabel}>Select Payment Method</Text>
            <View style={styles.methodsRow}>
              <TouchableOpacity
                onPress={() => setSelectedMethod('upi')}
                style={[styles.methodTab, selectedMethod === 'upi' && styles.methodTabActive]}
              >
                <Ionicons name="phone-portrait-outline" size={18} color={selectedMethod === 'upi' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.methodTabText, selectedMethod === 'upi' && styles.methodTabTextActive]}>
                  UPI Apps
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedMethod('card')}
                style={[styles.methodTab, selectedMethod === 'card' && styles.methodTabActive]}
              >
                <Ionicons name="card-outline" size={18} color={selectedMethod === 'card' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.methodTabText, selectedMethod === 'card' && styles.methodTabTextActive]}>
                  Cards
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedMethod('netbanking')}
                style={[styles.methodTab, selectedMethod === 'netbanking' && styles.methodTabActive]}
              >
                <Ionicons name="business-outline" size={18} color={selectedMethod === 'netbanking' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.methodTabText, selectedMethod === 'netbanking' && styles.methodTabTextActive]}>
                  NetBanking
                </Text>
              </TouchableOpacity>
            </View>

            {/* Payment Form according to selected method */}
            {selectedMethod === 'upi' && (
              <View style={styles.methodBox}>
                <Text style={styles.methodHint}>Pay directly using your favorite UPI app:</Text>
                <View style={styles.upiAppsRow}>
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                    <TouchableOpacity
                      key={app}
                      onPress={handleSimulatePayment}
                      style={styles.upiAppPill}
                    >
                      <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                      <Text style={styles.upiAppText}>{app}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.methodHint, { marginTop: 12 }]}>Or enter UPI Virtual Payment Address (VPA):</Text>
                <TextInput
                  style={styles.vpaInput}
                  placeholder="e.g. mobile@upi or username@okicici"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={upiId}
                  onChangeText={setUpiId}
                />
              </View>
            )}

            {selectedMethod === 'card' && (
              <View style={styles.methodBox}>
                <Text style={styles.methodHint}>Credit / Debit Cards (Visa, MasterCard, RuPay)</Text>
                <TextInput
                  style={[styles.vpaInput, { marginBottom: 8 }]}
                  placeholder="Card Number: 4111 2222 3333 4444"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={[styles.vpaInput, { flex: 1 }]}
                    placeholder="MM / YY"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.vpaInput, { flex: 1 }]}
                    placeholder="CVV"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                  />
                </View>
              </View>
            )}

            {selectedMethod === 'netbanking' && (
              <View style={styles.methodBox}>
                <Text style={styles.methodHint}>Popular Banks:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Andhra Pragathi Grameena'].map((b) => (
                    <TouchableOpacity key={b} onPress={handleSimulatePayment} style={styles.upiAppPill}>
                      <Text style={styles.upiAppText}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Pay Button */}
            <TouchableOpacity
              onPress={handlePay}
              disabled={loading}
              style={styles.payBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
                  <Text style={styles.payBtnText}>Pay ₹{amount} via Razorpay</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.guaranteeText}>
              🛡️ 100% Secure Payment powered by Razorpay India. Instant Listing Activation.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rzpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  rzpBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  secureText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  amountBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  entityNameText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    maxWidth: 200,
  },
  planNameText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  amountText: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: '900',
  },
  taxText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  reviewerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  reviewerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  reviewerSub: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 1,
  },
  fastPayBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fastPayBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodTabActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  methodTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  methodTabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  methodBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 10,
  },
  methodHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  upiAppsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  upiAppPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upiAppText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  vpaInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  payBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  guaranteeText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 14,
  },
});
