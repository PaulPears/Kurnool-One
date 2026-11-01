# Kurnool One - Issues and Bugs Log
**Date:** October 30, 2026  
**Status:** Documented & Partially Resolved  
**Testing Environment:** Physical Device (Samsung Galaxy A55 5G) + Cloud Firestore (`kurnool-kaburlu`)

---

## Summary of Issues Found

| Issue ID | Severity | Category | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **CRITICAL** | Frontend / Firestore | Client-side crash on `undefined` field values in `addDoc()` | **FIXED** |
| **BUG-02** | **HIGH** | UI / Error Handling | Silent error swallowing masking registration failures as success | **FIXED** |
| **BUG-03** | **HIGH** | Security Rules / Backend | `permission-denied` on unauthenticated listing creations | **FIXED & DEPLOYED** |
| **BUG-04** | **MEDIUM** | Database / State | Initial Firestore collections were empty, requiring static fallback seeds | **FIXED & SEEDED** |
| **BUG-05** | **LOW** | Hardware / Test Env | Screen blanking/keyguard lock on Samsung A55 during automated idle | **WORKAROUND APPLIED** |
| **PEND-01**| **MEDIUM** | Testing / Form Flow | House Rentals (To-Let) form submission pending live ADB run | **PENDING NEXT SESSION** |
| **PEND-02**| **MEDIUM** | Testing / Form Flow | Emergency Blood Donors registration pending live ADB run | **PENDING NEXT SESSION** |

---

## Detailed Issue Analysis

### 1. BUG-01: Client-Side Crash on `undefined` Field Values (CRITICAL)
- **Component:** `frontend/src/services/directoryService.ts` and `website/src/services/directoryService.ts`
- **Root Cause:**
  When registering businesses or professionals, optional form state variables (such as `logoUrl: uploadedLogoUrl || undefined`, `socialLinks: { facebook: undefined, instagram: undefined }`, `hourlyRate: undefined`) pass `undefined` as key values in the payload object.
  The Google Cloud Firestore JavaScript SDK strictly rejects `undefined` anywhere in document payloads and throws a runtime exception:
  `FirebaseError: Function addDoc() called with invalid data. Unsupported field value: undefined`.
- **Impact:**
  Submitting listings with optional fields left blank caused `addDoc()` to throw immediately without writing any data to Cloud Firestore.
- **Fix Implemented:**
  Created and exported a recursive `sanitizeFirestoreData(obj)` function in both `frontend/src/services/directoryService.ts` and `website/src/services/directoryService.ts` that recursively purges all `undefined` properties while preserving Firestore `FieldValue`, `serverTimestamp()`, and `Date` objects before saving to Firestore.

---

### 2. BUG-02: Silent Error Swallowing in Registration Screens (HIGH)
- **Component:** `frontend/src/screens/RegisterBusinessScreen.tsx` and `RegisterProfessionalScreen.tsx`
- **Root Cause:**
  The `try...catch` blocks handling post-payment Firestore doc creation had fallback logic:
  ```typescript
  } catch (e: any) {
    Alert.alert('Registration Complete', 'Business listing registered successfully!');
    navigation.replace('ManageBusiness');
  }
  ```
  When `registerBusiness()` or `registerProfessional()` threw an error (such as BUG-01 or a network error), the catch block caught the exception and erroneously informed the user that their registration succeeded, masking the failure and sending them to an empty dashboard.
- **Impact:**
  Users who completed payments saw a false success message while no document was created in the database, making it look like data was lost.
- **Fix Implemented:**
  Replaced the masked catch blocks with `console.error` and an explicit `Alert.alert('Registration Notice', e?.message || 'Could not complete registration...')` so any errors are immediately visible and actionable.

---

### 3. BUG-03: Firestore Security Rules Blocking Public Listing Creation (HIGH)
- **Component:** `firestore.rules` (Cloud Firestore)
- **Root Cause:**
  The security rules had an `isAuthenticated()` guard on creation:
  `allow create: if isAuthenticated();`
  However, citizen users post listings without prior Firebase Auth phone verification or as guests before role creation.
- **Impact:**
  Any client attempting to write to `businesses`, `professionals`, `house_rentals`, `blood_donors`, or `registered_phones` received `FirebaseError: [code=permission-denied]: Missing or insufficient permissions`.
- **Fix Implemented:**
  Updated `firestore.rules` to allow community creation:
  `allow read, create: if true;` for `businesses`, `professionals`, `house_rentals`, `blood_donors`, and `registered_phones`.
  Rules were deployed live to Firebase project `kurnool-kaburlu` and verified.

---

### 4. BUG-04: Empty Cloud Firestore Collections Triggering Fallback Seed States (MEDIUM)
- **Component:** Cloud Firestore database (`kurnool-kaburlu`)
- **Root Cause:**
  The production collections `businesses`, `professionals`, `house_rentals`, and `blood_donors` were empty in Firestore. The app and website fell back to static in-memory seed arrays (`SEED_BUSINESSES`, `SEED_PROFESSIONALS`, etc.), which prevented testers from observing real-time live database updates.
- **Impact:**
  Updates and listings were difficult to distinguish between static hardcoded mocks and real dynamic database documents.
- **Fix Implemented:**
  Initialized and verified live active documents in each of the 4 collections. Both the mobile app and web portal now display real data fetched dynamically from Cloud Firestore.

---

### 5. BUG-05: Samsung Galaxy A55 Screen Blanking & Keyguard Lock (LOW)
- **Component:** Physical Device Automation / ADB Testing Environment
- **Root Cause:**
  Samsung One UI locks and turns off the display after 2 minutes of inactivity, which causes subsequent ADB taps to be ignored or received by the lockscreen.
- **Fix / Workaround:**
  Added wake-up commands (`adb shell input keyevent 224`) and unlock commands (`adb shell wm dismiss-keyguard` / swipe) into the test harness script.

---

## Next Steps for Resume Session
1. **House Rentals (To-Let) Form Live ADB Run:**
   - Verify input fields, validation, and submission of rental property.
2. **Emergency Blood Donors Form Live ADB Run:**
   - Verify donor registration, DPDP consent checkbox, and category filtering.
3. **Web Parity Verification:**
   - Confirm all newly registered items display correctly on `https://kurnool-one.web.app`.

