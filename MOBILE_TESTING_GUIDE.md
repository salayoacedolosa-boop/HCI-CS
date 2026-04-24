# MOBILE TESTING GUIDE - Emergency Response System

## Overview

This guide provides step-by-step instructions to test your Emergency Response app on a mobile device or mobile emulator.

---

## **Part 1: Setup & Prerequisites**

### What You Need:

- Node.js installed on your computer
- A real Android/iOS device OR Android Emulator/iOS Simulator
- Vite development server running
- Capacitor CLI (optional, for native app testing)

### Firestore Setup (CRITICAL - DO THIS FIRST):

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `student-emergency-web-app`
3. Go to **Firestore Database** → **Start Collection**
4. Create a collection named `incidents` (will store all emergency reports)
5. Create a collection named `users` (will store user profiles)
6. Go to **Rules** tab and update with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /incidents/{id} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null;
      allow delete: if false;
    }
    match /users/{id} {
      allow read, write: if request.auth.uid == id;
    }
  }
}
```

7. Click **Publish** to save the rules

### Enable Authentication:

1. In Firebase Console → **Authentication** → **Get Started**
2. Enable **Google** provider (for quick testing)
3. Enable **Email/Password** provider
4. (Optional) Set up test accounts

---

## **Part 2: Start Development Server**

### Step 1: Open Terminal

```powershell
cd C:\Users\USER\Documents\HCI-CS
npm run dev
```

Expected output:

```
  VITE v8.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/EMERGENCY/html/home.html
```

### Step 2: Keep Terminal Open

Leave the terminal running. This is your dev server. Don't close it while testing.

---

## **Part 3: Test on Desktop Browser (Baseline Test)**

### Step 1: Open in Desktop Chrome

1. Go to `http://localhost:5173/EMERGENCY/html/home.html`
2. You should see the mobile phone frame mockup

### Step 2: Test Location Feature

- Click **"See your Location"**
- Accept geolocation permission popup
- You'll see coordinates displayed in the browser console
- Toast message should appear: "Location: [latitude], [longitude]"

### Step 3: Test SOS Button (Desktop)

- **Hold** the big red SOS button for 3 seconds
- You'll see a countdown timer (0.0s → 3.0s)
- At 3 seconds, button should turn bright red and glow
- Firebase incident should be created (check Firestore)

### Step 4: Test Emergency Cards

- Click **"I am INJURED"** card
- After 3 seconds, should redirect to emergency.html with incident details

---

## **Part 4: Test on Mobile Device (REAL DEVICE)**

### Option A: Using Android Device

#### Prerequisites:

- Install [Android Studio](https://developer.android.com/studio)
- Enable **Developer Mode** on your Android phone
  1. Settings → About Phone → tap "Build Number" 7 times
  2. Back to Settings → Developer Options → Enable USB Debugging

#### Connection:

1. Connect Android device to computer via USB cable
2. In terminal, run:
   ```powershell
   adb devices
   ```

   - You should see your device listed
   - If not, check USB drivers or restart ADB: `adb kill-server`

#### Port Forwarding:

```powershell
adb reverse tcp:5173 tcp:5173
```

#### Open App on Mobile:

1. On your Android device, open Chrome
2. Go to: `http://localhost:5173/EMERGENCY/html/home.html`
3. You'll see the app exactly as on desktop

---

### Option B: Using Android Emulator

#### Setup:

1. Open Android Studio → **Device Manager**
2. Create a new emulator (choose Pixel 6 or Pixel 7)
3. Start the emulator
4. Wait 30 seconds for it to fully load

#### Port Forwarding:

```powershell
adb reverse tcp:5173 tcp:5173
```

#### Open App in Emulator:

1. In emulator, click Chrome icon
2. Go to: `http://localhost:5173/EMERGENCY/html/home.html`

---

### Option C: Using iOS Device

#### Prerequisites:

- Mac with Xcode
- iPad or iPhone
- Apple Developer Account (free tier OK)

#### Setup:

1. Connect iPhone/iPad via USB to Mac
2. In Mac terminal:
   ```bash
   sudo ip-forward 5173:5173
   ```
3. Find your Mac's IP address:
   ```bash
   ifconfig | grep inet
   ```
   (Look for something like `192.168.x.x`)

#### Open App:

1. On iOS device, open Safari
2. Go to: `http://[YOUR-MAC-IP]:5173/EMERGENCY/html/home.html`

---

## **Part 5: Mobile Testing Checklist**

### Geolocation Testing

- [ ] Click "See your Location"
- [ ] Allow permission popup
- [ ] Coordinates appear in location display
- [ ] Toast message shows success
- [ ] **On emulator**: Location is simulated (mock location)
- [ ] **On real device**: Location is actual GPS coordinates

### SOS Button Testing (Mobile)

- [ ] **Touch and hold** for 3 seconds (not a click, HOLD)
- [ ] Button glows red while holding
- [ ] Timer counts: 0.0s → 1.0s → 2.0s → 3.0s
- [ ] At 3 seconds, modal appears: "SOS ACTIVATED"
- [ ] Click "Confirm" → redirects to sos.html
- [ ] **Release early**: Timer stops and resets (no incident created)
- [ ] Check Firebase: new incident doc created in `incidents` collection

### Emergency Card Testing (Mobile)

- [ ] Swipe cards horizontally (should scroll smoothly)
- [ ] Tap **"I am INJURED"** → creates incident, redirects
- [ ] Tap **"FIRE"** → creates incident, redirects
- [ ] Tap **"CRIME"** → creates incident, redirects
- [ ] Tap **"ACCIDENT"** → creates incident, redirects
- [ ] Check Firebase: each incident has correct type

### Navigation Testing (Mobile)

- [ ] Tap home icon (house) → stays on home
- [ ] Tap history icon (clock) → redirects to history.html
- [ ] Tap contacts icon (address book) → redirects to contact.html
- [ ] Tap settings icon (gear) → redirects to settings.html
- [ ] Active nav item has yellow background
- [ ] Bottom nav is always visible and responsive

### UI Responsiveness

- [ ] Phone frame fits screen without scrolling (height: 620px)
- [ ] No elements cut off
- [ ] Text is readable
- [ ] Buttons are easy to tap (min 44px touch target)
- [ ] No horizontal scroll on phone frame
- [ ] Landscape mode works (optional)

---

## **Part 6: Check Firebase Data**

### Verify Incidents Were Created:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select `student-emergency-web-app` project
3. Go to **Firestore Database**
4. Click on **incidents** collection
5. You should see documents like:

```json
{
  "userId": "abc123...",
  "type": "sos",
  "status": "active",
  "location": {
    "lat": 14.5995,
    "lng": 120.9842,
    "accuracy": 15.5,
    "timestamp": "2026-04-20T10:30:00Z"
  },
  "createdAt": "2026-04-20T10:30:00Z",
  "updatedAt": "2026-04-20T10:30:00Z"
}
```

### Success Indicators:

- ✅ New document created for each incident
- ✅ `userId` is populated (requires user login)
- ✅ `location` has real coordinates
- ✅ `type` matches the emergency type
- ✅ `status` is "active"
- ✅ Timestamps are populated

---

## **Part 7: Test Authentication (Optional)**

### Setup Google Login:

1. In Firebase Console → **Authentication** → **Settings** (gear icon)
2. Under **Authorized Domains**, add:
   - `localhost` (dev testing)
   - Your actual domain (production)

### Test Flow:

1. On home page, click **"Login using your PLP Account"**
2. Click "Sign in with Google"
3. Select or create a test Google account
4. After login, user email should display in top bar
5. Now SOS button and cards should work (they require login)

---

## **Part 8: Troubleshooting**

### Issue: "Location not available" on mobile

**Solution**:

- Check that location is enabled on device
- Grant location permission to browser
- If emulator, set a mock location in emulator settings

### Issue: "Firebase config is undefined"

**Solution**:

- Ensure `.env` file exists and is in project root
- Verify all `VITE_FIREBASE_*` variables are present
- Stop dev server and restart: `npm run dev`

### Issue: "Geolocation popup doesn't appear"

**Solution**:

- Chrome requires HTTPS or localhost for geolocation
- Dev server runs on `localhost:5173` (OK)
- If using emulator, allow permissions in emulator settings

### Issue: "Incident not created in Firestore"

**Solution**:

- Check Firestore rules (see Part 1, step 6)
- Check browser console for errors (F12 → Console)
- Ensure user is logged in before triggering SOS
- Check Network tab to see API calls

### Issue: "SOS button doesn't respond to touch"

**Solution**:

- Mobile browsers may need `touch-action: none;` CSS
- Use **long press** (3+ seconds), not a quick tap
- Try a different browser (Chrome, Firefox, Safari)

---

## **Part 9: Performance & Best Practices**

### Monitor Network:

1. Open Dev Tools: F12 → Network tab
2. Trigger SOS button
3. Look for API calls to `firestore.googleapis.com`
4. Response time should be < 1 second

### Monitor Console:

1. Open Dev Tools: F12 → Console tab
2. Check for red errors
3. Look for location and incident logs
4. No "undefined" or reference errors

### Performance Metrics:

- Page load: < 3 seconds
- Geolocation response: < 10 seconds (on real device)
- SOS trigger: < 2 seconds to create incident
- Navigation between pages: < 1 second

---

## **Part 10: Before Pushing to Production**

- [ ] Test on at least 2 real mobile devices
- [ ] Test on both Android and iOS (if possible)
- [ ] Rotate Firebase API key (secret is now exposed)
- [ ] Enable Firestore backup & recovery
- [ ] Set up Firebase monitoring & alerts
- [ ] Test offline mode (disable WiFi/mobile data)
- [ ] Test with poor network (DevTools → Network → Slow 3G)
- [ ] Create privacy policy for location data
- [ ] Test push notifications (Firebase Cloud Messaging)

---

## **Quick Command Reference**

```powershell
# Start dev server
npm run dev

# Build for production
npm build

# Port forward for mobile (Android)
adb reverse tcp:5173 tcp:5173

# View Firebase logs
firebase functions:log

# Deploy (when ready)
firebase deploy
```

---

## **Questions?**

Check console logs:

```javascript
// In browser DevTools → Console
console.log(currentLocation); // Current location
console.log(currentUser); // Current user
console.log("Test message"); // Debug logs
```

Good luck! 🚀
