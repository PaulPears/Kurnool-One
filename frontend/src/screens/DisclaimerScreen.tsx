import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export default function DisclaimerScreen({ navigation }: any) {
  const { language } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Legal Disclaimers' : 'చట్టపరమైన నిరాకరణలు'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tagBadge}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#2563EB" />
          <Text style={styles.tagText}>
            {language === 'en' ? 'Official Platform Disclaimers' : 'అధికారిక నిరాకరణ ప్రకటనలు'}
          </Text>
        </View>

        <Text style={styles.mainTitle}>
          {language === 'en' ? 'Disclaimers & Limitations' : 'నిరాకరణలు & పరిమితులు'}
        </Text>
        <Text style={styles.lastUpdated}>
          {language === 'en' ? 'Effective Date: November 2026 • Kurnool One Civic Platform' : 'అమలు తేదీ: నవంబర్ 2026'}
        </Text>

        {/* 1. Government Non-Affiliation */}
        <View style={[styles.section, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="business" size={18} color="#D97706" />
            <Text style={[styles.sectionHeading, { color: '#92400E', marginBottom: 0 }]}>
              {language === 'en' ? '1. Government Non-Affiliation Notice' : '1. ప్రభుత్వేతర స్వతంత్ర ప్రకటన'}
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: '#92400E' }]}>
            {language === 'en'
              ? 'Kurnool One is an independent civic utility and business discovery platform created by local technology entrepreneurs. Kurnool One is NOT affiliated with, sponsored by, endorsed by, or representing any government authority, including the Government of Andhra Pradesh, Kurnool District Administration, Kurnool Municipal Corporation (KMC), or any statutory police or judicial body.'
              : 'కర్నూలు వన్ అనేది ఒక స్వతంత్ర ప్రైవేట్ డిజిటల్ సిటీ డైరెక్టరీ. ఇది ఆంధ్రప్రదేశ్ ప్రభుత్వం లేదా కర్నూలు మున్సిపల్ కార్పొరేషన్‌తో ఎటువంటి అధికారిక సంబంధం కలిగి లేదు.'}
          </Text>
        </View>

        {/* 2. Medical & Emergency Services Disclaimer */}
        <View style={[styles.section, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="medkit" size={18} color="#DC2626" />
            <Text style={[styles.sectionHeading, { color: '#991B1B', marginBottom: 0 }]}>
              {language === 'en' ? '2. Voluntary Blood Donors & Medical Emergencies' : '2. రక్తదాతలు మరియు అత్యవసర వైద్య నిరాకరణ'}
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: '#7F1D1D' }]}>
            {language === 'en'
              ? 'The Blood Donor Directory connects voluntary donors with citizens facing urgent medical requirements. Kurnool One is NOT a blood bank, clinic, hospital, or diagnostic lab. We do not screen donors for infectious diseases, antibodies, or blood group compatibility. Families, attending physicians, and licensed hospital blood banks must perform mandatory cross-matching and laboratory validation before any transfusion.'
              : 'రక్తదాతల సమాచారం సహాయార్థం మాత్రమే అందించబడింది. కర్నూలు వన్ రక్త పరీక్షలు నిర్వహించదు. రక్తమార్పిడికి ముందు ఆసుపత్రులు మరియు రక్తనిధులు అధికారిక పరీక్షలను తప్పనిసరిగా నిర్వహించాలి.'}
          </Text>
        </View>

        {/* 3. Commercial Directory & Service Quality */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="storefront" size={18} color="#2563EB" />
            <Text style={[styles.sectionHeading, { marginBottom: 0 }]}>
              {language === 'en' ? '3. Independent Merchant & Professional Directory' : '3. స్వతంత్ర వ్యాపారాలు & నిపుణుల సేవలు'}
            </Text>
          </View>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'Businesses and Skilled Professionals listed on Kurnool One operate independently. Kurnool One does not employ, guarantee, certify, or warrant the quality, pricing, safety, or legality of services rendered or goods sold by listed third parties. Any payment, service agreement, or commercial engagement made with a merchant or service professional is strictly between the user and that service provider.'
              : 'కర్నూలు వన్ వేదికపై జాబితా చేయబడిన వ్యాపారాలు మరియు ప్రొఫెషనల్స్ స్వతంత్రంగా పనిచేస్తారు. వారి సేవా నాణ్యత లేదా ధరలకు యాప్ బాధ్యత వహించదు.'}
          </Text>
        </View>

        {/* 4. Local Classifieds & Used Goods */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="pricetags" size={18} color="#059669" />
            <Text style={[styles.sectionHeading, { marginBottom: 0 }]}>
              {language === 'en' ? '4. Peer-to-Peer Marketplace & Classifieds' : '4. పీర్-టు-పీర్ మార్కెట్‌ప్లేస్ నిరాకరణ'}
            </Text>
          </View>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'The Kurnool One Buy & Sell Marketplace provides peer-to-peer classified advertisements. Buyers and sellers are strictly advised to inspect items in person, verify physical condition, and avoid sending advance bank or UPI payments before receiving products. Kurnool One is not responsible for second-hand product condition, ownership titles, or escrow transactions.'
              : 'సెకండ్ హ్యాండ్ వస్తువుల కొనుగోలుకు ముందు వస్తువును ప్రత్యక్షంగా పరిశీలించండి. అడ్వాన్స్ ఆన్‌లైన్ పేమెంట్లు చేయవద్దు.'}
          </Text>
        </View>

        {/* 5. Citizen News & Community Updates */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="newspaper" size={18} color="#475569" />
            <Text style={[styles.sectionHeading, { marginBottom: 0 }]}>
              {language === 'en' ? '5. Local News & Community Feeds' : '5. స్థానిక వార్తలు & అప్‌డేట్లు'}
            </Text>
          </View>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'News headlines, events, and community updates are aggregated from verified local reporters and public press releases. Kurnool One exercises best journalistic efforts to verify facts before publishing. Readers are encouraged to cross-reference official announcements for government notifications and emergency orders.'
              : 'వార్తలు మరియు కార్యక్రమాల సమాచారం ప్రజల సౌలభ్యం కొరకు మాత్రమే అందించబడుతుంది.'}
          </Text>
        </View>

        {/* Grievance Redressal Contact */}
        <View style={[styles.section, { borderBottomWidth: 0, backgroundColor: '#F8FAFC' }]}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? 'Grievance Officer Contact' : 'ఫిర్యాదుల అధికారి సంప్రదింపు'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'In compliance with Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:'
              : 'ఐటీ రూల్స్ 2021 నిబంధనల ప్రకారం:'}
          </Text>
          <Text style={[styles.bodyText, { marginTop: 6, fontWeight: '700', color: '#1E293B' }]}>
            Grievance Redressal Officer, Kurnool One
          </Text>
          <Text style={styles.bodyText}>Email: grievance@kurnoolone.com</Text>
          <Text style={styles.bodyText}>Postal Address: Kurnool One Technology Desk, Kurnool, AP 518001</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 18,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});

