import {
  collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, increment,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────

export interface CategoryItem {
  id: string;
  name_en: string;
  name_te: string;
  icon: string;
  color?: string;
  bgLight?: string;
  subcategories: { id: string; name_en: string; name_te: string }[];
}

export interface DayOperatingHours {
  closed: boolean;
  open: string;
  close: string;
}

export interface BusinessItem {
  id: string;
  name_en: string;
  name_te: string;
  slug?: string;
  categoryId: string;
  customCategory?: string;
  subcategoryId?: string;
  area?: string;
  tagline?: string;
  description_en: string;
  description_te?: string;
  address: string;
  landmark?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  googleMapsUrl?: string;
  googleMapsEmbed?: string;
  googleMapsLocation?: string;
  operatingHours?: {
    monday: DayOperatingHours;
    tuesday: DayOperatingHours;
    wednesday: DayOperatingHours;
    thursday: DayOperatingHours;
    friday: DayOperatingHours;
    saturday: DayOperatingHours;
    sunday: DayOperatingHours;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  logoUrl?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  galleryUrls?: string[];
  youtubeVideoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  images: string[];
  coverImage?: string;
  timing?: string;
  amenities?: string[];
  customFeatures?: string[];
  priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  ownerUid?: string;
  claimStatus: 'unclaimed' | 'pending' | 'verified' | 'claimed';
  tier: 'free' | 'featured' | 'premium';
  verificationBadge: 'none' | 'verified_business';
  planId?: 'monthly' | 'half_yearly' | 'yearly' | 'free' | 'verified' | 'premium';
  paymentStatus?: 'free' | 'unpaid' | 'paid';
  paymentId?: string;
  orderId?: string;
  planExpiresAt?: string;
  viewCount?: number;
  callCount?: number;
  whatsappCount?: number;
  ratingAvg: number;
  ratingCount: number;
  latitude?: number;
  longitude?: number;
  status: 'pending_approval' | 'published' | 'suspended';
  createdAt?: string;
}

export interface LeadItem {
  id?: string;
  targetId: string; // Business or Pro ID
  targetType: 'business' | 'professional';
  targetOwnerUid?: string;
  targetName: string;
  actionType: 'view' | 'call' | 'whatsapp' | 'quote';
  citizenUid?: string;
  citizenName: string;
  citizenPhone: string;
  citizenArea?: string;
  citizenGender?: string;
  createdAt?: any;
}

export interface ProfessionalItem {
  id: string;
  userId?: string;
  fullName: string;
  category: string;
  customCategory?: string;
  categoryName_te?: string;
  experienceYears: number;
  serviceAreas: string[];
  phone: string;
  whatsapp?: string;
  hourlyRate?: string;
  visitingCharges?: string;
  startingPrice?: string;
  pricingUnit?: string;
  description?: string;
  about_en?: string;
  about_te?: string;
  portfolioPhotos?: string[];
  avatarUrl?: string; // Profile photo/image
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  email?: string;
  verifiedProfessional: boolean;
  ratingAvg: number;
  ratingCount: number;
  reviewCount?: number;
  planId?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'free';
  paymentId?: string;
  orderId?: string;
  operatingHours?: any;
  planExpiresAt?: string;
  status: 'active' | 'pending' | 'suspended';
}

export interface ProfessionalCategory {
  id: string;
  name_en: string;
  name_te: string;
  icon: string;
  color: string;
  bgLight: string;
  placeholderRate?: string;
}

export const PROFESSIONAL_CATEGORIES: ProfessionalCategory[] = [
  { id: 'influencer', name_en: 'Influencer & Content Creator', name_te: 'ఇన్‌ఫ్లుయెన్సర్లు & కంటెంట్ క్రియేటర్స్', icon: 'videocam', color: '#E11D48', bgLight: '#FFE4E6', placeholderRate: 'Brand Collaboration / Shoot Quote' },
  { id: 'plumbers', name_en: 'Plumbers', name_te: 'ప్లంబర్లు', icon: 'water', color: '#0284C7', bgLight: '#E0F2FE', placeholderRate: '₹150 - ₹300 (Visit / Work)' },
  { id: 'electricians', name_en: 'Electricians', name_te: 'ఎలక్ట్రీషియన్లు', icon: 'flash', color: '#D97706', bgLight: '#FEF3C7', placeholderRate: '₹150 - ₹350 (Wiring & Fittings)' },
  { id: 'carpenters', name_en: 'Carpenters & Wood Work', name_te: 'వడ్రంగులు & వుడ్ వర్కర్స్', icon: 'hammer', color: '#92400E', bgLight: '#FEF3C7', placeholderRate: '₹300 - ₹600 (Furniture / Repair)' },
  { id: 'painters', name_en: 'House & Wall Painters', name_te: 'పెయింటర్లు & డిస్టెంపర్', icon: 'color-palette', color: '#BE185D', bgLight: '#FCE7F3', placeholderRate: 'Per Sq.Ft / Day Wage' },
  { id: 'ac_appliance_repair', name_en: 'AC & Refrigerator Technicians', name_te: 'ఏసీ & ఫ్రిడ్జ్ టెక్నీషియన్లు', icon: 'snow', color: '#0891B2', bgLight: '#CFFAFE', placeholderRate: '₹350 - ₹500 (Service / Gas Refill)' },
  { id: 'appliance_repair', name_en: 'Washing Machine, TV & Appliance Repair', name_te: 'వాషింగ్ మెషీన్, టీవీ & గృహోపకరణాల రిపేర్', icon: 'hardware-chip', color: '#6366F1', bgLight: '#EEF2FF', placeholderRate: '₹250 - ₹400 (Inspection)' },
  { id: 'auto_mechanics', name_en: 'Two & Four Wheeler Mechanics', name_te: 'టూ & ఫోర్ వీలర్ మెకానిక్స్', icon: 'car-sport', color: '#DC2626', bgLight: '#FEE2E2', placeholderRate: '₹200 - ₹500 (Vehicle Service)' },
  { id: 'mason_civil', name_en: 'Masons, Tile & Civil Workers', name_te: 'మేస్త్రీలు, టైల్స్ & సివిల్ వర్కర్లు', icon: 'construct', color: '#57534E', bgLight: '#F5F5F4', placeholderRate: 'Daily Wage / Contract' },
  { id: 'cleaning_housekeeping', name_en: 'House Cleaning & Deep Cleaning', name_te: 'హౌస్ కీపింగ్ & డీప్ క్లీనింగ్', icon: 'sparkles', color: '#059669', bgLight: '#D1FAE5', placeholderRate: '₹1,000 - ₹2,500 (Full Home Clean)' },
  { id: 'house_maids', name_en: 'House Maids & Domestic Helpers', name_te: 'పని మనుషులు & హౌస్ మెయిడ్స్', icon: 'home', color: '#0D9488', bgLight: '#CCFBF1', placeholderRate: '₹2,000 - ₹5,000 / Month' },
  { id: 'beauticians_makeup', name_en: 'Beauticians & Bridal Makeup Artists', name_te: 'బ్యూటీషియన్లు & బ్రైడల్ మేకప్', icon: 'rose', color: '#E11D48', bgLight: '#FFE4E6', placeholderRate: 'Bridal & Party Packages' },
  { id: 'tailors_designers', name_en: 'Tailors & Boutique Designers', name_te: 'టైలర్లు & బోటిక్ డిజైనర్లు', icon: 'cut', color: '#7C3AED', bgLight: '#EDE9FE', placeholderRate: 'Stitching & Alteration Rates' },
  { id: 'photographers_videographers', name_en: 'Photographers & Videographers', name_te: 'ఫోటోగ్రాఫర్లు & వీడియో ఎడిటర్లు', icon: 'camera', color: '#2563EB', bgLight: '#EFF6FF', placeholderRate: 'Event & Wedding Quotes' },
  { id: 'drivers', name_en: 'Car, Auto & Heavy Drivers', name_te: 'కార్, ఆటో & హెవీ డ్రైవర్లు', icon: 'car', color: '#0D9488', bgLight: '#CCFBF1', placeholderRate: '₹500 - ₹800 / Day' },
  { id: 'cooks_caterers', name_en: 'Cooks & Catering Chefs', name_te: 'వంట మాస్టర్లు & క్యాటరింగ్', icon: 'restaurant', color: '#EA580C', bgLight: '#FFEDD5', placeholderRate: 'Per Day / Event Rates' },
  { id: 'home_tutors', name_en: 'Home Tutors & Academic Teachers', name_te: 'హోమ్ ట్యూటర్లు & ఉపాధ్యాయులు', icon: 'book', color: '#4338CA', bgLight: '#E0E7FF', placeholderRate: '₹2,500 - ₹5,000 / Month' },
  { id: 'doctors_healthcare', name_en: 'Doctors & Health Experts', name_te: 'వైద్యులు & ఆరోగ్య నిపుణులు', icon: 'medkit', color: '#0284C7', bgLight: '#E0F2FE', placeholderRate: '₹300 - ₹500 (Consultation)' },
  { id: 'advocates_legal', name_en: 'Advocates & Legal Advisors', name_te: 'న్యాయవాదులు & లీగల్ అడ్వైజర్లు', icon: 'scale', color: '#334155', bgLight: '#F1F5F9', placeholderRate: '₹300 - ₹1,000 (Consultation)' },
  { id: 'ca_tax_accountants', name_en: 'Chartered Accountants & GST Consultants', name_te: 'సీఏ & జీఎస్టీ ఫైలింగ్ నిపుణులు', icon: 'calculator', color: '#047857', bgLight: '#ECFDF5', placeholderRate: 'Tax Filing & Audit Rates' },
  { id: 'real_estate_agents', name_en: 'Real Estate Agents & Brokers', name_te: 'రియల్ ఎస్టేట్ ఏజెంట్లు & బ్రోకర్లు', icon: 'home', color: '#1D4ED8', bgLight: '#DBEAFE', placeholderRate: 'Standard Advisory / Brokerage' },
  { id: 'pandits_purohits', name_en: 'Pandits, Purohits & Astrologers', name_te: 'పండితులు, పురోహితులు & జ్యోతిష్యులు', icon: 'flame', color: '#C2410C', bgLight: '#FFEDD5', placeholderRate: 'Pooja & Muhurtham Dakshina' },
  { id: 'event_decorators', name_en: 'Event Decorators & Sound Lights', name_te: 'డెకరేషన్ & సౌండ్ సిస్టమ్స్', icon: 'balloon', color: '#C026D3', bgLight: '#FAE8FF', placeholderRate: 'Custom Event Quotations' },
  { id: 'security_guards', name_en: 'Security Guards & Watchmen', name_te: 'సెక్యూరిటీ గార్డులు & సూపర్వైజర్లు', icon: 'shield-checkmark', color: '#1E293B', bgLight: '#F8FAFC', placeholderRate: 'Monthly Guard Charges' },
  { id: 'it_software', name_en: 'IT & Software Developers', name_te: 'ఐటీ & వెబ్ డిజైనర్లు', icon: 'laptop', color: '#3B82F6', bgLight: '#EFF6FF', placeholderRate: 'Project / Hourly Quote' },
  { id: 'digital_marketing', name_en: 'Digital Marketers & Social Media', name_te: 'డిజిటల్ మార్కెటింగ్ & సోషల్ మీడియా', icon: 'trending-up', color: '#10B981', bgLight: '#ECFDF5', placeholderRate: 'Monthly Retainers' },
  { id: 'fitness_gym_trainers', name_en: 'Gym Trainers & Yoga Gurus', name_te: 'ఫిట్‌నెస్ ట్రైనర్లు & యోగా గురువులు', icon: 'fitness', color: '#E11D48', bgLight: '#FFE4E6', placeholderRate: '₹2,000 - ₹4,000 / Month' },
  { id: 'delivery_couriers', name_en: 'Delivery Partners & Couriers', name_te: 'డెలివరీ బాయ్స్ & కొరియర్ సర్వీసెస్', icon: 'bicycle', color: '#D97706', bgLight: '#FEF3C7', placeholderRate: 'Per Parcel / Day' },
  { id: 'other_professionals', name_en: 'Other Specialized Professionals', name_te: 'ఇతర నైపుణ్య వృత్తి నిపుణులు', icon: 'ellipsis-horizontal-circle', color: '#64748B', bgLight: '#F1F5F9', placeholderRate: 'As Applicable' },
];

export interface PlaceItem {
  id: string;
  type: 'tourist' | 'temple' | 'church' | 'masjid' | 'landmark' | 'park';
  name_en: string;
  name_te: string;
  description_en: string;
  description_te: string;
  address: string;
  timings: string;
  entryFee?: string;
  bestTimeToVisit?: string;
  dressCodeRules?: string;
  photos: string[];
  latitude?: number;
  longitude?: number;
  isPromoted: boolean;
}

export interface EventItem {
  id: string;
  title_en: string;
  title_te?: string;
  dateStr: string;
  timeStr: string;
  venue: string;
  organizerName: string;
  contactPhone: string;
  posterUrl: string;
  entryType: 'free' | 'ticketed';
  ticketUrl?: string;
  status: 'approved' | 'pending';
}

export interface OfferItem {
  id: string;
  title_en: string;
  title_te?: string;
  description_en: string;
  description_te?: string;
  discountText: string;
  businessId?: string;
  businessName: string;
  validUntil: string;
  bannerUrl?: string;
  images?: string[];
  phone?: string;
  category: string;
}

export interface BusinessReview {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── MASTER CATEGORIES ───────────────────────────────────────────────────────

export const MASTER_CATEGORIES: CategoryItem[] = [
  {
    id: 'restaurants_cafes',
    name_en: 'Restaurants & Cafes',
    name_te: 'రెస్టారెంట్లు & కేఫ్‌లు',
    icon: 'restaurant',
    color: '#EA580C',
    bgLight: '#FFEDD5',
    subcategories: [
      { id: 'family_restaurant', name_en: 'Family Restaurant', name_te: 'ఫ్యామిలీ రెస్టారెంట్' },
      { id: 'cafes', name_en: 'Cafes & Coffee Shops', name_te: 'కేఫ్‌లు & కాఫీ షాపులు' },
      { id: 'fast_food', name_en: 'Fast Food & Chaat', name_te: 'ఫాస్ట్ ఫుడ్ & చాట్' },
      { id: 'biryani_special', name_en: 'Biryani Centers', name_te: 'బిర్యానీ సెంటర్లు' },
    ],
  },
  {
    id: 'hotels_lodges',
    name_en: 'Hotels & Lodges',
    name_te: 'హోటళ్ళు & లాడ్జీలు',
    icon: 'bed',
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    subcategories: [
      { id: 'luxury_hotels', name_en: 'Luxury & Business Hotels', name_te: 'లగ్జరీ హోటళ్ళు' },
      { id: 'budget_lodges', name_en: 'Budget Lodges & Rooms', name_te: 'బడ్జెట్ లాడ్జీలు' },
      { id: 'resorts', name_en: 'Resorts & Staycations', name_te: 'రిసార్ట్‌లు' },
    ],
  },
  {
    id: 'supermarkets_groceries',
    name_en: 'Supermarkets & Grocery Stores',
    name_te: 'సూపర్‌మార్కెట్లు & కిరాణా దుకాణాలు',
    icon: 'cart',
    color: '#059669',
    bgLight: '#D1FAE5',
    subcategories: [
      { id: 'supermarkets', name_en: 'Supermarkets', name_te: 'సూపర్‌మార్కెట్లు' },
      { id: 'kirana_stores', name_en: 'Kirana & General Stores', name_te: 'కిరాణా దుకాణాలు' },
      { id: 'organic_stores', name_en: 'Organic & Dry Fruits', name_te: 'ఆర్గానిక్ & డ్రై ఫ్రూట్స్' },
    ],
  },
  {
    id: 'clothing_fashion',
    name_en: 'Clothing & Fashion Stores',
    name_te: 'వస్త్ర & ఫ్యాషన్ దుకాణాలు',
    icon: 'shirt',
    color: '#E11D48',
    bgLight: '#FFE4E6',
    subcategories: [
      { id: 'saree_showrooms', name_en: 'Saree & Pattu Showrooms', name_te: 'చీరలు & పట్టు వస్త్రాలు' },
      { id: 'mens_wear', name_en: "Men's Clothing", name_te: 'పురుషుల దుస్తులు' },
      { id: 'kids_wear', name_en: "Kids & Women's Wear", name_te: 'పిల్లలు & మహిళల దుస్తులు' },
    ],
  },
  {
    id: 'electronics_mobiles',
    name_en: 'Electronics & Mobile Stores',
    name_te: 'ఎలక్ట్రానిక్స్ & మొబైల్ స్టోర్లు',
    icon: 'phone-portrait',
    color: '#0284C7',
    bgLight: '#E0F2FE',
    subcategories: [
      { id: 'mobile_showrooms', name_en: 'Mobile Phone Showrooms', name_te: 'మొబైల్ షోరూమ్‌లు' },
      { id: 'home_appliances', name_en: 'TV, Fridge & AC Showrooms', name_te: 'గృహోపకరణాలు' },
      { id: 'gadgets_accessories', name_en: 'Gadgets & Accessories', name_te: 'యాక్సెసరీస్' },
    ],
  },
  {
    id: 'hospitals_clinics',
    name_en: 'Hospitals & Clinics',
    name_te: 'ఆసుపత్రులు & క్లినిక్‌లు',
    icon: 'medkit',
    color: '#0D9488',
    bgLight: '#CCFBF1',
    subcategories: [
      { id: 'multispeciality', name_en: 'Multi-Speciality Hospitals', name_te: 'మల్టీ-స్పెషాలిటీ ఆసుపత్రులు' },
      { id: 'dental_clinics', name_en: 'Dental Clinics', name_te: 'డెంటల్ క్లినిక్‌లు' },
      { id: 'eye_hospitals', name_en: 'Eye Hospitals', name_te: 'కంటి ఆసుపత్రులు' },
      { id: 'pediatric', name_en: "Children's Clinics", name_te: 'పిల్లల క్లినిక్‌లు' },
    ],
  },
  {
    id: 'pharmacies_medical',
    name_en: 'Pharmacies & Medical Stores',
    name_te: 'మందుల దుకాణాలు',
    icon: 'flask',
    color: '#7C3AED',
    bgLight: '#EDE9FE',
    subcategories: [
      { id: '24hr_pharmacy', name_en: '24/7 Medical Stores', name_te: '24 గంటల మందుల షాపులు' },
      { id: 'ayurvedic', name_en: 'Ayurvedic & Homeo Stores', name_te: 'ఆయుర్వేదిక్ & హోమియో' },
      { id: 'surgical_equipment', name_en: 'Surgical & Healthcare Equip', name_te: 'సర్జికల్ ఎక్విప్‌మెంట్' },
    ],
  },
  {
    id: 'educational_institutions',
    name_en: 'Educational Institutions',
    name_te: 'విద్యా సంస్థలు',
    icon: 'school',
    color: '#2563EB',
    bgLight: '#EFF6FF',
    subcategories: [
      { id: 'schools', name_en: 'Private & CBSE Schools', name_te: 'పాఠశాలలు' },
      { id: 'colleges', name_en: 'Junior & Degree Colleges', name_te: 'జూనియర్ & డిగ్రీ కాలేజీలు' },
      { id: 'engineering_medical', name_en: 'Engg & Medical Colleges', name_te: 'ఇంజనీరింగ్ & మెడికల్ కాలేజీలు' },
    ],
  },
  {
    id: 'coaching_training',
    name_en: 'Coaching & Training Centers',
    name_te: 'కోచింగ్ & శిక్షణా సంస్థలు',
    icon: 'book',
    color: '#D97706',
    bgLight: '#FEF3C7',
    subcategories: [
      { id: 'govt_job_coaching', name_en: 'Govt Job & Bank Coaching', name_te: 'ప్రభుత్వ ఉద్యోగాల కోచింగ్' },
      { id: 'iit_neet_coaching', name_en: 'IIT-JEE & NEET Coaching', name_te: 'ఐఐటీ & నీట్ కోచింగ్' },
      { id: 'software_training', name_en: 'Coding & IT Training', name_te: 'సాఫ్ట్‌వేర్ ట్రైనింగ్' },
    ],
  },
  {
    id: 'it_software',
    name_en: 'IT & Software Companies',
    name_te: 'ఐటీ & సాఫ్ట్‌వేర్ సంస్థలు',
    icon: 'laptop',
    color: '#3B82F6',
    bgLight: '#EFF6FF',
    subcategories: [
      { id: 'web_app_development', name_en: 'Web & App Development', name_te: 'వెబ్ & యాప్ డెవలప్‌మెంట్' },
      { id: 'software_products', name_en: 'SaaS & Enterprise Software', name_te: 'ఎంటర్‌ప్రైజ్ సాఫ్ట్‌వేర్' },
      { id: 'it_consulting', name_en: 'IT Solutions & Support', name_te: 'ఐటీ సపోర్ట్ & కన్సల్టింగ్' },
    ],
  },
  {
    id: 'digital_marketing',
    name_en: 'Digital Marketing Agencies',
    name_te: 'డిజిటల్ మార్కెటింగ్ ఏజెన్సీలు',
    icon: 'megaphone',
    color: '#10B981',
    bgLight: '#ECFDF5',
    subcategories: [
      { id: 'social_media_marketing', name_en: 'Social Media Management', name_te: 'సోషల్ మీడియా మార్కెటింగ్' },
      { id: 'seo_branding', name_en: 'SEO & Brand Promotions', name_te: 'ఎస్ఈఓ & బ్రాండింగ్' },
      { id: 'performance_ads', name_en: 'Google & Meta Ads', name_te: 'యాడ్ క్యాంపెయిన్స్' },
    ],
  },
  {
    id: 'real_estate',
    name_en: 'Real Estate & Properties',
    name_te: 'రియల్ ఎస్టేట్ & ప్రాపర్టీస్',
    icon: 'home',
    color: '#1D4ED8',
    bgLight: '#DBEAFE',
    subcategories: [
      { id: 'open_plots', name_en: 'Open Plots & Ventures', name_te: 'ఓపెన్ ప్లాట్లు & వెంచర్లు' },
      { id: 'apartments_villas', name_en: 'Flats & Luxury Villas', name_te: 'ఫ్లాట్లు & విల్లాలు' },
      { id: 'commercial_leasing', name_en: 'Commercial Spaces for Rent', name_te: 'వాణిజ్య స్థలాలు' },
    ],
  },
  {
    id: 'construction_builders',
    name_en: 'Construction & Builders',
    name_te: 'కన్‌స్ట్రక్షన్ & బిల్డర్స్',
    icon: 'construct',
    color: '#C2410C',
    bgLight: '#FFEDD5',
    subcategories: [
      { id: 'civil_contractors', name_en: 'Civil & Building Contractors', name_te: 'భవన కాంట్రాక్టర్లు' },
      { id: 'architects_engineers', name_en: 'Architects & Interior Designers', name_te: 'ఆర్కిటెక్ట్స్ & డిజైనర్లు' },
      { id: 'building_materials', name_en: 'Cement, Steel & Bricks', name_te: 'భవన నిర్మాణ వస్తువులు' },
    ],
  },
  {
    id: 'automobile_dealers',
    name_en: 'Automobile Dealers',
    name_te: 'కార్ & బైక్ షోరూమ్‌లు',
    icon: 'car-sport',
    color: '#BE185D',
    bgLight: '#FCE7F3',
    subcategories: [
      { id: 'two_wheeler_dealers', name_en: 'Two-Wheeler Showrooms', name_te: 'బైక్ & స్కూటర్ షోరూమ్‌లు' },
      { id: 'car_dealers', name_en: 'New & Used Car Showrooms', name_te: 'కార్ల షోరూమ్‌లు' },
      { id: 'ev_dealers', name_en: 'Electric Vehicle (EV) Dealers', name_te: 'ఈవీ షోరూమ్‌లు' },
    ],
  },
  {
    id: 'automobile_service',
    name_en: 'Automobile Service & Repair',
    name_te: 'ఆటోమొబైల్ సర్వీస్ & రిపేర్',
    icon: 'build',
    color: '#0891B2',
    bgLight: '#CFFAFE',
    subcategories: [
      { id: 'bike_mechanics', name_en: 'Two-Wheeler Service Centers', name_te: 'బైక్ రిపేర్ సెంటర్లు' },
      { id: 'car_garages', name_en: 'Car Garages & Denting/Painting', name_te: 'కార్ గ్యారేజీలు' },
      { id: 'water_wash', name_en: 'Auto Washing & Detailing', name_te: 'కార్ వాషింగ్ & డీటెయిలింగ్' },
    ],
  },
  {
    id: 'beauty_salons',
    name_en: 'Beauty Parlours & Salons',
    name_te: 'బ్యూటీ పార్లర్లు & సెలూన్లు',
    icon: 'sparkles',
    color: '#DB2777',
    bgLight: '#FCE7F3',
    subcategories: [
      { id: 'women_parlours', name_en: "Ladies Beauty Parlours", name_te: 'మహిళల బ్యూటీ పార్లర్లు' },
      { id: 'mens_salons', name_en: "Men's Hair Salons & Grooming", name_te: 'పురుషుల సెలూన్లు' },
      { id: 'spa_wellness', name_en: 'Spa & Skin Care Centers', name_te: 'స్పా & స్కిన్ కేర్' },
    ],
  },
  {
    id: 'fitness_gyms',
    name_en: 'Fitness Centers & Gyms',
    name_te: 'ఫిట్‌నెస్ సెంటర్లు & జిమ్‌లు',
    icon: 'barbell',
    color: '#DC2626',
    bgLight: '#FEE2E2',
    subcategories: [
      { id: 'unisex_gyms', name_en: 'Gyms & Weight Training', name_te: 'జిమ్‌లు & వర్కవుట్ సెంటర్లు' },
      { id: 'yoga_zumba', name_en: 'Yoga & Aerobics Studios', name_te: 'యోగా & ఏరోబిక్స్' },
      { id: 'crossfit_martialarts', name_en: 'CrossFit & Martial Arts', name_te: 'కరాటే & మార్షల్ ఆర్ట్స్' },
    ],
  },
  {
    id: 'jewellery_stores',
    name_en: 'Jewellery Stores',
    name_te: 'బంగారు & వెండి నగల దుకాణాలు',
    icon: 'diamond',
    color: '#CA8A04',
    bgLight: '#FEF9C3',
    subcategories: [
      { id: 'gold_diamond', name_en: 'Gold & Diamond Showrooms', name_te: 'బంగారు & డైమండ్ నగల దుకాణాలు' },
      { id: 'silver_ornaments', name_en: 'Silver Ornaments & Articles', name_te: 'వెండి ఆభరణాలు' },
      { id: 'fashion_jewellery', name_en: '1-Gram Gold & Fashion Jewellery', name_te: 'వన్ గ్రామ్ గోల్డ్' },
    ],
  },
  {
    id: 'furniture_home_decor',
    name_en: 'Furniture & Home Decor',
    name_te: 'ఫర్నిచర్ & హోమ్ డెకర్',
    icon: 'bed',
    color: '#9333EA',
    bgLight: '#F3E8FF',
    subcategories: [
      { id: 'wooden_furniture', name_en: 'Sofas, Beds & Dining Sets', name_te: 'చెక్క ఫర్నిచర్' },
      { id: 'office_furniture', name_en: 'Office Chairs & Desks', name_te: 'ఆఫీస్ ఫర్నిచర్' },
      { id: 'home_decor', name_en: 'Curtains, Wallpapers & Decor', name_te: 'హోమ్ డెకర్ & కర్టెన్లు' },
    ],
  },
  {
    id: 'hardware_electrical',
    name_en: 'Hardware & Electrical Stores',
    name_te: 'హార్డ్‌వేర్ & ఎలక్ట్రికల్ దుకాణాలు',
    icon: 'hardware-chip',
    color: '#475569',
    bgLight: '#F1F5F9',
    subcategories: [
      { id: 'electrical_goods', name_en: 'Wires, Lights & Fans', name_te: 'ఎలక్ట్రికల్ వస్తువులు' },
      { id: 'paints_sanitary', name_en: 'Paints & Sanitary Ware', name_te: 'పెయింట్లు & శానిటరీ' },
      { id: 'tools_hardware', name_en: 'Power Tools & Hardware', name_te: 'పవర్ టూల్స్ & హార్డ్‌వేర్' },
    ],
  },
  {
    id: 'wholesale_distributors',
    name_en: 'Wholesale & Distributors',
    name_te: 'హోల్‌సేల్ & డిస్ట్రిబ్యూటర్లు',
    icon: 'cube',
    color: '#4338CA',
    bgLight: '#E0E7FF',
    subcategories: [
      { id: 'fmcg_distributors', name_en: 'FMCG & Provision Distributors', name_te: 'ఎఫ్‌ఎంసీజీ డిస్ట్రిబ్యూటర్లు' },
      { id: 'pharma_distributors', name_en: 'Pharma Wholesalers', name_te: 'ఫార్మా హోల్‌సేలర్లు' },
      { id: 'textile_wholesalers', name_en: 'Textile & Cloth Wholesale', name_te: 'వస్త్ర హోల్‌సేలర్లు' },
    ],
  },
  {
    id: 'manufacturing_industries',
    name_en: 'Manufacturing & Industries',
    name_te: 'తయారీ & పరిశ్రమలు',
    icon: 'business',
    color: '#334155',
    bgLight: '#F1F5F9',
    subcategories: [
      { id: 'cement_granite', name_en: 'Slab, Cement & Granite Units', name_te: 'గ్రానైట్ & సిమెంట్ యూనిట్లు' },
      { id: 'plastic_packaging', name_en: 'Packaging & Plastics', name_te: 'ప్యాకేజింగ్ & ప్లాస్టిక్స్' },
      { id: 'agro_industries', name_en: 'Cotton, Oil & Agro Mills', name_te: 'కాటన్ & ఆయిల్ మిల్లులు' },
    ],
  },
  {
    id: 'agriculture_farming',
    name_en: 'Agriculture & Farming Businesses',
    name_te: 'వ్యవసాయం & విత్తన వ్యాపారాలు',
    icon: 'leaf',
    color: '#15803D',
    bgLight: '#DCFCE7',
    subcategories: [
      { id: 'seeds_fertilizers', name_en: 'Seeds & Fertilizer Shops', name_te: 'విత్తనాలు & ఎరువుల దుకాణాలు' },
      { id: 'farm_machinery', name_en: 'Tractors & Farm Equipment', name_te: 'ట్రాక్టర్లు & పనిముట్లు' },
      { id: 'irrigation_drip', name_en: 'Drip Irrigation & Pumps', name_te: 'డ్రిప్ ఇరిగేషన్ & మోటార్లు' },
    ],
  },
  {
    id: 'travel_tourism',
    name_en: 'Travel & Tourism Agencies',
    name_te: 'ట్రావెల్స్ & టూరిజం ఏజెన్సీలు',
    icon: 'airplane',
    color: '#0284C7',
    bgLight: '#E0F2FE',
    subcategories: [
      { id: 'tour_operators', name_en: 'Pilgrimage & Holiday Packages', name_te: 'తీర్థయాత్రలు & టూర్ ప్యాకేజీలు' },
      { id: 'car_rentals', name_en: 'Taxi Services & Self-Drive Cars', name_te: 'కార్ రెంటల్స్ & ట్యాక్సీ' },
      { id: 'bus_train_booking', name_en: 'Ticket Booking Centers', name_te: 'టికెట్ బుకింగ్ కేంద్రాలు' },
    ],
  },
  {
    id: 'event_management',
    name_en: 'Event Management Services',
    name_te: 'ఈవెంట్ మేనేజ్‌మెంట్',
    icon: 'calendar',
    color: '#C026D3',
    bgLight: '#FAE8FF',
    subcategories: [
      { id: 'corporate_events', name_en: 'Corporate Events & Launches', name_te: 'కార్పొరేట్ ఈవెంట్లు' },
      { id: 'stage_lighting', name_en: 'Stage, Sound & LED Walls', name_te: 'సౌండ్ & లైటింగ్ సిస్టమ్స్' },
      { id: 'birthday_parties', name_en: 'Birthday & Anniversary Planners', name_te: 'పుట్టినరోజు ఈవెంట్స్' },
    ],
  },
  {
    id: 'wedding_planners',
    name_en: 'Wedding Planners & Decorators',
    name_te: 'వెడ్డింగ్ ప్లానర్స్ & డెకరేటర్స్',
    icon: 'rose',
    color: '#E11D48',
    bgLight: '#FFE4E6',
    subcategories: [
      { id: 'wedding_decorators', name_en: 'Mandapam & Flower Decorators', name_te: 'మండపం & పూల అలంకరణ' },
      { id: 'destination_weddings', name_en: 'Complete Wedding Planners', name_te: 'సంపూర్ణ వివాహ ప్రణాళిక' },
      { id: 'orchestra_nadaswaram', name_en: 'Music Bands & Nadaswaram', name_te: 'మేళతాళాలు & సంగీతం' },
    ],
  },
  {
    id: 'photography_studios',
    name_en: 'Photography & Videography Studios',
    name_te: 'ఫోటో & వీడియో స్టూడియోలు',
    icon: 'camera',
    color: '#6366F1',
    bgLight: '#EEF2FF',
    subcategories: [
      { id: 'wedding_photography', name_en: 'Candid Wedding Photographers', name_te: 'వివాహ ఫోటోగ్రఫీ' },
      { id: 'drone_cinematography', name_en: 'Drone Shoots & 4K Video', name_te: 'డ్రోన్ & 4K వీడియోగ్రఫీ' },
      { id: 'photo_studios', name_en: 'Passport & Family Portrait Studios', name_te: 'ఫోటో స్టూడియోలు' },
    ],
  },
  {
    id: 'financial_services',
    name_en: 'Financial Services & Consultants',
    name_te: 'ఆర్థిక సేవలు & కన్సల్టెంట్లు',
    icon: 'cash',
    color: '#047857',
    bgLight: '#ECFDF5',
    subcategories: [
      { id: 'loan_consultants', name_en: 'Home & Business Loans', name_te: 'రుణాల కన్సల్టెంట్లు' },
      { id: 'mutual_funds_tax', name_en: 'Mutual Funds, Stocks & Tax Planning', name_te: 'మ్యూచువల్ ఫండ్స్ & పన్ను ప్రణాళిక' },
      { id: 'gold_loan', name_en: 'Gold Loan Companies', name_te: 'గోల్డ్ లోన్ సర్వీసెస్' },
    ],
  },
  {
    id: 'banks_insurance',
    name_en: 'Banks & Insurance Services',
    name_te: 'బ్యాంకులు & ఇన్సూరెన్స్ సేవలు',
    icon: 'card',
    color: '#1E40AF',
    bgLight: '#DBEAFE',
    subcategories: [
      { id: 'public_private_banks', name_en: 'Bank Branches & ATMs', name_te: 'బ్యాంకు శాఖలు & ఏటీఎంలు' },
      { id: 'life_health_insurance', name_en: 'Life & Health Insurance Agents', name_te: 'జీవిత & ఆరోగ్య బీమా' },
      { id: 'vehicle_insurance', name_en: 'Motor & General Insurance', name_te: 'వాహన బీమా' },
    ],
  },
  {
    id: 'legal_consultancy',
    name_en: 'Legal & Consultancy Services',
    name_te: 'న్యాయ & కన్సల్టెన్సీ సేవలు',
    icon: 'briefcase',
    color: '#374151',
    bgLight: '#F3F4F6',
    subcategories: [
      { id: 'advocates_chambers', name_en: 'Civil & Criminal Advocates', name_te: 'న్యాయవాదుల కార్యాలయాలు' },
      { id: 'doc_registration', name_en: 'Property Registration Document Writers', name_te: 'డాక్యుమెంట్ రైటర్లు' },
      { id: 'notary_services', name_en: 'Notary & Legal Stamp Services', name_te: 'నోటరీ సేవలు' },
    ],
  },
  {
    id: 'courier_logistics',
    name_en: 'Courier & Logistics Services',
    name_te: 'కొరియర్ & లాజిస్టిక్స్ సర్వీసెస్',
    icon: 'paper-plane',
    color: '#D97706',
    bgLight: '#FEF3C7',
    subcategories: [
      { id: 'domestic_couriers', name_en: 'Domestic Parcel Services', name_te: 'దేశీయ కొరియర్ సేవలు' },
      { id: 'international_courier', name_en: 'International Courier Agencies', name_te: 'అంతర్జాతీయ కొరియర్' },
      { id: 'packers_movers', name_en: 'Packers & Movers', name_te: 'ప్యాకర్స్ & మూవర్స్' },
    ],
  },
  {
    id: 'transportation_services',
    name_en: 'Transportation Services',
    name_te: 'రవాణా & ట్రాన్స్‌పోర్ట్ సర్వీసులు',
    icon: 'bus',
    color: '#2563EB',
    bgLight: '#EFF6FF',
    subcategories: [
      { id: 'lorry_goods_transport', name_en: 'Lorry & Truck Transport Office', name_te: 'లారీ & గూడ్స్ రవాణా' },
      { id: 'auto_cab_stands', name_en: 'Auto & Taxi Union Stands', name_te: 'ఆటో & క్యాబ్ స్టాండ్లు' },
      { id: 'travel_buses', name_en: 'Intercity Private Bus Operators', name_te: 'ప్రైవేట్ బస్సు ఆపరేటర్లు' },
    ],
  },
  {
    id: 'home_services_repairs',
    name_en: 'Home Services & Repairs',
    name_te: 'గృహ మరమ్మతులు & సర్వీసులు',
    icon: 'hammer',
    color: '#EA580C',
    bgLight: '#FFEDD5',
    subcategories: [
      { id: 'plumbing_electrical', name_en: 'Plumbers & Electricians', name_te: 'ప్లంబింగ్ & ఎలక్ట్రికల్' },
      { id: 'appliance_repairs', name_en: 'RO, Fridge & Washing Machine Repair', name_te: 'గృహోపకరణాల మరమ్మతు' },
      { id: 'carpentry_painting', name_en: 'Carpenters & House Painters', name_te: 'వడ్రంగి & పెయింటింగ్' },
    ],
  },
  {
    id: 'cleaning_pest_control',
    name_en: 'Cleaning & Pest Control Services',
    name_te: 'క్లీనింగ్ & పెస్ట్ కంట్రోల్',
    icon: 'shield-checkmark',
    color: '#059669',
    bgLight: '#D1FAE5',
    subcategories: [
      { id: 'pest_control', name_en: 'Termite & Cockroach Pest Control', name_te: 'చీడపీడల నియంత్రణ' },
      { id: 'deep_cleaning', name_en: 'Deep Home & Office Cleaning', name_te: 'డీప్ క్లీనింగ్ సేవలు' },
      { id: 'water_tank_cleaning', name_en: 'Water Tank & Sump Cleaning', name_te: 'వాటర్ ట్యాంక్ క్లీనింగ్' },
    ],
  },
  {
    id: 'printing_advertising',
    name_en: 'Printing & Advertising Agencies',
    name_te: 'ప్రింటింగ్ & అడ్వర్టైజింగ్',
    icon: 'print',
    color: '#7C3AED',
    bgLight: '#EDE9FE',
    subcategories: [
      { id: 'flex_banners', name_en: 'Flex Banners & Hoardings', name_te: 'ఫ్లెక్స్ బ్యానర్లు & హోర్డింగ్స్' },
      { id: 'offset_printing', name_en: 'Wedding Cards & Book Printing', name_te: 'పెళ్లి పత్రికలు & ఆఫ్‌సెట్ ప్రింటింగ్' },
      { id: 'digital_xerox', name_en: 'Digital Color Xerox & Lamination', name_te: 'జిరాక్స్ & లామినేషన్' },
    ],
  },
  {
    id: 'bakeries_sweets',
    name_en: 'Bakeries & Sweet Shops',
    name_te: 'బేకరీలు & స్వీట్ షాపులు',
    icon: 'fast-food',
    color: '#D97706',
    bgLight: '#FEF3C7',
    subcategories: [
      { id: 'traditional_sweets', name_en: 'Kurnool Traditional Sweets & Ghee Treats', name_te: 'సంప్రదాయ స్వీట్స్' },
      { id: 'cake_pastry_bakeries', name_en: 'Fresh Cakes, Puffs & Bakery Items', name_te: 'కేకులు & బేకరీ తినుబండారాలు' },
      { id: 'ice_cream_parlours', name_en: 'Ice Cream Parlours', name_te: 'ఐస్ క్రీమ్ పార్లర్లు' },
    ],
  },
  {
    id: 'food_catering',
    name_en: 'Food & Catering Services',
    name_te: 'క్యాటరింగ్ & భోజన సేవలు',
    icon: 'restaurant',
    color: '#DC2626',
    bgLight: '#FEE2E2',
    subcategories: [
      { id: 'wedding_catering', name_en: 'Wedding & Function Catering', name_te: 'వివాహ & ఫంక్షన్ క్యాటరింగ్' },
      { id: 'mess_tiffin_services', name_en: 'Tiffin Services & Daily Mess', name_te: 'టిఫిన్ సెంటర్లు & మెస్' },
      { id: 'curry_points', name_en: 'Takeaway Curry Points', name_te: 'కర్రీ పాయింట్స్' },
    ],
  },
  {
    id: 'dairy_milk',
    name_en: 'Dairy & Milk Products',
    name_te: 'డెయిరీ & పాల ఉత్పత్తులు',
    icon: 'water',
    color: '#0284C7',
    bgLight: '#E0F2FE',
    subcategories: [
      { id: 'fresh_milk_centers', name_en: 'Fresh Milk & Curd Centers', name_te: 'తాజా పాలు & పెరుగు కేంద్రాలు' },
      { id: 'paneer_ghee_stores', name_en: 'Pure Ghee, Paneer & Butter', name_te: 'స్వచ్ఛమైన నెయ్యి & పనీర్' },
      { id: 'dairy_farms', name_en: 'Local Dairy Farms & Outlets', name_te: 'డెయిరీ ఫారాలు' },
    ],
  },
  {
    id: 'gift_toy_stores',
    name_en: 'Gift & Toy Stores',
    name_te: 'గిఫ్ట్ & బొమ్మల దుకాణాలు',
    icon: 'gift',
    color: '#EC4899',
    bgLight: '#FCE7F3',
    subcategories: [
      { id: 'gift_articles', name_en: 'Gift Articles & Novelties', name_te: 'గిఫ్ట్ ఆర్టికల్స్' },
      { id: 'toy_shops', name_en: "Kids Toys & Games", name_te: 'పిల్లల బొమ్మల దుకాణాలు' },
      { id: 'watches_clocks', name_en: 'Watches & Wall Clocks', name_te: 'వాచీలు & గడియారాలు' },
    ],
  },
  {
    id: 'sports_fitness_stores',
    name_en: 'Sports & Fitness Stores',
    name_te: 'స్పోర్ట్స్ & ఫిట్‌నెస్ స్టోర్లు',
    icon: 'football',
    color: '#16A34A',
    bgLight: '#DCFCE7',
    subcategories: [
      { id: 'sports_gear', name_en: 'Cricket, Badminton & Sports Gear', name_te: 'క్రీడా సామాగ్రి' },
      { id: 'fitness_equipment', name_en: 'Treadmills, Dumbbells & Gym Gear', name_te: 'ఫిట్‌నెస్ ఎక్విప్‌మెంట్' },
      { id: 'sports_apparel', name_en: 'Sportswear & Shoes', name_te: 'స్పోర్ట్స్ షూస్ & డ్రెస్సులు' },
    ],
  },
  {
    id: 'pet_shops_veterinary',
    name_en: 'Pet Shops & Veterinary Services',
    name_te: 'పెట్ షాపులు & వెటర్నరీ క్లినిక్స్',
    icon: 'paw',
    color: '#854D0E',
    bgLight: '#FEF3C7',
    subcategories: [
      { id: 'pet_supplies', name_en: 'Dog & Cat Food, Accessories', name_te: 'పెట్ ఫుడ్ & ఉపకరణాలు' },
      { id: 'veterinary_doctors', name_en: 'Veterinary Clinics & Doctors', name_te: 'పశువైద్య శాలలు' },
      { id: 'aquarium_birds', name_en: 'Aquariums, Fishes & Pet Birds', name_te: 'ఆక్వేరియం & పక్షులు' },
    ],
  },
  {
    id: 'ngos_social_orgs',
    name_en: 'NGOs & Social Organizations',
    name_te: 'ఎన్జీఓలు & సేవా సంస్థలు',
    icon: 'people',
    color: '#0D9488',
    bgLight: '#CCFBF1',
    subcategories: [
      { id: 'charity_trusts', name_en: 'Charitable Trusts & Foundations', name_te: 'ఛారిటబుల్ ట్రస్ట్‌లు' },
      { id: 'blood_banks', name_en: 'Voluntary Blood Donation Societies', name_te: 'బ్లడ్ బ్యాంకులు' },
      { id: 'orphanages_oldage', name_en: 'Orphanages & Old Age Homes', name_te: 'అనాథ & వృద్ధాశ్రమాలు' },
    ],
  },
  {
    id: 'coworking_spaces',
    name_en: 'Coworking Spaces',
    name_te: 'కో-వర్కింగ్ స్పేసెస్',
    icon: 'desktop',
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    subcategories: [
      { id: 'shared_desks', name_en: 'Hot Desks & Shared Workstations', name_te: 'వర్క్‌స్పేస్ డెస్క్‌లు' },
      { id: 'private_cabins', name_en: 'Private Offices & Team Cabins', name_te: 'ప్రైవేట్ క్యాబిన్లు' },
      { id: 'meeting_rooms', name_en: 'Conference & Meeting Rooms', name_te: 'మీటింగ్ హాళ్లు' },
    ],
  },
  {
    id: 'shopping_malls',
    name_en: 'Shopping Malls & Commercial Complexes',
    name_te: 'షాపింగ్ మాల్స్ & కాంప్లెక్స్‌లు',
    icon: 'business',
    color: '#9333EA',
    bgLight: '#F3E8FF',
    subcategories: [
      { id: 'shopping_centers', name_en: 'Shopping Malls', name_te: 'షాపింగ్ మాల్స్' },
      { id: 'commercial_plazas', name_en: 'Commercial Shopping Plazas', name_te: 'వాణిజ్య సముదాయాలు' },
    ],
  },
  {
    id: 'ecommerce_online',
    name_en: 'E-commerce & Online Businesses',
    name_te: 'ఈ-కామర్స్ & ఆన్‌లైన్ వ్యాపారాలు',
    icon: 'globe',
    color: '#2563EB',
    bgLight: '#EFF6FF',
    subcategories: [
      { id: 'd2c_brands', name_en: 'Online D2C Retailers & Brands', name_te: 'ఆన్‌లైన్ బ్రాండ్లు' },
      { id: 'drop_shipping', name_en: 'E-commerce Fulfillment Centers', name_te: 'ఈ-కామర్స్ ఆర్డర్ డెలివరీ' },
      { id: 'digital_products', name_en: 'Online Courses & Digital Services', name_te: 'డిజిటల్ సేవలు' },
    ],
  },
  {
    id: 'repair_services',
    name_en: 'Mobile & Computer Repair Services',
    name_te: 'మొబైల్ & కంప్యూటర్ రిపేరింగ్',
    icon: 'hardware-chip',
    color: '#0891B2',
    bgLight: '#CFFAFE',
    subcategories: [
      { id: 'mobile_repair', name_en: 'Mobile Screen & Motherboard Repair', name_te: 'మొబైల్ స్క్రీన్ రిపేర్' },
      { id: 'laptop_service', name_en: 'Laptop & Desktop Repair Centers', name_te: 'ల్యాప్‌టాప్ సర్వీసింగ్' },
      { id: 'printer_cctv_repair', name_en: 'CCTV & Printer Servicing', name_te: 'సీసీటీవీ & ప్రింటర్ రిపేర్' },
    ],
  },
  {
    id: 'tailoring_boutiques',
    name_en: 'Tailoring & Boutique Shops',
    name_te: 'టైలరింగ్ & బొటిక్ షాపులు',
    icon: 'cut',
    color: '#E11D48',
    bgLight: '#FFE4E6',
    subcategories: [
      { id: 'ladies_tailors', name_en: 'Blouse, Maggam Work & Salwar Tailors', name_te: 'మగ్గం వర్క్ & లేడీస్ టైలర్స్' },
      { id: 'designer_boutiques', name_en: 'Designer Bridal Boutiques', name_te: 'డిజైనర్ బొటిక్స్' },
      { id: 'gents_tailors', name_en: 'Suiting & Shirting Tailors', name_te: 'జెంట్స్ టైలర్స్' },
    ],
  },
  {
    id: 'handicrafts_local',
    name_en: 'Handicrafts & Local Products',
    name_te: 'హస్తకళలు & స్థానిక ఉత్పత్తులు',
    icon: 'color-palette',
    color: '#B45309',
    bgLight: '#FEF3C7',
    subcategories: [
      { id: 'handloom_cotton', name_en: 'Handloom Cotton & Traditional Weaves', name_te: 'చేనేత వస్త్రాలు' },
      { id: 'clay_metal_crafts', name_en: 'Terracotta, Brass & Clay Crafts', name_te: 'మట్టి & ఇత్తడి కళారూపాలు' },
      { id: 'wooden_carvings', name_en: 'Wooden Art & Heritage Souvenirs', name_te: 'చెక్క బొమ్మలు & కళాఖండాలు' },
    ],
  },
  {
    id: 'entertainment_recreation',
    name_en: 'Entertainment & Recreation Centers',
    name_te: 'వినోదం & ఆట స్థలాలు',
    icon: 'game-controller',
    color: '#7C3AED',
    bgLight: '#EDE9FE',
    subcategories: [
      { id: 'movie_theatres', name_en: 'Cinema Theatres & Multiplexes', name_te: 'సినిమా థియేటర్లు' },
      { id: 'gaming_zones', name_en: 'Bowling, VR & Gaming Arcades', name_te: 'గేమింగ్ జోన్లు' },
      { id: 'amusement_waterparks', name_en: 'Children Parks & Play Arenas', name_te: 'పిల్లల పార్కులు & ఆట స్థలాలు' },
    ],
  },
  {
    id: 'other_businesses',
    name_en: 'Other Businesses',
    name_te: 'ఇతర వ్యాపారాలు',
    icon: 'apps',
    color: '#64748B',
    bgLight: '#F1F5F9',
    subcategories: [
      { id: 'general_enterprises', name_en: 'General Enterprises & Services', name_te: 'ఇతర వ్యాపార సంస్థలు' },
    ],
  },
];

// Legacy mapping support for seamless query backward compatibility
export const LEGACY_BUSINESS_CATEGORY_MAP: Record<string, string> = {
  food_dining: 'restaurants_cafes',
  health_wellness: 'hospitals_clinics',
  shopping: 'clothing_fashion',
  home_services: 'home_services_repairs',
  skilled_services: 'home_services_repairs',
  education: 'educational_institutions',
  automotive: 'automobile_service',
  beauty_care: 'beauty_salons',
  creative_media: 'photography_studios',
  professional_services: 'legal_consultancy',
};

// ─── INITIAL SEED DATA (KURNOOL ATTRACTIONS & HERITAGE) ─────────────────────

export const SEED_PLACES: PlaceItem[] = [];

export const SEED_WORSHIP_PLACES: PlaceItem[] = [];

export const SEED_PROFESSIONALS: ProfessionalItem[] = [
  {
    id: 'pro_venkat_electrician',
    fullName: 'P. Venkat Ramana',
    category: 'electrician',
    categoryName_te: 'ఎలక్ట్రీషియన్',
    experienceYears: 8,
    serviceAreas: ['Bhagya Nagar', 'Collectorate', 'Prakash Nagar', 'Santosh Nagar'],
    phone: '+919848123450',
    whatsapp: '+919848123450',
    ratingAvg: 4.8,
    ratingCount: 62,
    startingPrice: '₹250',
    pricingUnit: 'per visit',
    about_en: 'Expert in house electrical wiring, short circuit repair, MCB fixes, ceiling fan installation, and inverter setups across Kurnool.',
    about_te: 'ఇంటి వైరింగ్, షార్ట్ సర్క్యూట్ రిపేర్ మరియు ఇన్వర్టర్ సెటప్ నిపుణుడు.',
    status: 'active',
    verifiedProfessional: true,
  },
  {
    id: 'pro_suresh_plumber',
    fullName: 'K. Suresh Kumar',
    category: 'plumber',
    categoryName_te: 'ప్లంబర్',
    experienceYears: 11,
    serviceAreas: ['Old City', 'C-Camp', 'Joharapuram', 'B-Camp'],
    phone: '+919848234561',
    whatsapp: '+919848234561',
    ratingAvg: 4.7,
    ratingCount: 48,
    startingPrice: '₹300',
    pricingUnit: 'per service',
    about_en: 'Complete bathroom plumbing solutions, pipeline leakage repair, water motor pump installations, and water tank cleaning.',
    about_te: 'పైప్‌లైన్ లీకేజ్ రిపేర్, మోటార్ పంపు బిగింపు మరియు వాటర్ ట్యాంక్ క్లీనింగ్.',
    status: 'active',
    verifiedProfessional: true,
  },
  {
    id: 'pro_rajesh_ac_tech',
    fullName: 'M. Rajesh',
    category: 'ac_repair',
    categoryName_te: 'ఏసీ & ఫ్రిజ్ టెక్నీషియన్',
    experienceYears: 6,
    serviceAreas: ['All Kurnool City Areas'],
    phone: '+919848345672',
    whatsapp: '+919848345672',
    ratingAvg: 4.9,
    ratingCount: 75,
    startingPrice: '₹450',
    pricingUnit: 'per AC service',
    about_en: 'Split and window AC gas charging, deep jet cleaning, PCB repair, and refrigerator troubleshooting.',
    about_te: 'ఏసీ గ్యాస్ ఛార్జింగ్, డీప్ జెట్ క్లీనింగ్ మరియు ఫ్రిజ్ రిపేర్ సేవలు.',
    status: 'active',
    verifiedProfessional: true,
  },
];

export const SEED_BUSINESSES: BusinessItem[] = [
  {
    id: 'biz_mourya_inn',
    name_en: 'Hotel Mourya Inn',
    name_te: 'హోటల్ మౌర్య ఇన్',
    categoryId: 'hotels_lodges',
    address: 'Bhagya Nagar, Near Old Bus Stand, Kurnool, AP 518001',
    landmark: 'Near Old Bus Stand',
    phone: '+918518224999',
    whatsapp: '+919848011223',
    ratingAvg: 4.5,
    ratingCount: 128,
    description_en: 'Premier luxury hotel offering premium AC suites, multi-cuisine restaurants, and banquet halls in the heart of Kurnool city.',
    description_te: 'కర్నూలు నడిబొడ్డున ఉన్న ప్రముఖ లగ్జరీ హోటల్, ఏసీ గదులు మరియు బ్యాంక్వెట్ హాళ్ళు.',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    status: 'published',
    tier: 'featured',
    verificationBadge: 'verified_business',
    claimStatus: 'verified',
  },
  {
    id: 'biz_kurnool_ruchulu',
    name_en: 'Kurnool Ruchulu Restaurant',
    name_te: 'కర్నూలు రుచులు రెస్టారెంట్',
    categoryId: 'restaurants_cafes',
    address: 'Collectorate Complex Road, Kurnool, AP 518002',
    landmark: 'Opp. ZP Office',
    phone: '+919440054321',
    whatsapp: '+919440054321',
    ratingAvg: 4.7,
    ratingCount: 214,
    description_en: 'Authentic Rayalaseema cuisine, famous Kurnool spicy Natu Kodi Pulao, Uggani Bajji, and Ragi Sangati with mutton curry.',
    description_te: 'ప్రసిద్ధ రాయలసీమ వంటకాలు, నాటుకోడి పులావ్ మరియు రాగి సంకటి.',
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    status: 'published',
    tier: 'featured',
    verificationBadge: 'verified_business',
    claimStatus: 'verified',
  },
  {
    id: 'biz_balaji_supermarket',
    name_en: 'Sri Balaji Supermarket',
    name_te: 'శ్రీ బాలాజీ సూపర్ మార్కెట్',
    categoryId: 'supermarkets_grocery',
    address: 'Prakash Nagar Main Road, Kurnool, AP 518004',
    landmark: 'Near Venkateswara Swamy Temple',
    phone: '+919848523456',
    whatsapp: '+919848523456',
    ratingAvg: 4.6,
    ratingCount: 95,
    description_en: 'One-stop grocery and daily essentials store featuring fresh organic produce, daily household items, and doorstep delivery across Kurnool.',
    description_te: 'తాజా కూరగాయలు, కిరాణా సరుకులు మరియు హోమ్ డెలివరీ సౌకర్యం.',
    images: ['https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'],
    status: 'published',
    tier: 'featured',
    verificationBadge: 'verified_business',
    claimStatus: 'verified',
  },
  {
    id: 'biz_sai_silk_palace',
    name_en: 'Sri Sai Silk Palace',
    name_te: 'శ్రీ సాయి సిల్క్ ప్యాలెస్',
    categoryId: 'clothing_fashion',
    address: 'Park Road, Old City, Kurnool, AP 518001',
    landmark: 'Near Raj Vihar Centre',
    phone: '+919848012345',
    whatsapp: '+919848012345',
    ratingAvg: 4.8,
    ratingCount: 160,
    description_en: 'Exclusive bridal silk sarees, Gadwal & Dharmavaram handlooms, wedding sherwanis, and festive wear collections.',
    description_te: 'వివాహ పట్టుచీరలు, గద్వాల & ధర్మవరం చేనేత వస్త్రాల ప్రత్యేక షోరూమ్.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'],
    status: 'published',
    tier: 'premium',
    verificationBadge: 'verified_business',
    claimStatus: 'verified',
  },
  {
    id: 'biz_konda_reddy_clinic',
    name_en: 'Konda Reddy Diagnostics & Clinic',
    name_te: 'కొండారెడ్డి డయాగ్నస్టిక్స్ & క్లినిక్',
    categoryId: 'hospitals_clinics',
    address: 'Gayatri Estate, Near Government General Hospital, Kurnool, AP 518002',
    landmark: 'Near GGH Kurnool',
    phone: '+918518233445',
    whatsapp: '+919441188990',
    ratingAvg: 4.6,
    ratingCount: 84,
    description_en: 'Full diagnostic lab facilities, 24/7 emergency pharmacy, digital X-Ray, ultrasound, and specialist doctor consultations.',
    description_te: '24/7 డయాగ్నస్టిక్ ల్యాబ్, డిజిటల్ ఎక్స్-రే మరియు స్పెషలిస్ట్ వైద్యుల సంప్రదింపులు.',
    images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'],
    status: 'published',
    tier: 'featured',
    verificationBadge: 'verified_business',
    claimStatus: 'verified',
  },
  {
    id: 'biz_raghavendra_sweets',
    name_en: 'Sri Raghavendra Sweets & Bakery',
    name_te: 'శ్రీ రాఘవేంద్ర స్వీట్స్',
    categoryId: 'restaurants_cafes',
    address: 'Mourya Inn Circle, Kurnool, AP 518001',
    landmark: 'Mourya Circle',
    phone: '+919849123789',
    whatsapp: '+919849123789',
    ratingAvg: 4.9,
    ratingCount: 310,
    description_en: 'Traditional pure ghee sweets, famous Kurnool Kova, Mysore Pak, Bellam Jalebi, hot savouries, and fresh bakery items.',
    description_te: 'స్వచ్ఛమైన నెయ్యి స్వీట్లు, ప్రసిద్ధ కర్నూలు కోవా మరియు మైసూర్ పాక్.',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'],
    status: 'published',
    tier: 'premium',
    verificationBadge: 'verified_business',
    claimStatus: 'verified',
  },
];

export const SEED_OFFERS: OfferItem[] = [
  {
    id: 'offer_silk_saree_kurnool',
    title_en: 'Festive Season Saree Offer',
    title_te: 'పండుగల పట్టుచీరల ప్రత్యేక ఆఫర్',
    description_en: 'Get flat 20% off on all bridal silk sarees & traditional dhotis with complimentary fall and edging.',
    description_te: 'అన్ని వివాహ పట్టుచీరలపై 20% ఫ్లాట్ డిస్కౌంట్ మరియు ఉచిత ఫాల్ అండ్ పీకో.',
    discountText: 'FLAT 20% OFF',
    businessName: 'Sri Sai Silk Palace, Kurnool',
    validUntil: 'Valid till 31 Oct 2026',
    category: 'clothing_fashion',
    phone: '+919848012345',
    bannerUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'offer_uggani_bajji_combo',
    title_en: 'Rayalaseema Dining Special',
    title_te: 'రాయలసీమ స్పెషల్ భోజనం & ఉగ్గాని బజ్జీ',
    description_en: 'Enjoy special Rayalaseema authentic combos with complimentary famous Kurnool Uggani Bajji sampler on orders over ₹399.',
    description_te: '₹399 పై ఆర్డర్లపై ప్రసిద్ధ కర్నూలు ఉగ్గాని బజ్జీ ఉచితం.',
    discountText: 'COMPLIMENTARY DISH',
    businessName: 'Kurnool Ruchulu Restaurant',
    validUntil: 'Valid this Month',
    category: 'restaurants_cafes',
    phone: '+919440054321',
    bannerUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    ],
  },
];

export const SEED_EVENTS: EventItem[] = [
  {
    id: 'event_konda_reddy_walk',
    title_en: 'Konda Reddy Buruju Historic Heritage Walk',
    title_te: 'కొండారెడ్డి బురుజు హెరిటేజ్ వాక్',
    dateStr: 'Every Sunday Morning',
    timeStr: '06:30 AM - 08:30 AM',
    venue: 'Konda Reddy Fort Bastion Gate, Kurnool',
    organizerName: 'Kurnool Heritage Society',
    contactPhone: '+919849067890',
    posterUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800',
    entryType: 'free',
    status: 'approved',
  },
  {
    id: 'event_kurnool_expo',
    title_en: 'Kurnool Handloom & Artisans Trade Expo',
    title_te: 'కర్నూలు చేనేత & కుటీర పరిశ్రమల ప్రదర్శన',
    dateStr: 'Upcoming Weekend',
    timeStr: '10:00 AM - 09:00 PM',
    venue: 'Municipal Corporation Grounds, Kurnool',
    organizerName: 'Rayalaseema Crafts Forum',
    contactPhone: '+919441122334',
    posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    entryType: 'free',
    status: 'approved',
  },
];

// ─── FIRESTORE API METHODS ───────────────────────────────────────────────────

export const fetchBusinesses = async (
  categoryId?: string,
  searchQuery?: string,
): Promise<BusinessItem[]> => {
  try {
    const coll = collection(db, 'businesses');
    let q = query(coll, where('status', '==', 'published'), limit(50));
    let targetCategory = categoryId;
    if (categoryId && categoryId !== 'all') {
      const mapped = LEGACY_BUSINESS_CATEGORY_MAP[categoryId];
      if (mapped) targetCategory = mapped;
      q = query(coll, where('status', '==', 'published'), where('categoryId', 'in', [categoryId, targetCategory]), limit(50));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      let filtered = [...SEED_BUSINESSES];
      if (categoryId && categoryId !== 'all') {
        filtered = filtered.filter(b => b.categoryId === categoryId);
      }
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        filtered = filtered.filter(b => 
          b.name_en.toLowerCase().includes(queryLower) ||
          b.name_te?.includes(searchQuery) ||
          b.description_en?.toLowerCase().includes(queryLower)
        );
      }
      return filtered;
    }

    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessItem));
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      results = results.filter(b => 
        b.name_en.toLowerCase().includes(queryLower) ||
        b.name_te?.includes(searchQuery) ||
        b.description_en?.toLowerCase().includes(queryLower)
      );
    }
    return results;
  } catch (error) {
    console.error('fetchBusinesses error:', error);
    return SEED_BUSINESSES;
  }
};

export const fetchBusinessById = async (id: string): Promise<BusinessItem | null> => {
  try {
    const docRef = doc(db, 'businesses', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as BusinessItem;
    }
    const seed = SEED_BUSINESSES.find(b => b.id === id);
    return seed || null;
  } catch {
    const seed = SEED_BUSINESSES.find(b => b.id === id);
    return seed || null;
  }
};

export const fetchProfessionalById = async (id: string): Promise<ProfessionalItem | null> => {
  try {
    const docRef = doc(db, 'professionals', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as ProfessionalItem;
    }
    const seed = SEED_PROFESSIONALS.find(p => p.id === id);
    return seed || null;
  } catch {
    const seed = SEED_PROFESSIONALS.find(p => p.id === id);
    return seed || null;
  }
};

export const fetchProfessionals = async (category?: string, searchQuery?: string): Promise<ProfessionalItem[]> => {
  try {
    const coll = collection(db, 'professionals');
    const q = query(coll, where('status', '==', 'active'), limit(50));
    const snap = await getDocs(q);
    let list = snap.empty ? [...SEED_PROFESSIONALS] : snap.docs.map(d => ({ id: d.id, ...d.data() } as ProfessionalItem));

    if (category && category !== 'all') {
      const catObj = PROFESSIONAL_CATEGORIES.find(c => c.id === category);
      const matchName = catObj ? catObj.name_en.toLowerCase() : category.toLowerCase();
      list = list.filter(p => p.category.toLowerCase().includes(matchName) || (p.categoryName_te && p.categoryName_te.includes(category)));
    }

    if (searchQuery) {
      const qLower = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.fullName.toLowerCase().includes(qLower) ||
        p.category.toLowerCase().includes(qLower) ||
        (p.categoryName_te && p.categoryName_te.includes(searchQuery)) ||
        p.serviceAreas.some(a => a.toLowerCase().includes(qLower))
      );
    }
    return list;
  } catch {
    return SEED_PROFESSIONALS;
  }
};

export const fetchPlaces = async (type?: string): Promise<PlaceItem[]> => {
  try {
    const coll = collection(db, 'places');
    const snap = await getDocs(coll);
    if (snap.empty) {
      if (type && type !== 'all') {
        return SEED_PLACES.filter(p => p.type === type);
      }
      return SEED_PLACES;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PlaceItem));
  } catch {
    return SEED_PLACES;
  }
};

export const fetchWorshipPlaces = async (type?: string): Promise<PlaceItem[]> => {
  try {
    const coll = collection(db, 'places_of_worship');
    const snap = await getDocs(coll);
    if (snap.empty) {
      if (type && type !== 'all') {
        return SEED_WORSHIP_PLACES.filter(p => p.type === type);
      }
      return SEED_WORSHIP_PLACES;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PlaceItem));
  } catch {
    return SEED_WORSHIP_PLACES;
  }
};

export const fetchOffers = async (): Promise<OfferItem[]> => {
  try {
    const coll = collection(db, 'promotions');
    const snap = await getDocs(coll);
    if (snap.empty) return SEED_OFFERS;
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OfferItem));
  } catch {
    return SEED_OFFERS;
  }
};

export const fetchEvents = async (): Promise<EventItem[]> => {
  try {
    const coll = collection(db, 'events');
    const snap = await getDocs(coll);
    if (snap.empty) return SEED_EVENTS;
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EventItem));
  } catch {
    return SEED_EVENTS;
  }
};

export const uploadBusinessImage = async (uri: string): Promise<string> => {
  const filename = `biz_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const storageRef = ref(storage, `businesses/${filename}`);
  const response = await fetch(uri);
  const blob = await response.blob();
  const task = await uploadBytesResumable(storageRef, blob);
  return await getDownloadURL(task.ref);
};

export const uploadOfferImage = async (uri: string): Promise<string> => {
  const filename = `offer_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const storageRef = ref(storage, `offers/${filename}`);
  const response = await fetch(uri);
  const blob = await response.blob();
  const task = await uploadBytesResumable(storageRef, blob);
  return await getDownloadURL(task.ref);
};

export const registerBusiness = async (data: Partial<BusinessItem>): Promise<string> => {
  const user = auth.currentUser;
  const coll = collection(db, 'businesses');
  const docRef = await addDoc(coll, {
    ...data,
    ownerUid: data.ownerUid || user?.uid || '',
    claimStatus: (data.ownerUid || user) ? 'claimed' : 'unclaimed',
    tier: data.tier || 'featured',
    verificationBadge: 'none',
    ratingAvg: 5.0,
    ratingCount: 1,
    status: data.status || 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const uploadProfessionalAvatar = async (uri: string): Promise<string> => {
  const filename = `pro_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const storageRef = ref(storage, `professionals/${filename}`);
  const response = await fetch(uri);
  const blob = await response.blob();
  const task = await uploadBytesResumable(storageRef, blob);
  return await getDownloadURL(task.ref);
};

export const registerProfessional = async (
  data: Partial<ProfessionalItem>
): Promise<string> => {
  const user = auth.currentUser;
  const coll = collection(db, 'professionals');
  const docRef = await addDoc(coll, {
    ...data,
    userId: data.userId || user?.uid || '',
    ratingAvg: 5.0,
    ratingCount: 1,
    verifiedProfessional: false,
    status: data.status || 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const fetchMyProfessionalProfile = async (userId?: string, phone?: string): Promise<ProfessionalItem | null> => {
  try {
    const coll = collection(db, 'professionals');
    if (userId) {
      const q = query(coll, where('userId', '==', userId), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as ProfessionalItem;
      }
    }
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const qPhone = query(coll, where('phone', '==', cleanPhone), limit(1));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        const d = snapPhone.docs[0];
        return { id: d.id, ...d.data() } as ProfessionalItem;
      }
    }
    return null;
  } catch (err) {
    console.error('Error fetching professional profile:', err);
    return null;
  }
};

export const updateProfessionalProfile = async (
  proId: string,
  updates: Partial<ProfessionalItem>
): Promise<void> => {
  const docRef = doc(db, 'professionals', proId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};


export const addBusinessReview = async (
  businessId: string,
  rating: number,
  comment: string,
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in required');
  const userSnap = await getDoc(doc(db, 'users', user.uid));
  const userData = userSnap.data();

  const reviewRef = collection(db, 'businesses', businessId, 'reviews');
  await addDoc(reviewRef, {
    businessId,
    userId: user.uid,
    userName: userData?.name || user.displayName || 'Resident',
    userPhoto: userData?.photoURL || user.photoURL || '',
    rating,
    comment: comment.trim(),
    createdAt: serverTimestamp(),
  });

  const bizRef = doc(db, 'businesses', businessId);
  await updateDoc(bizRef, {
    ratingCount: increment(1),
  });
};

export const fetchBusinessReviews = async (businessId: string): Promise<BusinessReview[]> => {
  try {
    const q = query(
      collection(db, 'businesses', businessId, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(20),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as BusinessReview));
  } catch {
    return [];
  }
};

export const trackBusinessInteraction = async (
  businessId: string,
  type: 'view' | 'call' | 'whatsapp'
): Promise<void> => {
  if (!businessId) return;
  try {
    const bizRef = doc(db, 'businesses', businessId);
    const fieldMap = {
      view: 'viewCount',
      call: 'callCount',
      whatsapp: 'whatsappCount',
    };
    await updateDoc(bizRef, {
      [fieldMap[type]]: increment(1),
    });
  } catch (err) {
    // Ignore seed doc updates
  }
};

export const updateBusinessProfile = async (
  businessId: string,
  data: Partial<BusinessItem>
): Promise<void> => {
  const bizRef = doc(db, 'businesses', businessId);
  await updateDoc(bizRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const createBusinessOffer = async (
  data: Partial<OfferItem>
): Promise<string> => {
  const coll = collection(db, 'promotions');
  const docRef = await addDoc(coll, {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const fetchMyBusinesses = async (ownerUid?: string, phone?: string): Promise<BusinessItem[]> => {
  try {
    const coll = collection(db, 'businesses');
    let results: BusinessItem[] = [];

    if (ownerUid) {
      const q = query(coll, where('ownerUid', '==', ownerUid), limit(50));
      const snap = await getDocs(q);
      snap.forEach(d => results.push({ id: d.id, ...d.data() } as BusinessItem));
    }

    // Also check by phone if provided and not yet found
    if (phone && results.length === 0) {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const qPhone = query(coll, where('phone', '==', cleanPhone), limit(10));
      const snapPhone = await getDocs(qPhone);
      snapPhone.forEach(d => {
        if (!results.find(r => r.id === d.id)) {
          results.push({ id: d.id, ...d.data() } as BusinessItem);
        }
      });
    }

    return results;
  } catch (err) {
    console.error('Error fetching user businesses:', err);
    return [];
  }
};

export const recordCustomerLead = async (lead: Omit<LeadItem, 'createdAt' | 'id'>): Promise<void> => {
  try {
    const leadsColl = collection(db, 'leads');
    await addDoc(leadsColl, {
      ...lead,
      createdAt: serverTimestamp(),
    });

    // In-app notification to business / pro owner if targetOwnerUid exists
    if (lead.targetOwnerUid) {
      const notifColl = collection(db, 'users', lead.targetOwnerUid, 'notifications');
      let title = 'New Profile Lead! 🔔';
      let body = `${lead.citizenName || 'A Kurnool resident'} viewed your profile on Kurnool One.`;
      if (lead.actionType === 'call') {
        title = 'Direct Call Lead! 📞';
        body = `${lead.citizenName || 'A customer'} initiated a phone call to your listing.`;
      } else if (lead.actionType === 'whatsapp') {
        title = 'WhatsApp Inquiry Lead! 💬';
        body = `${lead.citizenName || 'A customer'} opened a WhatsApp chat with you.`;
      }
      await addDoc(notifColl, {
        title,
        body,
        actionType: lead.actionType,
        targetId: lead.targetId,
        citizenPhone: lead.citizenPhone || '',
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Failed to record customer lead:', err);
  }
};

export const fetchMyLeads = async (targetOwnerUid?: string, targetId?: string): Promise<LeadItem[]> => {
  try {
    const coll = collection(db, 'leads');
    let leads: LeadItem[] = [];
    if (targetOwnerUid) {
      const q = query(coll, where('targetOwnerUid', '==', targetOwnerUid), limit(50));
      const snap = await getDocs(q);
      snap.forEach(d => leads.push({ id: d.id, ...d.data() } as LeadItem));
    }
    if (targetId && leads.length === 0) {
      const q = query(coll, where('targetId', '==', targetId), limit(50));
      const snap = await getDocs(q);
      snap.forEach(d => {
        if (!leads.find(l => l.id === d.id)) {
          leads.push({ id: d.id, ...d.data() } as LeadItem);
        }
      });
    }
    return leads.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Error fetching leads:', err);
    return [];
  }
};

export const uploadBusinessLogo = async (uri: string): Promise<string> => {
  const filename = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const storageRef = ref(storage, `businesses/logos/${filename}`);
  const response = await fetch(uri);
  const blob = await response.blob();
  const task = await uploadBytesResumable(storageRef, blob);
  return await getDownloadURL(task.ref);
};

export const uploadBusinessCover = async (uri: string): Promise<string> => {
  const filename = `cover_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const storageRef = ref(storage, `businesses/covers/${filename}`);
  const response = await fetch(uri);
  const blob = await response.blob();
  const task = await uploadBytesResumable(storageRef, blob);
  return await getDownloadURL(task.ref);
};

export const deleteBusiness = async (businessId: string): Promise<void> => {
  const docRef = doc(db, 'businesses', businessId);
  await deleteDoc(docRef);
};

export const deleteProfessional = async (proId: string): Promise<void> => {
  const docRef = doc(db, 'professionals', proId);
  await deleteDoc(docRef);
};

// ─── KURNOOL CITY LOCALITIES ─────────────────────────────────────────────

export const KURNOOL_AREAS: string[] = [
  'Camp Area',
  'C-Camp',
  'B-Camp',
  'A-Camp',
  'Budhawarapet',
  'Nandyal Checkpost / Road',
  'One Town (Old City)',
  'Two Town',
  'Collectorate Complex',
  'Venkataramana Colony',
  'Santosh Nagar',
  'Birla Gate',
  'Raj Vihar Centre',
  'Joharapuram',
  'Roza / Konda Reddy Fort Area',
  'Maddur Nagar',
  'Allagadda Road',
  'Peddapadu',
  'Bellary Road',
  'Other Area in Kurnool',
];

export interface PricingPlan {
  id: string;
  name: string;
  name_te: string;
  price: number;
  period: string;
  badge?: string;
  features: string[];
  recommended?: boolean;
}

export const BUSINESS_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'biz_monthly',
    name: 'Monthly Plan',
    name_te: 'నెలవారీ ప్లాన్',
    price: 199,
    period: 'per month',
    badge: 'Flexible',
    features: [
      'Full business listing in 50 Categories',
      'Monday to Sunday operating hours',
      'Direct Call & WhatsApp lead buttons',
      'Google Maps directions embed',
      'Basic search visibility',
    ],
  },
  {
    id: 'biz_half_yearly',
    name: '6 Months Plan',
    name_te: '6 నెలల ప్లాన్',
    price: 999,
    period: 'for 6 months',
    badge: 'Popular Choice',
    features: [
      'Everything in Monthly plan',
      'Verified Merchant badge',
      'Full Photo Gallery & Video embed',
      'Offers & Festival Deals publishing',
      'Lead and call click analytics',
    ],
  },
  {
    id: 'biz_yearly',
    name: 'Yearly Plan',
    name_te: 'సంవత్సర ప్లాన్',
    price: 2000,
    period: 'per year',
    badge: 'Best Value (Save ₹388)',
    recommended: true,
    features: [
      'All features for full 12 Months',
      'Top priority category ranking',
      'Homepage Featured showcase',
      'Social media boost on Kurnool One handles',
      'Dedicated manager support',
    ],
  },
];

export const PROFESSIONAL_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'pro_monthly',
    name: 'Monthly Plan',
    name_te: 'నెలవారీ ప్లాన్',
    price: 99,
    period: 'per month',
    badge: 'Flexible',
    features: [
      'Profile in 30 Personal Categories',
      'Direct Call & WhatsApp lead buttons',
      'Visiting / consultation charge display',
      'Service area coverage listing',
      'Direct client contact',
    ],
  },
  {
    id: 'pro_half_yearly',
    name: '6 Months Plan',
    name_te: '6 నెలల ప్లాన్',
    price: 500,
    period: 'for 6 months',
    badge: 'Popular',
    features: [
      'Everything in Monthly plan',
      'Official verified pro checkmark',
      'Instagram & YouTube handle links',
      'Priority ranking in professional search',
      'Customer reviews and rating badge',
    ],
  },
  {
    id: 'pro_yearly',
    name: 'Yearly Plan',
    name_te: 'సంవత్సర ప్లాన్',
    price: 900,
    period: 'per year',
    badge: 'Best Value (Save ₹288)',
    recommended: true,
    features: [
      'Full 12 Months pro listing',
      'Top placement in category search',
      'Featured Spotlight on Kurnool One homepage',
      'Social media showcase on Kurnool One channels',
      'Direct verified lead inquiries',
    ],
  },
];

export const EVENT_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'event_listing',
    name: 'Official Event Listing',
    name_te: 'అధికారిక ఈవెంట్ లిస్టింగ్',
    price: 2999,
    period: 'flat listing fee',
    badge: 'Launch Offer ₹2,999 (Regular ₹4,000)',
    recommended: true,
    features: [
      'Full Event Showcase on Kurnool One Events Page',
      'Top Banner placement & Event Details',
      'Date, Venue, Timings & Google Maps navigation',
      'Direct Organizer Call & WhatsApp buttons',
      'Ticket booking & RSVP links integration',
      'High visibility across Kurnool One App & Web users',
    ],
  },
];

// ─── NEWS INTERFACE & SERVICES ──────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title_en: string;
  title_te?: string;
  content_en: string;
  content_te?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  publishedAt: string;
  dateStr?: string;
  category?: string;
  createdAt?: any;
}

export const SEED_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title_en: 'Kurnool City Development: New Bypass Road & Flyover Project Approved',
    title_te: 'కర్నూలు నగర అభివృద్ధి: కొత్త బైపాస్ రోడ్డు మరియు ఫ్లైఓవర్ ప్రాజెక్టుకు ఆమోదం',
    content_en: 'The Andhra Pradesh state administration has sanctioned new infrastructure upgrades for Kurnool city, easing traffic congestion between Bellary Chowrasta and Raj Vihar center. Work is slated to commence shortly.',
    content_te: 'కర్నూలు నగరంలో ట్రాఫిక్ సమస్యలను పరిష్కరించేందుకు బళ్లారి చౌరస్తా మరియు రాజ్ విహార్ సెంటర్ మధ్య కొత్త ఫ్లైఓవర్ ప్రాజెక్టును ప్రభుత్వం మంజూరు చేసింది.',
    source: 'Public Press Release / District Information',
    publishedAt: '2025-02-15',
    category: 'Development',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'news-2',
    title_en: 'Historic Konda Reddy Buruju Light & Sound Show Revamped for Visitors',
    title_te: 'చారిత్రక కొండారెడ్డి బురుజు లైట్ అండ్ సౌండ్ షో ఆధునికీకరణ',
    content_en: 'The prestigious Konda Reddy Buruju fort in Kurnool is now hosting an upgraded evening light and sound show narrating the glorious history of Rayalaseema and freedom fighters.',
    content_te: 'కర్నూలులోని కొండారెడ్డి బురుజు వద్ద సాయంత్రం వేళల్లో నిర్వహించే లైట్ అండ్ సౌండ్ షోను సరికొత్త హంగులతో ఆధునీకరించారు.',
    source: 'Tourism & Cultural Dept Updates',
    publishedAt: '2025-02-10',
    category: 'Culture & Tourism',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'news-3',
    title_en: 'Solar & Renewable Energy Push Across Kurnool District',
    title_te: 'కర్నూలు జిల్లాలో సౌర విద్యుత్ ప్రాజెక్టుల విస్తరణ',
    content_en: 'With Kurnool remaining one of the largest renewable energy hubs in India, new rooftop solar incentives and mega park installations are generating sustainable local employment.',
    content_te: 'భారతదేశంలో ప్రముఖ పునరుత్పాదక ఇంధన కేంద్రంగా ఉన్న కర్నూలు జిల్లాలో మరిన్ని సౌర విద్యుత్ ప్రాజెక్టులు అందుబాటులోకి వస్తున్నాయి.',
    source: 'District Energy Updates',
    publishedAt: '2025-02-05',
    category: 'Energy',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  },
];

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const q = query(collection(db, 'news'), orderBy('publishedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
    }
  } catch (err) {
    console.warn('fetchNews Firestore error, returning seed news:', err);
  }
  return SEED_NEWS;
}

export async function createNews(newsData: Omit<NewsItem, 'id'>): Promise<string> {
  const colRef = collection(db, 'news');
  const docRef = await addDoc(colRef, {
    ...newsData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteNews(newsId: string): Promise<void> {
  await deleteDoc(doc(db, 'news', newsId));
}


