import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicyScreen({ navigation }: any) {
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
          {language === 'en' ? 'Privacy Policy' : 'గోప్యతా విధానం'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tagBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
          <Text style={styles.tagText}>
            {language === 'en' ? 'DPDP Act 2023 & Google Play Compliant' : 'డిజిటల్ డేటా రక్షణ చట్టం 2023'}
          </Text>
        </View>

        <Text style={styles.mainTitle}>
          {language === 'en' ? 'Privacy Policy' : 'గోప్యతా విధానం'}
        </Text>
        <Text style={styles.lastUpdated}>
          {language === 'en'
            ? 'Last Updated: October 2026 • Effective for Kurnool One Android App & Platform'
            : 'చివరిగా నవీకరించబడింది: అక్టోబర్ 2026'}
        </Text>

        {/* Government Non-Affiliation Banner */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle" size={18} color="#92400E" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.disclaimerTitle}>
              {language === 'en' ? 'Civic Non-Affiliation Notice' : 'ప్రభుత్వేతర స్వతంత్ర ప్రకటన'}
            </Text>
            <Text style={styles.disclaimerText}>
              {language === 'en'
                ? 'Kurnool One is an independent private digital city directory and community discovery platform operated by local technology entrepreneurs. It is NOT affiliated with, authorized by, endorsed by, or in any way officially connected with the Government of Andhra Pradesh, Kurnool Municipal Corporation (KMC), or the District Collectorate of Kurnool.'
                : 'కర్నూలు వన్ అనేది ఒక స్వతంత్ర ప్రైవేట్ డిజిటల్ సిటీ డైరెక్టరీ. ఇది ఆంధ్రప్రదేశ్ ప్రభుత్వం లేదా కర్నూలు మున్సిపల్ కార్పొరేషన్‌తో ఎటువంటి అధికారిక సంబంధం కలిగి లేదు.'}
            </Text>
          </View>
        </View>

        {/* Section 1: Information Collected */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '1. Information We Collect' : '1. మేము సేకరించే సమాచారం'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'We collect information strictly necessary to provide city directory services, merchant authentication, and customer connections:'
              : 'మేము డైరెక్టరీ సేవలు మరియు వ్యాపార ధృవీకరణకు అవసరమైన సమాచారాన్ని మాత్రమే సేకరిస్తాము:'}
          </Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: '700' }}>{language === 'en' ? 'Mobile Phone & Identity: ' : 'మొబైల్ నంబర్: '}</Text>
              {language === 'en'
                ? 'Used as the primary identity credential for business and professional accounts to prevent spam and impersonation.'
                : 'నకిలీ లిస్టింగ్‌లను నిరోధించడానికి మొబైల్ నంబర్ ప్రాథమిక గుర్తింపుగా ఉపయోగించబడుతుంది.'}
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: '700' }}>{language === 'en' ? 'Listing Data: ' : 'లిస్టింగ్ వివరాలు: '}</Text>
              {language === 'en'
                ? 'Storefront names, categories, operational hours, addresses, storefront photos, and service rates voluntarily provided for public display.'
                : 'పౌరుల సమాచారం కోసం స్వచ్ఛందంగా అందించిన దుకాణం లేదా సర్వీస్ వివరాలు.'}
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: '700' }}>{language === 'en' ? 'Blood Donor Registry: ' : 'రక్తదాతల నమోదు: '}</Text>
              {language === 'en'
                ? 'Citizens who voluntarily register as blood donors provide blood group, locality, and explicit consent to display phone numbers for emergency medical needs.'
                : 'రక్తదాతలుగా నమోదు చేసుకున్న పౌరులు అందించిన వివరాలు అత్యవసర పరిస్థితుల్లో మాత్రమే ఉపయోగించబడతాయి.'}
            </Text>
          </View>
        </View>

        {/* Section 2: Zero SMS Policy */}
        <View style={[styles.section, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Ionicons name="lock-closed" size={16} color="#16A34A" />
            <Text style={[styles.sectionHeading, { color: '#166534', marginBottom: 0 }]}>
              {language === 'en' ? '2. Zero SMS Permission Policy' : '2. జీరో ఎస్ఎంఎస్ అనుమతి విధానం'}
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: '#14532D' }]}>
            {language === 'en'
              ? 'In strict compliance with Google Play Developer Policies, Kurnool One DOES NOT request or declare dangerous SMS permissions (READ_SMS or RECEIVE_SMS). The app uses Google Play Services native SMS Retriever API for one-time code verification. We cannot read your private messages or inbox.'
              : 'కర్నూలు వన్ యాప్ ఎలాంటి వ్యక్తిగత SMS అనుమతులను కోరదు. ఇది గూగుల్ ప్లే స్టోర్ నియమాలకు పూర్తిగా కట్టుబడి ఉంది.'}
          </Text>
        </View>

        {/* Section 3: Medical Notice */}
        <View style={[styles.section, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Ionicons name="medkit" size={16} color="#DC2626" />
            <Text style={[styles.sectionHeading, { color: '#991B1B', marginBottom: 0 }]}>
              {language === 'en' ? '3. Medical & Emergency Services Notice' : '3. వైద్య & అత్యవసర సేవల గమనిక'}
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: '#7F1D1D' }]}>
            {language === 'en'
              ? 'Kurnool One provides voluntary community contact listings (such as Blood Donors). Kurnool One DOES NOT medically screen donors, guarantee blood compatibility, or verify medical suitability. Hospitals and licensed medical practitioners must perform standard cross-matching and verification prior to any transfusion.'
              : 'రక్తదాతల సంప్రదింపు వివరాలు సహాయం కోసమే అందించబడ్డాయి. రక్తమార్పిడికి ముందు ఆసుపత్రులు మరియు వైద్యులు ప్రామాణిక పరీక్షలు తప్పనిసరిగా నిర్వహించాలి.'}
          </Text>
        </View>

        {/* Section 4: Data Retention & Account Deletion */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '4. Data Retention & Account Erasure' : '4. డేటా రక్షణ & ఖాతా తొలగింపు'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'In accordance with India DPDP Act 2023 and Google Play Store policies, you have complete ownership of your personal data:'
              : 'మీ వ్యక్తిగత డేటాను ఎప్పుడైనా పూర్తిగా తొలగించుకునే హక్కు మీకు ఉంది:'}
          </Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              {language === 'en'
                ? 'Inside App: Go to Profile → Settings → "Delete Account & Data" to immediately delete your account and all associated records.'
                : 'యాప్ లోపల: ప్రొఫైల్ → సెట్టింగ్స్ → "Delete Account" ద్వారా మీ ఖాతాను తొలగించవచ్చు.'}
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              {language === 'en'
                ? 'Web Portal: Request deletion anytime at kurnoolone.com/delete-account.'
                : 'వెబ్‌సైట్ ద్వారా: kurnoolone.com/delete-account ద్వారా తొలగింపు అభ్యర్థించవచ్చు.'}
            </Text>
          </View>
        </View>

        {/* Section 5: Grievance & Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            {language === 'en' ? '5. Grievance Officer & Contact' : '5. సంప్రదింపు వివరాలు'}
          </Text>
          <Text style={styles.bodyText}>
            {language === 'en'
              ? 'For privacy questions, data correction, or grievance escalation:'
              : 'గోప్యతా సమస్యలు లేదా ప్రశ్నల కోసం సంప్రదించండి:'}
          </Text>
          <Text style={[styles.bodyText, { marginTop: 6, fontWeight: '700', color: '#1E293B' }]}>
            Kurnool One Grievance Redressal Cell
          </Text>
          <Text style={styles.bodyText}>Email: support@kurnoolone.com</Text>
          <Text style={styles.bodyText}>Location: Kurnool, Andhra Pradesh 518001</Text>
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
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
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
  disclaimerBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  disclaimerText: {
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
  bulletItem: {
    flexDirection: 'row',
    marginTop: 6,
    paddingLeft: 4,
    gap: 6,
  },
  bulletDot: {
    fontSize: 14,
    color: '#2563EB',
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
  },
});
