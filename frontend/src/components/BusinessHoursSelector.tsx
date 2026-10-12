import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DaySchedule {
  closed: boolean;
  open: string;
  close: string;
}

export interface OperatingHoursSchedule {
  isOpen24x7?: boolean;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface BusinessHoursSelectorProps {
  value: OperatingHoursSchedule;
  onChange: (schedule: OperatingHoursSchedule, summary: string) => void;
  title?: string;
}

const DAYS: { key: keyof Omit<OperatingHoursSchedule, 'isOpen24x7'>; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const STANDARD_TIMES = [
  '06:00 AM', '07:00 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:59 PM',
];

export default function BusinessHoursSelector({
  value,
  onChange,
  title = 'Operating / Working Hours',
}: BusinessHoursSelectorProps) {
  const [is24x7, setIs24x7] = useState(!!value.isOpen24x7);

  // Time Picker Modal State
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeDay, setActiveDay] = useState<keyof Omit<OperatingHoursSchedule, 'isOpen24x7'> | null>(null);
  const [activeType, setActiveType] = useState<'open' | 'close'>('open');

  const generateSummary = (schedule: OperatingHoursSchedule, open24: boolean): string => {
    if (open24) return 'Open 24/7 (Always Open)';
    const mon = schedule.monday;
    const sameAllWeek = DAYS.every(d => {
      const s = schedule[d.key];
      return s.closed === mon.closed && s.open === mon.open && s.close === mon.close;
    });

    if (sameAllWeek) {
      if (mon.closed) return 'Closed All Days';
      return `Everyday: ${mon.open} - ${mon.close}`;
    }

    const sun = schedule.sunday;
    if (sun.closed) {
      return `Mon-Sat: ${mon.open} - ${mon.close}, Sun: Closed`;
    }
    return `Mon-Sat: ${mon.open} - ${mon.close}, Sun: ${sun.open} - ${sun.close}`;
  };

  const handleToggle24x7 = (enabled: boolean) => {
    setIs24x7(enabled);
    const updated: OperatingHoursSchedule = {
      ...value,
      isOpen24x7: enabled,
    };
    onChange(updated, generateSummary(updated, enabled));
  };

  const handleToggleClosed = (day: keyof Omit<OperatingHoursSchedule, 'isOpen24x7'>) => {
    const current = value[day];
    const updated: OperatingHoursSchedule = {
      ...value,
      [day]: {
        ...current,
        closed: !current.closed,
      },
    };
    onChange(updated, generateSummary(updated, is24x7));
  };

  const openTimePicker = (day: keyof Omit<OperatingHoursSchedule, 'isOpen24x7'>, type: 'open' | 'close') => {
    setActiveDay(day);
    setActiveType(type);
    setPickerVisible(true);
  };

  const handleSelectTime = (time: string) => {
    if (!activeDay) return;
    const current = value[activeDay];
    const updated: OperatingHoursSchedule = {
      ...value,
      [activeDay]: {
        ...current,
        [activeType]: time,
      },
    };
    onChange(updated, generateSummary(updated, is24x7));
    setPickerVisible(false);
  };

  const handleApplyToAllDays = () => {
    const mondaySched = value.monday;
    const updated: OperatingHoursSchedule = {
      ...value,
      tuesday: { ...mondaySched },
      wednesday: { ...mondaySched },
      thursday: { ...mondaySched },
      friday: { ...mondaySched },
      saturday: { ...mondaySched },
      sunday: { ...mondaySched },
    };
    onChange(updated, generateSummary(updated, is24x7));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="time" size={18} color="#2563EB" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.summaryBadge} numberOfLines={1}>
          {generateSummary(value, is24x7)}
        </Text>
      </View>

      {/* 24x7 Quick Toggle & Apply All Bar */}
      <View style={styles.quickBar}>
        <View style={styles.toggle24x7}>
          <Text style={styles.quickBarText}>Open 24/7 (Always Open)</Text>
          <Switch
            value={is24x7}
            onValueChange={handleToggle24x7}
            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
            thumbColor={is24x7 ? '#2563EB' : '#F1F5F9'}
          />
        </View>

        {!is24x7 && (
          <TouchableOpacity
            style={styles.applyAllBtn}
            onPress={handleApplyToAllDays}
            activeOpacity={0.8}
          >
            <Ionicons name="copy-outline" size={13} color="#2563EB" />
            <Text style={styles.applyAllBtnText}>Apply Mon to All Days</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Days List (Disabled if Open 24/7) */}
      {!is24x7 && (
        <View style={styles.daysList}>
          {DAYS.map(({ key, label, short }) => {
            const daySched = value[key] || { closed: false, open: '09:00 AM', close: '09:00 PM' };
            const isClosed = !!daySched.closed;

            return (
              <View key={key} style={[styles.dayRow, isClosed && styles.dayRowClosed]}>
                <View style={styles.dayNameCol}>
                  <Text style={[styles.dayLabel, isClosed && styles.dayLabelClosed]}>{short}</Text>
                  <Text style={styles.dayFull}>{label}</Text>
                </View>

                {/* Closed Toggle */}
                <TouchableOpacity
                  onPress={() => handleToggleClosed(key)}
                  style={[styles.closedPill, isClosed && styles.closedPillActive]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isClosed ? 'close-circle' : 'checkmark-circle'}
                    size={14}
                    color={isClosed ? '#EF4444' : '#10B981'}
                  />
                  <Text style={[styles.closedPillText, isClosed && styles.closedPillTextActive]}>
                    {isClosed ? 'Closed' : 'Open'}
                  </Text>
                </TouchableOpacity>

                {/* Timings Pickers */}
                {!isClosed ? (
                  <View style={styles.timePickersRow}>
                    <TouchableOpacity
                      onPress={() => openTimePicker(key, 'open')}
                      style={styles.timeBox}
                    >
                      <Text style={styles.timeText}>{daySched.open || '09:00 AM'}</Text>
                      <Ionicons name="chevron-down" size={12} color="#64748B" />
                    </TouchableOpacity>

                    <Text style={styles.timeSep}>to</Text>

                    <TouchableOpacity
                      onPress={() => openTimePicker(key, 'close')}
                      style={styles.timeBox}
                    >
                      <Text style={styles.timeText}>{daySched.close || '09:00 PM'}</Text>
                      <Ionicons name="chevron-down" size={12} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.closedNoticeBox}>
                    <Text style={styles.closedNoticeText}>Store Closed on this day</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Modal Time Selector */}
      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {activeType === 'open' ? 'Opening' : 'Closing'} Time ({activeDay?.toUpperCase()})
              </Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={STANDARD_TIMES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => handleSelectTime(item)}
                >
                  <Text style={styles.timeOptionText}>{item}</Text>
                  <Ionicons name="time-outline" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryBadge: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: 160,
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  toggle24x7: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  applyAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  applyAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  daysList: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dayRowClosed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  dayNameCol: {
    width: 50,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayLabelClosed: {
    color: '#94A3B8',
  },
  dayFull: {
    fontSize: 9,
    color: '#64748B',
  },
  closedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginRight: 10,
  },
  closedPillActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  closedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  closedPillTextActive: {
    color: '#DC2626',
  },
  timePickersRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  timeSep: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  closedNoticeBox: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  closedNoticeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    maxHeight: 450,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  timeOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
});
