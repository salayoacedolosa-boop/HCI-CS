# Capacitor Quick Start - Build Android APK

## One-Time Setup ✅ COMPLETE

- ✅ Installed Capacitor packages
- ✅ Initialized Capacitor config
- ✅ Added Android platform (`android/` folder created)
- ✅ Added npm scripts for easy building

---

## Build & Run (3 Easy Steps)

### Step 1: Build Web Assets
```powershell
npm run build
```
Creates optimized files in `dist/` folder

### Step 2: Sync to Android
```powershell
npx cap sync android
```
Copies `dist/` to Android native project

### Step 3: Build APK or Run Directly

**Option A: Build APK (Install Manually Later)**
```powershell
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

**Option B: Build & Run Directly on Device** (Easiest)
```powershell
npm run android:run
```
Requires USB connection and Android Studio

### Step 4: Install & Test
```powershell
# If you built APK manually:
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Open app console to see logs (F12 in Chrome)
```

---

## Shortcuts

```powershell
# Build web + sync android (do this every time you change code)
npm run build:android

# Open Android Studio to manage emulator/device
npm run android:open

# Build + sync + run on device in one command
npm run android:run
```

---

## Prerequisites Before Building

- [ ] Android Studio installed
- [ ] Android device connected OR emulator running
- [ ] USB Debugging enabled (on real device)

---

## File Locations

| What | Where |
|------|-------|
| Web source code | `EMERGENCY/html/`, `EMERGENCY/css/`, `EMERGENCY/api/` |
| Built web files | `dist/` (after `npm run build`) |
| Android project | `android/` (do NOT edit directly) |
| App config | `capacitor.config.json` |
| Android APK | `android/app/build/outputs/apk/debug/app-debug.apk` |

---

## Troubleshooting

**"No dist folder"** → Run `npm run build`

**"Android SDK not found"** → Install Android Studio

**"USB device not recognized"** → 
1. Enable USB Debugging on phone
2. Run `adb devices` to verify

**"Gradle sync failed"** → 
```powershell
cd android
./gradlew clean
```

---

## For Full Details

Read [CAPACITOR_SETUP_GUIDE.md](CAPACITOR_SETUP_GUIDE.md) for:
- Release builds
- Google Play Store submission
- Plugin setup (camera, notifications, etc.)
- All troubleshooting
- Command reference

---

## Next: Your First Build

1. Connect Android device via USB (or open emulator)
2. Run this:
```powershell
npm run android:run
```
3. Wait 5-10 minutes for first build
4. App launches on device automatically
5. Open browser console (F12) to see logs

Good luck! 🚀

