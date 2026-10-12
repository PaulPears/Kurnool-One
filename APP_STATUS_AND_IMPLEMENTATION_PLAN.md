# KURNOOL ONE – MOBILE APP AUDIT & IMPLEMENTATION PLAN

**Date:** October 8, 2026  
**Focus:** Android Mobile App (`/frontend`) & Firebase Backend  
**Document Purpose:** Detailed status audit of current completion, pending items, and step-by-step implementation plan for Google Play Store readiness.

---

## 1. Executive Summary & Current App Status

The Kurnool One Mobile Application is built with **React Native (Expo SDK 52)**, **TypeScript**, **TailwindCSS (NativeWind)**, **Firebase (Auth, Firestore, Storage)**, **Google Mobile Ads (AdMob)**, and a **Razorpay** checkout system.

### App Screens Audit (19 Screens)

| Screen File | Current Purpose | Current Status | Issues / Pending Updates |
|---|---|---|---|
| [SplashScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/SplashScreen.tsx) | App startup, brand logo, session checking | Completed | Routes to login or main based on stored session |
| [MobileFirebaseLogin.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/MobileFirebaseLogin.tsx) | User login & registration | **Needs Overhaul** | Still has mobile number + OTP inputs; must be updated to **Single "Continue with Google"** only |
| [HomeScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/HomeScreen.tsx) | Citizen Home, Search, Quick Categories, Pros, Tourism | Partially Working | Remove "for free" claim; verify category color tokens; investigate home notification badge |
| [DirectoryScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/DirectoryScreen.tsx) | Business & Professional Listings, Filter tabs | Partially Working | Needs dynamic category colors and **Influencer** category support |
| [BusinessDetailScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/BusinessDetailScreen.tsx) | Detailed shop profile, hours, calls, reviews | Completed | Ready; verify disclaimer for third-party info |
| [ProfessionalDetailScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/ProfessionalDetailScreen.tsx) | Pro profile, rates, experience, direct call | Completed | Needs Influencer badge styling |
| [RegisterBusinessScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/RegisterBusinessScreen.tsx) | Shop registration & 3 subscription plans | Partially Working | Payment flow works with Razorpay modal; update to support Test ATM card instructions |
| [RegisterProfessionalScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/RegisterProfessionalScreen.tsx) | Professional registration & 3 plans | Partially Working | Missing **Influencer** category option; payment works with Test ATM Card |
| [ManageBusinessScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/ManageBusinessScreen.tsx) | Business owner portal (leads, hours, info) | Completed | Role-gated for business accounts |
| [ManageProfessionalScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/ManageProfessionalScreen.tsx) | Professional portal (client calls, rates, areas) | Completed | Role-gated for professional accounts |
| [OffersScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/OffersScreen.tsx) | Deals & City Events browsing | Partially Working | Lacks expired deal auto-filtering and deep-link handlers from push notifications |
| [ExploreScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/ExploreScreen.tsx) | Tourism, Konda Reddy Buruju, Places of Worship | Completed | Fully functional |
| [SearchScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/SearchScreen.tsx) | Global search across shops, pros, and landmarks | Completed | Dynamic multi-entity search working |
| [ProfileScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/ProfileScreen.tsx) | User profile, live counts, portals, admin entry | Completed | Shows portals depending on user role |
| [SettingsScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/SettingsScreen.tsx) | Language switcher, Legal links, Delete account | Completed | Google Play compliant account erasure implemented |
| [NotificationScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/NotificationScreen.tsx) | Notifications list | Partially Working | Basic notifications; needs support for Deal, Event, and News deep links |
| [AdminDashboardScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/AdminDashboardScreen.tsx) | Mobile admin dashboard | Partially Working | Needs manual access granting, News CRUD, Offers moderation, and Push trigger |
| [AdminBannerScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/AdminBannerScreen.tsx) | Hero banner manager | Completed | Image upload and link management works |
| [EditProfileScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/EditProfileScreen.tsx) | Edit name, bio, photo | Completed | Working |

---

## 2. Requirement Status Matrix (Mobile App Focus)

| # | Requirement | Current App Status | Action Needed |
|---|---|---|---|
| 1 | **Single Login System** | Partially Working | Remove phone input & OTP. Keep ONLY "Continue with Google". Auto-detect role upon login. |
| 2 | **Terms of Service & Privacy Policy** | Partially Working | Display on login screen with direct in-app browser opening. |
| 3 | **Business & Pro Payment System** | Working | Test ATM Card flow supported. Verify payment status storage in Firestore. |
| 4 | **Google Play Reviewer Access** | Partially Working | Provide test card credentials in Play Console review notes (no public reviewer button). |
| 5 | **Complete Admin Panel** | Partially Working | Expand mobile admin screen: News, Events, Offers approval, and Manual Access Granting. |
| 6 | **Admin-Granted Access** | Pending | Add UI for Admin to grant Business/Pro role with audit record in `admin_access_grants`. |
| 7 | **Role-Based Access Control** | Partially Working | Enforce route guards and Firestore rules so Citizens, Businesses, Pros access only their spaces. |
| 8 | **Influencer Category** | Missing | Add `influencer` to [directoryService.ts](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/services/directoryService.ts) and [RegisterProfessionalScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/RegisterProfessionalScreen.tsx). |
| 9 | **Business Category Colors** | Partially Working | Ensure each category's distinct color appears on business cards, listings, and filters. |
| 10 | **Offers & Deals System** | Partially Working | Add expiry date checks (hide expired), status pipeline (`approved`, `rejected`, `expired`). |
| 11 | **Push Notifications for Offers & Deals** | Pending | Trigger notification when deal is approved; handle deep link to deal details. |
| 12 | **Complete Push Notification System** | Pending | Support announcements, events, news, and deals notifications with deep links. |
| 13 | **Home Screen Notification Issue** | Investigating | Remove accidental/test notifications from Firestore collections. |
| 14 | **News Feature** | Missing | Add `NewsScreen.tsx`, Firestore `news` collection, Admin creation, and third-party disclaimers. |
| 15 | **Events System** | Partially Working | Connect to Firestore `events`, add Admin event creation & citizen event view. |
| 16 | **Content Moderation** | Partially Working | Ensure Admin can delete/hide listings, offers, deals, news, and events. |
| 17 | **Featured in Kurnool** | Partially Working | Admin toggle to feature specific businesses, pros, and deals. |
| 18 | **Homepage Registration Message** | Needs Update | Remove misleading "for free" wording on [HomeScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/HomeScreen.tsx#L351). |
| 19 | **Disclaimers** | Partially Working | Add disclaimers for third-party business listings, events, and offers. |
| 20 | **Advertisement Integration** | Partially Working | Banner ads implemented; add App Open & Interstitial test units without UX obstruction. |
| 21 | **Database & Backend Consistency** | Partially Working | Update [firestore.rules](file:///f:/Kurnool%20One/Kurnool%20One/firestore.rules) for new collections (`news`, `admin_access_grants`). |
| 22 | **UI/UX Review** | Partially Working | Standardize card margins, typography, loading indicators, and empty states. |
| 23 | **Single Login User Journey** | Pending Phase 1 | Test new user $\rightarrow$ Google login $\rightarrow$ role resolution $\rightarrow$ correct dashboard. |
| 24 | **Google Authentication Testing** | Partially Working | Test login persistence, token expiration, cancellation, and sign-out. |
| 25 | **Payment Testing** | Working | Test with Razorpay Test Card (`4111 2222 3333 4444`) for success and failure scenarios. |
| 26 | **Admin Security** | Partially Working | Ensure admin routes check `user.role === 'admin' || 'super_admin'` with Firestore rules. |
| 27 | **Google Play Review Readiness** | Ready for Plan | Complete all app checklist items. |
| 28 | **Complete End-to-End Testing** | Pending | Execute full test plan after implementation. |
| 29 | **Final Test Report** | Pending | Generate comprehensive ADB and functional report. |
| 30 | **Final Google Play Checklist** | Pending | Final verification table. |

---

## 3. Payment Testing Strategy (Using Test ATM/Debit Cards)

Since you want to test the **actual payment system for free**, we are using **Razorpay Sandbox / Test Mode**:

### Test Card Credentials
- **Visa Test ATM Card**: `4111 2222 3333 4444`
- **Expiry Date**: Any future date (e.g., `12/28`)
- **CVV**: `123`
- **Cardholder**: `Test User`
- **Test OTP**: `123456`
- **Cost**: **₹0.00 (100% Free)** — No money is debited.
- **Result**: Generates real `razorpay_payment_id`, updates listing to `paymentStatus: 'paid'`, sets tier to `featured`, and grants Business/Professional dashboard access.

### Failure Case Testing (Verification of Requirement 3 & 25)
- **Declined Card**: `4000 0000 0000 0002` (Simulates card decline).
- **Verification**: The app shows a payment failed alert, does **NOT** grant dashboard access, and leaves status as `unpaid`.

---

## 4. Mobile App Step-by-Step Implementation Plan

### Phase 1: Authentication & Single Login Overhaul
1. **Refactor [MobileFirebaseLogin.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/MobileFirebaseLogin.tsx)**:
   - Remove mobile number TextInput, OTP input, countdown timer, and synthetic credentials fallback.
   - Design a clean, branded login screen with official Google logo and **"Continue with Google"**.
   - Add clickable **Terms of Service** and **Privacy Policy** links opening `https://kurnool-kaburlu.web.app/terms` and `/privacy` via `WebBrowser.openBrowserAsync`.
2. **Implement Role-Based Routing Post-Auth**:
   - Check user document in Firestore `users/{uid}`.
   - If role is `business` $\rightarrow$ navigate directly to `ManageBusiness`.
   - If role is `professional` $\rightarrow$ navigate directly to `ManageProfessional`.
   - If role is `user` (citizen) $\rightarrow$ navigate to `Main` (HomeScreen).
   - If user has no record $\rightarrow$ create citizen profile by default.

### Phase 2: Category Upgrades & Visual Enhancements
1. **Add Influencer Category**:
   - Add `{ id: 'influencer', name_en: 'Influencer & Content Creator', name_te: 'ఇన్‌ఫ్లుయెన్సర్లు & కంటెంట్ క్రియేటర్స్', icon: 'videocam', color: '#E11D48', bgLight: '#FFE4E6' }` to [directoryService.ts](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/services/directoryService.ts).
   - Ensure it appears in [RegisterProfessionalScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/RegisterProfessionalScreen.tsx) and [DirectoryScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/DirectoryScreen.tsx).
2. **Apply Business Category Colors**:
   - Use each category's dedicated `color` and `bgLight` on business cards, category badges, and directory filter chips instead of generic blue.
3. **Fix Homepage Copy**:
   - Update line 351 in [HomeScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/HomeScreen.tsx) to remove "for free".

### Phase 3: News, Events & Offers Features
1. **Build News Feature**:
   - Create [NewsScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/NewsScreen.tsx) with title, content, image, date, category, and source disclaimer.
   - Add News item cards to Home Screen or dedicated Tab/Stack.
2. **Enhance Offers & Events in [OffersScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/OffersScreen.tsx)**:
   - Filter out expired deals automatically (`validUntil < today`).
   - Add third-party platform disclaimers on deal and event detail cards.
   - Add deep-linking listener to open deals directly from notifications.

### Phase 4: Admin Controls & Manual Access Granting
1. **Extend [AdminDashboardScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/AdminDashboardScreen.tsx)**:
   - **Offers & Deals Moderation**: Approve, reject, delete, or hide offers.
   - **Manual Access Grant**: Select any user $\rightarrow$ Grant Business or Professional access without payment $\rightarrow$ Record log in Firestore `admin_access_grants` (User UID, role granted, admin UID, timestamp, expiry).
   - **News & Events Management**: Create, edit, and delete news articles and city events.
   - **Featured in Kurnool**: Toggle `isFeatured` badge on businesses and pros.
2. **Backend Security Rules**:
   - Update [firestore.rules](file:///f:/Kurnool%20One/Kurnool%20One/firestore.rules) to protect `admin_access_grants`, `news`, and moderation operations strictly for `admin` and `super_admin`.

### Phase 5: Push Notifications & AdMob Feasibility
1. **Notification System**:
   - Clean up accidental development notifications from Firestore.
   - Implement notification trigger function when an Offer, Event, or News article is published.
   - Configure deep link routing in [NotificationScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/NotificationScreen.tsx).
2. **AdMob Integration**:
   - Ensure banner ads use test IDs in development.
   - Verify App Open and Interstitial ads comply with Google Play policies (never display during login or before key actions).

### Phase 6: ADB Testing & Verification
1. **Connect Android Device / Start Emulator**:
   - Verify connection via `adb devices`.
2. **Build and Install Standalone APK**:
   - Compile via `./build-android.ps1` and install via `adb install -r Kurnool-One.apk`.
3. **Execute Comprehensive Test Suite**:
   - Single Google login $\rightarrow$ citizen flow.
   - Business registration with Test ATM card $\rightarrow$ dashboard verification.
   - Professional registration (Influencer) with Test ATM card $\rightarrow$ pro dashboard.
   - Admin login $\rightarrow$ manual access grant $\rightarrow$ moderation tests.
   - Capture `adb logcat` and screenshot reports.
4. **Compile Final Test Report & Google Play Checklist**.

---

## 5. Required Actions & Credentials

### Your Actions Required:
1. **Google Sign-In SHA-1**: Ensure the SHA-1 fingerprint of `android/app/debug.keystore` and `android/app/release.keystore` is added in Firebase Console $\rightarrow$ Project Settings $\rightarrow$ Your Android App $\rightarrow$ SHA certificate fingerprints.
2. **Google Play Console Reviewer Note**: Provide the test credentials and Test ATM Card info in the review access section of Google Play Console.
3. **Android Device Connection**: Connect an Android device with USB debugging enabled or launch an emulator so we can execute ADB testing.
