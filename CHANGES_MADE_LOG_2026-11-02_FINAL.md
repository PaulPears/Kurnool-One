# Kurnool One — Release & Changes Log
**Date & Time:** November 3, 2026 — 12:32 AM IST  
**Release Artifact:** `Kurnool-One.apk` (42.07 MB)  
**Status:** All 8 Workstreams Implemented • 0 TypeScript Errors • Build Successful

---

## Summary of Changes Made Across Codebase

### 1. Partner Program: Aadhaar Removal & Unique Code Generation
- **File:** `frontend/src/screens/PartnerProgramScreen.tsx`
- **Legal Compliance:** Completely removed 12-digit Aadhaar collection, state variables, and inputs to comply with Section 57 of the Indian Aadhaar Act and Google Play Store User Data & Financial policies.
- **KYC Verification:** Identity is authenticated via Firebase Phone OTP + NPCI bank-verified UPI ID (VPA). Commission payouts are paid to this UPI ID with 12-digit Bank UTR receipts.
- **Unique Code:** Implemented `generateUniqueCode()`: creates guaranteed unique uppercase alphanumeric codes (`KNL-XXXX`, e.g. `KNL-7X9B`), verified against Firestore.
- **Commission Table:** Aligned rates (Standard Shop ₹399 -> ₹100; Premium Shop ₹999 -> ₹250; Pro Elite ₹499 -> ₹150).

### 2. Registration Tier Benefits Transparency
- **Files:** `frontend/src/screens/RegisterBusinessScreen.tsx`, `frontend/src/screens/RegisterProfessionalScreen.tsx`
- Added clear, checkmarked perk bullet points inside each plan card during registration:
  - **Free Basic (₹0):** Basic listing, phone button, operating hours, standard search.
  - **Standard Verified (₹399 / ₹199 - 6 Months):** Official Blue Verified Checkmark, 1-tap WhatsApp lead button, priority category placement, 5-photo gallery showcase.
  - **Premium Featured (₹999 / ₹499 - 1 Year):** Top #1 Homepage Featured Banner, unlimited Hot Deals publishing privileges, social boost.

### 3. Dynamic Plan Upgrade Flow & Feature Gating
- **Files:** `frontend/src/screens/ManageBusinessScreen.tsx`, `frontend/src/screens/ManageProfessionalScreen.tsx`
- **Status Banner:** Added plan status card at the top showing current plan tier (Free Basic / Standard / Premium) with an instant `[ ⚡ Upgrade ]` button.
- **Upgrade Modal:** Displays plan options with benefits and triggers Razorpay checkout; upon completion, updates Firestore document `tier`, `planId`, `verified: true`, and calculates `planExpiresAt`.
- **Feature Gating:** Attempting to publish Hot Deals without an active paid plan triggers an informative Upgrade Required alert with direct checkout access.

### 4. Home Page Google Account Avatar
- **File:** `frontend/src/screens/HomeScreen.tsx`
- Replaced the static generic person icon with the user's authentic Google account photo (`user?.photoURL`), rendered in a circular avatar (`width: 36, height: 36, borderRadius: 18`) with an active blue border. Falls back to icon when logged out.

### 5. Business Directory Vertical Space Reduction
- **File:** `frontend/src/screens/DirectoryScreen.tsx`
- Transformed tall 280px business cards into compact horizontal list items (~95px height):
  - Left: 76×76 rounded thumbnail or category icon badge.
  - Right: Business Name + Blue Verified checkmark, category pill, star rating (`★ 4.8 (24)`), landmark/address, and compact 1-tap Call & WhatsApp buttons.
- Fits **3 to 4 businesses on screen at once**, eliminating empty dead space.

### 6. Hot Deals: Landscape Cards & Text-Only Support
- **File:** `frontend/src/screens/OffersScreen.tsx`
- Converted Hot Deals feed from a 2-column grid to **single-column 16:9 landscape banner cards**.
- **Text-Only Deals Supported:** If a merchant posts a deal without an image, the app renders a vibrant gradient card with bold discount typography (`FLAT 30% OFF` / `SPECIAL DEAL`), deal title, merchant name, and validity tag.
- Added "+ Post Deal" button in the deals header with merchant tier verification.

### 7. Classified Bazaar: 1 Free + 4 Rewarded Video Ad Slots
- **File:** `frontend/src/screens/OffersScreen.tsx`
- Increased photo limit to 5.
- Slot 1 is free; Slots 2, 3, 4, 5 display unlock buttons that prompt the user to watch a rewarded video ad (`100% compliant with Google AdMob Rewarded Inventory Policy`).
- Integrated with `pickImageWithFreeStyleCrop` for free-style image adjustment.
- Added smooth horizontal swipeable gallery (swipe left/right) with photo counter (`📸 1 / N`) and pagination dots in the detail modal.

### 8. House Rentals (To-Let): Compact Cards & Swipeable Carousel
- **File:** `frontend/src/screens/HouseRentScreen.tsx`
- Redesigned listings into **2-column compact cards matching Kurnool Bazaar** (cover photo thumbnail with rent badge overlay `₹8,500/mo` and BHK tag, title, area, tenant type tag, and View Details).
- Created a comprehensive detail modal featuring a **horizontal swipeable gallery (swipe left and right)** with photo counter (`📸 1 / N`) and animated pagination dots.
- Post House for Rent supports 5 photos: 1 free photo + 4 rewarded video ad unlock slots with free-style cropping.

### 9. Blood Donors: Sticky Mandatory Medical Notice
- **File:** `frontend/src/screens/BloodDonorsScreen.tsx`
- Replaced bottom footer disclaimer with a **Sticky Mandatory Medical Notice Banner** anchored right beneath the blood group filter bar so it is never pushed off-screen as the donor list grows.
- Includes voluntary donation declaration, hospital cross-matching reminder, anti-fraud warning ("Never pay money or advance transfer fees to anyone claiming to be a donor"), and collapsible summary toggle.

---

## Verification & Build Details
- **TypeScript Typecheck:** `npx tsc --noEmit` passed with **0 errors**.
- **Build Command:** `./gradlew.bat app:assembleRelease -x lint -x test --no-build-cache -PreactNativeArchitectures=arm64-v8a`
- **Build Duration:** 18m 4s (808 actionable tasks, 92 executed, 716 up-to-date).
- **Output APK:** `G:\Kurnool One\Kurnool One\Kurnool-One.apk` (42.07 MB).

