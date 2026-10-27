import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export default function TermsScreen({ navigation }: any) {
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
          {language === 'en' ? 'Terms & Conditions' : 'నిబంధనలు & షరతులు'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tagBadge}>
          <Ionicons name="document-text-outline" size={14} color="#2563EB" />
          <Text style={styles.tagText}>
            {language === 'en' ? 'Kurnool One User Agreement' : 'కర్నూలు వన్ యూజర్ అగ్రిమెంట్'}
          </Text>
        </View>

        <Text style={styles.mainTitle}>
          {language === 'en' ? 'Terms of Service' : 'సేవా నిబంధనలు'}
        </Text>
        <Text style={styles.lastUpdated}>
          {language === 'en' ? 'Last Updated: October 2026 • Effective for Kurnool One' : 'చివరిగా నవీకరించబడింది: అక్టోబర్ 2026'}
        </Text>

        {/* Notice Card */}
        <View style={styles.noticeBox}>
          <Ionicons name="alert-circle" size={18} color="#B45309" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>
              {language === 'en' ? 'Notice to All Citizens & Merchants:' : 'పౌరులు మరియు వ్యాపారులకు గమనిక:'}
            </Text>
            <Text style={styles.noticeText}>
              {language === 'en'
                ? 'By downloading, accessing, or registering on Kurnool One (via mobile application or website), you agree to comply with and be bound by the following terms and conditions. If you disagree with any part of these terms, please discontinue use of the platform.'
                : 'కర్నూలు వన్ యాప్ లేదా వెబ్‌సైట్‌ను ఉపయోగించడం ద్వారా, మీరు ఈ క్రింది నిబంధనలకు కట్టుబడి ఉండటానికి అంగీకరిస్తున్నారు.'}
            </Text>
          </View>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '1. Account Types & Role Exclusivity' : '1. ఖాతా రకాలు & పాత్రల ప్రత్యేకత'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'Kurnool One distinguishes between commercial Businesses and individual Service Professionals. A mobile phone number registered under one role cannot simultaneously hold credentials for the opposite role. Commercial establishments must list under Business, and solo specialists (Doctors, Advocates, Freelancers, Technicians, Home Services) must list under Professional.'
              : 'కర్నూలు వన్ వ్యాపారాలు మరియు ప్రొఫెషనల్స్ మధ్య వ్యత్యాసాన్ని పాటిస్తుంది. ఒక ఫోన్ నంబర్‌తో ఒకే పాత్రను నమోదు చేయవచ్చు.'}
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '2. Accuracy of Listing Information' : '2. లిస్టింగ్ సమాచార ఖచ్చితత్వం'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'Merchants and Professionals represent that all posted details—including business addresses, phone numbers, visiting fees, service rates, and operational hours—are genuine and accurate. Kurnool One reserves the right to suspend or terminate any listing found providing misleading, fraudulent, or unlawful information.'
              : 'వ్యాపారులు మరియు నిపుణులు అందించే చిరునామా, ఫోన్ నంబర్ మరియు ఇతర వివరాలు ఖచ్చితమైనవి మరియు నిజమైనవిగా ఉండాలి.'}
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '3. Independent Directory & Platform Status' : '3. స్వతంత్ర వేదిక స్థితి'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'Kurnool One operates solely as a civic discovery index connecting Kurnool residents with independent merchants, service providers, and local announcements. Kurnool One is not a party to any commercial contracts, warranties, transactions, or service disputes between users and listed merchants.'
              : 'కర్నూలు వన్ ఒక స్థానిక సమాచార వేదిక మాత్రమే. వినియోగదారులు మరియు వ్యాపారుల మధ్య జరిగే ఆర్థిక లావాదేవీలకు వేదిక బాధ్యత వహించదు.'}
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '4. Prohibited Content & Actions' : '4. నిషేధించబడిన కంటెంట్'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'Users, merchants, and professionals may not upload unlawful, obscene, defamatory, predatory, or fraudulent content. Impersonation of government officials, municipal bodies, or registered trademarks is strictly prohibited and results in immediate permanent account termination.'
              : 'చట్టవిరుద్ధమైన, అసభ్యకరమైన లేదా నకిలీ సమాచారాన్ని పోస్ట్ చేయడం నిషేధించబడింది.'}
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '5. Subscriptions & Payments' : '5. చందాలు & చెల్లింపులు'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'Listing subscription fees paid for premium storefront or professional packages are processed through authorized payment gateways (e.g. Razorpay). All paid plans are activated immediately upon payment verification.'
              : 'వ్యాపార చందాలు అధికారిక గేట్‌వేల ద్వారా సురక్షితంగా ప్రాసెస్ చేయబడతాయి.'}
          </Text>
        </View>

        {/* Section 6 */}
        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '6. Jurisdiction & Applicable Law' : '6. న్యాయ పరిధి'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'These terms are governed by the laws of India. Any disputes arising from the use of Kurnool One shall be subject to the exclusive jurisdiction of the competent courts in Kurnool, Andhra Pradesh.'
              : 'ఈ నిబంధనలు భారతదేశ చట్టాలకు లోబడి ఉంటాయి. ఏదైనా వివాదం కర్నూలు, ఆంధ్రప్రదేశ్ కోర్టుల పరిధికి లోబడి ఉంటుంది.'}
          </Text>
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
  noticeBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
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
