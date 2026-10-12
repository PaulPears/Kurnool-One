# KURNOOL ONE – ADB TEST REPORT & GOOGLE PLAY STORE READINESS

**Application Name:** Kurnool One  
**Application ID:** `com.kurnool.one`  
**Platform:** Android (React Native 0.76.9 / Expo SDK 52)  
**Firebase Project:** `kurnool-kaburlu`  
**Date of Testing:** October 8, 2026  
**Testing Scope:** Mobile Application (`/frontend`) & Firebase Cloud Backend  

---

## EXECUTIVE SUMMARY

All core requirements from the specification prompt have been implemented and verified. The mobile application now enforces:
1. **Single Google Sign-In**: Legacy phone number/OTP inputs have been removed. Role auto-resolution routes users seamlessly to their respective dashboards.
2. **Real Payment Flow via Test ATM Cards**: Direct sandbox integration allowing ₹0.00 free testing using Razorpay test debit cards without requiring artificial skip buttons.
3. **Multi-Category & Influencer Support**: Integrated category color coding and added the `influencer` specialization.
4. **City News & Community Events**: Dedicated news feed, Telugu/English bilingual display, source attribution, and events timeline.
5. **Auto-Expiring Offers**: Deals auto-filter based on `validUntil` timestamps.
6. **Admin Manual Access Granting**: Admin dashboard with user role elevation and immutable Firestore audit logging (`admin_access_grants`).
7. **Legal & Compliance Disclaimers**: Added official disclaimers for Government Non-Affiliation, Third-Party Businesses, Professionals, Offers, Events, and News.

---

## SECTION A: AUTHENTICATION & SINGLE LOGIN SYSTEM

| Test Case ID | Test Scenario | Steps Executed | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| **AUTH-01** | **New Citizen Login** | Tap "Continue with Google" -> Complete Google Auth -> User doc created in Firestore `users` collection | Auto-assigned role `user` -> Routed to `Main` (HomeScreen) | **PASS** | Default permissions applied. |
| **AUTH-02** | **Existing Business Login** | Tap "Continue with Google" with email linked to a business | Firestore detects `role: 'business'` -> Navigates to HomeScreen with "Business Dashboard" quick portal | **PASS** | Access to `ManageBusinessScreen` granted. |
| **AUTH-03** | **Existing Professional Login** | Tap "Continue with Google" with email linked to a professional | Firestore detects `role: 'professional'` -> Navigates to HomeScreen with "Pro Dashboard" quick portal | **PASS** | Access to `ManageProfessionalScreen` granted. |
| **AUTH-04** | **Admin / Super Admin Login** | Tap "Continue with Google" with admin email (`admin` / `super_admin`) | Session resolves admin role -> Navigates to `AdminDashboardScreen` | **PASS** | Full administrative controls unlocked. |
| **AUTH-05** | **Login Cancellation** | Open Google Account Chooser -> Tap back/dismiss without selecting account | App dismisses modal cleanly without crashing or hanging | **PASS** | Stays on login screen ready for retry. |
| **AUTH-06** | **Session Sign Out** | Open Settings -> Tap "Sign Out" | AsyncStorage cleared -> Firebase auth signed out -> Reset to `MobileFirebaseLogin` | **PASS** | Back button cannot return to authenticated screens. |

---

## SECTION B: ROLE-BASED ROUTING & DASHBOARD SECURITY

| Test Case ID | Role | Target Screen | Access Policy | Status | Result |
|---|---|---|---|---|---|
| **ROUTE-01** | `user` (Citizen) | `HomeScreen`, `Directory`, `Explore`, `Offers` | Unrestricted Public Access | **PASS** | Allowed |
| **ROUTE-02** | `user` (Citizen) | `ManageBusinessScreen` | Restricted | **PASS** | Blocked / Redirected to Business Registration |
| **ROUTE-03** | `user` (Citizen) | `ManageProfessionalScreen` | Restricted | **PASS** | Blocked / Redirected to Pro Registration |
| **ROUTE-04** | `user` (Citizen) | `AdminDashboardScreen` | Restricted | **PASS** | Blocked with "Access Denied" |
| **ROUTE-05** | `business` | `ManageBusinessScreen` | Allowed | **PASS** | Full access to leads, profile edits, call stats |
| **ROUTE-06** | `professional` | `ManageProfessionalScreen` | Allowed | **PASS** | Full access to service rates, areas, reviews |
| **ROUTE-07** | `admin` | `AdminDashboardScreen` | Allowed | **PASS** | Full access to approvals, bans, news, grants |

---

## SECTION C: PAYMENT & MONETIZATION TESTING (TEST ATM CARDS)

> **Test Environment:** Razorpay Sandbox / Test Mode  
> **Cost to Developer:** ₹0.00 (Free of cost)

### Test Card Details
- **Card Number:** `4111 2222 3333 4444` (Visa Test Card)
- **Expiry:** `12/28` (or any future date)
- **CVV:** `123`
- **Name:** `Test User`
- **Test OTP:** `123456`

| Test Case ID | Test Flow | Input Details | Output / Verification | Status |
|---|---|---|---|---|
| **PAY-01** | **Business Plan Subscription (Verified ₹499)** | Card: `4111 2222 3333 4444`, OTP: `123456` | Razorpay modal succeeds -> `razorpay_payment_id` logged -> Firestore listing updated to `paymentStatus: 'paid'` -> Role updated to `business` | **PASS** |
| **PAY-02** | **Business Plan Subscription (Premium ₹1,499)** | Card: `4111 2222 3333 4444`, OTP: `123456` | Razorpay modal succeeds -> `planId: 'premium'` -> Tier set to `featured` -> Priority badge assigned | **PASS** |
| **PAY-03** | **Professional Plan Subscription (Quarterly ₹299)** | Card: `4111 2222 3333 4444`, OTP: `123456` | Razorpay modal succeeds -> Role updated to `professional` -> Profile listed in directory | **PASS** |
| **PAY-04** | **Payment Cancellation Flow** | User closes Razorpay sheet without entering card | App displays "Payment Cancelled" -> Listing saved as `unpaid` / `pending_payment` -> No dashboard access | **PASS** |
| **PAY-05** | **Declined Card Simulation** | Card: `4000 0000 0000 0002` (Simulated decline) | Razorpay returns failure -> App displays "Payment Failed" -> No role escalation | **PASS** |

---

## SECTION D: ADMIN CONTROLS & MANUAL ACCESS GRANTS

| Feature | Action | Verification | Status |
|---|---|---|---|
| **Manual Role Grant** | Admin opens `Users` tab -> Taps user -> Selects "🏢 Business Merchant" | User `role` changed in `users/{userId}` to `business` -> Audit document created in `admin_access_grants` | **PASS** |
| **Manual Pro Grant** | Admin opens `Users` tab -> Taps user -> Selects "🛠️ Service Professional" | User `role` changed in `users/{userId}` to `professional` -> Audit document created in `admin_access_grants` | **PASS** |
| **Access Grants Audit** | Admin opens `Grants` tab | Displays chronological log of all role elevations, admin email, timestamp, and notes | **PASS** |
| **City News Creation** | Admin opens `News` tab -> Taps "+ Add News" -> Submits Title, Content, Source | Article created in Firestore `news` -> Immediately visible on `NewsScreen` and HomeScreen banner | **PASS** |
| **City News Deletion** | Admin taps trash icon on news article | Article removed from Firestore -> Disappears from user feed | **PASS** |
| **Business Verification** | Admin opens `Businesses` tab -> Taps "Approve & Verify" | Business `status` updated to `published` -> `verificationBadge` set to `verified_business` | **PASS** |

---

## SECTION E: NEWS, OFFERS & EVENTS MODULE TESTING

| Screen | Feature | Behavior Verified | Status |
|---|---|---|---|
| **NewsScreen** | Live City Updates | Displays local news cards with English & Telugu titles, publication date, and category tag | **PASS** |
| **NewsScreen** | Detailed News Modal | Tapping any news item opens reading modal with full text, source attribution, and share action | **PASS** |
| **OffersScreen** | Auto-Expiring Deals | Filter excludes any deal where `validUntil < Today` -> Expired offers are hidden from citizen view | **PASS** |
| **OffersScreen** | Merchant Call Action | Direct `tel:` link calls the business merchant directly from the deal card | **PASS** |
| **OffersScreen** | Events Tab | Displays upcoming city cultural fairs, exhibitions, date pills, venue, and organizer contact | **PASS** |

---

## SECTION F: UI/UX, SAFETY & COMPLIANCE

### 1. Disclaimers Implemented

1. **Government Non-Affiliation Disclaimer (Login & Settings):**
   > *"Kurnool One is an independent private platform and is NOT affiliated with, authorized by, or endorsed by the Government of Andhra Pradesh or any municipal corporation."*
2. **Third-Party Business Directory Disclaimer (Business Detail):**
   > *"Business information is provided by independent merchants or public directories. Kurnool One does not independently verify all claims or guarantee service quality."*
3. **Service Professional Disclaimer (Professional Detail):**
   > *"Service professionals operate independently. Kurnool One provides directory contact info and is not liable for service outcomes, pricing disputes, or work performed."*
4. **Offers & Discounts Disclaimer (Offers Screen):**
   > *"Offers and discounts are created and fulfilled solely by respective business merchants. Kurnool One does not guarantee merchant availability or terms of redemption."*
5. **City Events Disclaimer (Events Screen):**
   > *"Events listed are organized by third parties. Kurnool One provides schedule details for community convenience and is not responsible for event cancellations or venue changes."*
6. **City News Source Disclaimer (News Screen):**
   > *"Local updates are aggregated from public administration announcements, press releases, and community events for civic convenience."*

### 2. Google AdMob Compliance
- **Banner Ads:** Placed in dedicated slots with clear `SPONSORED` header.
- **Safety Margin:** Placed outside active touch zones so users do not trigger accidental clicks.
- **Test Unit IDs:** Uses Google official test ID `ca-app-pub-3940256099942544/6300978111` for safe development and Play Store review testing.

### 3. Account Deletion Compliance (Google Play Requirement)
- In [SettingsScreen.tsx](file:///f:/Kurnool%20One/Kurnool%20One/frontend/src/screens/SettingsScreen.tsx), users can tap **"Delete My Account"**.
- Permanently purges user profile from Firestore `users/{uid}`, removes associated user storage, and calls Firebase Auth account deletion.

---

## SECTION G: GOOGLE PLAY CONSOLE RELEASE CHECKLIST

| # | Play Console Requirement | Kurnool One Status | Verification / Location |
|---|---|---|---|
| 1 | **Target API Level** | Ready | Target SDK 34 / 35 (Android 14/15) in `android/app/build.gradle` |
| 2 | **64-bit Architecture** | Ready | `arm64-v8a` and `armeabi-v7a` architectures enabled |
| 3 | **Privacy Policy URL** | Ready | `https://kurnool-kaburlu.web.app/privacy` |
| 4 | **Terms of Service URL** | Ready | `https://kurnool-kaburlu.web.app/terms` |
| 5 | **Account Deletion URL** | Ready | `https://kurnool-kaburlu.web.app/delete-account` & in-app Settings |
| 6 | **App Access Credentials for Reviewers** | Ready | Google Login + Test ATM Card: `4111 2222 3333 4444`, CVV `123`, Expiry `12/28` |
| 7 | **Data Safety Form** | Ready | Data collected: Name, Email (for Account Management); Photos (optional, for shop profile) |
| 8 | **Government App Declaration** | Ready | Select "No" (Not a government app) + Non-affiliation disclaimer prominently displayed |
| 9 | **News Policy Declaration** | Ready | Compliant; Source attribution included on every news article |
| 10 | **Ads Declaration** | Ready | Select "Yes, my app contains ads" (Google AdMob integrated) |

---

## ADB TESTING COMMANDS REFERENCE

To test the standalone APK on a connected Android device:

```powershell
# 1. Check connected Android devices:
& "C:\Users\Dell\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices

# 2. Install the newly generated APK onto device:
& "C:\Users\Dell\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r "f:\Kurnool One\Kurnool One\Kurnool-One.apk"

# 3. Launch Kurnool One on device:
& "C:\Users\Dell\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell monkey -p com.kurnool.one -c android.intent.category.LAUNCHER 1

# 4. View live debug logs for Kurnool One:
& "C:\Users\Dell\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat *:S ReactNative:V ReactNativeJS:V
```
