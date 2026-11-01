import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, increment, query, where, limit, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// ─── TYPES ───────────────────────────────────────────────────────────────────

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
  claimStatus: 'unclaimed' | 'pending' | 'verified';
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

export interface LeadItem {
  id: string;
  businessId?: string;
  businessName?: string;
  professionalId?: string;
  professionalName?: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenId?: string;
  citizenArea?: string;
  targetId?: string;
  targetName?: string;
  targetType?: 'business' | 'professional' | string;
  actionType?: 'call' | 'whatsapp' | 'inquiry' | 'quote' | 'view';
  notes?: string;
  metadata?: any;
  createdAt?: any;
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
  phone?: string;
  category: string;
}

export interface EventItem {
  id: string;
  title_en: string;
  title_te?: string;
  category?: 'cultural' | 'expo' | 'sports' | 'devotional' | 'general';
  dateStr: string;
  timeStr: string;
  venue: string;
  organizerName: string;
  contactPhone: string;
  posterUrl: string;
  entryType: 'free' | 'ticketed';
  ticketPrice?: string;
  ticketUrl?: string;
  tier?: 'free' | 'featured' | 'mega';
  status: 'approved' | 'pending';
}

// ─── MASTER CATEGORIES ───────────────────────────────────────────────────────

export const MASTER_CATEGORIES: CategoryItem[] = [
  {
    id: 'restaurants_cafes',
    name_en: 'Restaurants & Cafes',
    name_te: 'రెస్టారెంట్లు & కేఫ్‌లు',
    icon: 'Utensils',
    subcategories: [
      { id: 'family_restaurant', name_en: 'Family Restaurant', name_te: 'ఫ్యామిలీ రెస్టారెంట్' },
      { id: 'cafes', name_en: 'Cafes & Coffee Shops', name_te: 'కేఫ్‌లు & కాఫీ షాపులు' },
      { id: 'fast_food', name_en: 'Fast Food & Chaat', name_te: 'ఫాస్ట్ ఫుడ్ & చాట్' },
      { id: 'biryani_special', name_en: 'Biryani Centers', name_te: 'బిర్యానీ సెంటర్లు' },
    ],
  },
  {
    id: 'chicken_mutton_center',
    name_en: 'Chicken and Mutton Center',
    name_te: 'చికెన్ మరియు మటన్ సెంటర్',
    icon: 'UtensilsCrossed',
    color: '#DC2626',
    bgLight: '#FEF2F2',
    subcategories: [
      { id: 'fresh_raw_chicken', name_en: 'Fresh Raw Chicken', name_te: 'తాజా చికెన్' },
      { id: 'fresh_mutton', name_en: 'Fresh Mutton', name_te: 'తాజా మటన్' },
      { id: 'natu_kodi', name_en: 'Country Chicken / Natu Kodi', name_te: 'నాటు కోడి' },
      { id: 'sea_food_fish', name_en: 'Sea Food & Fish', name_te: 'చేపలు & సీ ఫుడ్' },
      { id: 'eggs_poultry', name_en: 'Eggs & Poultry', name_te: 'గుడ్లు & పౌల్ట్రీ' },
    ],
  },
  {
    id: 'hotels_lodges',
    name_en: 'Hotels & Lodges',
    name_te: 'హోటళ్ళు & లాడ్జీలు',
    icon: 'Hotel',
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
    icon: 'ShoppingBag',
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
    icon: 'Shirt',
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
    icon: 'Smartphone',
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
    icon: 'HeartPulse',
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
    icon: 'Pill',
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
    icon: 'GraduationCap',
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
    icon: 'BookOpen',
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
    icon: 'Laptop',
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
    icon: 'Megaphone',
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
    icon: 'Building2',
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
    icon: 'Hammer',
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
    icon: 'Car',
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
    icon: 'Wrench',
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
    icon: 'Sparkles',
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
    icon: 'Dumbbell',
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
    icon: 'Gem',
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
    icon: 'Armchair',
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
    icon: 'Zap',
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
    icon: 'Package',
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
    icon: 'Factory',
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
    icon: 'Sprout',
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
    icon: 'Plane',
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
    icon: 'Calendar',
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
    icon: 'PartyPopper',
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
    icon: 'Camera',
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
    icon: 'CreditCard',
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
    icon: 'Landmark',
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
    icon: 'Scale',
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
    icon: 'Truck',
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
    icon: 'Bus',
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
    icon: 'Wrench',
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
    icon: 'Sparkle',
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
    icon: 'Printer',
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
    icon: 'Cake',
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
    icon: 'UtensilsCrossed',
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
    icon: 'Milk',
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
    icon: 'Gift',
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
    icon: 'Trophy',
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
    icon: 'Dog',
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
    icon: 'Users',
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
    icon: 'Building',
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
    icon: 'Store',
    subcategories: [
      { id: 'shopping_centers', name_en: 'Shopping Malls', name_te: 'షాపింగ్ మాల్స్' },
      { id: 'commercial_plazas', name_en: 'Commercial Shopping Plazas', name_te: 'వాణిజ్య సముదాయాలు' },
    ],
  },
  {
    id: 'ecommerce_online',
    name_en: 'E-commerce & Online Businesses',
    name_te: 'ఈ-కామర్స్ & ఆన్‌లైన్ వ్యాపారాలు',
    icon: 'Globe',
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
    icon: 'Cpu',
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
    icon: 'Scissors',
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
    icon: 'Palette',
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
    icon: 'Gamepad2',
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
    icon: 'Layers',
    subcategories: [
      { id: 'general_enterprises', name_en: 'General Enterprises & Services', name_te: 'ఇతర వ్యాపార సంస్థలు' },
    ],
  },
];

export const BUSINESS_CATEGORIES = MASTER_CATEGORIES;

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

// ─── SEED DATA ───────────────────────────────────────────────────────────────

export const SEED_BUSINESSES: BusinessItem[] = [];

export const SEED_PROFESSIONALS: ProfessionalItem[] = [];

export const SEED_PLACES: PlaceItem[] = [
  {
    id: 'konda_reddy_buruju',
    type: 'landmark',
    name_en: 'Konda Reddy Buruju (Kurnool Fort)',
    name_te: 'కొండారెడ్డి బురుజు (కర్నూలు కోట)',
    description_en: 'Iconic 12th-century bastion fort of the Vijayanagara Empire standing tall in the heart of Kurnool city with subterranean tunnels and panoramic heritage bastions.',
    description_te: 'కర్నూలు నడిబొడ్డున ఉన్న చారిత్రాత్మక విజయనగర సామ్రాజ్య కోట మరియు కొండారెడ్డి బురుజు.',
    address: 'Old Bus Stand Road, Kurnool, Andhra Pradesh 518001',
    timings: '09:00 AM - 06:00 PM',
    entryFee: 'Free Entry',
    bestTimeToVisit: 'October to March (Evenings)',
    photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.8281,
    longitude: 78.0373,
    isPromoted: true,
  },
  {
    id: 'orvakal_rock_garden',
    type: 'park',
    name_en: 'Orvakal Rock Garden',
    name_te: 'ఓర్వకల్లు రాతి తోటలు',
    description_en: 'Ancient natural quartz and silica rock formations sprawling across 1,000 acres with serene water bodies, hiking trails, boating, and AP Tourism haritha resort.',
    description_te: 'ఓర్వకల్లు సహజసిద్ధ రాతి కొండలు, సరస్సు, బోటింగ్ మరియు హరిత రిసార్ట్స్.',
    address: 'NH 40, Orvakal, Kurnool District, Andhra Pradesh 518010',
    timings: '08:00 AM - 06:00 PM',
    entryFee: '₹20 per Adult',
    bestTimeToVisit: 'Post-Monsoon & Winter',
    photos: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.6833,
    longitude: 78.2167,
    isPromoted: true,
  },
  {
    id: 'belum_caves',
    type: 'tourist',
    name_en: 'Belum Caves',
    name_te: 'బెలూం గుహలు',
    description_en: 'The second largest subterranean natural caves in the Indian subcontinent featuring stalactites, stalagmites, freshwater chambers, and Buddhist relics.',
    description_te: 'భారతదేశంలోనే రెండవ అతిపెద్ద సహజసిద్ధ గుహలు. అద్భుతమైన సున్నపురాతి ఆకృతులు.',
    address: '1/1, Main Road, Belum Caves, Kurnool District, Andhra Pradesh 518123',
    timings: '10:00 AM - 05:00 PM',
    entryFee: '₹60 for Indians / ₹300 Foreigners',
    bestTimeToVisit: 'November to February',
    photos: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.1031,
    longitude: 78.1147,
    isPromoted: true,
  },
  {
    id: 'rollapadu_wildlife',
    type: 'park',
    name_en: 'Rollapadu Bird Sanctuary',
    name_te: 'రోళ్లపాడు వన్యప్రాణి అభయారణ్యం',
    description_en: 'Renowned grasslands sanctuary home to the endangered Great Indian Bustard, blackbucks, foxes, and diverse migratory birds.',
    description_te: 'బట్టమేక పిట్ట మరియు జింకల ప్రసిద్ధ రోళ్లపాడు పక్షుల అభయారణ్యం.',
    address: 'Rollapadu, near Nandikotkur, Kurnool District, Andhra Pradesh 518401',
    timings: '07:00 AM - 06:00 PM',
    entryFee: '₹30 Entry Fee',
    bestTimeToVisit: 'September to February',
    photos: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.7483,
    longitude: 78.3617,
    isPromoted: false,
  },
];

export const SEED_WORSHIP_PLACES: PlaceItem[] = [
  {
    id: 'worship_mahanandi',
    type: 'temple',
    name_en: 'Mahanandi Temple',
    name_te: 'మహానంది క్షేత్రం',
    description_en: 'Ancient 1,500-year-old Lord Shiva temple nestled in lush Nallamala forests, renowned for its crystal-clear mineral freshwater springs (Pushkarini) that flow continuously across seasons.',
    description_te: 'నల్లమల అటవీ ప్రాంతంలో వెలసిన అతి పురాతన శైవ క్షేత్రం. నిరంతరం స్వచ్ఛమైన నీటి ఊట ప్రవహించే రుద్రగుండం పుష్కరిణి.',
    address: 'Mahanandi, near Nandyal, Kurnool / Nandyal District, Andhra Pradesh 518502',
    timings: '05:30 AM - 12:30 PM, 05:00 PM - 08:30 PM',
    entryFee: 'Free Darshan / Special Darshan ₹50',
    bestTimeToVisit: 'All Year Round (Maha Shivaratri special)',
    dressCodeRules: 'Traditional Indian Attire (Dhoti/Kurta for Men, Saree/Chudidhar for Women)',
    photos: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.4833,
    longitude: 78.6167,
    isPromoted: true,
  },
  {
    id: 'worship_ahobilam',
    type: 'temple',
    name_en: 'Ahobilam Nava Narasimha Swamy Kshethram',
    name_te: 'అహోబిలం నవ నారసింహ స్వామి క్షేత్రం',
    description_en: 'Sacred Divya Desam nestled amidst the hills of Garudadri with 9 temples dedicated to the 9 avatars of Lord Narasimha, split between Upper and Lower Ahobilam with forest trekking routes.',
    description_te: 'నవ నారసింహుల పవిత్ర దివ్యదేశం. ఎగువ మరియు దిగువ అహోబిలం కొండల మధ్య వెలసిన పవిత్ర క్షేత్రం.',
    address: 'Allagadda Mandal, Kurnool / Nandyal District, Andhra Pradesh 518545',
    timings: '06:00 AM - 01:00 PM, 03:00 PM - 08:00 PM',
    entryFee: 'Free Darshan / Special Darshan ₹100',
    bestTimeToVisit: 'October to March',
    dressCodeRules: 'Traditional Hindu Attire',
    photos: ['https://images.unsplash.com/photo-1599818491741-94420e1762c4?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.1333,
    longitude: 78.7333,
    isPromoted: true,
  },
  {
    id: 'worship_yaganti',
    type: 'temple',
    name_en: 'Yaganti Uma Maheshwara Temple',
    name_te: 'యాగంటి ఉమా మహేశ్వర స్వామి దేవాలయం',
    description_en: 'Magnificent 15th-century Sangama dynasty cave temple famous for the naturally growing stone Nandi (Basavanna), Agastya Pushkarini, and Venkateswara Cave.',
    description_te: 'క్రమంగా పరిమాణం పెరుగుతున్న నంది విగ్రహం, అగస్త్య పుష్కరిణి గల ప్రసిద్ధ పురాతన శైవ క్షేత్రం.',
    address: 'Yaganti Temple Road, Banaganapalle, Kurnool District, Andhra Pradesh 518124',
    timings: '06:00 AM - 01:00 PM, 03:00 PM - 08:00 PM',
    entryFee: 'Free Darshan',
    bestTimeToVisit: 'Winter (November to February)',
    dressCodeRules: 'Modest Traditional Attire',
    photos: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.3500,
    longitude: 78.1400,
    isPromoted: true,
  },
  {
    id: 'worship_mantralayam',
    type: 'temple',
    name_en: 'Mantralayam Sri Raghavendra Swamy Mutt',
    name_te: 'మంత్రాలయం శ్రీ రాఘవేంద్ర స్వామి మఠం',
    description_en: 'World-renowned holy pilgrimage destination situated on the picturesque banks of the Tungabhadra River, enshrining the sacred Jeeva Samadhi (Brindavan) of Sri Raghavendra Teertha.',
    description_te: 'తుంగభద్ర నదీ తీరాన వెలసిన పరమ పవిత్ర శ్రీ రాఘవేంద్ర స్వామి మూల బృందావన క్షేత్రం.',
    address: 'Sri Raghavendra Swamy Matha, Mantralayam, Kurnool District, Andhra Pradesh 518345',
    timings: '06:00 AM - 02:00 PM, 04:00 PM - 09:00 PM',
    entryFee: 'Free Darshan / Seva passes available at counter',
    bestTimeToVisit: 'All Year (Avoid peak summer afternoons)',
    dressCodeRules: 'Dhoti/Kurta for Men (Shirts removed during Darshan), Sarees for Women',
    photos: ['https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.9372,
    longitude: 77.4300,
    isPromoted: true,
  },
  {
    id: 'worship_jagannatha_gattu',
    type: 'temple',
    name_en: 'Jagannatha Gattu Shiva Temple',
    name_te: 'జగన్నాథ గట్టు శివాలయం',
    description_en: 'Historic hilltop temple perched on a rocky hillock in Kurnool city, said to have been consecrated by Lord Rama, providing scenic 360-degree sunset views over Kurnool.',
    description_te: 'కర్నూలు నగర సుందర దృశ్యాలను వీక్షించగల చారిత్రక కొండపై వెలసిన జగన్నాథ గట్టు శివాలయం.',
    address: 'Jagannatha Gattu Hilltop, Kurnool, Andhra Pradesh 518002',
    timings: '06:00 AM - 12:00 PM, 04:30 PM - 08:00 PM',
    entryFee: 'Free Entry',
    bestTimeToVisit: 'Early Mornings & Evenings',
    dressCodeRules: 'Modest Attire',
    photos: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.7925,
    longitude: 78.0410,
    isPromoted: false,
  },
  {
    id: 'worship_jumma_masjid',
    type: 'masjid',
    name_en: 'Historic Jumma Masjid & Dargahs',
    name_te: 'చారిత్రాత్మక జుమ్మా మసీదు',
    description_en: 'Historic 17th-century grand mosque constructed during the Bijapur Sultanate rule in Kurnool Old City with impressive towering minarets and expansive prayer halls.',
    description_te: 'బీజాపూర్ సుల్తానుల కాలం నాటి కర్నూలు ఓల్డ్ సిటీలోని ప్రసిద్ధ చారిత్రక జుమ్మా మసీదు.',
    address: 'Old City, Near Osmania College Road, Kurnool, Andhra Pradesh 518001',
    timings: '05:00 AM - 09:30 PM (Except during private congregational prayers)',
    entryFee: 'Free Entry',
    bestTimeToVisit: 'All Year',
    dressCodeRules: 'Modest attire covering arms and legs; head covering recommended.',
    photos: ['https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80'],
    latitude: 15.8310,
    longitude: 78.0425,
    isPromoted: false,
  },
];

export const SEED_OFFERS: OfferItem[] = [];

export const SEED_EVENTS: EventItem[] = [];

// ─── FIRESTORE API METHODS ───────────────────────────────────────────────────

export const fetchBusinesses = async (
  categoryId?: string,
  searchQuery?: string,
): Promise<BusinessItem[]> => {
  try {
    const coll = collection(db, 'businesses');
    let q = query(coll, where('status', '==', 'published'), limit(60));
    let targetCategory = categoryId;
    if (categoryId && categoryId !== 'all') {
      const mapped = LEGACY_BUSINESS_CATEGORY_MAP[categoryId];
      if (mapped) targetCategory = mapped;
      q = query(coll, where('status', '==', 'published'), where('categoryId', 'in', [categoryId, targetCategory]), limit(60));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      return [];
    }

    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessItem));
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      results = results.filter(b =>
        b.name_en.toLowerCase().includes(queryLower) ||
        b.name_te?.includes(searchQuery) ||
        b.description_en?.toLowerCase().includes(queryLower) ||
        b.address?.toLowerCase().includes(queryLower)
      );
    }
    return results;
  } catch {
    return [];
  }
};

export const fetchBusinessById = async (id: string): Promise<BusinessItem | null> => {
  try {
    const docRef = doc(db, 'businesses', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as BusinessItem;
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchProfessionals = async (): Promise<ProfessionalItem[]> => {
  try {
    const coll = collection(db, 'professionals');
    const q = query(coll, where('status', '==', 'active'), limit(30));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProfessionalItem));
  } catch {
    return [];
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

export const fetchPlaces = async (): Promise<PlaceItem[]> => {
  try {
    const coll = collection(db, 'places');
    const snap = await getDocs(coll);
    if (snap.empty) return SEED_PLACES;
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

export interface CustomerLeadData {
  targetId: string;
  targetType: 'business' | 'professional';
  targetOwnerUid?: string;
  targetName: string;
  actionType: 'view' | 'call' | 'whatsapp';
  citizenUid?: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenArea?: string;
  citizenGender?: string;
}

export const recordCustomerLead = async (lead: CustomerLeadData): Promise<void> => {
  try {
    const leadsColl = collection(db, 'leads');
    const sanitizedLead: Record<string, any> = {
      targetId: lead.targetId,
      targetType: lead.targetType,
      actionType: lead.actionType,
      targetName: lead.targetName || '',
      createdAt: serverTimestamp(),
    };
    if (lead.targetOwnerUid) sanitizedLead.targetOwnerUid = lead.targetOwnerUid;
    if (lead.citizenUid) sanitizedLead.citizenUid = lead.citizenUid;
    if (lead.citizenName) sanitizedLead.citizenName = lead.citizenName;
    if (lead.citizenPhone) sanitizedLead.citizenPhone = lead.citizenPhone;
    if (lead.citizenGender) sanitizedLead.citizenGender = lead.citizenGender;

    await addDoc(leadsColl, sanitizedLead);
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
        read: false,
        type: 'lead',
        targetId: lead.targetId,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Error logging lead:', err);
  }
};

export const fetchOffers = async (): Promise<OfferItem[]> => {
  try {
    const coll = collection(db, 'promotions');
    const snap = await getDocs(coll);
    if (snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OfferItem));
  } catch {
    return [];
  }
};

export const uploadBusinessImage = async (file: File): Promise<string> => {
  const filename = `biz_${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `businesses/${filename}`);
  const task = await uploadBytesResumable(storageRef, file);
  return await getDownloadURL(task.ref);
};

export function sanitizeFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return (obj as any[])
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const proto = Object.getPrototypeOf(obj);
    if (proto && proto.constructor && proto.constructor.name !== 'Object') {
      return obj;
    }
    const clean: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        clean[k] = sanitizeFirestoreData(v);
      }
    }
    return clean as T;
  }
  return obj;
}

export const registerBusiness = async (data: Partial<BusinessItem>): Promise<string> => {
  const coll = collection(db, 'businesses');
  const payload = sanitizeFirestoreData({
    ...data,
    claimStatus: 'unclaimed',
    tier: data.tier || 'free',
    verificationBadge: data.verificationBadge || 'none',
    ratingAvg: 0,
    ratingCount: 0,
    viewCount: 0,
    callCount: 0,
    whatsappCount: 0,
    status: data.status || 'pending_approval',
    createdAt: serverTimestamp(),
  });
  const docRef = await addDoc(coll, payload);
  return docRef.id;
};

// ─── PHONE AUTH & ROLE EXCLUSIVITY ──────────────────────────────────────────

export const sanitizePhone = (rawPhone: string): string => {
  const cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  return cleaned;
};

export interface PhoneExclusivityResult {
  allowed: boolean;
  existingRole?: 'business' | 'professional';
  message?: string;
  phoneDoc?: any;
}

export const checkPhoneRoleExclusivity = async (
  phone: string,
  requestedRole: 'business' | 'professional'
): Promise<PhoneExclusivityResult> => {
  const formattedPhone = sanitizePhone(phone);
  if (!formattedPhone || formattedPhone.replace(/\D/g, '').length < 10) {
    return { allowed: false, message: 'Please enter a valid 10-digit mobile number.' };
  }

  try {
    const phoneRef = doc(db, 'registered_phones', formattedPhone);
    const snap = await getDoc(phoneRef);

    if (snap.exists()) {
      const data = snap.data();
      // Allow dual-role registration: a citizen/merchant can own both a business listing and a professional profile
      return { allowed: true, phoneDoc: data, existingRole: data.role };
    }
    return { allowed: true };
  } catch (error) {
    console.warn('Phone role check error/offline fallback:', error);
    return { allowed: true };
  }
};

export const registerPhoneRole = async (
  phone: string,
  role: 'business' | 'professional',
  uid: string,
  extra?: { name?: string; businessName?: string }
): Promise<void> => {
  const formattedPhone = sanitizePhone(phone);
  try {
    const phoneRef = doc(db, 'registered_phones', formattedPhone);
    const phoneSnap = await getDoc(phoneRef);
    let existingRoles: string[] = [];
    if (phoneSnap.exists()) {
      const pData = phoneSnap.data();
      existingRoles = Array.isArray(pData.roles) ? pData.roles : [pData.role].filter(Boolean);
    }
    if (!existingRoles.includes(role)) {
      existingRoles.push(role);
    }

    await setDoc(phoneRef, {
      phone: formattedPhone,
      role,
      roles: existingRoles,
      uid,
      name: extra?.name || '',
      businessName: extra?.businessName || '',
      hasBusiness: existingRoles.includes('business'),
      hasProfessional: existingRoles.includes('professional'),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    let userRoles: string[] = [];
    if (userSnap.exists()) {
      const uData = userSnap.data();
      userRoles = Array.isArray(uData.roles) ? uData.roles : [uData.role].filter(Boolean);
    }
    if (!userRoles.includes(role)) {
      userRoles.push(role);
    }

    await setDoc(userRef, {
      phone: formattedPhone,
      role,
      roles: userRoles,
      hasBusiness: userRoles.includes('business'),
      hasProfessional: userRoles.includes('professional'),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('registerPhoneRole non-fatal warning:', err);
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
    // Ignore seed/mock doc updates gracefully
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

export const fetchMyBusinesses = async (ownerUid?: string): Promise<BusinessItem[]> => {
  if (!ownerUid) return [];
  try {
    const coll = collection(db, 'businesses');
    const q = query(coll, where('ownerUid', '==', ownerUid), limit(50));
    const snap = await getDocs(q);
    if (snap.empty) {
      return [];
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessItem));
  } catch (err) {
    console.error('Error fetching my businesses:', err);
    return [];
  }
};

export const uploadBusinessLogo = async (file: File): Promise<string> => {
  const filename = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `businesses/logos/${filename}`);
  const task = await uploadBytesResumable(storageRef, file);
  return await getDownloadURL(task.ref);
};

export const uploadBusinessCover = async (file: File): Promise<string> => {
  const filename = `cover_${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `businesses/covers/${filename}`);
  const task = await uploadBytesResumable(storageRef, file);
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

export const uploadProfessionalAvatar = async (file: File): Promise<string> => {
  const filename = `pro_${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const storageRef = ref(storage, `professionals/${filename}`);
  const task = await uploadBytesResumable(storageRef, file);
  return await getDownloadURL(task.ref);
};

export const registerProfessional = async (
  data: Partial<ProfessionalItem>
): Promise<string> => {
  const coll = collection(db, 'professionals');
  const payload = sanitizeFirestoreData({
    ...data,
    ratingAvg: 5.0,
    ratingCount: 1,
    verifiedProfessional: data.verifiedProfessional ?? false,
    status: data.status || 'active',
    createdAt: serverTimestamp(),
  });
  const docRef = await addDoc(coll, payload);
  return docRef.id;
};

export const fetchMyProfessionalProfile = async (userId: string): Promise<ProfessionalItem | null> => {
  try {
    const coll = collection(db, 'professionals');
    const q = query(coll, where('userId', '==', userId), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as ProfessionalItem;
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

// ─── EVENTS API & PRICING TIERS ──────────────────────────────────────────────

export interface PricingPlan {
  id: string;
  name: string;
  name_te?: string;
  price: number;
  period?: string;
  duration?: string;
  pricePerMonth?: string;
  savings?: string | null;
  popular?: boolean;
  badge?: string;
  tag?: string;
  originalPrice?: number;
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

export const fetchEvents = async (category?: string): Promise<EventItem[]> => {
  try {
    const coll = collection(db, 'events');
    const snap = await getDocs(coll);
    if (snap.empty) return [];
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() } as EventItem));
    if (category && category !== 'all') {
      list = list.filter(e => e.category === category);
    }
    return list;
  } catch {
    return [];
  }
};

export const registerEvent = async (data: Partial<EventItem>): Promise<string> => {
  const coll = collection(db, 'events');
  const docRef = await addDoc(coll, {
    ...data,
    status: data.status || 'pending',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};



// ─── LEADS & CATEGORY ADMIN APIS ─────────────────────────────────────────────

export const fetchPlatformLeads = async (maxCount = 100): Promise<LeadItem[]> => {
  try {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LeadItem));
  } catch (err) {
    console.error('fetchPlatformLeads error:', err);
    return [];
  }
};

export const fetchMyLeads = async (ownerId?: string, businessId?: string): Promise<LeadItem[]> => {
  try {
    const coll = collection(db, 'leads');
    let q;
    if (businessId) {
      q = query(coll, where('businessId', '==', businessId), limit(100));
    } else if (ownerId) {
      q = query(coll, where('ownerId', '==', ownerId), limit(100));
    } else {
      return [];
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LeadItem));
  } catch (err) {
    console.error('fetchMyLeads error:', err);
    return [];
  }
};

export const syncMasterCategoriesToFirestore = async (): Promise<{ count: number }> => {
  let count = 0;
  try {
    for (const cat of MASTER_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      count++;
    }
  } catch (err) {
    console.error('syncMasterCategoriesToFirestore error:', err);
  }
  return { count };
};

export const saveCategoryToFirestore = async (category: Partial<CategoryItem> & { id: string }): Promise<void> => {
  try {
    await setDoc(doc(db, 'categories', category.id), category, { merge: true });
  } catch (err) {
    console.error('saveCategoryToFirestore error:', err);
  }
};

export const deleteCategoryFromFirestore = async (categoryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (err) {
    console.error('deleteCategoryFromFirestore error:', err);
  }
};

// ─── MARKETPLACE ITEMS (BUY & SELL) ──────────────────────────────────────────

export interface MarketplaceItem {
  id: string;
  title_en: string;
  title_te?: string;
  price: string;
  category: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp?: string;
  sellerUid?: string;
  area: string;
  condition: string;
  postedDate?: string;
  imageUrl?: string;
  images?: string[];
  description: string;
  status: 'active' | 'sold' | 'suspended';
  createdAt?: any;
}

export const SEED_MARKET_ITEMS: MarketplaceItem[] = [
  {
    id: 'm1',
    title_en: 'Honda Activa 5G (Single Owner, Kurnool Reg)',
    title_te: 'హోండా యాక్టివా 5G (సింగిల్ ఓనర్, కర్నూలు)',
    price: '₹38,500',
    category: 'Two-Wheelers',
    sellerName: 'Suresh Rao',
    sellerPhone: '9848012345',
    sellerWhatsapp: '9848012345',
    area: 'Abbas Nagar, Kurnool',
    condition: 'Excellent • 24,000 KM',
    postedDate: 'Today',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Very well maintained scooter with insurance valid till Dec 2026. New rear tyre, single hand drive.',
    status: 'active',
  },
  {
    id: 'm2',
    title_en: 'Apple iPhone 13 (128GB Midnight Black)',
    title_te: 'యాపిల్ ఐఫోన్ 13 (128GB మిడ్‌నైట్)',
    price: '₹36,000',
    category: 'Mobiles & Tablets',
    sellerName: 'K. Rakesh',
    sellerPhone: '9440188990',
    sellerWhatsapp: '9440188990',
    area: 'Gayatri Estate, Kurnool',
    condition: 'Like New • 89% Battery Health',
    postedDate: 'Yesterday',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Original Indian bill with box and braided lightning cable. Flawless condition, zero scratches, tempered glass applied.',
    status: 'active',
  },
  {
    id: 'm3',
    title_en: 'Solid Teak Wood 6-Seater Dining Table',
    title_te: 'టేకు కలప 6-సీటర్ డైనింగ్ టేబుల్',
    price: '₹14,500',
    category: 'Home & Furniture',
    sellerName: 'M. Venkateswarlu',
    sellerPhone: '9989012345',
    sellerWhatsapp: '9989012345',
    area: 'Nandyal Checkpost, Kurnool',
    condition: 'Very Good • Genuine Teak',
    postedDate: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Heavy solid teakwood dining set with 6 chairs and 10mm beveled glass top. Moving out sale.',
    status: 'active',
  },
];

export async function fetchMarketplaceItems(): Promise<MarketplaceItem[]> {
  try {
    const q = query(
      collection(db, 'marketplace'),
      where('status', '==', 'active'),
      limit(50)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const live = snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketplaceItem));
      const liveIds = new Set(live.map(l => l.id));
      const seeds = SEED_MARKET_ITEMS.filter(s => !liveIds.has(s.id));
      return [...live, ...seeds];
    }
  } catch (err) {
    console.warn('fetchMarketplaceItems non-fatal:', err);
  }
  return SEED_MARKET_ITEMS;
}

export async function createMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'createdAt'>): Promise<string> {
  const colRef = collection(db, 'marketplace');
  const docRef = await addDoc(colRef, {
    ...item,
    status: item.status || 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): Promise<void> {
  await updateDoc(doc(db, 'marketplace', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMarketplaceItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'marketplace', id));
}

// ─── BLOOD DONORS DIRECTORY ──────────────────────────────────────────────────

export interface BloodDonorItem {
  id: string;
  userId?: string;
  displayName: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  showPhonePublicly: boolean;
  area: string;
  availability: 'available' | 'donated_recently' | 'unavailable';
  notes?: string;
  status: 'active' | 'suspended';
  createdAt?: any;
  updatedAt?: any;
}

export const SEED_BLOOD_DONORS: BloodDonorItem[] = [
  {
    id: 'seed_bd1',
    userId: 'seed_1',
    displayName: 'Praveen Kumar',
    bloodGroup: 'O+',
    phone: '9848011223',
    showPhonePublicly: true,
    area: 'Gayatri Estate, Kurnool',
    availability: 'available',
    notes: 'Available for urgent emergency requests',
    status: 'active',
  },
  {
    id: 'seed_bd2',
    userId: 'seed_2',
    displayName: 'M. Ramesh',
    bloodGroup: 'A+',
    phone: '9440198765',
    showPhonePublicly: true,
    area: 'Nandyal Checkpost, Kurnool',
    availability: 'available',
    notes: 'Regular donor at Kurnool General Hospital',
    status: 'active',
  },
  {
    id: 'seed_bd3',
    userId: 'seed_3',
    displayName: 'Syed Farooq',
    bloodGroup: 'B+',
    phone: '9123456780',
    showPhonePublicly: true,
    area: 'Joharapuram Road, Kurnool',
    availability: 'available',
    notes: 'Available during day time',
    status: 'active',
  },
  {
    id: 'seed_bd4',
    userId: 'seed_4',
    displayName: 'K. Sreekanth',
    bloodGroup: 'AB+',
    phone: '9849200001',
    showPhonePublicly: true,
    area: 'B Camp, Kurnool',
    availability: 'available',
    notes: 'Available on weekends and evenings',
    status: 'active',
  },
  {
    id: 'seed_bd5',
    userId: 'seed_5',
    displayName: 'D. Venkat',
    bloodGroup: 'O-',
    phone: '9701234567',
    showPhonePublicly: true,
    area: 'Collectorate Complex, Kurnool',
    availability: 'available',
    notes: 'Rare blood group voluntary donor',
    status: 'active',
  },
];

export async function fetchBloodDonors(bloodGroup?: string): Promise<BloodDonorItem[]> {
  try {
    const coll = collection(db, 'blood_donors');
    let q;
    if (bloodGroup && bloodGroup !== 'all' && bloodGroup !== 'All') {
      q = query(coll, where('status', '==', 'active'), where('bloodGroup', '==', bloodGroup), limit(50));
    } else {
      q = query(coll, where('status', '==', 'active'), limit(50));
    }
    const snap = await getDocs(q);
    const liveItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as BloodDonorItem));
    if (liveItems.length > 0) {
      const liveIds = new Set(liveItems.map(i => i.id));
      const filteredSeeds = SEED_BLOOD_DONORS.filter(s => {
        if (liveIds.has(s.id)) return false;
        if (bloodGroup && bloodGroup !== 'all' && bloodGroup !== 'All') return s.bloodGroup === bloodGroup;
        return true;
      });
      return [...liveItems, ...filteredSeeds];
    }
  } catch (err) {
    console.warn('fetchBloodDonors error:', err);
  }
  if (bloodGroup && bloodGroup !== 'all' && bloodGroup !== 'All') {
    return SEED_BLOOD_DONORS.filter(s => s.bloodGroup === bloodGroup);
  }
  return SEED_BLOOD_DONORS;
}

export async function registerBloodDonor(donor: Omit<BloodDonorItem, 'id' | 'createdAt'>): Promise<string> {
  const colRef = collection(db, 'blood_donors');
  const payload = sanitizeFirestoreData({
    ...donor,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
}

export async function updateBloodDonor(id: string, updates: Partial<BloodDonorItem>): Promise<void> {
  const payload = sanitizeFirestoreData({
    ...updates,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'blood_donors', id), payload);
}

export async function deleteBloodDonor(id: string): Promise<void> {
  await deleteDoc(doc(db, 'blood_donors', id));
}

export async function fetchMyBloodDonorProfile(userId: string): Promise<BloodDonorItem | null> {
  try {
    const q = query(collection(db, 'blood_donors'), where('userId', '==', userId), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as BloodDonorItem;
    }
  } catch (err) {
    console.warn('fetchMyBloodDonorProfile non-fatal:', err);
  }
  return null;
}

// ─── PUSH NOTIFICATIONS & BROADCASTS ─────────────────────────────────────────

export interface BroadcastNotificationItem {
  id?: string;
  title: string;
  body: string;
  category: 'general' | 'deal' | 'breaking' | 'event' | 'alert';
  targetAudience: 'all' | 'citizens' | 'businesses' | 'professionals';
  actionUrl?: string;
  imageUrl?: string;
  senderName?: string;
  createdAt?: any;
  sentAt?: string;
  status: 'sent' | 'draft';
}

export async function sendBroadcastNotification(
  item: Omit<BroadcastNotificationItem, 'id' | 'createdAt'>
): Promise<string> {
  const colRef = collection(db, 'broadcast_notifications');
  const docRef = await addDoc(colRef, {
    ...item,
    status: 'sent',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchBroadcastNotifications(): Promise<BroadcastNotificationItem[]> {
  try {
    const q = query(collection(db, 'broadcast_notifications'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      let sentAt = 'Just now';
      if (data.createdAt?.toDate) {
        sentAt = data.createdAt.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      } else if (data.createdAt?.seconds) {
        sentAt = new Date(data.createdAt.seconds * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
      return {
        id: d.id,
        ...data,
        sentAt,
      } as BroadcastNotificationItem;
    });
  } catch (err) {
    console.warn('fetchBroadcastNotifications error:', err);
    return [];
  }
}

export async function deleteBroadcastNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, 'broadcast_notifications', id));
}

// ─── NEWS INTERFACES & SERVICES (CITIZEN JOURNALISM) ─────────────────────────

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
  area?: string;
  authorUid?: string;
  authorName?: string;
  authorPhone?: string;
  status?: 'pending_approval' | 'published' | 'rejected';
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
    publishedAt: '2026-10-15',
    category: 'Development',
    area: 'Raj Vihar to Bellary Chowrasta',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    status: 'published',
  },
  {
    id: 'news-2',
    title_en: 'Historic Konda Reddy Buruju Light & Sound Show Revamped for Visitors',
    title_te: 'చారిత్రక కొండారెడ్డి బురుజు లైట్ అండ్ సౌండ్ షో ఆధునికీకరణ',
    content_en: 'The prestigious Konda Reddy Buruju fort in Kurnool is now hosting an upgraded evening light and sound show narrating the glorious history of Rayalaseema and freedom fighters.',
    content_te: 'కర్నూలులోని కొండారెడ్డి బురుజు వద్ద సాయంత్రం వేళల్లో నిర్వహించే లైట్ అండ్ సౌండ్ షోను సరికొత్త హంగులతో ఆధునీకరించారు.',
    source: 'Tourism & Cultural Dept Updates',
    publishedAt: '2026-10-10',
    category: 'Culture & Tourism',
    area: 'Konda Reddy Buruju, Old City',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80',
    status: 'published',
  },
  {
    id: 'news-3',
    title_en: 'Solar & Renewable Energy Push Across Kurnool District',
    title_te: 'కర్నూలు జిల్లాలో సౌర విద్యుత్ ప్రాజెక్టుల విస్తరణ',
    content_en: 'With Kurnool remaining one of the largest renewable energy hubs in India, new rooftop solar incentives and mega park installations are generating sustainable local employment.',
    content_te: 'భారతదేశంలో ప్రముఖ పునరుత్పాదక ఇంధన కేంద్రంగా ఉన్న కర్నూలు జిల్లాలో మరిన్ని సౌర విద్యుత్ ప్రాజెక్టులు అందుబాటులోకి వస్తున్నాయి.',
    source: 'District Energy Updates',
    publishedAt: '2026-10-05',
    category: 'Energy',
    area: 'Orvakal Industrial Corridor',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    status: 'published',
  },
];

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const q = query(
      collection(db, 'news'),
      where('status', '==', 'published'),
      limit(50)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const live = snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
      const liveIds = new Set(live.map(l => l.id));
      const seeds = SEED_NEWS.filter(s => !liveIds.has(s.id));
      return [...live, ...seeds];
    }
  } catch (err) {
    console.warn('fetchNews non-fatal fallback:', err);
  }
  return SEED_NEWS;
}

export async function submitNewsStory(newsData: Omit<NewsItem, 'id' | 'createdAt' | 'status'> & { status?: 'pending_approval' | 'published' }): Promise<string> {
  const colRef = collection(db, 'news');
  const docRef = await addDoc(colRef, {
    ...newsData,
    status: newsData.status || 'pending_approval',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function createNews(newsData: Omit<NewsItem, 'id'>): Promise<string> {
  const colRef = collection(db, 'news');
  const docRef = await addDoc(colRef, {
    ...newsData,
    status: newsData.status || 'published',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteNews(newsId: string): Promise<void> {
  await deleteDoc(doc(db, 'news', newsId));
}

// ─── HOUSE RENTALS & TO-LET PROPERTIES ───────────────────────────────────────

export interface HouseRentalItem {
  id: string;
  ownerUid?: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp?: string;
  title_en: string;
  title_te?: string;
  bhk: '1 RK' | '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK' | 'Commercial';
  propertyType: string;
  monthlyRent: number;
  depositAmount?: number;
  tenantPreference: 'Family Only' | 'Bachelors' | 'Any / All';
  furnishing: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  area: string;
  addressDetails?: string;
  waterFacility?: string;
  parking?: string;
  description: string;
  images: string[];
  status: 'available' | 'rented';
  postedDate?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const SEED_HOUSE_RENTALS: HouseRentalItem[] = [
  {
    id: 'hr_seed_1',
    ownerUid: 'seed_owner_1',
    ownerName: 'Venkateswarlu G.',
    ownerPhone: '9848011223',
    ownerWhatsapp: '9848011223',
    title_en: '2 BHK Spacious Flat (1st Floor, East Facing)',
    title_te: '2 BHK విశాలమైన ఫ్లాట్ (మొదటి అంతస్తు, తూర్పు ముఖం)',
    bhk: '2 BHK',
    propertyType: 'Apartment / Flat',
    monthlyRent: 9500,
    depositAmount: 25000,
    tenantPreference: 'Family Only',
    furnishing: 'Semi-Furnished',
    area: 'Gayatri Estate, Kurnool',
    addressDetails: 'Near Venkateswara Swamy Temple, 2nd Cross Road',
    waterFacility: '24/7 Borewell + Municipal Drinking Tap',
    parking: 'Car & Bike Parking Available',
    description: 'Neat & clean 2 BHK flat with modular kitchen, fans, lights, geyser, and separate utility balcony. Strictly vegetarian families preferred.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    postedDate: 'Today',
  },
  {
    id: 'hr_seed_2',
    ownerUid: 'seed_owner_2',
    ownerName: 'Shaik Abdul Rahim',
    ownerPhone: '9440198765',
    ownerWhatsapp: '9440198765',
    title_en: '1 BHK Independent House Ground Floor',
    title_te: '1 BHK ఇండిపెండెంట్ ఇల్లు గ్రౌండ్ ఫ్లోర్',
    bhk: '1 BHK',
    propertyType: 'Independent House',
    monthlyRent: 5500,
    depositAmount: 12000,
    tenantPreference: 'Any / All',
    furnishing: 'Unfurnished',
    area: 'Joharapuram Road, Kurnool',
    addressDetails: 'Opposite Community Hall, 30ft Road',
    waterFacility: '24/7 Borewell water',
    parking: 'Bike Parking Inside Gate',
    description: 'Peaceful residential locality with peaceful surroundings. 1 Hall, 1 Bedroom with attached bath, Kitchen, and utility wash area.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    postedDate: 'Yesterday',
  },
  {
    id: 'hr_seed_3',
    ownerUid: 'seed_owner_3',
    ownerName: 'M. Suresh Reddy',
    ownerPhone: '9849200001',
    ownerWhatsapp: '9849200001',
    title_en: '3 BHK Deluxe Flat with Lift & Generator',
    title_te: '3 BHK డీలక్స్ ఫ్లాట్ (లిఫ్ట్ & జనరేటర్)',
    bhk: '3 BHK',
    propertyType: 'Apartment / Flat',
    monthlyRent: 16000,
    depositAmount: 40000,
    tenantPreference: 'Family Only',
    furnishing: 'Fully Furnished',
    area: 'B Camp, Kurnool',
    addressDetails: 'Prime Location, Near Silver Jubilee College',
    waterFacility: 'Borewell & Manjeera connection',
    parking: 'Dedicated Covered Car Parking',
    description: 'Fully furnished 3 BHK with 3 ACs, sofa set, dining table, 2 double beds with mattresses, and modular kitchen chimney. 24/7 security guard.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    postedDate: '2 days ago',
  },
  {
    id: 'hr_seed_4',
    ownerUid: 'seed_owner_4',
    ownerName: 'K. Srinivasa Rao',
    ownerPhone: '9123456780',
    ownerWhatsapp: '9123456780',
    title_en: '2 BHK Independent House (Near Checkpost)',
    title_te: '2 BHK ఇండిపెండెంట్ ఇల్లు (చెక్ పోస్ట్ దగ్గర)',
    bhk: '2 BHK',
    propertyType: 'Independent House',
    monthlyRent: 8000,
    depositAmount: 20000,
    tenantPreference: 'Family Only',
    furnishing: 'Semi-Furnished',
    area: 'Nandyal Checkpost, Kurnool',
    addressDetails: 'Behind Reliance Trends, Krishna Nagar',
    waterFacility: 'Continuous supply borewell water',
    parking: 'Bike & Small Car Parking',
    description: 'Very close to main road, bus stop, schools, and hospitals. 100% Vastu compliant, east facing with marble flooring.',
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    postedDate: '3 days ago',
  },
  {
    id: 'hr_seed_5',
    ownerUid: 'seed_owner_5',
    ownerName: 'Ravi Teja',
    ownerPhone: '9848055667',
    ownerWhatsapp: '9848055667',
    title_en: 'Main Road Commercial Shop / Office Space',
    title_te: 'మెయిన్ రోడ్ కమర్షియల్ షాప్ / ఆఫీస్ స్పేస్',
    bhk: 'Commercial',
    propertyType: 'Commercial Space',
    monthlyRent: 12000,
    depositAmount: 50000,
    tenantPreference: 'Any / All',
    furnishing: 'Unfurnished',
    area: 'Abbas Nagar, Kurnool',
    addressDetails: 'Ground Floor, High Footfall Main Junction',
    waterFacility: 'Commercial water connection',
    parking: 'Customer Parking on Frontage',
    description: '280 sq.ft prime commercial space with rolling shutter, glass partition, tile flooring, and separate electrical meter. Ideal for clinic, pharmacy, or office.',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'available',
    postedDate: '4 days ago',
  },
];

export async function fetchHouseRentals(bhkFilter?: string): Promise<HouseRentalItem[]> {
  try {
    const coll = collection(db, 'house_rentals');
    let q;
    if (bhkFilter && bhkFilter !== 'all' && bhkFilter !== 'All') {
      q = query(coll, where('status', '==', 'available'), where('bhk', '==', bhkFilter), limit(50));
    } else {
      q = query(coll, where('status', '==', 'available'), limit(50));
    }
    const snap = await getDocs(q);
    const liveItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as HouseRentalItem));
    if (liveItems.length > 0) {
      const liveIds = new Set(liveItems.map(i => i.id));
      const filteredSeeds = SEED_HOUSE_RENTALS.filter(s => {
        if (liveIds.has(s.id)) return false;
        if (bhkFilter && bhkFilter !== 'all' && bhkFilter !== 'All') return s.bhk === bhkFilter;
        return true;
      });
      return [...liveItems, ...filteredSeeds];
    }
  } catch (err) {
    console.warn('fetchHouseRentals fallback to seeds:', err);
  }
  if (bhkFilter && bhkFilter !== 'all' && bhkFilter !== 'All') {
    return SEED_HOUSE_RENTALS.filter(s => s.bhk === bhkFilter);
  }
  return SEED_HOUSE_RENTALS;
}

export async function createHouseRental(rental: Omit<HouseRentalItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const colRef = collection(db, 'house_rentals');
  const payload = sanitizeFirestoreData({
    ...rental,
    status: 'available',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
}

export async function updateHouseRental(id: string, updates: Partial<HouseRentalItem>): Promise<void> {
  const payload = sanitizeFirestoreData({
    ...updates,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'house_rentals', id), payload);
}

export async function deleteHouseRental(id: string): Promise<void> {
  await deleteDoc(doc(db, 'house_rentals', id));
}

// ─── BUSINESS REVIEWS ────────────────────────────────────────────────────────

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

export const fetchBusinessReviews = async (businessId: string): Promise<BusinessReview[]> => {
  try {
    const q = query(
      collection(db, 'businesses', businessId, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt || new Date().toISOString(),
    } as BusinessReview));
  } catch (err) {
    console.warn('fetchBusinessReviews error:', err);
    return [];
  }
};

export const addBusinessReview = async (
  businessId: string,
  userId: string,
  userName: string,
  userPhoto: string,
  rating: number,
  comment: string
): Promise<void> => {
  const reviewRef = collection(db, 'businesses', businessId, 'reviews');
  await addDoc(reviewRef, {
    businessId,
    userId,
    userName,
    userPhoto: userPhoto || '',
    rating,
    comment,
    createdAt: serverTimestamp(),
  });

  try {
    const bizRef = doc(db, 'businesses', businessId);
    const bizSnap = await getDoc(bizRef);
    if (bizSnap.exists()) {
      const data = bizSnap.data();
      const currentCount = data.ratingCount || 0;
      const currentAvg = data.ratingAvg || 0;
      const newCount = currentCount + 1;
      const newAvg = Number(((currentAvg * currentCount + rating) / newCount).toFixed(1));
      await updateDoc(bizRef, {
        ratingCount: newCount,
        ratingAvg: newAvg,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Error updating business rating aggregate:', err);
  }
};


