# 🎯 Quick Build Commands

## Prerequisites
```powershell
# Install EAS CLI (one-time)
npm install -g eas-cli

# Login to Expo (one-time)
eas login
```

## Navigate to Project
```powershell
cd e:\Programming\app\blood-bridge
```

## Build Commands

### 📱 Android APK (Recommended for Testing)
```powershell
eas build --platform android --profile preview
```
- Direct install on device
- No Google Play needed
- ~5-10 minutes build time
- Download link provided after build

### 📦 Android AAB (Google Play Store)
```powershell
eas build --platform android --profile production
```
- For Play Store submission
- Optimized bundle size
- ~5-10 minutes build time

### 🍎 iOS (Requires Apple Developer Account)
```powershell
eas build --platform ios --profile production
```
- $99/year Apple Developer account required
- ~10-15 minutes build time

## Check Build Status
```powershell
eas build:list
```

## Download Build Locally
```powershell
eas build:download
```

## Local Development
```powershell
# Terminal 1: Backend
cd e:\Programming\app\BloodBridge\blood_bridge_backend
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Frontend
cd e:\Programming\app\blood-bridge
npx expo start
```

## Configuration Files
- `app.json` - App metadata (name, version, icons)
- `eas.json` - Build profiles
- `src/config.js` - API URL configuration

## Important
- Backend IP: `192.168.0.101:8000`
- Version: `1.0.0`
- Package: `com.emon3234.bloodbridge`
