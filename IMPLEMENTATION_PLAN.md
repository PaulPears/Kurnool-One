# Kurnool One Mobile App – Master Implementation Plan

> **Scope:** Strictly restricted to the **Android Mobile App (`frontend/`)** and Firebase backend.  
> **Updated:** October 12, 2026  
> **Status:** Review & Implementation Ready

---

## 1. Key Reviews, Architecture Decisions & Policy Answers

### 1.1 Emergency & Civic Helplines (Removed)
* **Decision:** Emergency & Civic Helplines (Police 100, Ambulance 108, Fire 101, KMC Helpline) are **completely removed** from this implementation plan and will not be included in the mobile app.

### 1.2 News & Marketplace Sharing with App Link
* **Requirement:** Whenever any News article or Marketplace item is shared, the shared text message must end with the official Kurnool One App Play Store download link.
* **Format:**
  ```text
  [Title / Content]

  👉 Download Kurnool One App to explore more local updates & deals:
  https://play.google.com/store/apps/details?id=com.kurnoolone.app
  ```

### 1.3 Why "SPONSORED" Appears on the Home Page
* **Reason:** In `HomeScreen.tsx`, right above the Google AdMob banner ad slot, there is an explicit badge: `<Text style={styles.adLabel}>SPONSORED</Text>`.
* **AdMob Policy Context:** Google AdMob requires apps to clearly label advertisement units so users are not misled into thinking an ad is organic app content.
* **Optimization:** We will refine this to look subtle and sleek (a small gray `Ad` tag inside the ad frame) and ensure it only occupies space when an ad is actively loaded, avoiding awkward blank space when offline or during test mode.

### 1.4 Home Page "Register" Banner Fix (Shop vs. Service Choice)
* **Current Issue:** The banner title asks *"Own a Shop or Service in Kurnool?"*, but clicking "Register Now" directly routes to `RegisterBusinessScreen` (retail shop plans), confusing service professionals (electricians, plumbers, photographers, tutors, maids, etc.).
* **Solution:** Replace the single hardcoded redirect with:
  * A dual-choice Bottom Sheet / Modal or two clear side-by-side action buttons:
    1. 🏪 **Register Shop / Business** $\rightarrow$ `RegisterBusinessScreen`
    2. 🛠️ **Register Service / Pro** $\rightarrow$ `RegisterProfessionalScreen`

### 1.5 Marketplace: Full Image Viewer, Multi-Image Support & Sharing
* **Click-to-Open Image:** Currently, thumbnail images are non-interactive. We will add an interactive **Full-Screen Image Modal** with pinch-to-zoom / close button, supporting swiping if an item has multiple images.
* **Share Button:** Each marketplace item will have a dedicated **Share** button alongside Call and WhatsApp with item title, price, area, and the Google Play download link.

---

### 1.6 Policy Analysis: Adding an Ad When User Adds More Than One Image

> **Question:** *"If user wants to add more than one image, can we add an Interstitial ad first? Is it allowed according to Google AdMob policies and rules?"*

#### ⚠️ Direct Answer: Interstitial vs. Rewarded Ad Policy
* **FORCED INTERSTITIAL = VIOLATION ❌**  
  Under Google Play's **Better Ads Standards** and Google AdMob's **Unexpected Interstitial Ads Policy**, you **CANNOT** fire an unprompted, sudden interstitial ad when a user taps a functional button (like "Add Photo" or in the middle of a form). Google considers this *"unexpected interstitial before key user action"* and will flag/suspend the ad unit or reject app updates.
* **REWARDED VIDEO AD = 100% POLICY COMPLIANT & HIGH EARNINGS ✅**  
  Google AdMob explicitly allows and encourages gating optional extra features behind **Rewarded Ads**:
  1. **User Choice Prompt:** When the user taps *"Add 2nd Photo"*, show a polite prompt:  
     > *"1st photo is 100% Free! Want to add a 2nd photo? Watch a short 15–30s sponsor video to unlock Photo #2."*  
     > Buttons: `[Watch Video to Unlock]` or `[Keep 1 Photo]`.
  2. **Opt-in Execution:** The user voluntarily chooses to watch the ad (`RewardedAd`).
  3. **Reward Granted:** Upon completion (`onUserEarnedReward`), the second image upload slot immediately unlocks!
  4. **Why this is superior:**
     - 100% compliant with Google Play & AdMob policies.
     - Rewarded Video ads pay **3x to 5x higher eCPM** than plain interstitials.
     - Zero user frustration because it is completely voluntary and transparent.
* **NATURAL BREAK INTERSTITIAL = ALSO COMPLIANT ✅**  
  If you also want to use a standard Interstitial ad, Google policy permits showing it at a **natural transition point**:  
  - E.g., **After** the user successfully clicks *"Submit / Post Listing"* and sees the *"Listing Published Successfully!"* confirmation screen, an interstitial ad can be displayed before taking them back to the marketplace feed.

---

### 1.7 Google AdMob: Exact List of Ad Unit IDs to Create
To monetize the app in full compliance with Google policies, create these Ad Units in your **Google AdMob Console** (`https://admob.google.com`):

| # | Ad Unit Name in AdMob | Ad Format | Where it is Used in App | Priority |
|---|---|---|---|:---:|
| **1** | `KurnoolOne_Home_Banner` | **Banner** (Adaptive 320x50) | Bottom of Home Screen | **Must Have** |
| **2** | `KurnoolOne_Directory_Banner` | **Banner** (Adaptive 320x50) | In Directory & Category listings | **Must Have** |
| **3** | `KurnoolOne_Offers_Banner` | **Banner** (Adaptive 320x50) | Inside Deals & Marketplace feed | **Must Have** |
| **4** | `KurnoolOne_Submit_Interstitial` | **Interstitial** (Full Screen) | Shown at natural break points (e.g., after posting an item or initiating a call) | **Recommended** |
| **5** | `KurnoolOne_Rewarded_MultiImage` | **Rewarded Video** (15-30s) | Unlocks **Photo #2** when posting a deal/marketplace item | **High Value** |
| **6** | `KurnoolOne_Rewarded_PushNotification` | **Rewarded Video** (15-30s) | Unlocks **+1 Extra Push Notification** when daily quota is reached | **High Value** |
| **7** | `KurnoolOne_App_Open` *(Optional)* | **App Open** | Displayed upon cold app launch | Optional |

> **AdMob ID Formats:**  
> - **App ID** (Format: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY` with `~`) $\rightarrow$ placed in `app.json`.  
> - **Ad Unit IDs** (Format: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY` with `/`) $\rightarrow$ placed in `src/config/ads.ts`.

---

### 1.8 Hot Deals & Offers Images: Database Size & Pro/Business Access

#### Will adding images make the database heavier or slow down?
* **NO! The Firestore database will NOT become heavy or bloated.**
* **Architecture:**
  1. **Cloud Firestore** is a NoSQL text database. It only stores text fields and a download URL string (`https://firebasestorage.googleapis.com/...`), which takes less than **100 bytes** per document. 10,000 deals in Firestore consume less than **5 MB**.
  2. **Firebase Cloud Storage:** Actual image binaries are stored in Google Cloud Storage.
  3. **Local Compression:** The app compresses photos before upload (max 1080px width, 75% quality), shrinking 5MB camera photos to **~150 KB – 200 KB**.
  4. **Free Quotas:** Firebase Storage gives **5 GB storage free** (over **25,000+ compressed deal photos**) and **1 GB/day bandwidth**.

#### Should we give Businesses & Professionals access to add up to 2 images?
* **YES, 100% recommended!**
* Visual deals with 1 or 2 photos receive **5x higher engagement and customer inquiries** than text-only offers.
* Both registered **Businesses** and **Service Professionals** will have a dedicated **"🔥 Post Hot Deal / Offer"** module in their dashboards (`ManageBusinessScreen` & `ManageProfessionalScreen`):
  - Offer Title & Description (English & Telugu)
  - Discount Tag (e.g., "Flat 25% Off", "Buy 1 Get 1", "Free Checkup")
  - Valid Until Date Picker
  - **Upload 1 Photo for Free** (Photo #2 unlocked via Rewarded Ad or automatically included for paid business tiers)
  - Instant live posting into the **Hot Deals** section of `OffersScreen`.

---

### 1.9 Comprehensive Navigation Audit & Fixes

Our audit revealed specific navigation bugs and inconsistencies that will be fixed:

1. **`AdminDashboardScreen.tsx` Broken Screen Reference:**
   - Line 143 attempts `navigation.navigate('CreatePost', ...)` which does not exist in `AppNavigator.tsx`. Tapping crashes the screen.
   - **Fix:** Replace with an integrated announcement trigger or modal flow.
2. **`NotificationScreen.tsx` Param Mismatch for Professionals:**
   - Line 43 navigates to `ProfessionalDetail` with `{ proId: item.proId }`, but `ProfessionalDetailScreen.tsx` expects `{ pro: ProfessionalItem }`. This causes a runtime crash or blank screen.
   - **Fix:** Update `ProfessionalDetailScreen.tsx` to accept either `pro` object or `proId` (and automatically fetch the pro document if only `proId` is provided).
3. **`DirectoryScreen.tsx` Stale Category Selection:**
   - Navigating from Home categories passes `initialCategory`. If the user returns to Home and taps another category, `selectedCategory` does not update because `useEffect` only listened to `initialTab`.
   - **Fix:** Add a reactive `useEffect` watching `route.params?.initialCategory`.
4. **`HomeScreen.tsx` Registration Button Misdirection:**
   - Clicking "Register" assumes only business shops and skips service professionals.
   - **Fix:** Add a selection modal / two distinct buttons for Shop vs Professional registration.
5. **Standard Header Back Buttons:**
   - Ensure every secondary screen has a consistent, visible top-left back arrow (`navigation.goBack()`).

---

## 2. Step-by-Step Implementation Phases

### Phase 1: Core Navigation & Parameter Fixes
- [ ] Fix `ProfessionalDetailScreen.tsx` to handle `{ proId }` lookup from Firestore when `pro` object is not passed.
- [ ] Fix `AdminDashboardScreen.tsx` broken `CreatePost` navigation call.
- [ ] Add `useEffect` in `DirectoryScreen.tsx` for dynamic updates when `route.params?.initialCategory` changes.
- [ ] Verify clean back-stack navigation on all 19 screens.

### Phase 2: Home Screen Registration Chooser & Sponsor Badge Polish
- [ ] Remove hardcoded `RegisterBusiness` direct jump from `HomeScreen.tsx` registration banner.
- [ ] Add dual-choice selector:
  - 🏪 **Register Shop / Business** $\rightarrow$ `RegisterBusinessScreen`
  - 🛠️ **Register Service Professional** $\rightarrow$ `RegisterProfessionalScreen`
- [ ] Polish the Ad banner slot on `HomeScreen.tsx`: subtle modern badge, avoiding jarring empty "SPONSORED" placeholder when ads are loading.

### Phase 3: News & Marketplace Sharing with App Download Link
- [ ] Update `NewsScreen.tsx` (both card share button and full article modal share button) to append the Google Play Store link.
- [ ] Add a dedicated Share button to `OffersScreen.tsx` for Marketplace items including item name, price, location, and the Google Play app link.

### Phase 4: Marketplace Full Image Viewer & Multi-Image Carousel
- [ ] Make all marketplace thumbnail images clickable in `OffersScreen.tsx`.
- [ ] Create a high-resolution, full-screen Image Viewer Modal with pinch-to-zoom and clean close button.
- [ ] Add support for multiple image previews (swipeable carousel / thumbnail selector).

### Phase 5: Hot Deals & Offers Multi-Image Engine + Rewarded Ad Unlock
- [ ] Extend `OfferItem` interface in `directoryService.ts` to support `images: string[]` (up to 2 image URLs).
- [ ] In `OffersScreen.tsx`, render Hot Deal images (interactive card banner / side-by-side images with tap-to-expand modal).
- [ ] In `ManageBusinessScreen.tsx` and `ManageProfessionalScreen.tsx`, add **"🔥 Post Hot Deal / Offer"** form:
  - 1st photo upload included for free.
  - Option to unlock 2nd photo upload via watching a Rewarded Ad (or unlocked automatically for paid tiers).
  - Compressed upload to Firebase Cloud Storage.
- [ ] At the end of deal/item submission, show an optional natural-break interstitial ad before redirecting.

### Phase 6: AdMob Ad Unit Integration
- [ ] Prepare AdMob configuration file `frontend/src/config/ads.ts` with placeholder IDs for:
  - Banner Ads (Home, Directory, Offers)
  - Interstitial Ads (Call / Post success)
  - Rewarded Video Ads (Photo #2 unlock & +1 push notification)
- [ ] Ensure app switches seamlessly between Google Test IDs (during development) and Live AdMob IDs (for production store release).

### Phase 7: Verification & Build Generation
- [ ] Conduct end-to-end device testing via ADB on physical Android device / emulator.
- [ ] Test all updated navigation flows, news/marketplace sharing, deal image uploads, and full-screen viewers.
- [ ] Compile fresh production `Kurnool-One.apk` and `Kurnool-One.aab`.
