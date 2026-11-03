# Kurnool One — Comprehensive Changes Log
**Date:** November 3, 2026  
**Time:** 12:36 AM IST  
**Version / Release APK:** `Kurnool-One.apk` (42.07 MB)  
**TypeScript Status:** 0 Errors (`npx tsc --noEmit` verified)  
**Android Gradle Build:** `BUILD SUCCESSFUL in 18m 4s`

---

## 1. Executive Summary
This document captures all modifications, architectural updates, policy compliances, and user-facing feature additions made to the **Kurnool One** application on **November 3, 2026**.

---

## 2. Detailed Breakdown of Changes

### A. Partner Program Compliance & Guaranteed Unique Code Generation
- **File:** `frontend/src/screens/PartnerProgramScreen.tsx`
- **Aadhaar Field Removal:** Removed 12-digit Aadhaar input box, validation logic, and state variables to strictly comply with Section 57 of the Indian Aadhaar Act and Google Play Store User Data policies.
- **Identity & KYC:** Onboarding relies on verified Firebase Phone OTP authentication + NPCI bank-verified UPI ID (VPA). Partner commission payouts are routed directly to this UPI ID with 12-digit Bank UTR receipts.
- **Unique Referral Code Generation:** Implemented `generateUniqueCode()`: generates an 8-character uppercase alphanumeric code (`KNL-XXXX`, e.g., `KNL-7X9B`), cross-checked against Firestore's `partners` collection to guarantee zero collision.
- **Commission Table Alignment:** Aligned payout rates with actual pricing plans:
  - Standard Business (6 Months - ₹399): ₹100 commission
  - Premium Featured Business (1 Year - ₹999): ₹250 commission
  - Standard Professional (6 Months - ₹199): ₹50 commission
  - Professional Elite (1 Year - ₹499): ₹150 commission

---

### B. Transparent Plan Benefits Display during Registration
- **Files:**
  - `frontend/src/screens/RegisterBusinessScreen.tsx`
  - `frontend/src/screens/RegisterProfessionalScreen.tsx`
- **Perks Checklist:** Added checkmarked bullet lists under each plan card during onboarding:
  - **Free Basic (₹0):** Basic listing, phone button, operating hours, standard directory ranking.
  - **Standard Verified (₹399 / ₹199 - 6 Months):** Official Blue Verified Checkmark, 1-tap WhatsApp lead button, priority category placement, 5-photo gallery showcase.
  - **Premium Featured (₹999 / ₹499 - 1 Year):** Top #1 Homepage Featured Banner, unlimited Hot Deals publishing privileges, social boost.

---

### C. Dynamic Plan Upgrade Flow & Feature Gating
- **Files:**
  - `frontend/src/screens/ManageBusinessScreen.tsx`
  - `frontend/src/screens/ManageProfessionalScreen.tsx`
- **Plan Status Banner:** Added top-level status banner showing current active plan (Free Basic / Standard Verified / Premium Featured) with an instant `[ ⚡ Upgrade ]` button.
- **Upgrade Modal:** Allows free merchants to upgrade to Standard or Premium at any time with Razorpay checkout. Upon payment, updates `tier`, `planId`, `verificationBadge`, and calculates `planExpiresAt`.
- **Feature Gating:** Attempting to publish Hot Deals on a free plan triggers an informative Upgrade Required sheet with direct checkout access.

---

### D. Google User Profile Avatar on Home Screen
- **File:** `frontend/src/screens/HomeScreen.tsx`
- Replaced the static generic person outline icon in the top header with the authenticated Google profile picture (`user.photoURL`).
- Rendered in a circular avatar (`width: 36, height: 36, borderRadius: 18`) with an active blue border, falling back to the person icon when logged out.

---

### E. Business Directory Vertical Space Optimization
- **File:** `frontend/src/screens/DirectoryScreen.tsx`
- Redesigned business cards from tall 280px cards to **compact horizontal list cards (~95px height)**:
  - Left: 76×76 rounded thumbnail or category icon badge.
  - Right: Business Name + Blue Verified checkmark, category pill, star rating (`★ 4.8`), landmark/address, and compact 1-tap Call & WhatsApp action buttons.
- Fits **3 to 4 businesses on screen at once**, eliminating empty dead space.

---

### F. Hot Deals: Modern 16:9 Landscape Cards & Text-Only Deals
- **File:** `frontend/src/screens/OffersScreen.tsx`
- Converted Hot Deals feed from a 2-column grid to **single-column 16:9 landscape banner cards**.
- **Text-Only Deals Supported:** If an offer has no image, the app renders a vibrant gradient card with bold discount typography (`FLAT 30% OFF`), deal title, merchant name, and validity tag.
- Added `+ Post Deal` button in the deals header with merchant tier verification.

---

### G. Classified Bazaar: 1 Free + 4 Rewarded Video Ad Slots
- **File:** `frontend/src/screens/OffersScreen.tsx`
- Users can attach up to 5 photos: **1 photo is free**, and **Slots 2, 3, 4, and 5** unlock by watching a rewarded video ad (`100% compliant with Google AdMob Rewarded Inventory Policy`).
- Integrated with `pickImageWithFreeStyleCrop` for free-style image adjustment.
- Added smooth horizontal swipeable gallery (swipe left/right) with photo counter (`📸 1 / N`) and pagination dots in both Deal and Classified detail modals.

---

### H. House Rentals (To-Let): Compact Cards & Swipeable Carousel
- **File:** `frontend/src/screens/HouseRentScreen.tsx`
- Redesigned listings into **2-column compact cards matching Kurnool Bazaar** (cover photo thumbnail with rent badge overlay `₹8,500/mo` and BHK tag, title, area, tenant type tag, and View Details).
- Created a comprehensive detail modal featuring a **horizontal swipeable gallery (swipe left and right)** with photo counter (`📸 1 / N`) and animated pagination dots.
- Post House for Rent supports 5 photos: **1 free + 4 rewarded video ad unlock slots** with free-style cropping.

---

### I. Blood Donors: Sticky Mandatory Medical Notice
- **File:** `frontend/src/screens/BloodDonorsScreen.tsx`
- Replaced bottom footer disclaimer with a **Sticky Mandatory Medical Notice Banner** anchored right beneath the blood group filter bar so it is **never pushed off-screen** regardless of how many donors exist.
- Includes voluntary donation declaration, hospital cross-matching notice, anti-fraud warning ("Never pay money or advance transfer fees to anyone claiming to be a donor"), and collapsible summary toggle.

---

## 3. Build & Artifact Verification
| Artifact | Path / Location | Size / Status |
| :--- | :--- | :--- |
| **Standalone Release APK** | `G:\Kurnool One\Kurnool One\Kurnool-One.apk` | 42.07 MB • Generated Nov 3, 2026 |
| **TypeScript Validation** | `frontend/` (`npx tsc --noEmit`) | 0 Errors • Exit Code 0 |
| **Android Build Engine** | `frontend/android` (Gradle 8.10.2, Adoptium JDK 17) | `BUILD SUCCESSFUL in 18m 4s` |

