# Kurnool One — Google AdMob Architecture & Monetization Guide

**Document Version:** 1.0.0  
**Updated:** November 4, 2026  
**Status:** Production Verified  

---

## 1. Official Google AdMob Configuration

All AdMob credentials have been verified and integrated into the Kurnool One Android native configuration (`app.json`, `android/app/src/main/AndroidManifest.xml`) and TypeScript application layer (`frontend/src/config/ads.ts`).

| Property / Ad Type | Unit Name in AdMob Console | Production ID |
| :--- | :--- | :--- |
| **Google Mobile Ads App ID** | `KurnoolOne_Android_App` | `ca-app-pub-6894923761807901~1249968686` |
| **Adaptive Banner Ad** | `KurnoolOne_Adaptive_Banner` | `ca-app-pub-6894923761807901/6222488522` |
| **Interstitial Ad** | `KurnoolOne_Interstitial` | `ca-app-pub-6894923761807901/1773760321` |
| **App Open Ad** | `KurnoolOne_App_Open` | `ca-app-pub-6894923761807901/2088445936` |
| **Native Advanced Ad** | `Native_advanced_1` | `ca-app-pub-6894923761807901/6615023461` |
| **Rewarded Video Ad (Optional)** | `KurnoolOne_Rewarded_Perks` | *Optional — For unlocking extra merchant photo quotas* |

---

## 2. Where Ads Are Placed in the App

### A. App Open Ad (`ca-app-pub-6894923761807901/2088445936`)
* **Placement:** Cold launch and background-to-foreground resume.
* **Behavior:** Seamlessly loads when the user taps the Kurnool One app icon on their Android device.
* **Policy Compliance:** Built with frequency capping (at most once every 4 hours per user session) so citizens opening the app multiple times in a row never get interrupted.

### B. Adaptive Banner Ad (`ca-app-pub-6894923761807901/6222488522`)
* **Placement 1 (Home Screen):** Positioned between the Places of Worship section and the Merchant Onboarding banner in [`HomeScreen.tsx`](file:///frontend/src/screens/HomeScreen.tsx#L442-L449).
* **Placement 2 (Directory Screen):** Fixed sticky/in-feed separator banner between business category listings.
* **Placement 3 (Hot Deals & Offers):** Displayed between Hot Deals and Kurnool Bazaar sections in [`OffersScreen.tsx`](file:///frontend/src/screens/OffersScreen.tsx).
* **Styling:** Wrapped inside an anchored adaptive container with a subtle, compliant `AD` pill label.

### C. Interstitial Ad (`ca-app-pub-6894923761807901/1773760321`)
* **Placement 1 (Claim Deal CTA):** Displayed when a citizen taps "Claim Deal →" to claim a festival coupon code.
* **Placement 2 (Merchant Registration):** Displayed immediately after a merchant successfully submits their new business or professional profile for verification.
* **Placement 3 (Deep Section Navigation):** Displayed periodically during exploration of Kurnool historical landmarks or deep category filters.

### D. Native Advanced Ad (`ca-app-pub-6894923761807901/6615023461`)
* **Placement:** Integrated directly inside the business listing feed (`DirectoryScreen.tsx`) and city news feed (`NewsScreen.tsx`).
* **Appearance:** Styled identically to Kurnool One store cards using [`SafeNativeAd.tsx`](file:///frontend/src/components/SafeNativeAd.tsx) with a prominent `SPONSORED` badge to comply with Google Play and AdMob policies.

---

## 3. What is Missing (Audit & Recommendations)

1. **Rewarded Ad Unit (Optional):**
   * *Status:* Missing in your current list, but **NOT blocking**.
   * *Purpose:* Can be used to let free tier shop owners watch a 30-second sponsored video to unlock 3 extra storefront gallery photos without paying.
   * *Recommendation:* If you want this feature later, create a **Rewarded Ad** in your AdMob console named `KurnoolOne_Rewarded_Photos` and provide the Unit ID. Otherwise, you can keep it disabled.

2. **`app-ads.txt` Verification on Website:**
   * *Status:* Required by Google AdMob within 30 days of launch.
   * *Location:* Must be accessible at `https://kurnool-one.web.app/app-ads.txt`.
   * *Line format:*
     ```text
     google.com, pub-6894923761807901, DIRECT, f08c47fec0942fa0
     ```
   * *Action Taken:* We have automatically placed this in `website/public/app-ads.txt` so Google AdMob crawler validates your domain automatically.

---

## 4. Code Implementation Architecture

### Configuration File: [`frontend/src/config/ads.ts`](file:///frontend/src/config/ads.ts)
Contains centralized definitions, automatic `__DEV__` test ID toggles (to prevent policy strikes during local emulator testing), and production AdMob IDs for production APK/AAB builds.

### Android Native Manifest: [`frontend/android/app/src/main/AndroidManifest.xml`](file:///frontend/android/app/src/main/AndroidManifest.xml#L16)
```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-6894923761807901~1249968686"
  tools:replace="android:value" />
```

### Expo Native Plugin: [`frontend/app.json`](file:///frontend/app.json#L33-L39)
```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-6894923761807901~1249968686",
    "iosAppId": "ca-app-pub-6894923761807901~1249968686"
  }
]
```

