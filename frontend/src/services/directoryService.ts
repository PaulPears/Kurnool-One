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
  subcategories: { id: string; name_en: string; name_te: string }[];
}

export interface BusinessItem {
  id: string;
  name_en: string;
  name_te: string;
  categoryId: string;
  subcategoryId: string;
  description_en: string;
  description_te: string;
  address: string;
  landmark?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  images: string[];
  coverImage?: string;
  timing?: string;
  amenities?: string[];
  priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  ownerUid?: string;
  claimStatus: 'unclaimed' | 'pending' | 'verified';
  tier: 'free' | 'featured' | 'premium';
  verificationBadge: 'none' | 'verified_business';
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
  categoryName_te?: string;
  experienceYears: number;
  serviceAreas: string[];
  phone: string;
  whatsapp?: string;
  hourlyRate?: string;
  visitingCharges?: string;
  description?: string;
  portfolioPhotos: string[];
  avatarUrl?: string;
  verifiedProfessional: boolean;
  ratingAvg: number;
  ratingCount: number;
  status: 'active' | 'pending' | 'suspended';
}

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
    id: 'food_dining',
    name_en: 'Food & Dining',
    name_te: 'ఆహారం & రెస్టారెంట్లు',
    icon: 'restaurant',
    subcategories: [
      { id: 'restaurants', name_en: 'Restaurants', name_te: 'రెస్టారెంట్లు' },
      { id: 'cafes', name_en: 'Cafes & Bakeries', name_te: 'కేఫ్‌లు & బేకరీలు' },
      { id: 'fast_food', name_en: 'Fast Food & Snacks', name_te: 'ఫాస్ట్ ఫుడ్' },
      { id: 'catering', name_en: 'Catering & Sweets', name_te: 'క్యాటరింగ్ & స్వీట్స్' },
    ],
  },
  {
    id: 'shopping',
    name_en: 'Shopping & Retail',
    name_te: 'షాపింగ్ & దుకాణాలు',
    icon: 'bag-handle',
    subcategories: [
      { id: 'clothing', name_en: 'Clothing & Textiles', name_te: 'బట్టల దుకాణాలు' },
      { id: 'jewellery', name_en: 'Jewellery Stores', name_te: 'నగల దుకాణాలు' },
      { id: 'electronics', name_en: 'Mobiles & Electronics', name_te: 'ఎలక్ట్రానిక్స్ & మొబైల్స్' },
      { id: 'supermarkets', name_en: 'Supermarkets & Groceries', name_te: 'సూపర్‌మార్కెట్లు' },
    ],
  },
  {
    id: 'health_wellness',
    name_en: 'Health & Medical',
    name_te: 'వైద్యం & ఆరోగ్యం',
    icon: 'medkit',
    subcategories: [
      { id: 'hospitals', name_en: 'Hospitals & Clinics', name_te: 'ఆసుపత్రులు' },
      { id: 'pharmacies', name_en: 'Pharmacies', name_te: 'మందుల షాపులు' },
      { id: 'diagnostics', name_en: 'Diagnostic Labs', name_te: 'ల్యాబ్‌లు' },
      { id: 'gyms', name_en: 'Gyms & Fitness', name_te: 'జిమ్‌లు & ఫిట్‌నెస్' },
    ],
  },
  {
    id: 'skilled_services',
    name_en: 'Home & Repair Services',
    name_te: 'గృహ మరమ్మతు సేవలు',
    icon: 'hammer',
    subcategories: [
      { id: 'plumbers', name_en: 'Plumbers', name_te: 'ప్లంబర్లు' },
      { id: 'electricians', name_en: 'Electricians', name_te: 'ఎలక్ట్రీషియన్లు' },
      { id: 'ac_repair', name_en: 'AC & Appliance Repair', name_te: 'ఏసీ & ఉపకరణాల రిపేర్' },
      { id: 'painters', name_en: 'Painters & Carpenters', name_te: 'పెయింటర్లు & కార్పెంటర్లు' },
    ],
  },
  {
    id: 'creative_media',
    name_en: 'Photo & Media',
    name_te: 'ఫోటోగ్రఫీ & మీడియా',
    icon: 'camera',
    subcategories: [
      { id: 'photographers', name_en: 'Wedding & Event Photographers', name_te: 'ఫోటోగ్రాఫర్లు' },
      { id: 'videography', name_en: 'Cinematography & Drone', name_te: 'వీడియో & డ్రోన్' },
      { id: 'designers', name_en: 'Graphic & Web Designers', name_te: 'డిజైనర్లు' },
    ],
  },
  {
    id: 'beauty_care',
    name_en: 'Salons & Bridal',
    name_te: 'సెలూన్లు & బ్యూటీ పార్లర్లు',
    icon: 'sparkles',
    subcategories: [
      { id: 'mens_salons', name_en: "Men's Salons", name_te: 'పురుషుల సెలూన్లు' },
      { id: 'beauty_parlours', name_en: 'Beauty Parlours & Spas', name_te: 'బ్యూటీ పార్లర్లు' },
      { id: 'bridal_makeup', name_en: 'Bridal Makeup Artists', name_te: 'బ్రైడల్ మేకప్' },
    ],
  },
  {
    id: 'education',
    name_en: 'Education & Coaching',
    name_te: 'విద్య & కోచింగ్',
    icon: 'school',
    subcategories: [
      { id: 'schools_colleges', name_en: 'Schools & Colleges', name_te: 'పాఠశాలలు & కళాశాలలు' },
      { id: 'coaching_centers', name_en: 'Exam Coaching Institutes', name_te: 'కోచింగ్ సెంటర్లు' },
      { id: 'tutors', name_en: 'Home Tutors & Skill Training', name_te: 'ట్యూటర్లు' },
    ],
  },
  {
    id: 'professional_services',
    name_en: 'Professional Services',
    name_te: 'వృత్తిపరమైన సేవలు',
    icon: 'briefcase',
    subcategories: [
      { id: 'advocates', name_en: 'Advocates & Legal', name_te: 'న్యాయవాదులు' },
      { id: 'chartered_accountants', name_en: 'Chartered Accountants', name_te: 'సీఏ & ఆడిటర్లు' },
      { id: 'real_estate', name_en: 'Real Estate Consultants', name_te: 'రియల్ ఎస్టేట్' },
    ],
  },
];

// ─── INITIAL SEED DATA (KURNOOL ATTRACTIONS & HERITAGE) ─────────────────────

export const SEED_PLACES: PlaceItem[] = [
  {
    id: 'konda_reddy_fort',
    type: 'landmark',
    name_en: 'Konda Reddy Fort (Buruju)',
    name_te: 'కొండారెడ్డి బురుజు',
    description_en: 'The most iconic historical symbol of Kurnool city, built in the 12th century by Vijayanagara rulers. Notable for its circular bastion and historic underground tunnels.',
    description_te: 'కర్నూలు నగర చారిత్రక చిహ్నం, 12వ శతాబ్దంలో విజయనగర రాజులు నిర్మించారు. కొండారెడ్డి బురుజు కర్నూలు గుండెకాయ వంటిది.',
    address: 'Near Old City, Kurnool, Andhra Pradesh 518001',
    timings: '09:00 AM - 06:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'Morning & Evening',
    photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
    latitude: 15.8281,
    longitude: 78.0373,
    isPromoted: true,
  },
  {
    id: 'orvakal_rock_garden',
    type: 'tourist',
    name_en: 'Orvakal Rock Garden',
    name_te: 'ఓర్వకల్లు రాతి ఉద్యానవనం',
    description_en: 'Magnificent 1000-acre natural park with rare quartz and silica rock formations carved over millions of years around natural water ponds. A major film shooting and picnic destination.',
    description_te: 'ఓర్వకల్లు వద్ద సహజసిద్ధమైన అద్భుతమైన క్వార్ట్జ్ రాతి నిర్మాణాలు, సరస్సులు మరియు బోటింగ్ సౌకర్యాలు ఉన్నాయి.',
    address: 'NH 40, Orvakal, Kurnool Dist (24 km from city)',
    timings: '08:00 AM - 06:00 PM',
    entryFee: '₹20 adults / ₹10 children',
    bestTimeToVisit: 'October to February',
    photos: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'],
    latitude: 15.6886,
    longitude: 78.2257,
    isPromoted: true,
  },
  {
    id: 'rollapadu_sanctuary',
    type: 'tourist',
    name_en: 'Rollapadu Wildlife Sanctuary',
    name_te: 'రోళ్లపాడు వన్యప్రాణుల సంరక్షణ కేంద్రం',
    description_en: 'Renowned grasslands sanctuary home to the endangered Great Indian Bustard, Blackbucks, and diverse migratory birds.',
    description_te: 'రోళ్లపాడు గడ్డిభూములు మరియు అంతరించిపోతున్న గ్రేట్ ఇండియన్ బస్టర్డ్, జింకల సంరక్షణ కేంద్రం.',
    address: 'Rollapadu Village, near Nandikotkur, Kurnool District',
    timings: '07:00 AM - 05:30 PM',
    entryFee: '₹30',
    bestTimeToVisit: 'November to March',
    photos: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'],
    latitude: 15.7483,
    longitude: 78.3752,
    isPromoted: false,
  },
  {
    id: 'tungabhadra_riverfront',
    type: 'landmark',
    name_en: 'Tungabhadra Riverfront & Ghats',
    name_te: 'తుంగభద్ర నదీ తీరం & పుష్కర ఘాట్లు',
    description_en: 'Scenic sacred riverfront where Kurnool residents gather for evening walks, cultural celebrations, and morning tranquility.',
    description_te: 'కర్నూలు నగర తుంగభద్ర నదీ తీరం, సాయంత్రపు నడకలకు మరియు పుష్కర ఘాట్లకు ప్రసిద్ధి.',
    address: 'River Road, Kurnool',
    timings: 'Open 24 Hours',
    entryFee: 'Free',
    photos: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    latitude: 15.8344,
    longitude: 78.0468,
    isPromoted: false,
  },
];

export const SEED_WORSHIP_PLACES: PlaceItem[] = [
  {
    id: 'mantralayam_raghavendra',
    type: 'temple',
    name_en: 'Mantralayam Sri Raghavendra Swamy Matha',
    name_te: 'మంత్రాలయం శ్రీ రాఘవేంద్ర స్వామి మఠం',
    description_en: 'World-renowned holy pilgrimage center on the banks of Tungabhadra where the saint Sri Raghavendra Swamy entered Jeeva Samadhi in 1671.',
    description_te: 'తుంగభద్ర తీరంలో వెలసిన ప్రముఖ పుణ్యక్షేత్రం, శ్రీ రాఘవేంద్ర స్వామి సజీవ సమాధి చెందిన పవిత్ర స్థలం.',
    address: 'Mantralayam, Kurnool District (70 km from Kurnool)',
    timings: '06:00 AM - 02:00 PM, 04:00 PM - 09:00 PM',
    photos: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
    latitude: 15.9409,
    longitude: 77.4304,
    isPromoted: true,
  },
  {
    id: 'kurnool_jumma_masjid',
    type: 'masjid',
    name_en: 'Historic Kurnool Jumma Masjid',
    name_te: 'చారిత్రక కర్నూలు జుమ్మా మసీదు',
    description_en: 'Historic and grand congregational mosque in the heart of Kurnool city, built during the era of the Nawabs of Kurnool.',
    description_te: 'నవాబుల కాలంలో నిర్మించిన కర్నూలు నగర కేంద్రంలోని చారిత్రక మరియు అందమైన జుమ్మా మసీదు.',
    address: 'Old City, near One Town, Kurnool, Andhra Pradesh 518001',
    timings: 'Open for all 5 daily prayers',
    photos: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'],
    latitude: 15.8305,
    longitude: 78.0388,
    isPromoted: true,
  },
  {
    id: 'st_anthonys_shrine',
    type: 'church',
    name_en: "St. Anthony's Shrine & Cathedral",
    name_te: "సెయింట్ ఆంథోనీస్ కేథడ్రల్ చర్చి",
    description_en: 'A peaceful and sacred Roman Catholic cathedral known for its serene prayer hall and community welfare services.',
    description_te: 'కర్నూలులోని ప్రముఖ రోమన్ కాథలిక్ చర్చి మరియు ఆధ్యాత్మిక కేంద్రం.',
    address: 'Budhawarapet, Kurnool, Andhra Pradesh 518002',
    timings: '06:00 AM - 08:00 PM',
    photos: ['https://images.unsplash.com/photo-1548625361-195feeed8230?w=800'],
    latitude: 15.8234,
    longitude: 78.0412,
    isPromoted: true,
  },
  {
    id: 'chennakesava_temple',
    type: 'temple',
    name_en: 'Sri Chennakesava Swamy Temple',
    name_te: 'శ్రీ చెన్నకేశవ స్వామి దేవాలయం',
    description_en: 'Ancient temple of Lord Vishnu dedicated to Sri Chennakesava with serene architecture and daily traditional rituals.',
    description_te: 'కర్నూలులోని ప్రాచీన మరియు ప్రసిద్ధ శ్రీ చెన్నకేశవ స్వామి దేవాలయం.',
    address: 'One Town, Kurnool',
    timings: '06:30 AM - 12:00 PM, 05:00 PM - 08:30 PM',
    photos: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'],
    latitude: 15.8291,
    longitude: 78.0354,
    isPromoted: false,
  },
];

export const SEED_PROFESSIONALS: ProfessionalItem[] = [
  {
    id: 'pro_1',
    fullName: 'Ramesh Electrician & Wiring',
    category: 'Electrician',
    categoryName_te: 'ఎలక్ట్రీషియన్',
    experienceYears: 8,
    serviceAreas: ['Camp Area', 'B-Camp', 'Collectorate', 'Santosh Nagar'],
    phone: '9848012345',
    whatsapp: '9848012345',
    visitingCharges: '₹150',
    hourlyRate: '₹250/hr',
    description: 'Expert residential & commercial electrical wiring, short circuits, switchboards, fan installations and inverter setups.',
    portfolioPhotos: [],
    verifiedProfessional: true,
    ratingAvg: 4.8,
    ratingCount: 34,
    status: 'active',
  },
  {
    id: 'pro_2',
    fullName: 'Srinivas Plumber Services',
    category: 'Plumber',
    categoryName_te: 'ప్లంబర్',
    experienceYears: 11,
    serviceAreas: ['Nandyal Checkpost', 'Prakash Nagar', 'Budhawarapet', 'All Kurnool'],
    phone: '9848023456',
    whatsapp: '9848023456',
    visitingCharges: '₹150',
    description: 'Leakages, bathroom fittings, motor pump repairs, overhead water tank connections and sanitary piping.',
    portfolioPhotos: [],
    verifiedProfessional: true,
    ratingAvg: 4.9,
    ratingCount: 52,
    status: 'active',
  },
  {
    id: 'pro_3',
    fullName: 'Krishna Cool Care (AC Technician)',
    category: 'AC & Appliance',
    categoryName_te: 'ఏసీ సర్వీసింగ్',
    experienceYears: 6,
    serviceAreas: ['All Kurnool City Areas'],
    phone: '9848034567',
    whatsapp: '9848034567',
    visitingCharges: '₹200',
    description: 'Split and window AC gas refilling, jet pump wet servicing, PCB repairs and refrigerator cooling fixes.',
    portfolioPhotos: [],
    verifiedProfessional: true,
    ratingAvg: 4.7,
    ratingCount: 29,
    status: 'active',
  },
  {
    id: 'pro_4',
    fullName: 'Chandra Photography & Films',
    category: 'Wedding Photographer',
    categoryName_te: 'వెడ్డింగ్ ఫోటోగ్రఫీ',
    experienceYears: 7,
    serviceAreas: ['Kurnool & Surrounding Districts'],
    phone: '9848045678',
    whatsapp: '9848045678',
    description: 'Pre-wedding candid shoots, traditional Telugu wedding photography, 4K cinematography and drone aerial coverage.',
    portfolioPhotos: [],
    verifiedProfessional: true,
    ratingAvg: 5.0,
    ratingCount: 41,
    status: 'active',
  },
];

export const SEED_BUSINESSES: BusinessItem[] = [
  {
    id: 'biz_1',
    name_en: 'Mourya Inn Restaurant & Hotel',
    name_te: 'మౌర్య ఇన్ రెస్టారెంట్ & హోటల్',
    categoryId: 'food_dining',
    subcategoryId: 'restaurants',
    description_en: 'Premium family multi-cuisine restaurant serving authentic Rayalaseema delicacies, Kurnool Biryani, North & South Indian meals.',
    description_te: 'కర్నూలులోని ప్రముఖ ఫ్యామిలీ రెస్టారెంట్, రాయలసీమ మరియు బిర్యానీ స్పెషల్స్.',
    address: 'Opp. Old Bus Stand, Kurnool, AP',
    landmark: 'Old Bus Stand',
    phone: '08518224999',
    whatsapp: '9848055555',
    timing: '11:00 AM - 11:00 PM',
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    amenities: ['AC Dining', 'Valet Parking', 'UPI Accepted', 'Takeaway'],
    priceRange: '₹₹',
    claimStatus: 'verified',
    tier: 'featured',
    verificationBadge: 'verified_business',
    ratingAvg: 4.5,
    ratingCount: 120,
    latitude: 15.8275,
    longitude: 78.0355,
    status: 'published',
  },
  {
    id: 'biz_2',
    name_en: 'MedPlus Pharmacy & Healthcare',
    name_te: 'మెడ్‌ప్లస్ మెడికల్ స్టోర్',
    categoryId: 'health_wellness',
    subcategoryId: 'pharmacies',
    description_en: 'Genuine medicines, wellness products, diagnostic sample collections with instant home delivery across Kurnool.',
    description_te: 'అన్ని రకాల మందులు మరియు వైద్య ఉత్పత్తులు లభించును.',
    address: 'Near Nandyal Checkpost, Kurnool',
    landmark: 'Nandyal Checkpost',
    phone: '08518230000',
    whatsapp: '9848066666',
    timing: '07:00 AM - 11:30 PM',
    images: ['https://images.unsplash.com/photo-1586015555751-63c25b3cf17d?w=800'],
    amenities: ['Home Delivery', 'Online UPI', 'Pharmacist On Duty'],
    priceRange: '₹',
    claimStatus: 'verified',
    tier: 'free',
    verificationBadge: 'verified_business',
    ratingAvg: 4.6,
    ratingCount: 45,
    latitude: 15.8190,
    longitude: 78.0450,
    status: 'published',
  },
  {
    id: 'biz_3',
    name_en: 'Kurnool Mega Silks & Sarees',
    name_te: 'కర్నూలు మెగా సిల్క్స్ & శారీస్',
    categoryId: 'shopping',
    subcategoryId: 'clothing',
    description_en: 'Famous bridal wedding pattu sarees, handloom silks, fancy lehengas and family clothing collection.',
    description_te: 'పెళ్లి పట్టు చీరలు, డ్రెస్సులు మరియు ఫ్యామిలీ బట్టల షోరూమ్.',
    address: 'Park Road, One Town, Kurnool',
    phone: '08518241234',
    whatsapp: '9848077777',
    timing: '10:00 AM - 09:30 PM',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'],
    amenities: ['AC Showroom', 'Cards Accepted', 'Trial Rooms'],
    priceRange: '₹₹₹',
    claimStatus: 'verified',
    tier: 'featured',
    verificationBadge: 'verified_business',
    ratingAvg: 4.7,
    ratingCount: 88,
    latitude: 15.8260,
    longitude: 78.0340,
    status: 'published',
  },
];

export const SEED_OFFERS: OfferItem[] = [
  {
    id: 'off_1',
    title_en: 'Flat 20% OFF on Wedding Outfits',
    title_te: 'పెళ్లి బట్టలపై 20% తగ్గింపు',
    description_en: 'Special festive discount on designer silk sarees and bridal collections at Kurnool Mega Silks.',
    description_te: 'మెగా సిల్క్స్ లో పట్టు చీరలపై ప్రత్యేక తగ్గింపు.',
    discountText: '20% OFF',
    businessName: 'Kurnool Mega Silks',
    validUntil: 'Valid till Sunday',
    phone: '08518241234',
    category: 'Shopping',
  },
  {
    id: 'off_2',
    title_en: 'Family Combo Meal @ ₹599 Only',
    title_te: 'ఫ్యామిలీ కాంబో మీల్ @ ₹599 మాత్రమే',
    description_en: '2 Special Biryanis + 1 Starter + Beverages at Mourya Inn Restaurant.',
    description_te: 'రెండు బిర్యానీలు మరియు స్టార్టర్ కాంబో ఆఫర్.',
    discountText: 'COMBO ₹599',
    businessName: 'Mourya Inn Restaurant',
    validUntil: 'Every Weekend',
    phone: '08518224999',
    category: 'Food',
  },
];

export const SEED_EVENTS: EventItem[] = [
  {
    id: 'eve_1',
    title_en: 'Kurnool District Agri & Handloom Expo 2026',
    title_te: 'కర్నూలు జిల్లా వ్యవసాయ & చేనేత ఎగ్జిబిషన్',
    dateStr: 'This Weekend',
    timeStr: '10:00 AM - 09:00 PM',
    venue: 'Government Arts College Grounds, Kurnool',
    organizerName: 'District Industrial Promotion Cell',
    contactPhone: '08518250000',
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    entryType: 'free',
    status: 'approved',
  },
  {
    id: 'eve_2',
    title_en: 'Tungabhadra Evening Cultural Aarti & Classical Music',
    title_te: 'తుంగభద్ర సాయంత్రపు హారతి & సాంస్కృతిక వేడుక',
    dateStr: 'Every Friday Evening',
    timeStr: '06:30 PM - 08:00 PM',
    venue: 'Pushkara Ghat, Riverfront, Kurnool',
    organizerName: 'Kurnool Heritage Society',
    contactPhone: '9848099999',
    posterUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
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
    if (categoryId && categoryId !== 'all') {
      q = query(coll, where('status', '==', 'published'), where('categoryId', '==', categoryId), limit(50));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      let list = SEED_BUSINESSES;
      if (categoryId && categoryId !== 'all') {
        list = list.filter(b => b.categoryId === categoryId);
      }
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        list = list.filter(b => 
          b.name_en.toLowerCase().includes(queryLower) ||
          b.name_te.includes(searchQuery) ||
          b.description_en.toLowerCase().includes(queryLower)
        );
      }
      return list;
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
    return SEED_BUSINESSES.find(b => b.id === id) || null;
  }
};

export const fetchProfessionals = async (category?: string): Promise<ProfessionalItem[]> => {
  try {
    const coll = collection(db, 'professionals');
    const q = query(coll, where('status', '==', 'active'), limit(50));
    const snap = await getDocs(q);
    if (snap.empty) {
      if (category && category !== 'all') {
        return SEED_PROFESSIONALS.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
      }
      return SEED_PROFESSIONALS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProfessionalItem));
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

export const registerBusiness = async (data: Partial<BusinessItem>): Promise<string> => {
  const user = auth.currentUser;
  const coll = collection(db, 'businesses');
  const docRef = await addDoc(coll, {
    ...data,
    ownerUid: user?.uid || '',
    claimStatus: user ? 'pending' : 'unclaimed',
    tier: 'free',
    verificationBadge: 'none',
    ratingAvg: 0,
    ratingCount: 0,
    status: 'pending_approval',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
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
