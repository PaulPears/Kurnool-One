# Kurnool One - Resolved UI Issues, Navigation & Merchant Portal Guide
**Date:** October 30, 2026  
**Status:** All UI Fixes Implemented & Verified (0 TypeScript Errors)  
**Target Build:** Android Standalone APK & Web Portal (`com.kurnoolone` / `kurnool-one.web.app`)

---

## 1. Summary of UI Issues Resolved in This Update

| Issue Area | Problem Identified | Fix Implemented |
|:---|:---|:---|
| **White Screen on Launch** | App showed a blank white screen for 3.2s on startup while loading assets/AdMob and fading from 0 opacity. | 1) Initialized `fadeAnim` at 0.4 opacity with snappy 300ms entrance.<br>2) Reduced splash screen delay from 3,200ms to 1,300ms.<br>3) Deferred Google AdMob SDK initialization by 1,000ms so it does not block the main UI thread during cold start. |
| **Duplicated Plan Cards in Business Listing** | Form had two separate plan selection components (one 3-card selector at top and another card selector at bottom), confusing users and wasting screen height. | Removed redundant top plan selector while preserving the official benefits list, keeping a single, unified plan selector right above the payment button. |
| **Duplicated Plan Cards in Pro Listing** | Personal profile registration had duplicate plan selectors at both top and bottom. | Streamlined to a single, unified plan selector above checkout with official benefits overview. |
| **Android Status Bar & Notch Overlap** | Core React Native `<SafeAreaView>` only works on iOS, causing headers on Android (Samsung punch-hole camera) to overlap status bar icons. | Upgraded all screens (`RegisterBusinessScreen`, `RegisterProfessionalScreen`, `HouseRentScreen`, `BloodDonorsScreen`) to use `SafeAreaView` from `react-native-safe-area-context`. |
| **Soft Keyboard Overlapping Input Fields** | On modern Android devices, the Samsung virtual keyboard opened over bottom inputs (Address, Description, Social Links). | Wrapped forms in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>` with dynamic scroll padding. |
| **Bottom Navigation Bar Overlap** | Sticky payment and submit buttons sat too close to Android navigation bars / gesture handles. | Increased bottom scroll padding to `130px` across all form screens. |
| **Unbounded Input Lengths (No Limits)** | Text inputs lacked `maxLength`, allowing potential memory abuse, layout breakage, and oversized Firestore payloads. | Added strict `maxLength` constraints and live character counters across all forms. |

---

## 2. Character Limits Configured Across All Forms

| Form Screen | Field Name | Max Length (`maxLength`) | Input Type / Notes |
|:---|:---|:---|:---|
| **Business Registration** | Business Name (English) | `80` chars | Single line text |
| | Business Name (Telugu) | `80` chars | Single line text |
| | Custom Category | `50` chars | Shown when "Other" is selected |
| | Phone Number | `10` digits | Numeric (`phone-pad`) |
| | WhatsApp Number | `10` digits | Numeric (`phone-pad`) |
| | Full Address | `150` chars | Street / Area |
| | Landmark | `80` chars | Prominent location |
| | Website URL | `100` chars | Web link (`url`) |
| | Google Maps Link | `250` chars | Google Maps share URL |
| | Social Links (IG, FB, X, YT, LI) | `100` chars each | Profile URLs |
| | Business Description | `500` chars | Multiline with live counter (`X/500`) |
| **Professional Registration** | Full Name / Creator Handle | `60` chars | Single line text |
| | Custom Category / Specialty | `50` chars | For unlisted professions |
| | Experience | `2` digits | Numeric (0–99 years) |
| | Service Areas | `150` chars | Localities in Kurnool |
| | Visiting / Starting Fee | `40` chars | Upfront rate |
| | Package / Hourly Rate | `40` chars | Service rate |
| | Phone & WhatsApp | `10` digits each | Numeric (`phone-pad`) |
| | Portfolio / Profile Photo URL | `250` chars | Image URL |
| | Social & Channel URLs | `100` chars each | Work profiles |
| | About Skills & Work | `500` chars | Multiline with live counter (`X/500`) |
| **House Rentals (To-Let)** | Listing Title | `80` chars | e.g., "2 BHK East Facing Flat" |
| | Monthly Rent | `8` digits | Numeric (up to ₹99,99,999) |
| | Security Deposit | `8` digits | Numeric |
| | Locality / Area | `60` chars | Kurnool colony |
| | Address / Landmark | `150` chars | Detailed address |
| | Phone & WhatsApp | `10` digits each | Contact numbers |
| | Water & Parking | `50` chars each | Amenities |
| | Description & Rules | `500` chars | Multiline with live counter (`X/500`) |
| **Blood Donors** | Full Name | `60` chars | Single line |
| | Phone Number | `10` digits | Emergency phone |
| | Locality / Area | `60` chars | Area in Kurnool |
| | Notes / Availability | `150` chars | Multiline with live counter (`X/150`) |

---

## 3. How Businesses & Professionals Manage Their Listings

### Where Can They Access Their Dashboard?
Merchants and skilled professionals have dedicated dashboards built into the app:
1. **From the Bottom Navigation Bar:**  
   Tap the **Profile** tab (the 5th icon on the bottom).
2. **Under "Manage Listings & Growth":**  
   - **For Businesses:** Tap **"My Business Listings & Leads"** $\rightarrow$ opens `ManageBusinessScreen`.
   - **For Professionals:** Tap **"My Professional Services & Clients"** $\rightarrow$ opens `ManageProfessionalScreen`.
3. **Direct Navigation on Registration:**  
   Immediately upon completing registration, the app navigates the user straight into their dashboard.

---

### Features Available to Business Owners (`ManageBusinessScreen`)
1. **Store Profile & Operating Hours Editing:**
   - Update contact phone, WhatsApp number, store address, landmark, website, and Google Maps direction link.
   - Adjust daily store opening and closing hours.
2. **Branding & Visuals Management:**
   - Upload or replace the 1:1 square Business Logo (`uploadBusinessLogo`).
   - Upload or replace the 16:9 Storefront Banner/Cover photo (`uploadBusinessCover`).
3. **Social Media Showcase:**
   - Update Instagram, Facebook, YouTube, Twitter/X, and LinkedIn handles.
4. **Live Customer Lead Tracker:**
   - Real-time list of citizen interactions: incoming phone call clicks, WhatsApp chat inquiries, and profile views.
5. **City-Wide Deals & Offers Publisher:**
   - Post flash discounts (e.g., "FLAT 20% OFF", "Diwali Special") with custom offer images and validity dates.
   - Deals appear instantly on the city-wide **Offers** tab.
6. **Multi-Shop Management:**
   - If an owner manages more than one shop in Kurnool, an in-dashboard store switcher allows toggling between stores.
7. **Listing Status & Subscription Renewal:**
   - View active plan (Monthly / 6 Months / Yearly), expiration date, and one-tap Razorpay renewal button.
8. **Live Preview:**
   - Dedicated "View Listing" button to see exactly how citizens view their storefront.

---

### Features Available to Skilled Professionals (`ManageProfessionalScreen`)
1. **Skills & Rate Card Management:**
   - Update profession category, years of experience, and covered localities in Kurnool.
   - Set upfront visiting charges (e.g. ₹150) and package/hourly rates (e.g. ₹250/hr).
2. **Work Portfolio & Photos:**
   - Upload profile avatar and work sample photos.
3. **Daily Availability & Working Hours:**
   - Set working hours and availability status.
4. **Lead & Inquiry Tracking:**
   - View customer calls and quotes received from citizens.
5. **Verified Technician Badge:**
   - Active status showing the blue shield badge.
6. **Direct Profile Preview:**
   - Preview technician card in the directory.

---

## 4. Navigation Architecture Audit (All 20 Pages Verified)

All screens are registered in `AppNavigator.tsx` and cross-verified:
1. `Splash` $\rightarrow$ Snappy startup, session validation, route resolution.
2. `MobileFirebaseLogin` $\rightarrow$ Phone OTP & Google sign-in.
3. `Main` (Bottom Tabs):
   - `Home` (`HomeScreen`)
   - `Directory` (`DirectoryScreen`)
   - `Explore` (`ExploreScreen`)
   - `Offers` (`OffersScreen`)
   - `Profile` (`ProfileScreen`)
4. `BusinessDetail` $\rightarrow$ Public storefront view with call/WhatsApp buttons.
5. `ProfessionalDetail` $\rightarrow$ Public skilled pro profile view.
6. `RegisterBusiness` $\rightarrow$ Merchant onboarding with Razorpay payment.
7. `RegisterProfessional` $\rightarrow$ Skilled professional onboarding with Razorpay payment.
8. `ManageBusiness` $\rightarrow$ Merchant lead tracker & store editor.
9. `ManageProfessional` $\rightarrow$ Professional client tracker & profile editor.
10. `HouseRent` $\rightarrow$ To-Let listings feed + listing submission modal.
11. `BloodDonors` $\rightarrow$ Blood donors emergency directory + volunteer registration modal.
12. `News` $\rightarrow$ Kurnool local news feed.
13. `Search` $\rightarrow$ Universal search across shops, pros, places, and rentals.
14. `Notifications` $\rightarrow$ Push & in-app alerts.
15. `EditProfile` $\rightarrow$ User account settings.
16. `Settings` $\rightarrow$ Language, theme, and account management.
17. `AdminDashboard` $\rightarrow$ Superadmin moderation.
18. `Terms` $\rightarrow$ Terms of Service.
19. `PrivacyPolicy` $\rightarrow$ DPDP Act 2023 compliance policy.
20. `UserProfile` $\rightarrow$ Public citizen profile view.

---

## 5. Testing Status: Completed vs Pending

### Completed Testing (100% Verified on Physical Device Samsung Galaxy A55 5G):
- [x] Cloud Firestore security rules updated and deployed live (`businesses`, `professionals`, `house_rentals`, `blood_donors`, `registered_phones`).
- [x] Initial live Firestore documents seeded and active in all 4 collections.
- [x] Professional listing end-to-end flow with Razorpay test card & OTP verification.
- [x] Shop listing end-to-end flow with Razorpay test card & OTP verification.
- [x] Fixed Firestore SDK `undefined` field value crash via `sanitizeFirestoreData`.
- [x] Fixed silent error swallowing in registration catch blocks.
- [x] Fixed startup white screen crash (`toFixed` undefined on unrated entries) and deferred AdMob initialization.
- [x] Removed duplicated plan selectors in Business and Professional forms.
- [x] Added `maxLength` and character counters across all 4 listing forms.
- [x] Replaced `SafeAreaView` with `react-native-safe-area-context` across all forms.
- [x] Added `KeyboardAvoidingView` to prevent keyboard from covering form fields.
- [x] Strict TypeScript check: **0 errors** across both mobile and web.
- [x] Standalone APK compiled (`assembleRelease`) and installed on physical Samsung Galaxy A55 5G.
- [x] House Rentals (To-Let) Form Live Device Test: Successfully posted "LuxurysBHKsFlat" in Joharapuram, verified immediate rendering at the top of the feed with Call/WhatsApp/Share/Delete controls, and successfully verified real-time deletion!
- [x] Emergency Blood Donors Live Device Test: Registered donor "M Paul Pears" (B+) in Gayatri Estates with voluntary DPDP Act 2023 consent, verified instantaneous appearance in the community directory, verified active `My Status` state, and verified filtering by `B+` blood group!

### Final Deployment:
1. **Web Hosting Deployment:**  
   Deploy updated `website` to Firebase hosting (`kurnool-one.web.app`) so web users benefit from identical stability and formatting fixes.

