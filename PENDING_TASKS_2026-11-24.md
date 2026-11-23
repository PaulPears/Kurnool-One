# Kurnool One - Pending Tasks & Roadmap

**Date:** November 24, 2026  
**Status Overview:** All in-app code features, bug fixes, and compilation verifications are **100% Complete**. The remaining tasks pertain to external deployments, hardware testing, domain acquisition, and Google Play Console publishing.

---

## 1. Pending & Deferred Tasks Summary

| # | Task / Milestone | Category | Status | Action Required When Ready |
|---|---|---|---|---|
| **1** | **Physical Device ADB Deployment** | Hardware Testing | ⏸️ Deferred by User | Run `adb install -r Kurnool-One.apk` to Samsung Galaxy A55 5G (`RZCXC18A0DJ`) when user is ready to test on real hardware. |
| **2** | **Custom Domain Acquisition (`kurnoolone.com`)** | Infrastructure | ⏳ Awaiting Purchase | Currently deployed on Firebase / Vercel default domains. When the user purchases `kurnoolone.com`, map DNS records (A/CNAME records) to Firebase Hosting and Next.js website. |
| **3** | **Google Play Console Release & AAB Upload** | Release Management | 📋 Next Milestone | Generate signed production bundle (`Kurnool-One.aab`) via `./frontend/build-android.ps1` and upload to Google Play Console Internal / Production track. |
| **4** | **Google AdMob Production Live Ad Serving** | Monetization | ⏳ Dependent on Play Store | Ad units (`BANNER`, `INTERSTITIAL`, `APP_OPEN`, `NATIVE_ADVANCED`, `REWARDED`) are configured in `ads.ts`. Live ads will start rendering once the app is live on Play Store and `app-ads.txt` is verified on the website root. |
| **5** | **Razorpay Live Merchant Payment Gateway** | Payments | 💡 Optional / Post-Launch | Zero-cash policy is enforced for lead generation and listings. If premium sponsored listings / banner placements are monetized via self-serve checkout, plug in live Razorpay Key ID & Secret. |
| **6** | **WhatsApp Business API Official Cloud Integration** | Communications | 💡 Optional / Future Enhancement | Direct click-to-chat links for Line 1 (`+91 77805 33086`) and Line 2 (`+91 90633 67768`) are operational. Official Meta WhatsApp Cloud API can be connected if automated broadcast notifications are required. |

---

## 2. Detailed Task Breakdown

### 1. Physical Device Testing via ADB (Samsung Galaxy A55 5G)
- **Context:** The user instructed *"we can do adb later for now check here only"*.
- **Current State:** The code compiles with 0 TypeScript errors and Expo Hermes bytecode compiles cleanly (1178 modules).
- **Execution Step (When Ready):**
  ```powershell
  # 1. Build standalone release APK
  cd frontend
  .\build-android.ps1
  
  # 2. Install to connected device
  adb -s RZCXC18A0DJ install -r ..\Kurnool-One.apk
  
  # 3. Launch app on device
  adb -s RZCXC18A0DJ shell monkey -p com.kurnoolone.app -c android.intent.category.LAUNCHER 1
  ```

---

### 2. Custom Domain & DNS Configuration
- **Context:** Held until user purchases domain.
- **Current State:** App links to placeholder / default endpoints and Play Store package ID `com.kurnoolone.app`.
- **Target Domain:** `kurnoolone.com` or `kurnool.one`.
- **Configuration Required Upon Domain Purchase:**
  1. Add DNS `A` records pointing to Firebase Hosting IP addresses.
  2. Add `app-ads.txt` containing AdMob publisher ID:
     ```txt
     google.com, pub-6894923761807901, DIRECT, f08c47fec0942fa0
     ```
  3. Verify SSL certificate auto-generation.

---

### 3. Google Play Console Listing & Release (AAB)
- **Current State:** App is configured with target SDK 34 / 35, permissions tailored for Google Play, DPDP Act 2023 compliance pages (Privacy Policy, Terms, Disclaimers, Account Deletion).
- **Assets Ready for Play Console:**
  - High-res App Icon (512x512)
  - Feature Graphic (1024x500)
  - Privacy Policy URL (`/privacy-policy`)
  - Grievance Officer Contact Details (`/contact`)
  - Standalone signed Android App Bundle (`.aab`)

---

### 4. AdMob Live Impression Verification
- **App ID:** `ca-app-pub-6894923761807901~1249968686`
- **Configured Ad Units:**
  - `BANNER`: `ca-app-pub-6894923761807901/6222488522`
  - `INTERSTITIAL`: `ca-app-pub-6894923761807901/1773760321`
  - `APP_OPEN`: `ca-app-pub-6894923761807901/2088445936`
  - `NATIVE_ADVANCED`: `ca-app-pub-6894923761807901/6615023461`
  - `REWARDED`: `ca-app-pub-6894923761807901/9693728932`
- **Next Step:** Once the APK/AAB is live on the Play Store, link the app in the AdMob Console under "App Settings" -> "App Store" to begin receiving live ads.

---

## 3. Current Completed State

- **App Codebase:** 100% Dynamic Firestore records (no mock listings).
- **TypeScript:** 0 Errors (`npx tsc --noEmit`).
- **Bundler:** Hermes Bytecode Export Success (`npx expo export --platform android`).
- **Local Cache & Resync:** Verified functional in `SettingsScreen.tsx`.
- **All 9 Bug Fixes:** Fully implemented and validated.
