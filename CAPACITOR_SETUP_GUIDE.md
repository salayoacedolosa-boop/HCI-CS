# Capacitor Setup & Android Build Guide

## ✅ What's Been Set Up

Capacitor is now configured with:
- **App Name**: PLP Emergency Response
- **Package ID**: com.company.sers
- **Platform**: Android (iOS can be added later on Mac)
- **Config File**: `capacitor.config.json`
- **Android Project**: `android/` folder (native Android project)

---

## 📋 Prerequisites

Before building the APK, you need:

### 1. Android Studio
- Download: https://developer.android.com/studio
- Install on your computer
- Takes ~5GB space

### 2. Java Development Kit (JDK)
- Android Studio includes JDK 17
- Or download separately: https://www.oracle.com/java/technologies/downloads/

### 3. Android SDK
- Comes with Android Studio
- Ensure you have:
  - Android SDK 34+ (latest)
  - Android Gradle Plugin 8.0+

### 4. Gradle
- Comes with Android Studio
- No separate installation needed

---

## 🚀 Build & Run Workflow

### Step 1: Build Web Assets (Required First)
```powershell
cd C:\Users\USER\Documents\HCI-CS
npm run build
```

**Output**: Creates `dist/` folder with optimized assets
- Minified HTML, CSS, JS
- Firebase config injected
- ~500KB total size

### Step 2: Sync Web Assets to Android
```powershell
npx cap sync android
```

**What it does**:
- Copies `dist/` to `android/app/src/main/assets/public/`
- Updates native Android config
- Downloads any new plugins

### Step 3: Build Android APK
```powershell
cd android
./gradlew assembleDebug
```

**Output**: `android/app/build/outputs/apk/debug/app-debug.apk`
- Debug APK (for testing, ~10MB)
- Signed with debug key (auto-generated)
- Takes 2-5 minutes first time

**Or build Release APK**:
```powershell
./gradlew assembleRelease
```
- Production APK
- Requires signing key (see "Release Build" section below)
- Smaller file size (~8MB)

### Step 4: Install on Android Device
```powershell
# Connect device via USB and enable USB Debugging

adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Or use Android Studio**:
1. Open `android/` folder in Android Studio
2. Click **Run** button (green play icon)
3. Select your device
4. App installs and launches automatically

---

## 🔧 Full Development Workflow (Easiest)

### Quick Commands (Copy & Paste)

```powershell
# 1. Make changes to HTML/CSS/JS
# (Edit files in EMERGENCY/ folder)

# 2. Build and sync (one command for both)
npm run build && npx cap sync android

# 3. Open in Android Studio and run
# OR install via ADB:
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 4. Test on device
# (App is now on your phone)
```

---

## 📱 Testing the Android App

### On Real Device

#### Step 1: Enable USB Debugging
1. Connect Android phone via USB cable
2. Open **Settings** → **About Phone**
3. Tap **Build Number** 7 times until "Developer mode" unlocked
4. Go back to **Settings** → **Developer Options**
5. Enable **USB Debugging**
6. Allow USB debugging when prompted on phone

#### Step 2: Verify Connection
```powershell
adb devices
```

You should see:
```
List of attached devices
emulator-5554          device
```
(or your actual device serial number)

#### Step 3: Install APK
```powershell
# After building
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

#### Step 4: Launch App
```powershell
adb shell am start -n com.company.sers/.MainActivity
```

Or just tap the app icon on your phone (it's now installed)

---

### On Android Emulator

#### Step 1: Create Emulator
1. Open Android Studio
2. **Device Manager** (right sidebar)
3. Click **Create Device**
4. Choose **Pixel 6** (or latest)
5. Select **API 34** (latest Android)
6. Click **Finish**

#### Step 2: Start Emulator
```powershell
emulator -avd Pixel_6_API_34
```

Or use Android Studio → Device Manager → **Run** button

#### Step 3: Install APK
Same as real device:
```powershell
adb install android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.company.sers/.MainActivity
```

---

## 📂 Project Structure After Setup

```
HCI-CS/
├── android/                          ← Native Android project
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/com/company/sers/
│   │   │       │   └── MainActivity.java
│   │   │       ├── assets/public/    ← Web files copied here
│   │   │       └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── gradle/
│   ├── settings.gradle
│   └── build.gradle
├── dist/                             ← Built web assets (after npm run build)
├── EMERGENCY/                        ← Source HTML/CSS/JS
├── node_modules/
├── capacitor.config.json             ← Capacitor config
├── package.json
└── vite.config.js
```

---

## ⚙️ Capacitor Configuration

The `capacitor.config.json` controls app behavior:

```json
{
  "appId": "com.company.sers",
  "appName": "PLP Emergency Response",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  }
}
```

### Key Settings:
- **appId**: Unique identifier on Google Play Store
- **appName**: Display name on phone
- **webDir**: Points to Vite build output
- **androidScheme**: Use HTTPS for security

---

## 🔐 Release Build (For Google Play Store)

### Step 1: Generate Signing Key
```powershell
cd android
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias release
```

You'll be prompted for:
- Password (remember this!)
- First/Last Name
- Organization
- City, State, Country

This creates `android/release.keystore` (keep it safe!)

### Step 2: Configure Gradle Signing
Edit `android/app/build.gradle`, find `android { }` block, add:

```gradle
signingConfigs {
  release {
    storeFile file('/path/to/release.keystore')
    storePassword 'your_password'
    keyAlias 'release'
    keyPassword 'your_password'
  }
}

buildTypes {
  release {
    signingConfig signingConfigs.release
    minifyEnabled true
  }
}
```

### Step 3: Build Release APK
```powershell
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

This can be uploaded to Google Play Store.

---

## 🐛 Troubleshooting

### Issue: "No dist folder"
**Solution**: Run `npm run build` first
```powershell
npm run build
npx cap sync android
```

### Issue: "Android SDK not found"
**Solution**: 
1. Open Android Studio
2. Go to **Settings** → **Languages & Frameworks** → **Android SDK**
3. Ensure SDK is installed
4. Set `ANDROID_HOME` environment variable:
```powershell
$env:ANDROID_HOME = "C:\Users\YOU\AppData\Local\Android\Sdk"
```

### Issue: "Gradle sync failed"
**Solution**: 
```powershell
cd android
./gradlew clean
./gradlew build
```

### Issue: "App won't start on device"
**Check logs**:
```powershell
adb logcat | grep -i "com.company.sers"
```

**Check device browser console** (if app opens):
- Press F12 in Chrome DevTools
- Look for errors

### Issue: "Location permission denied"
**Solution**: 
1. Go to device **Settings** → **Apps** → **PLP Emergency Response**
2. **Permissions** → Enable **Location**

### Issue: ".gradle not found"
**Solution**: Gradle downloads automatically on first build
- First run takes 5-10 minutes
- Requires internet connection
- Do not interrupt the build

---

## 📊 Build Times

| Command | Time | Notes |
|---------|------|-------|
| `npm run build` | 10-15s | Vite bundles web assets |
| `npx cap sync` | 5-10s | Copies files to Android |
| `./gradlew assembleDebug` | 2-5 min | First time, subsequent 30s |
| `./gradlew assembleRelease` | 3-7 min | Includes minification |
| Total first build | 10-20 min | All steps |
| Incremental rebuild | 1-2 min | After small changes |

---

## 📱 App Features on Android

✅ **Working**:
- Geolocation (real GPS on device)
- Firebase sync (real incidents saved)
- SOS button (touch-and-hold)
- Emergency cards (create incidents)
- Bottom navigation (page routing)
- Toast notifications (user feedback)

⚠️ **May Need Extra Setup**:
- Push notifications (Firebase Cloud Messaging plugin)
- Camera (add @capacitor/camera plugin)
- Contacts (add @capacitor/contacts plugin)

---

## 🔄 Update Workflow

**When you make changes to web code:**

```powershell
# 1. Edit files in EMERGENCY/ folder
# (Do NOT edit android/ folder - it's auto-generated)

# 2. Rebuild and sync
npm run build
npx cap sync android

# 3. Reinstall on device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 4. Test on device
```

---

## 📚 Useful Commands

```powershell
# Capacitor
npx cap add ios                    # Add iOS support (Mac only)
npx cap sync                       # Sync to all platforms
npx cap open android              # Open Android Studio
npx cap run android               # Build & deploy directly

# Gradle (Android)
cd android
./gradlew clean                   # Clean build artifacts
./gradlew build                   # Full build
./gradlew tasks                   # List all available tasks

# ADB (Android Debug Bridge)
adb devices                       # List connected devices
adb install app.apk              # Install APK
adb uninstall com.company.sers   # Uninstall app
adb shell am start -n com.company.sers/.MainActivity  # Launch app
adb logcat                        # View device logs
adb reverse tcp:5173 tcp:5173    # Port forward for dev server
```

---

## ✨ Next Steps

1. **Test on Android device** (see "Testing the Android App" section)
2. **Add other Capacitor plugins**:
   - Firebase Push Notifications
   - Camera for evidence photos
   - Contacts for emergency contacts
3. **Build release APK** when ready for production
4. **Submit to Google Play Store** (requires developer account)

---

## 📖 Official Docs

- Capacitor: https://capacitorjs.com/
- Android Development: https://developer.android.com/
- Gradle: https://gradle.org/
- Firebase + Capacitor: https://firebase.google.com/docs/app-check/custom-resource-claims

Good luck! 🚀

