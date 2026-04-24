# Quick Mobile Testing Checklist

## Prerequisites (Do Once)

- [ ] Firebase Firestore: Create `incidents` collection
- [ ] Firebase Firestore: Create `users` collection
- [ ] Firebase Authentication: Enable Google & Email/Password
- [ ] Update Firestore Security Rules (see MOBILE_TESTING_GUIDE.md)
- [ ] `.env` file in project root with all VITE*FIREBASE*\* vars
- [ ] Run `npm run dev` and keep terminal open

---

## Desktop Browser Testing

```bash
npm run dev
# Open: http://localhost:5173/EMERGENCY/html/home.html
```

| Feature           | Action                    | Expected Result                  | Status |
| ----------------- | ------------------------- | -------------------------------- | ------ |
| **Location**      | Click "See your Location" | Toast shows coordinates          | ☐      |
| **SOS Button**    | Hold 3 seconds            | Modal appears "SOS ACTIVATED"    | ☐      |
| **SOS Cancel**    | Release after 1 sec       | Timer stops, no incident created | ☐      |
| **Injury Card**   | Click "I am INJURED"      | Redirects to emergency.html      | ☐      |
| **Fire Card**     | Click "FIRE"              | Redirects to emergency.html      | ☐      |
| **Crime Card**    | Click "CRIME"             | Redirects to emergency.html      | ☐      |
| **Accident Card** | Click "ACCIDENT"          | Redirects to emergency.html      | ☐      |
| **Home Nav**      | Click house icon          | Stays on home page               | ☐      |
| **History Nav**   | Click clock icon          | Redirects to history.html        | ☐      |
| **Contact Nav**   | Click address book        | Redirects to contact.html        | ☐      |
| **Settings Nav**  | Click gear icon           | Redirects to settings.html       | ☐      |

**Firebase Check**: Go to Firestore Console → `incidents` → Should see new docs for each test

---

## Android Mobile Testing

### Setup (Do Once)

```bash
# Enable Developer Mode on Android phone
# Settings → About Phone → tap Build Number 7 times
# Settings → Developer Options → Enable USB Debugging

# Connect via USB cable, then:
adb devices              # Should show device
adb reverse tcp:5173 tcp:5173
```

### Testing

| Feature            | Action                                                        | Expected Result                       | Status |
| ------------------ | ------------------------------------------------------------- | ------------------------------------- | ------ |
| **Page Load**      | Open browser → http://localhost:5173/EMERGENCY/html/home.html | Phone frame visible, no errors        | ☐      |
| **Location**       | Click "See your Location" → Allow permission                  | Coordinates appear in ~5 sec          | ☐      |
| **SOS Touch Hold** | **Long press** (3+ sec) SOS button                            | Button glows, modal appears           | ☐      |
| **SOS Release**    | Release after 2 seconds                                       | No modal, incident NOT created        | ☐      |
| **Card Swipe**     | Swipe cards horizontally                                      | Cards scroll smoothly                 | ☐      |
| **Injury Tap**     | Tap "I am INJURED"                                            | Location captured, redirects          | ☐      |
| **Fire Tap**       | Tap "FIRE"                                                    | Location captured, redirects          | ☐      |
| **Crime Tap**      | Tap "CRIME"                                                   | Location captured, redirects          | ☐      |
| **Accident Tap**   | Tap "ACCIDENT"                                                | Location captured, redirects          | ☐      |
| **Nav Buttons**    | Tap each nav icon                                             | Active state updates, no lag          | ☐      |
| **Screen Fit**     | Rotate device                                                 | Phone frame stays centered, no cutoff | ☐      |

**Firebase Check**: Firestore Console → `incidents` → Real GPS coordinates should appear

---

## Android Emulator Testing

### Setup (Do Once)

```bash
# Android Studio → Device Manager → Create Pixel 6 emulator
# Start emulator (takes 30-60 sec)
# In terminal:
adb reverse tcp:5173 tcp:5173
```

### Testing

Same as Android Mobile Testing above
**Note**: Location will be mock (default San Francisco)

---

## iOS Testing (if available)

### Setup

```bash
# On Mac:
# Find Mac IP: ifconfig | grep inet
# Example: 192.168.1.100

# On iOS: Safari → http://192.168.1.100:5173/EMERGENCY/html/home.html
```

### Testing

Same as Android Mobile Testing above
**Note**: Request geolocation permission from Safari

---

## Troubleshooting Quick Fixes

| Issue                           | Fix                                                     |
| ------------------------------- | ------------------------------------------------------- |
| "localhost refused to connect"  | Check `npm run dev` is running, try `adb reverse` again |
| No geolocation permission popup | Try different browser (Chrome, Firefox, Safari)         |
| Location shows 0, 0             | Allow location permission in browser settings           |
| SOS doesn't trigger on 3 sec    | Use **long press**, not a tap                           |
| Firebase data not appearing     | Check Firestore Rules and that user is logged in        |
| Page loads blank                | Check browser console (F12) for errors                  |
| API key error                   | Verify `.env` has all VITE*FIREBASE*\* variables        |

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Port forward Android
adb reverse tcp:5173 tcp:5173

# Check adb devices
adb devices

# View phone logs
adb logcat

# Clear local data
adb shell pm clear com.android.chrome
```

---

## Final Sign-Off

- [ ] All desktop tests passed
- [ ] All mobile tests passed
- [ ] Firestore incidents recorded correctly
- [ ] Location coordinates are real (not 0,0)
- [ ] No errors in console (F12 → Console tab)
- [ ] No "undefined" errors
- [ ] Ready to share with team!
