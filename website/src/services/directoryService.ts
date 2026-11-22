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
  ownerEmail?: string;
  claimStatus: 'unclaimed' | 'pending' | 'verified';
  tier: 'free' | 'featured' | 'premium' | 'standard';
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
  ownerEmail?: string;
  ownerUid?: string;
  createdAt?: string;
  verifiedProfessional: boolean;
  ratingAvg: number;
  ratingCount: number;
  reviewCount?: number;
  planId?: string;
  tier?: string;
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
  viewCount?: number;
  professionalId?: string;
  professionalName?: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenId?: string;
  citizenArea?: string;
  targetId?: string;
  targetName?: string;
  targetTitle?: string;
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
  images?: string[];
  phone?: string;
  category: string;
  status?: string;
  isFeatured?: boolean;
  viewCount?: number;
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
    id: 'car_showrooms',
    name_en: 'Car Showrooms',
    name_te: 'కార్ షోరూమ్‌లు',
    icon: 'Car',
    subcategories: [
      { id: 'new_car_showrooms', name_en: 'New Car Dealerships', name_te: 'కొత్త కార్ల షోరూమ్‌లు' },
      { id: 'used_car_dealers', name_en: 'Pre-Owned & Used Car Outlets', name_te: 'సెకండ్ హ్యాండ్ కార్లు' },
      { id: 'electric_car_dealers', name_en: 'Electric Car (EV) Dealerships', name_te: 'ఎలక్ట్రిక్ కార్ల షోరూమ్‌లు' },
      { id: 'commercial_car_dealers', name_en: 'Commercial Vehicles & Vans', name_te: 'కమర్షియల్ వాహనాలు' },
    ],
  },
  {
    id: 'bike_showrooms',
    name_en: 'Bike & Two-Wheeler Showrooms',
    name_te: 'బైక్ & స్కూటర్ షోరూమ్‌లు',
    icon: 'Bike',
    subcategories: [
      { id: 'two_wheeler_dealers', name_en: 'New Bike & Scooter Dealerships', name_te: 'కొత్త బైక్ షోరూమ్‌లు' },
      { id: 'ev_scooter_dealers', name_en: 'Electric Scooter Showrooms (Ola, Ather, Chetak)', name_te: 'ఈవీ స్కూటర్ల షోరూమ్‌లు' },
      { id: 'superbike_royal_enfield', name_en: 'Royal Enfield & Premium Bikes', name_te: 'రాయల్ ఎన్‌ఫీల్డ్ & ప్రీమియం బైక్‌లు' },
      { id: 'used_bikes', name_en: 'Pre-Owned & Second-Hand Two Wheelers', name_te: 'సెకండ్ హ్యాండ్ బైకులు' },
    ],
  },
  {
    id: 'automobile_dealers',
    name_en: 'Automobile Dealers & Showrooms',
    name_te: 'ఆటోమొబైల్ డీలర్లు & షోరూమ్‌లు',
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
    id: 'function_halls_banquets',
    name_en: 'Function Halls & Banquet Halls',
    name_te: 'ఫంక్షన్ హాళ్ళు & కళ్యాణ మండపాలు',
    icon: 'Building2',
    subcategories: [
      { id: 'ac_function_halls', name_en: 'AC Function Halls & Kalyana Mandapams', name_te: 'ఏసీ ఫంక్షన్ హాళ్ళు & కళ్యాణ మండపాలు' },
      { id: 'mini_banquet_halls', name_en: 'Mini Banquet Halls (Parties & Birthdays)', name_te: 'మినీ బాంక్వెట్ హాళ్ళు' },
      { id: 'convention_centers', name_en: 'Convention Centers & Open Lawns', name_te: 'కన్వెన్షన్ సెంటర్లు & ఓపెన్ లాన్స్' },
      { id: 'dining_community_halls', name_en: 'Community Halls & Dining Venues', name_te: 'కమ్యూనిటీ హాళ్ళు' },
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

export const SEED_PLACES: PlaceItem[] = [];

export const SEED_WORSHIP_PLACES: PlaceItem[] = [];

export const SEED_OFFERS: OfferItem[] = [];

// ─── FIRESTORE API METHODS ───────────────────────────────────────────────────

export const fetchBusinesses = async (
  categoryId?: string,
  searchQuery?: string,
): Promise<BusinessItem[]> => {
  try {
    const coll = collection(db, 'businesses');
    const q = query(coll, where('status', 'in', ['active', 'published', 'approved']), limit(100));
    const snap = await getDocs(q);

    let results: BusinessItem[] = [];
    if (!snap.empty) {
      results = snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessItem));
    }

    if (categoryId && categoryId !== 'all') {
      const mapped = LEGACY_BUSINESS_CATEGORY_MAP[categoryId];
      const matchCats = [categoryId, mapped].filter(Boolean);
      results = results.filter(b => matchCats.includes(b.categoryId));
    }

    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      results = results.filter(b =>
        b.name_en?.toLowerCase().includes(queryLower) ||
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

export const fetchProfessionals = async (): Promise<ProfessionalItem[]> => {
  try {
    const coll = collection(db, 'professionals');
    const q = query(coll, where('status', 'in', ['active', 'published', 'approved']), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProfessionalItem));
    }
    return [];
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

export const fetchProfessionalById = async (id: string): Promise<ProfessionalItem | null> => {
  try {
    const docRef = doc(db, 'professionals', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as ProfessionalItem;
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchPlaces = async (): Promise<PlaceItem[]> => {
  try {
    const coll = collection(db, 'places');
    const snap = await getDocs(coll);
    if (snap.empty) return [];
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PlaceItem));
  } catch {
    return [];
  }
};

export const fetchWorshipPlaces = async (type?: string): Promise<PlaceItem[]> => {
  try {
    const coll = collection(db, 'places_of_worship');
    const snap = await getDocs(coll);
    if (snap.empty) return [];
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as PlaceItem));
    if (type && type !== 'all') {
      return items.filter(p => p.type === type);
    }
    return items;
  } catch {
    return [];
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
    if (!snap.empty) {
      const now = Date.now();
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as OfferItem))
        .filter((o: any) => {
          if (o.expiresAt) {
            const exp = new Date(o.expiresAt).getTime();
            if (!isNaN(exp) && exp < now) return false;
          }
          return true;
        });
    }
    return [];
  } catch {
    return [];
  }
};

export const fetchAllOffersAdmin = async (): Promise<OfferItem[]> => {
  try {
    const coll = collection(db, 'promotions');
    const snap = await getDocs(coll);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as OfferItem));
    }
    return [];
  } catch {
    return [];
  }
};

export const uploadMediaFile = async (file: File, folder = 'media'): Promise<string> => {
  const filename = `${folder}_${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${folder}/${filename}`);
  const task = await uploadBytesResumable(storageRef, file);
  return await getDownloadURL(task.ref);
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

  // Automatically broadcast push alert for this new Hot Deal
  try {
    const notifColl = collection(db, 'broadcast_notifications');
    const discount = data.discountText || 'Special Offer';
    const store = data.businessName || 'Local Merchant';
    const dealTitle = data.title_en || data.title_te || 'Exclusive Deal';
    await addDoc(notifColl, {
      title: `🔥 Hot Deal: ${discount} at ${store}`,
      body: `${dealTitle} • Tap to view deal on Kurnool One!`,
      category: 'deal',
      targetAudience: 'all',
      actionUrl: '/offers',
      imageUrl: data.bannerUrl || (data.images && data.images[0]) || '',
      createdAt: serverTimestamp(),
    });
  } catch (notifErr) {
    console.warn('Failed to broadcast deal notification:', notifErr);
  }

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

export const fetchMyProfessionals = async (userId: string): Promise<ProfessionalItem[]> => {
  try {
    if (!userId) return [];
    const coll = collection(db, 'professionals');
    const q = query(coll, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProfessionalItem));
  } catch (err) {
    console.error('Error fetching my professionals:', err);
    return [];
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
    id: 'biz_free',
    name: 'Free Basic',
    name_te: 'ఉచిత బేసిక్',
    price: 0,
    period: 'always free',
    badge: 'Free Forever',
    features: [
      'Basic listing in selected category',
      'Address & basic contact details',
      'Operating hours display',
      'Standard civic search visibility',
    ],
  },
  {
    id: 'biz_standard',
    name: 'Standard Verified',
    name_te: 'స్టాండర్డ్ వెరిఫైడ్',
    price: 399,
    period: 'for 6 months',
    badge: 'Popular Choice',
    recommended: true,
    features: [
      'Official Verified Merchant checkmark',
      'Direct Call & WhatsApp lead buttons',
      'Google Maps directions link',
      'Logo & storefront cover photo',
      'Priority ranking above free listings',
    ],
  },
  {
    id: 'biz_premium',
    name: 'Premium Featured',
    name_te: 'ప్రీమియం ఫీచర్డ్',
    price: 999,
    period: 'for 1 year',
    badge: 'Best Value (1 Year)',
    features: [
      'Top priority category ranking for 1 Full Year',
      'Homepage Featured showcase placement',
      'Hot Deals & Offers publishing privileges',
      'Complete photo gallery & social media links',
      'Verified Merchant trust badge',
    ],
  },
];

export const PROFESSIONAL_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'pro_free',
    name: 'Free Basic',
    name_te: 'ఉచిత బేసిక్',
    price: 0,
    period: 'always free',
    badge: 'Free Forever',
    features: [
      'Personal profile in 1 skill category',
      'Direct contact phone number',
      'Service area coverage listing',
      'Standard search visibility',
    ],
  },
  {
    id: 'pro_standard',
    name: 'Standard Verified',
    name_te: 'స్టాండర్డ్ వెరిఫైడ్',
    price: 199,
    period: 'for 6 months',
    badge: 'Most Popular',
    recommended: true,
    features: [
      'Official Verified Pro checkmark',
      'Direct 1-tap Call & WhatsApp inquiry buttons',
      'Visiting charges & experience display',
      'Priority ranking above unverified profiles',
      'Customer review ratings badge',
    ],
  },
  {
    id: 'pro_premium',
    name: 'Elite Pro',
    name_te: 'ఎలైట్ ప్రో',
    price: 499,
    period: 'for 1 year',
    badge: 'Best Value (1 Year)',
    features: [
      'Top placement in category search for 12 Months',
      'Direct 1-tap client inquiry calls',
      'Full portfolio showcase',
      'Homepage Featured Spotlight placement',
      'Official Verified Pro badge',
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

export const syncAllSeedsToFirestore = async (): Promise<{ totalCount: number }> => {
  let totalCount = 0;
  try {
    for (const cat of MASTER_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      totalCount++;
    }
    for (const biz of SEED_BUSINESSES) {
      await setDoc(doc(db, 'businesses', biz.id), { ...biz, status: 'published' }, { merge: true });
      totalCount++;
    }
    for (const pro of SEED_PROFESSIONALS) {
      await setDoc(doc(db, 'professionals', pro.id), { ...pro, status: 'active' }, { merge: true });
      totalCount++;
    }
    for (const off of SEED_OFFERS) {
      await setDoc(doc(db, 'promotions', off.id), { ...off, status: 'published' }, { merge: true });
      totalCount++;
    }
    for (const plc of SEED_PLACES) {
      await setDoc(doc(db, 'places', plc.id), plc, { merge: true });
      totalCount++;
    }
    for (const wor of SEED_WORSHIP_PLACES) {
      await setDoc(doc(db, 'places_of_worship', wor.id), wor, { merge: true });
      totalCount++;
    }
    for (const n of SEED_NEWS) {
      await setDoc(doc(db, 'news', n.id), { ...n, status: 'approved' }, { merge: true });
      totalCount++;
    }
  } catch (err) {
    console.error('syncAllSeedsToFirestore error:', err);
  }
  return { totalCount };
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
  sourceType?: 'user' | 'business' | 'professional';
  businessId?: string;
  businessName?: string;
  viewCount?: number;
  proId?: string;
  proName?: string;
  createdAt?: any;
}

export const SEED_MARKET_ITEMS: MarketplaceItem[] = [];

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
      return live;
    }
  } catch (err) {
    console.warn('fetchMarketplaceItems non-fatal:', err);
  }
  return [];
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

export const SEED_BLOOD_DONORS: BloodDonorItem[] = [];

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
    return liveItems.sort((a, b) => {
      const tA = (a.createdAt as any)?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() / 1000 : 0);
      const tB = (b.createdAt as any)?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() / 1000 : 0);
      return tB - tA;
    });
  } catch (err) {
    console.warn('fetchBloodDonors error:', err);
  }
  return [];
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

export const SEED_NEWS: NewsItem[] = [];

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const q = query(
      collection(db, 'news'),
      where('status', '==', 'published'),
      limit(50)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
    }
  } catch (err) {
    console.warn('fetchNews error:', err);
  }
  return [];
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

export const SEED_HOUSE_RENTALS: HouseRentalItem[] = [];

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
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as HouseRentalItem));
  } catch (err) {
    console.warn('fetchHouseRentals error:', err);
    return [];
  }
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

export interface ReportSubmission {
  targetId: string;
  targetTitle: string;
  reportType: 'business' | 'professional' | 'deal' | 'news' | 'community_post' | 'marketplace';
  reason: string;
  details?: string;
  reporterPhone?: string;
  reporterUid?: string;
}

export const submitContentReport = async (report: ReportSubmission): Promise<boolean> => {
  try {
    const targetCollection =
      report.reportType === 'business' ? 'businesses' :
        report.reportType === 'professional' ? 'professionals' :
          report.reportType === 'deal' ? 'promotions' :
            report.reportType === 'news' ? 'news' :
              report.reportType === 'marketplace' ? 'marketplace' :
                report.reportType === 'community_post' ? 'posts' : 'businesses';

    const coll = collection(db, 'reports');
    await addDoc(coll, {
      ...report,
      targetCollection,
      itemType: report.reportType,
      title_en: report.targetTitle,
      status: 'pending',
      reportCount: 1,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error('submitContentReport error:', e);
    return false;
  }
};

export interface SubscriptionLedgerItem {
  id?: string;
  transactionId: string;
  orderId?: string;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  entityId: string;
  entityName: string;
  entityType: 'business' | 'professional';
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  startDate: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt?: any;
}

export async function recordSubscriptionPayment(sub: Omit<SubscriptionLedgerItem, 'id' | 'createdAt'>): Promise<string> {
  const coll = collection(db, 'subscriptions');
  const payload = sanitizeFirestoreData({
    ...sub,
    status: sub.status || 'active',
    createdAt: serverTimestamp(),
  });
  const docRef = await addDoc(coll, payload);
  return docRef.id;
}


