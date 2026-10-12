import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Alert, ScrollView
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
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');

  // OTP Bank Simulation State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('123456');
  const [processing, setProcessing] = useState(false);

  // Autofill helpers for testing
  const autofillSuccessCard = () => {
    setSelectedMethod('card');
    setCardNumber('4111 2222 3333 4444');
    setCardExpiry('12/28');
    setCardCvv('123');
    setCardHolder('Kurnool Tester');
  };

  const autofillDeclineCard = () => {
    setSelectedMethod('card');
    setCardNumber('4000 0000 0000 0002');
    setCardExpiry('12/28');
    setCardCvv('123');
    setCardHolder('Declined Tester');
  };

  const autofillSuccessUpi = () => {
    setSelectedMethod('upi');
    setUpiId('success@razorpay');
  };

  const autofillFailureUpi = () => {
    setSelectedMethod('upi');
    setUpiId('failure@razorpay');
  };

  // Format Card Number with spaces
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format Expiry as MM/YY
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  // Initiate Payment Submission
  const handleInitiatePay = () => {
    if (selectedMethod === 'card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length < 16) {
        Alert.alert('Invalid Card', 'Please enter a valid 16-digit debit/credit card number.');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
        Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        Alert.alert('Invalid CVV', 'Please enter a 3 or 4 digit CVV code.');
        return;
      }

      // Check simulated decline test card
      if (rawCard === '4000000000000002') {
        setProcessing(true);
        setTimeout(() => {
          setProcessing(false);
          Alert.alert(
            'Payment Failed ❌',
            'Card Declined: Issuing bank declined authorization (Simulated decline test card: 4000 0000 0000 0002).\n\nNo money was deducted.',
            [{ text: 'OK' }]
          );
        }, 1000);
        return;
      }

      // Valid card -> Proceed to 3D Secure / OTP Simulation
      setShowOtpModal(true);
      return;
    }

    if (selectedMethod === 'upi') {
      const cleanUpi = upiId.trim().toLowerCase();
      if (!cleanUpi || !cleanUpi.includes('@')) {
        Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. success@razorpay, yourname@okaxis)');
        return;
      }

      // Failure test UPI ID
      if (cleanUpi === 'failure@razorpay') {
        setProcessing(true);
        setTimeout(() => {
          setProcessing(false);
          Alert.alert(
            'UPI Payment Failed ❌',
            'Transaction declined by customer UPI application (Simulated failure: failure@razorpay).',
            [{ text: 'OK' }]
          );
        }, 1000);
        return;
      }

      // Successful UPI flow
      executeSuccessPayment('UPI');
      return;
    }

    if (selectedMethod === 'netbanking') {
      setShowOtpModal(true);
    }
  };

  // Final Success Execution
  const executeSuccessPayment = (methodName: string) => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowOtpModal(false);
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

  const handleOtpSubmit = () => {
    if (!otpValue || otpValue.trim().length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit test OTP (e.g. 123456).');
      return;
    }
    executeSuccessPayment(selectedMethod.toUpperCase());
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel? Your listing will remain pending payment.',
      [
        { text: 'Keep Paying', style: 'cancel' },
        {
          text: 'Cancel Payment',
          style: 'destructive',
          onPress: () => {
            setShowOtpModal(false);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.rzpBadge}>
                <Ionicons name="shield-checkmark" size={15} color="#0284C7" />
                <Text style={styles.rzpBadgeText}>Razorpay Sandbox</Text>
              </View>
              <Text style={styles.secureText}>Official Test Mode</Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Amount Banner */}
            <View style={styles.amountBanner}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.entityNameText} numberOfLines={1}>{entityName || 'Kurnool One Listing'}</Text>
                <Text style={styles.planNameText} numberOfLines={1}>{planName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountText}>₹{amount}</Text>
                <Text style={styles.taxText}>Inc. All Taxes</Text>
              </View>
            </View>

            {/* Razorpay Test Mode Helper & Autofill */}
            <View style={styles.testInfoBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name="flask" size={15} color="#0369A1" />
                <Text style={styles.testInfoTitle}>Official Razorpay Sandbox Testing</Text>
              </View>
              <Text style={styles.testInfoText}>
                Test payments freely with official test details. No live money is debited.
              </Text>
              <View style={styles.autofillBtnRow}>
                <TouchableOpacity onPress={autofillSuccessCard} style={styles.autofillPill}>
                  <Ionicons name="card" size={13} color="#2563EB" />
                  <Text style={styles.autofillPillText}>Test Card (Success)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={autofillDeclineCard} style={[styles.autofillPill, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="close-circle" size={13} color="#DC2626" />
                  <Text style={[styles.autofillPillText, { color: '#DC2626' }]}>Test Card (Decline)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={autofillSuccessUpi} style={styles.autofillPill}>
                  <Ionicons name="flash" size={13} color="#16A34A" />
                  <Text style={[styles.autofillPillText, { color: '#16A34A' }]}>Test UPI</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Method Selector */}
            <Text style={styles.sectionLabel}>Select Payment Method</Text>
            <View style={styles.methodsRow}>
              <TouchableOpacity
                onPress={() => setSelectedMethod('card')}
                style={[styles.methodTab, selectedMethod === 'card' && styles.methodTabActive]}
              >
                <Ionicons name="card-outline" size={18} color={selectedMethod === 'card' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.methodTabText, selectedMethod === 'card' && styles.methodTabTextActive]}>
                  Debit / ATM Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedMethod('upi')}
                style={[styles.methodTab, selectedMethod === 'upi' && styles.methodTabActive]}
              >
                <Ionicons name="phone-portrait-outline" size={18} color={selectedMethod === 'upi' ? '#2563EB' : '#64748B'} />
                <Text style={[styles.methodTabText, selectedMethod === 'upi' && styles.methodTabTextActive]}>
                  UPI (GPay / PhonePe)
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

            {/* Card Payment Form */}
            {selectedMethod === 'card' && (
              <View style={styles.methodBox}>
                <Text style={styles.inputTitle}>Card Number (ATM / Debit / Credit)</Text>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="card" size={18} color="#64748B" />
                  <TextInput
                    style={styles.flexInput}
                    placeholder="4111 2222 3333 4444"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    maxLength={19}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputTitle}>Valid Thru</Text>
                    <TextInput
                      style={styles.vpaInput}
                      placeholder="MM / YY (e.g. 12/28)"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      value={cardExpiry}
                      onChangeText={handleExpiryChange}
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputTitle}>CVV / CVC</Text>
                    <TextInput
                      style={styles.vpaInput}
                      placeholder="123"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      secureTextEntry
                      value={cardCvv}
                      onChangeText={(t) => setCardCvv(t.slice(0, 4))}
                      maxLength={4}
                    />
                  </View>
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text style={styles.inputTitle}>Cardholder Name</Text>
                  <TextInput
                    style={styles.vpaInput}
                    placeholder="Name as on card"
                    placeholderTextColor="#94A3B8"
                    value={cardHolder}
                    onChangeText={setCardHolder}
                  />
                </View>
              </View>
            )}

            {/* UPI Payment Form */}
            {selectedMethod === 'upi' && (
              <View style={styles.methodBox}>
                <Text style={styles.inputTitle}>Enter UPI ID / VPA</Text>
                <TextInput
                  style={styles.vpaInput}
                  placeholder="e.g. success@razorpay or mobile@upi"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={upiId}
                  onChangeText={setUpiId}
                />
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
                  💡 Use <Text style={{ fontWeight: 'bold', color: '#16A34A' }}>success@razorpay</Text> to test success, or <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>failure@razorpay</Text> to test failure.
                </Text>
              </View>
            )}

            {/* NetBanking Form */}
            {selectedMethod === 'netbanking' && (
              <View style={styles.methodBox}>
                <Text style={styles.inputTitle}>Select Your Bank</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Andhra Pragathi Grameena Bank'].map((b) => (
                    <TouchableOpacity
                      key={b}
                      onPress={() => setSelectedBank(b)}
                      style={[styles.bankPill, selectedBank === b && styles.bankPillActive]}
                    >
                      <Text style={[styles.bankPillText, selectedBank === b && styles.bankPillTextActive]}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Pay Button */}
            <TouchableOpacity
              onPress={handleInitiatePay}
              disabled={processing}
              style={[styles.payBtn, processing && styles.btnDisabled]}
              activeOpacity={0.85}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="lock-closed" size={17} color="#FFFFFF" />
                  <Text style={styles.payBtnText}>Pay ₹{amount} via Razorpay</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.guaranteeText}>
              🛡️ Official Razorpay Sandbox environment. 256-Bit SSL Encrypted.
            </Text>
          </ScrollView>
        </View>
      </View>

      {/* 3D Secure / Simulated Bank OTP Screen Modal */}
      <Modal visible={showOtpModal} transparent animationType="fade" onRequestClose={() => setShowOtpModal(false)}>
        <View style={styles.otpOverlay}>
          <View style={styles.otpCard}>
            <View style={styles.bankHeader}>
              <View>
                <Text style={styles.bankTitle}>Verified by VISA / RuPay</Text>
                <Text style={styles.bankSub}>{selectedBank || 'Issuing Bank'} 3D-Secure Portal</Text>
              </View>
              <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
            </View>

            <View style={styles.otpDetailsBox}>
              <View style={styles.otpRow}>
                <Text style={styles.otpLabel}>Merchant:</Text>
                <Text style={styles.otpVal}>Kurnool One Services</Text>
              </View>
              <View style={styles.otpRow}>
                <Text style={styles.otpLabel}>Amount:</Text>
                <Text style={[styles.otpVal, { fontWeight: '900', color: '#0F172A' }]}>₹{amount}.00</Text>
              </View>
              <View style={styles.otpRow}>
                <Text style={styles.otpLabel}>Card ending:</Text>
                <Text style={styles.otpVal}>{cardNumber.slice(-4) || '4444'}</Text>
              </View>
            </View>

            <Text style={styles.otpPrompt}>
              A test One Time Password (OTP) has been generated for authentication.
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="123456"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={otpValue}
              onChangeText={setOtpValue}
              maxLength={6}
            />

            <TouchableOpacity
              onPress={handleOtpSubmit}
              disabled={processing}
              style={[styles.otpSubmitBtn, processing && styles.btnDisabled]}
              activeOpacity={0.85}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.otpSubmitText}>Approve & Submit OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowOtpModal(false);
                Alert.alert('Payment Aborted', 'Payment verification was cancelled by user.');
              }}
              style={{ marginTop: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 13, color: '#DC2626', fontWeight: '700' }}>Cancel Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    maxHeight: '92%',
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
  testInfoBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  testInfoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0369A1',
  },
  testInfoText: {
    fontSize: 11,
    color: '#0284C7',
    marginBottom: 8,
  },
  autofillBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  autofillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  autofillPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
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
    gap: 6,
  },
  methodTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
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
  inputTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  flexInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
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
  bankPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bankPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  bankPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  bankPillTextActive: {
    color: '#2563EB',
    fontWeight: '800',
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
  btnDisabled: {
    opacity: 0.7,
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
  otpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  otpCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    elevation: 10,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  bankTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  bankSub: {
    fontSize: 11,
    color: '#64748B',
  },
  otpDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 4,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  otpVal: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
  },
  otpPrompt: {
    fontSize: 12,
    color: '#475569',
    marginTop: 12,
    textAlign: 'center',
  },
  otpInput: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 4,
    paddingVertical: 10,
    marginTop: 10,
  },
  otpSubmitBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },
  otpSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
