# Kurnool One: Project Status & Roadmap

> **Updated Date:** October 30, 2026  
> **Project Root:** `G:\Kurnool One\Kurnool One`  
> **Live Web App:** [https://kurnool-one.web.app](https://kurnool-one.web.app)  
> **Database:** Cloud Firestore (`kurnool-kaburlu`)  
> **Mobile APK Status:** Built with React Native & Expo EAS / local Gradle signing  

---

## 1. What Has Been Completed & Deployed Live ✅

### 1. Promotional Banners Eradication (Mobile & Web)
* **Mobile App:** Removed `heroBanners` state, Firestore query, carousel JSX, and styling from [`frontend/src/screens/HomeScreen.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/frontend/src/screens/HomeScreen.tsx). Removed `banners` tab from [`frontend/src/screens/AdminDashboardScreen.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/frontend/src/screens/AdminDashboardScreen.tsx) and removed `AdminBanners` route from [`frontend/src/navigation/AppNavigator.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/frontend/src/navigation/AppNavigator.tsx).
* **Web App:** Cleaned [`website/src/app/page.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/app/page.tsx) of duplicate promotion banners; kept clean civic hero search and category tiles.

### 2. Dedicated Professional Profile Pages ([`/professional/[id]`](https://kurnool-one.web.app/directory))
* Created [`website/src/app/professional/[id]/page.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/app/professional/[id]/page.tsx) with JSON-LD schema, visiting fees, service coverage areas, portfolio gallery, ratings, and direct contact CTAs.
* Added `recordCustomerLead` tracking (`call`, `whatsapp`, `view`) in [`website/src/components/ProfessionalActionButtons.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/components/ProfessionalActionButtons.tsx).
* Updated cards in [`website/src/app/directory/page.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/app/directory/page.tsx) to link directly to each specialist's full profile URL.

### 3. Temples & Sacred Shrines on Web Explorer ([`/explore`](https://kurnool-one.web.app/explore))
* Added `fetchWorshipPlaces` and rich bilingual seed data for `SEED_PLACES` and `SEED_WORSHIP_PLACES` (Mahanandi, Ahobilam, Yaganti, Mantralayam, Jagannatha Gattu, Jumma Masjid) in [`website/src/services/directoryService.ts`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/services/directoryService.ts).
* Updated [`website/src/app/explore/page.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/app/explore/page.tsx) with a 2-segment selector (*Historic Landmarks* vs *Temples & Sacred Shrines*) matching mobile `ExploreScreen.tsx`.

### 4. Admin Console Civic Moderation Extensions ([`/admin`](https://kurnool-one.web.app/admin))
* Added 3 dedicated moderation tabs in [`website/src/app/admin/page.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/app/admin/page.tsx):
  1. **Blood Donors Hub (`blood_donors`)**: Availability toggle, search, contact, delete.
  2. **House Rentals (To-Let) (`house_rentals`)**: Vacant/rented status toggle, approval, landlord contact, delete.
  3. **Marketplace Classifieds (`marketplace`)**: Active/suspended toggle, approval, price, delete.

### 5. Homepage Polish & Temples Strip
* In [`website/src/app/page.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/app/page.tsx):
  * Removed duplicate emergency blood and city news banners.
  * Added "Temples, Masjids & Sacred Shrines" card strip (Mahanandi, Ahobilam, Yaganti, Mantralayam).

### 6. Citizen Profile Hub & Notification Bell
* Created [`website/src/app/profile/page.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/app/profile/page.tsx) displaying user identity, verified badges, quick portals to owned shops/pros, and legal deletion links.
* Created [`website/src/components/NotificationBell.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/components/NotificationBell.tsx) with interactive dropdown for city bulletins.
* Embedded `<NotificationBell />` and citizen profile link into desktop and mobile drawer headers in [`website/src/components/Navbar.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/components/Navbar.tsx).

### 7. Interactive Customer Reviews on Business Pages ([`/business/[id]`](https://kurnool-one.web.app/directory))
* Created [`website/src/components/BusinessReviews.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/components/BusinessReviews.tsx) featuring:
  * Customer feedback list with star ratings and timestamps.
  * "Write a Review" modal with 5-star selector and comment input.
  * Integration with Firestore `reviews` sub-collection under businesses, auto-aggregating average rating and review counts.
* Embedded into [`website/src/app/business/[id]/page.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/website/src/app/business/[id]/page.tsx).

---

## 2. Production Build & Deployment Status 🚀

* **Web Application:**
  * Next.js production build passed with 0 TypeScript errors across all 31 routes.
  * Deployed live to Firebase Hosting: **[https://kurnool-one.web.app](https://kurnool-one.web.app)** (Status: HTTP 200 OK).
* **Mobile Application (Option B Local Gradle Build - Completed & Verified):**
  * Fresh standalone release APK built locally with Gradle 8.10.2 & Adoptium OpenJDK 17.
  * Stale drive cache resolved and autolinking path updated.
  * 808 Gradle tasks compiled in release mode with Hermes bytecode bundling.
  * Standalone APK location: **[`G:\Kurnool One\Kurnool One\Kurnool-One.apk`](file:///g:/Kurnool%20One/Kurnool%20One/Kurnool-One.apk)**
  * File Size: **40.08 MB (42,024,256 bytes)**
* **Live Device Testing (Samsung Galaxy A55 5G - `SM_A556E`):**
  * **Phase 0 (Install & Launch):** Streamed install succeeded, React Native Bridgeless mode active with PID 14252.
  * **Phase 1 (Visuals & Banner Purge):** Hero promotional banners 100% removed. Telugu language switch verified.
  * **Phase 2 (Navigation & Sub-Modules):**
    - Search engine tested with query `"Hotel"` -> Hotel Mourya Inn returned.
    - Business detail screen loaded with photos, tags, contact CTAs, and 5-star Customer Review modal.
    - House Rentals (To-Let) loaded listings, filter chips, and full-screen photo lightbox.
    - Emergency Blood Donors Hub verified with blood group filter (`O+`, `A+`, `B+`, `AB+`) and DPDP-compliant donor registration modal.
    - **Shop / Business Registration Form (`RegisterBusinessScreen`):** Plan cards (₹199/mo, ₹999/6mo, ₹2000/yr), English/Telugu business titles, 51-category selector, 24/7 or day-by-day business hours selector, social URLs, logo & 16:9 banner uploaders.
    - **Professional Listing Registration Form (`RegisterProfessionalScreen`):** Plan cards (₹99/mo, ₹500/6mo, ₹900/yr), 29-skill picker, visiting charges, package rate, profile photo, social links, and bio.
    - **Offers & Marketplace (`OffersScreen`):** 3-tab segment (*Hot Deals*, *Marketplace Classifieds*, *City Events*), verified deals and two-wheeler classifieds (`₹38,500 Activa 5G`).
    - **City News & Citizen Journalism (`NewsScreen`):** Local updates, bypass flyover announcement, Konda Reddy Buruju feature, and citizen report submission button.
  * **Phase 3 (Diagnostics & Fixes):**
    - Deployed `firestore.rules` live to Firebase Cloud Firestore to enable public read permissions for news, blood donors, and rentals.
    - Fixed `targetOwnerUid: undefined` serialization crash in `recordCustomerLead` across mobile and web.
    - Confirmed 0 crashes in `logcat -s AndroidRuntime:E`.

---

## 3. How to Install or Test the APK

The freshly generated standalone release APK is ready:
* Direct path: [`G:\Kurnool One\Kurnool One\Kurnool-One.apk`](file:///g:/Kurnool%20One/Kurnool%20One/Kurnool-One.apk)
* To install via ADB:
  ```powershell
  adb install -r "G:\Kurnool One\Kurnool One\Kurnool-One.apk"
  ```
* Or copy `Kurnool-One.apk` to any Android device storage and tap to install directly.
