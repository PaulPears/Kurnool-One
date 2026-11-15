import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { submitContentReport } from '../services/directoryService';
import { auth } from '../config/firebase';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetTitle: string;
  reportType: 'business' | 'professional' | 'deal' | 'news' | 'community_post' | 'marketplace';
}

const REPORT_REASONS = [
  'Inappropriate or offensive content',
  'Fake profile or fraudulent listing',
  'Wrong contact number or closed business',
  'Expired deal or refused offer discount',
  'Spam, copyright or impersonation',
  'Other violation',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  targetId,
  targetTitle,
  reportType,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Select Reason', 'Please select a reason for reporting.');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await submitContentReport({
        targetId,
        targetTitle,
        reportType,
        reason: selectedReason,
        details: details.trim(),
        reporterUid: auth.currentUser?.uid || 'guest',
        reporterPhone: auth.currentUser?.phoneNumber || '',
      });

      if (ok) {
        Alert.alert(
          'Report Submitted',
          'Thank you. Our moderation team will review this report within 24 hours to keep Kurnool safe.',
          [{ text: 'OK', onPress: onClose }]
        );
        setDetails('');
      } else {
        Alert.alert('Error', 'Could not submit report. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please check your network.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.flagIconWrap}>
                <Ionicons name="flag" size={18} color="#EF4444" />
              </View>
              <Text style={styles.title}>Report Content</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.targetName} numberOfLines={1}>
            {targetTitle}
          </Text>

          <Text style={styles.sectionLabel}>Select Reason:</Text>
          <View style={styles.reasonsList}>
            {REPORT_REASONS.map((reason) => {
              const active = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  style={[styles.reasonChip, active && styles.reasonChipActive]}
                >
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                    {active && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Additional details (optional):</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe what is wrong or misleading..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={details}
            onChangeText={setDetails}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  targetName: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonsList: {
    gap: 6,
    marginBottom: 14,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  reasonChipActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioCircleActive: {
    borderColor: '#EF4444',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  reasonText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  reasonTextActive: {
    color: '#991B1B',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
    height: 70,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

