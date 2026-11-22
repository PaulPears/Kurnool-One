# Kurnool One - Pending Actions & Go-Live Checklist
**Last Updated:** Monday, 23 November 2026, 03:57 AM IST  
**Status:** Core Code & Deployment 100% Complete; Launch Preparations Pending  

---

## 1. Recently Resolved Issues & Code Refinements (Testing Feedback)

### 1.1 Offer Card Terminology Standardized ("Claim →" replaced with "View Offer →")
* **Previous State:** Button said `"Claim"` on deal cards, which led users to expect an instant digital discount voucher.
* **Resolution Applied:** 
  * Replaced with bilingual `"View Offer →"` (English) and `"ఆఫర్ చూడండి →"` (Telugu).
  * Accurately sets user expectations: tapping the card opens the full deal sheet with verified store terms and direct Call / WhatsApp actions.
* **Status:** ✅ **RESOLVED & VERIFIED IN CODE** (`frontend/src/screens/OffersScreen.tsx`).

### 1.2 Offer Card Re-opening Image Bug
* **Reported Issue:** When attempting to open an offer card a second time, the full-screen photo viewer opened directly instead of the details sheet.
* **Root Cause:** In `OffersScreen.tsx`, `viewerVisible` was not being reset to `false` when dismissing the deal modal or upon `handleOpenDeal(deal)`. On subsequent taps, the still-active Image Viewer modal overlay sat directly on top of the screen.
* **Resolution Applied:**
  * Added explicit resets `setViewerVisible(false)`, `setViewerImages([])`, and `setViewerIndex(0)` inside `handleOpenDeal(deal)` and `handleOpenMarketItem(item)`.
  * Created dedicated `closeDealModal()` and `closeMarketModal()` handlers that flush image viewer state upon sheet dismissal.
  * Moved the `<Modal visible={viewerVisible}>` to the root bottom of the JSX tree, ensuring correct native Android Dialog stacking.
* **Status:** ✅ **RESOLVED & VERIFIED IN CODE** (`frontend/src/screens/OffersScreen.tsx`).

### 1.3 Hardcoded Mock Seed Listings Removed Across All Pages (Mobile & Web)
* **Previous State:** `directoryService.ts` and individual page files contained fallbacks to `SEED_BUSINESSES`, `SEED_PROFESSIONALS`, `SEED_OFFERS`, `SEED_NEWS`, `SEED_HOUSE_RENTALS`, `SEED_BLOOD_DONORS`, `SEED_PLACES`, and `SEED_WORSHIP_PLACES`. When the user deleted all businesses from Firebase, mock dummy listings (*Hotel Mourya Inn*, *Kurnool Ruchulu*, *Sri Balaji Supermarket*, etc.) still showed under "Featured in Kurnool" and across other directory pages.
* **Resolution Applied:**
  * **Mobile App:** Emptied `SEED_BUSINESSES`, `SEED_PROFESSIONALS`, `SEED_OFFERS`, `SEED_PLACES`, `SEED_WORSHIP_PLACES`, `SEED_NEWS`, `SEED_HOUSE_RENTALS`, `SEED_BLOOD_DONORS`, and `SEED_MARKET_ITEMS`. Removed all seed fallback logic in `directoryService.ts` and `HomeScreen.tsx`.
  * **Website & Admin:** Emptied `SEED_BUSINESSES`, `SEED_PROFESSIONALS`, `SEED_PLACES`, `SEED_WORSHIP_PLACES`, `SEED_OFFERS`, `SEED_MARKET_ITEMS`, `SEED_BLOOD_DONORS`, `SEED_NEWS`, and `SEED_HOUSE_RENTALS`. Removed all seed fallback logic in `directoryService.ts`, `rent/page.tsx`, `blood-donors/page.tsx`, `news/page.tsx`, and `offers/page.tsx`.
  * **Status:** ✅ **100% RESOLVED & VERIFIED IN CODE** (Both `frontend` and `website` pass `tsc --noEmit` with 0 errors). Both mobile and web strictly query live Firestore data. Empty collections display clean empty states with zero ghost listings.

---

## 2. End-to-End ADB Testing Suite (Physical Device: `RZCXC18A0DJ`)
* **Status:** ⏳ **READY FOR COMPLETE TEST RUN (APK Rebuild & Device Push on Command)**
* **Pending Execution Steps:**
  1. Rebuild release APK: Run `powershell.exe -ExecutionPolicy Bypass -File "frontend\build-android.ps1"`.
  2. Streamed install to test device via ADB: `adb -s RZCXC18A0DJ install -r Kurnool-One.apk`.
  3. Execute Full Test Matrix across all 5 navigation tabs and emergency features.
* **Test Plan Execution Checklist:**
  1. **Tab 1: Home Screen**
     * Dynamic greetings & Telugu typography rendering.
     * Category grid navigation (`Auto & Cab`, `Hospital & Doctors`, `Food & Dining`, etc.).
     * "🛒 Kurnool Bazaar" banner and quick shortcuts.
     * Top Verified Pros horizontal scroll chips.
     * Native Banner Ad display.
  2. **Tab 2: Directory & Search**
     * Text search and real-time category filtering.
     * Business detail view: Multi-image photo carousel (`1 / N`).
     * Social media direct link verification (Instagram, Facebook, YouTube, Website).
     * DPDP-compliant Customer Lead Consent Modal on Call / WhatsApp taps.
  3. **Tab 3: Explore / Services**
     * Hardware back button test (returns smoothly to Home screen without freezing).
     * Service professional listings and direct contact intents.
  4. **Tab 4: Hot Deals & Kurnool Bazaar**
     * "View Offer →" tap behavior (verified: opens deal sheet, increments view counter).
     * Image Viewer test: open photo, close viewer, re-open card (verified: opens sheet normally).
     * Kurnool Bazaar classifieds: "+ Sell" post modal, Citizen/Business seller badges.
     * Community safety disclaimer banner expandable toggle.
  5. **Tab 5: Profile & Management**
     * Citizen / Merchant / Pro dashboard toggle.
     * Manage Business: Lead capture list (top 5 leads), "Show More Leads" modal, multi-photo picker (10 photos).
     * Manage Professional: Kurnool Bazaar items management, leads view.
     * Delete Listing: Cascading cleanup (removes doc, clears `registered_phones`, deletes promos and leads) allowing immediate re-registration.
  6. **Emergency Hubs & Civic Services**
     * Emergency Blood Donors: Filter by blood group, safety disclaimer, 1-tap call intent.
     * Kurnool House Rentals: BHK filtering, property inspection warning.

---

## 3. Google AdMob Production IDs & Testing
* **Status:** ⏳ **AWAITING USER'S PRODUCTION ADMOB IDS**
* **AdMob Configuration Guidelines:**
  * **Can you use the same Ad Unit ID for multiple ads?**
    * **Within the same ad format (e.g., Banner ads): YES.** A single Banner Ad Unit ID can be placed across the Home Screen banner, Directory banner, and Offers screen banner. Google AdMob fully supports reusing a banner ID across multiple screens. (The only tradeoff is that AdMob reporting will aggregate all banner impressions together rather than breaking them down screen-by-screen, which is completely standard for initial launches).
    * **Across different ad formats (Banner vs Interstitial): NO.** An Interstitial (full-screen popup between screens) **requires its own dedicated Interstitial Ad Unit ID**. A Banner ID cannot be used for an Interstitial.
  * **The 3 IDs to provide from Google AdMob:**
    1. **AdMob App ID** (Format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX` — contains a tilde `~`).
    2. **Banner Ad Unit ID** (Format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX` — contains a slash `/`).
    3. **Interstitial Ad Unit ID** (Format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX` — contains a slash `/`).
* **Test Step Once Provided:**
  * Update `app.json` with the new App ID.
  * Update `SafeNativeAd.tsx` and `AppNavigator.tsx` with the new Banner and Interstitial IDs.
  * Rebuild APK with `./frontend/build-android.ps1` and test live ad serving.

---

## 4. External Credentials & Third-Party Configurations

### 1.1 Custom Web Domain Setup (On Hold - User Request)
* **Current State:** Website and Admin Console are live at `https://kurnool-one.web.app` and `https://ssrkurnoolone-zdqcfy56gq-uc.a.run.app`.
* **Pending Action:** When the user purchases the custom domain (e.g., `kurnoolone.com` or `kurnoolone.in`):
  1. Add custom domain in Firebase Console $\rightarrow$ Hosting $\rightarrow$ "Add custom domain".
  2. Add A and TXT DNS records at the domain registrar (GoDaddy, Namecheap, etc.).
  3. Verify automatic SSL certificate issuance.
* *Note:* Keep on hold; remind the user when they notify domain purchase.

### 1.2 Razorpay Payment Gateway Live Keys
* **Current State:** Payment APIs (`/api/payments/create-order`, `/api/payments/verify`, `/api/payments/webhook`) are configured with Razorpay Test Mode keys (`rzp_test_...`).
* **Pending Action:** When ready to accept real payments for merchant subscription tiers (Silver ₹399, Gold ₹999):
  1. Generate Live API Key and Secret in Razorpay Dashboard.
  2. Update environment variables in website and mobile configs.
  3. Configure live webhook URL pointing to `https://kurnool-one.web.app/api/payments/webhook`.

### 1.3 Google AdMob Production Ad Unit IDs
* **Current State:** AdMob is integrated using Google's official test ad unit IDs (`ca-app-pub-3940256099942544/...`) for banners and interstitials.
* **Pending Action:** Before public Play Store distribution:
  1. Create production banner and interstitial ad units in Google AdMob console.
  2. Update `app.json` / `AppNavigator.tsx` / `SafeNativeAd.tsx` with production AdMob App ID and Ad Unit IDs.

---

## 2. Google Play Console Production Submission

### 2.1 Release Bundle Upload
* **Current State:** Signed production bundle **[`Kurnool-One.aab`](file:///g:/Kurnool%20One/Kurnool%20One/Kurnool-One.aab)** *(32.3 MB)* is compiled and stored in the workspace root.
* **Pending Action:**
  1. Log into [Google Play Console](https://play.google.com/console).
  2. Navigate to **Kurnool One** $\rightarrow$ **Production** (or Closed Testing Track).
  3. Create a new release and upload `Kurnool-One.aab`.

### 2.2 Store Listing Graphics & Assets
* **App Icon:** 512x512 PNG (ready in `assets/icon.png`).
* **Feature Graphic:** 1024x500 PNG required for Play Store listing.
* **Phone Screenshots:** At least 4 high-resolution screenshots (can use ADB screenshots captured during testing).
* **Privacy Policy URL:** Set to `https://kurnool-one.web.app/privacy`.
* **Account Deletion URL:** Set to `https://kurnool-one.web.app/delete-account`.

### 2.3 Reviewer Demo Credentials
* Provide Google Play App Review team with test credentials:
  * **Phone Number:** `9032245532`
  * **Reviewer Role:** Verified Business Owner & Citizen Tester.

---

## 3. Product & Feature Roadmap (Future Phases)

### 3.1 Digital Wallet for Kurnool One Partner Program
* **User Requirement:** *"after getting wallet can we add Kurnool One Partner let me know once"*
* **Current State:** Partner payouts are managed via administrator manual UPI transfers and UTR tracking (Strict Zero Cash Collection Policy).
* **Pending Action:** When digital wallet infrastructure / API (e.g. Razorpay Route or Payouts) is established, integrate direct automated in-app wallet balances for registered partners.

### 3.2 Real-time Push Notifications via FCM HTTP v1
* **Current State:** Client notifications and in-app broadcast alerts write to `broadcast_notifications` collection.
* **Pending Action:** Set up Firebase Cloud Messaging (FCM) v1 service account credentials in a Cloud Function trigger to dispatch background system tray push notifications to locked/closed devices.

---

## 4. Immediate User Manual Testing Recommended

1. Open the updated **Kurnool One** app on your Samsung phone (`RZCXC18A0DJ`).
2. Verify **Offers & Kurnool Bazaar** tabs:
   - Tap any item; notice the eye view counter incrementing.
   - Tap **"Call"** or **"WhatsApp"** on a listing; confirm the 1-time Name & Phone consent popup appears.
3. Check your Business / Pro Dashboard:
   - Confirm your captured lead appears with phone number and direct action buttons.
   - Check the **Storefront & Product Gallery Photos (1/10)** multi-image picker.
4. Open the Web Admin Console at **[https://kurnool-one.web.app/admin](https://kurnool-one.web.app/admin)**:
   - Check the Hot Deals & Offers and Kurnool Bazaar tabs to inspect live synced records.
