# Kurnool One — Master Pending Tasks & Upcoming Roadmap

**Document Date:** November 1, 2026  
**Status:** In Progress / Approved Plan  
**Target:** Mobile App (`com.kurnoolone`), Web Admin Console (`website/`), and Backend Firebase

---

## 1. Mobile Application Pending Tasks

### 1.1 Image Upload & Free-Style Cropping
- [ ] Implement reusable image picker helper (`frontend/src/utils/imageUploadHelper.ts`) supporting:
  - 📷 Direct Camera capture
  - 🖼️ Gallery photo selection
  - ✂️ Free-Style Cropping on Android (`allowsEditing: true` with unlocked aspect ratio so users can freely drag and resize corners/edges)
- [ ] Connect Free-Style Cropper across all screens:
  - Business Registration (`logoUri`, `coverUri`)
  - Business Management (`logoUrl`, `coverImageUrl`)
  - Professional Registration & Management (`avatarUrl`)
  - Kurnool Bazaar Classifieds (`postImages`)
  - City News submission (`newsImage`)
  - User Profile Photo (`photoURL`)

### 1.2 Classifieds (Kurnool Bazaar) & Hot Deals Upgrades
- [ ] **Mandatory Description:** Add strict form validation preventing submission if description is empty or under 15 characters, with bilingual alerts (English & Telugu).
- [ ] **2-Column Grid (`numColumns={2}`):** Redesign Hot Deals and Kurnool Bazaar into a 2-column card grid so at least 4 to 6 items fit on screen without excessive scrolling.
- [ ] **Tap-to-Open Full Details Modal:**
  - High-resolution swipeable photo carousel (up to 5 photos).
  - Price, condition, locality, and complete detailed description.
  - Seller verification badge & contact card (Direct Call & WhatsApp Chat).
  - **Native Advanced Ad container** placed inside the full details sheet.
- [ ] **Rewarded Ad Photo Slots:** 1st photo free, watch a rewarded ad to unlock photos 2 to 5 (up to 5 total photos).

### 1.3 Home Screen & Top Header Fixes
- [ ] Remove `"Kurnool City, AP"` subtitle under the "Kurnool One" logo in the header.
- [ ] Move Hamburger Menu (`☰`) to the **top-left** next to the logo, and keep language switcher and profile on the top-right.

### 1.4 Pricing & Plans Alignment with Implementation Plan
- [ ] Update `RegisterBusinessScreen.tsx` and `RegisterProfessionalScreen.tsx`:
  - **Shops:** Free Basic (₹0), Standard Verified (₹399 / 6 Mos), Premium Featured (₹999 / 1 Year).
  - **Pros:** Free Basic (₹0), Standard Verified (₹199 / 6 Mos), Elite Pro (₹499 / 1 Year).

### 1.5 Phone Input Initialization & Reset
- [ ] Reset initial state of `phone` to empty string (`''`) across Business Registration, Pro Registration, and Classifieds.
- [ ] Prevent automatic session pre-fill from locking or overwriting the user's input, and ensure the clear `(✕)` button works reliably.

### 1.6 Business Hours Selector Responsive Fix
- [ ] Redesign [`BusinessHoursSelector.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/frontend/src/components/BusinessHoursSelector.tsx) so day rows, status badges, and time pickers stack cleanly on narrow 360px screens without horizontal overflow.
- [ ] Integrate this exact selector in [`ManageBusinessScreen.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/frontend/src/screens/ManageBusinessScreen.tsx) and [`ManageProfessionalScreen.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/frontend/src/screens/ManageProfessionalScreen.tsx).

### 1.7 Explore Page Top Bar & Sub-Filters
- [ ] Streamline segment bar buttons to clean pills: `[ 🏛️ Heritage ] [ ✨ Worship ] [ 🎪 Events ]` to prevent text wrapping on smaller devices.
- [ ] Under Places of Worship, add sub-filters: `[ All ] [ 🛕 Temples ] [ 🕌 Masjids ] [ ⛪ Churches ]`.
- [ ] Make tourist cards compact and add tap-to-open **Full View Modal** with gallery, timings, entry fee, Google Maps directions, and Native Ad placement.

### 1.8 City News Module Fixes
- [ ] Replace `"Photo URL (Optional)"` text input with direct **Camera & Gallery upload + Free-Style Crop**, saving to Cloud Storage (`/news/{timestamp}.jpg`).
- [ ] Provide localized fallback graphic cards (e.g. *Kurnool Civic Alert*, *Kurnool Weather*, *Traffic Advisory*) if no photo is taken, instead of foreign stock photos.

---

## 2. Web Admin Console Pending Tasks

### 2.1 Partner Payouts Management Tab
- [ ] Add a dedicated **Partners Tab** to `website/src/app/admin/page.tsx`:
  - View all registered partners (Name, Mobile, Locality, UPI ID, Referral Code, Onboarded Count).
  - Track total commissions earned, amount paid, and pending balance.
  - One-tap **"Approve & Mark Paid"** modal where admin records the Bank/UPI UTR reference number and updates the partner's status.

### 2.2 City News Review & Moderation Queue
- [ ] Verify moderation queue in Admin Console to approve, edit, reject, and publish citizen-reported news stories with image preview.

---

## 3. Project Cleanup Tasks

- [ ] Delete orphaned legacy file [`frontend/src/screens/AdminBannerScreen.tsx`](file:///g:/Kurnool%20One/Kurnool%20One/frontend/src/screens/AdminBannerScreen.tsx).
- [ ] Remove stale backup folder `DELETE LATER/` (80MB+ old builds).
- [ ] Remove leftover events code in `OffersScreen.tsx`.

---

## 4. Production & Store Release Checklist (Non-Code)

- [ ] Switch Razorpay key from test mode (`rzp_test_...`) to live mode (`rzp_live_...`) when ready for real transactions.
- [ ] Replace test Google AdMob App & Unit IDs with approved production AdMob IDs.
- [ ] Ensure Release Keystore SHA-1 and SHA-256 are added to Firebase Console under Android App settings for Phone Auth.
- [ ] Google Play Console submission: Upload signed AAB/APK, screenshots, and Privacy Policy URL (`https://kurnool-one.web.app/privacy`).
