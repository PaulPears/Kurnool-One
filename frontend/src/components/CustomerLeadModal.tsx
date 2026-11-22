import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

export const LEAD_USER_KEY = '@kurnool_lead_user';

interface CustomerLeadModalProps {
  visible: boolean;
  targetName: string;
  actionType: 'call' | 'whatsapp';
  onClose: () => void;
  onSubmit: (customerName: string, customerPhone: string) => void;
}

export default function CustomerLeadModal({
  visible,
  targetName,
  actionType,
  onClose,
  onSubmit,
}: CustomerLeadModalProps) {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    if (cleanName.length < 2) {
      setError(language === 'en' ? 'Please enter your name' : 'దయచేసి మీ పేరును నమోదు చేయండి');
      return;
    }
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setError(
        language === 'en'
          ? 'Enter a valid 10-digit mobile number'
          : 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి'
      );
      return;
    }

    setSaving(true);
    try {
      // Save locally so the user only enters this once
      await AsyncStorage.setItem(
        LEAD_USER_KEY,
        JSON.stringify({ name: cleanName, phone: cleanPhone })
      );
      setError('');
      onSubmit(cleanName, cleanPhone);
    } catch {
      onSubmit(cleanName, cleanPhone);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={[styles.iconWrap, { backgroundColor: actionType === 'whatsapp' ? '#ECFDF5' : '#EFF6FF' }]}>
                <Ionicons
                  name={actionType === 'whatsapp' ? 'logo-whatsapp' : 'call'}
                  size={20}
                  color={actionType === 'whatsapp' ? '#059669' : '#2563EB'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {actionType === 'whatsapp'
                    ? (language === 'en' ? 'Direct WhatsApp Inquiry' : 'వాట్సాప్ సంప్రదింపు')
                    : (language === 'en' ? 'Direct Call Callback' : 'కాల్ సంప్రదింపు')}
                </Text>
                <Text style={styles.subTitle} numberOfLines={1}>
                  {targetName}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Explanation */}
          <Text style={styles.description}>
            {language === 'en'
              ? 'Enter your name and mobile number so the listing can save your inquiry and call you back directly if line is busy.'
              : 'వ్యాపారి మీ సమాచారాన్ని నమోదు చేసుకుని, బిజీగా ఉన్నప్పుడు తిరిగి కాల్ చేయడానికి మీ పేరు మరియు ఫోన్ నంబర్ ఇవ్వండి.'}
          </Text>

          {/* Form */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {language === 'en' ? 'Your Name *' : 'మీ పేరు *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'en' ? 'e.g. Ramesh Reddy' : 'ఉదా. రమేష్ రెడ్డి'}
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={t => {
                setName(t);
                if (error) setError('');
              }}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {language === 'en' ? 'Mobile Number *' : 'మొబైల్ నంబర్ *'}
            </Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+91</Text>
              </View>
              <TextInput
                style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                placeholder="9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={t => {
                  setPhone(t.replace(/[^0-9]/g, ''));
                  if (error) setError('');
                }}
                maxLength={10}
              />
            </View>
          </View>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          {/* Consent / DPDP & Play Store compliance note */}
          <View style={styles.consentWrap}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.consentText}>
              {language === 'en'
                ? 'Your number is shared only with this listing for direct callback.'
                : 'మీ నంబర్ ఈ వ్యాపార సంప్రదింపు కోసం మాత్రమే ఉపయోగించబడుతుంది.'}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            style={[
              styles.submitBtn,
              { backgroundColor: actionType === 'whatsapp' ? '#059669' : '#2563EB' },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name={actionType === 'whatsapp' ? 'logo-whatsapp' : 'call'}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.submitBtnText}>
                  {actionType === 'whatsapp'
                    ? (language === 'en' ? 'Continue to WhatsApp' : 'వాట్సాప్‌లో చాట్ చేయండి')
                    : (language === 'en' ? 'Continue to Call' : 'కాల్ చేయండి')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 10,
    fontWeight: '600',
  },
  consentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  consentText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
