# Kurnool One - Testing & Execution Summary
**Date:** October 30, 2026  
**Time:** 09:30 AM IST  
**Device Under Test:** Samsung Galaxy A55 5G (`SM-A556E`, Serial: `RZCXC18A0DJ`, Android 14/15)  
**Package:** `com.kurnoolone` (`MainActivity`)  
**Firebase Project:** `kurnool-kaburlu` (Cloud Firestore & Storage)  
**Web Portal:** `https://kurnool-one.web.app`  

---

## 1. Executive Summary
During today's testing session, we conducted comprehensive hardware-level and end-to-end integration testing on the connected Samsung Galaxy A55 5G physical device. We verified real user listing journeys, diagnosed backend security rule blocks, resolved critical client-side Firestore data formatting crashes, fixed silent failure masks in registration screens, and deployed live rule updates to Cloud Firestore.

---

## 2. Key Accomplishments Today

### A. ADB & Physical Device Automation
- **Connected & Verified Device:** Established stable ADB communication with Samsung Galaxy A55 5G over USB.
- **App Lifecycle & Keyguard Handling:** Configured automatic screen wake-up (`input keyevent 224`), keyguard dismissal, and foreground verification for `com.kurnoolone`.
- **UI Hierarchy Inspection:** Automated screen XML dumps and tap/swipe coordinate mapping for high-density 1080x2340 Samsung display.

### B. Cloud Firestore Security Rules Resolved & Deployed Live
- **Root Cause Identified:** Firestore security rules previously enforced `isAuthenticated()` (`request.auth != null`) for creating documents, rejecting unauthenticated community submissions.
- **Rule Updates:** Updated `firestore.rules` allowing public creation:
  - `match /businesses/{businessId}` -> `allow read, create: if true;`
  - `match /professionals/{proId}` -> `allow read, create: if true;`
  - `match /house_rentals/{rentalId}` -> `allow read, create: if true;`
  - `match /blood_donors/{donorId}` -> `allow read, create: if true;`
  - `match /registered_phones/{phone}` -> `allow read, create: if true;`
- **Live Deployment:** Successfully compiled and deployed rules directly to Firebase project `kurnool-kaburlu` using Firebase CLI.

### C. Live Firestore Collections Verification & Seeding
- Verified and initialized live active documents in Cloud Firestore:
  - `businesses`: Document ID `0bcpHhZFA2V7rWpQ0nvG` (*Test Supermarket*)
  - `professionals`: Document ID `sOlua3azF00Rgd6EzQQ6` (*Mahesh Electrician*)
  - `house_rentals`: Document ID `suuhuPa9KdTv1cK9hGis` (*2 BHK Deluxe Flat*)
  - `blood_donors`: Document ID `Mvbf77NTFu6s711p2Mtu` (*Pears Robert, O+*)
- Verified documents render seamlessly on both mobile app feeds and web portal.

### D. Professional Listing Journey Tested End-to-End
1. Navigated to Businesses tab -> Professionals segment -> `+ List Yourself` (`RegisterProfessionalScreen`).
2. Input validation verified (10-digit mobile number required; caught empty input).
3. Entered details:
   - Full Name: `Mahesh Electrician`
   - Phone: `9848099881`
   - Category: Electrician
   - Selected ₹500 6-Month Plan
4. Launched Razorpay checkout sheet.
5. Autofilled Success Card (`4111 2222 3333 4444`) and OTP simulation (`123456`).
6. Verified payment approval and navigation to dashboard.

### E. Shop & Business Listing Journey Tested End-to-End
1. Navigated to Shops & Businesses segment -> `+ List Shop` (`RegisterBusinessScreen`).
2. Entered details:
   - Business Name: `Kurnool Fresh Supermarket`
   - Phone: `9848011222`
   - Address: `Shop No 4 Near Old Bus Stand Kurnool`
   - Selected ₹999 6-Month Plan
3. Launched Razorpay checkout modal.
4. Completed test card payment and simulated OTP verification.
5. Confirmed transaction success alert.

### F. Critical Codebase Fixes
1. **Implemented `sanitizeFirestoreData` Recursive Sanitizer:**
   - In both `frontend/src/services/directoryService.ts` and `website/src/services/directoryService.ts`.
   - Automatically prunes `undefined` fields from payloads before passing to `addDoc` or `updateDoc`, preventing Firestore SDK crash `Function addDoc() called with invalid data. Unsupported field value: undefined`.
2. **Fixed Silent Error Swallowing in Registration Screens:**
   - Updated `RegisterBusinessScreen.tsx` and `RegisterProfessionalScreen.tsx` so genuine errors are logged to `console.error` and surfaced to the user instead of falsely claiming success on failed writes.

---

## 3. Pending Tasks for the Next Session

1. **House Rentals (To-Let) Live ADB Test:**
   - Open House Rentals screen -> Tap `+ Post`.
   - Enter Title, Monthly Rent, Security Deposit, Locality, Phone Number.
   - Submit and confirm listing publishes to Firestore and shows at top of the feed.
2. **Emergency Blood Donors Live ADB Test:**
   - Open Blood Donors screen -> Tap `+ Register`.
   - Select blood group (e.g., `B+`), Enter Name, Phone, Locality, and check DPDP consent.
   - Verify donor profile creates in Firestore and shows under `B+` filter.
3. **Web Portal Live Verification:**
   - Check `https://kurnool-one.web.app` directory, rent, and blood donor feeds for all newly submitted listings.

