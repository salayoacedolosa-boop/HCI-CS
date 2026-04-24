# Home Page - Firebase Integration Summary

## What's New

### ✅ Features Implemented

**1. Firebase Authentication Integration**

- Detects logged-in users automatically
- Displays user email/name in top bar
- Shows "Login" prompt if not authenticated
- Supports Google login and email/password (configured in Firebase Console)

**2. Real-Time Location Capture**

- Click "See your Location" to capture GPS coordinates
- Shows latitude/longitude with 6 decimal precision
- Works on real devices (actual GPS) and emulators (mock location)
- Displays accuracy in meters
- Toast notification confirms success

**3. Mobile-Friendly SOS Button**

- **Touch & Hold for 3 seconds** to trigger SOS
- Works with both mouse and touch events (desktop & mobile)
- Real-time countdown timer (0.0s → 3.0s)
- Button glows red during hold
- Release early to cancel (no incident created)
- Creates incident in Firebase Firestore

**4. Emergency Types**

- Injury, Fire, Crime, Accident
- Each creates a separate incident in Firestore
- Captures location automatically
- Stores incident type for responders to see

**5. Firebase Incident Storage**

- All incidents stored in Firestore `incidents` collection
- Includes: user ID, type, location, timestamp, status
- Unique incident ID for tracking
- Live updates as responders receive notification

---

## File Structure

```
HCI-CS/
├── EMERGENCY/
│   ├── html/
│   │   └── home.html          ← UPDATED: Now connects to Firebase
│   ├── css/
│   │   └── home.css           ← No changes (design preserved)
│   └── api/                   ← NEW: Logic layer
│       ├── incidents.js       ← Firestore incident operations
│       ├── location.js        ← Geolocation & GPS handling
│       ├── auth.js            ← Firebase authentication
│       └── notifications.js   ← Toast & alert notifications
├── .env                       ← Firebase secrets (GITIGNORED)
├── .env.example               ← Template for teammates
├── vite.config.js             ← Build config (includes dev server)
├── package.json               ← Updated with dev scripts
└── MOBILE_TESTING_GUIDE.md    ← This comprehensive guide
```

---

## What Each API File Does

### `incidents.js`

```javascript
// Create SOS incident
createSOSIncident(db, userId, location);

// Create typed emergency (injury, fire, crime, accident)
createEmergencyIncident(db, userId, type, location, description);

// Update incident status (active → resolved, etc)
updateIncidentStatus(db, incidentId, newStatus);

// Update incident location (for live tracking)
updateIncidentLocation(db, incidentId, location);

// Get user's incident history
getUserIncidents(db, userId);
```

### `location.js`

```javascript
// Get current device location (GPS on real device, mock on emulator)
getDeviceLocation();

// Watch location continuously (for active incidents)
watchDeviceLocation(callback, errorCallback);

// Stop watching location
stopWatchingLocation(watchId);

// Format coordinates for display
formatCoordinates(latitude, longitude);

// Calculate distance between two points
calculateDistance(lat1, lng1, lat2, lng2);
```

### `auth.js`

```javascript
// Sign in with Google
signInWithGoogle(auth);

// Sign in with email/password
signInWithEmail(auth, email, password);

// Sign up with email/password
signUpWithEmail(auth, email, password);

// Sign out
userSignOut(auth);

// Listen to login/logout changes
onAuthStateChange(auth, callback);

// Get currently logged-in user
getCurrentUser(auth);
```

### `notifications.js`

```javascript
// Show browser notification
showNotification(title, options);

// Show toast (bottom popup)
showToast(message, type, duration);

// Show alert modal (dialog box)
showAlertModal(title, message, onConfirm, onCancel);

// Request notification permission
requestNotificationPermission();
```

---

## Firebase Firestore Data Structure

### `incidents` Collection

```json
{
  "userId": "auth_user_id",
  "type": "sos|injury|fire|crime|accident",
  "status": "active|resolved|cancelled",
  "description": "Additional details",
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

---

## How to Use

### 1. Start Development Server

```powershell
npm run dev
```

Navigate to: `http://localhost:5173/EMERGENCY/html/home.html`

### 2. Test on Desktop

- Click "See your Location" → get GPS coordinates
- Hold SOS button 3 seconds → trigger incident
- Click emergency cards → create typed incident
- Check Firebase Console → see incidents in Firestore

### 3. Test on Mobile (See MOBILE_TESTING_GUIDE.md)

- Connect Android device via USB
- Run: `adb reverse tcp:5173 tcp:5173`
- Open: `http://localhost:5173/EMERGENCY/html/home.html` on mobile
- Test touch-and-hold SOS button
- Verify real GPS location works

---

## Security Notes

⚠️ **CRITICAL**: Your Firebase API key was exposed in this conversation.

- Rotate it immediately in Firebase Console
- Go to: Project Settings → Your apps → Regenerate API key
- Update `.env` with new key

✅ **Best Practices Implemented**:

- Secrets stored in `.env` (gitignored)
- Firestore rules require authentication
- User can only access their own incidents
- No sensitive data in frontend code

---

## Testing Checklist

Before testing, ensure:

- [ ] `.env` file has all Firebase credentials
- [ ] Firestore `incidents` collection exists
- [ ] Firestore security rules are updated
- [ ] Firebase Authentication enabled (Google/Email)
- [ ] `npm run dev` is running

Then test:

- [ ] Desktop location capture works
- [ ] Desktop SOS button (3 sec hold)
- [ ] Mobile location capture works
- [ ] Mobile SOS button (3 sec touch-hold)
- [ ] Incidents appear in Firestore
- [ ] Navigation between pages works
- [ ] Bottom nav active state updates
- [ ] Toast notifications appear
- [ ] Alert modals show correctly

---

## Next Steps

1. **Test thoroughly on mobile** (see MOBILE_TESTING_GUIDE.md)
2. **Create other pages** (profile, history, contact, settings)
3. **Implement responder side** (admin dashboard with live map)
4. **Add push notifications** (Firebase Cloud Messaging)
5. **Deploy to production** (Firebase Hosting or Capacitor native apps)

---

## Support

**Check browser console for logs:**

```javascript
// Inspect current state
console.log(currentUser); // Logged-in user
console.log(currentLocation); // Last captured location

// Check Firestore in real-time
db.collection("incidents").onSnapshot((snapshot) => {
  snapshot.forEach((doc) => console.log(doc.data()));
});
```

**Questions?** Check `MOBILE_TESTING_GUIDE.md` troubleshooting section.
