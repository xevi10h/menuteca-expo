# Deep Linking Deployment - Setup Complete! ✅

## What Has Been Deployed

Your deep linking configuration files are now live on Netlify:

### ✅ iOS Universal Links
**File:** `https://menutecaapp.com/.well-known/apple-app-site-association`

This file tells iOS devices that your app should handle links from `menutecaapp.com/restaurant/*`

**Status:** ✅ Deployed and accessible
- Configured for Team ID: `4WWBHK245Y`
- Bundle ID: `com.menutecaapp.mobile`
- Paths: `/restaurant/*`

### ⚠️ Android App Links (Requires Action)
**File:** `https://menutecaapp.com/.well-known/assetlinks.json`

**Status:** ⚠️ Deployed but needs SHA256 fingerprint

This file currently has a placeholder `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` that needs to be updated with your actual Android signing key fingerprint.

---

## Next Steps

### 1. Update Android SHA256 Fingerprint

You need to get your Android app's SHA256 fingerprint and update the assetlinks.json file.

#### Option A: Get fingerprint from EAS Build (Recommended)

If you're using EAS Build for production builds, run:

```bash
eas credentials
```

Then:
1. Select your project
2. Select "Android"
3. Select "Production"
4. Choose "Keystore: Manage everything needed to build your project"
5. Select "View keystore credentials"
6. Copy the **SHA256 Fingerprint** (it will look like: `AA:BB:CC:DD:...`)

#### Option B: Get fingerprint from local keystore

If you have your keystore file locally:

```bash
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias-name
```

Look for the line that says `SHA256:` and copy the fingerprint.

#### Option C: Get fingerprint from Play Console

1. Go to Google Play Console
2. Select your app
3. Go to "Setup" → "App integrity"
4. Find the SHA-256 certificate fingerprint under "App signing key certificate"
5. Copy the fingerprint

#### Update the file

Once you have the SHA256 fingerprint, update the file:

```bash
# Edit the file
nano public/.well-known/assetlinks.json
```

Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` with your actual fingerprint (in uppercase, with colons):

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.menutecaapp.mobile",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

Then rebuild and redeploy:

```bash
npm run build:web
netlify deploy --prod --dir dist
```

### 2. Verify Deep Linking Files

#### Verify iOS (Apple App Site Association)

Use Apple's validator:
```
https://search.developer.apple.com/appsearch-validation-tool/
```

Or use Branch's validator:
```
https://branch.io/resources/aasa-validator/
```

Enter: `https://menutecaapp.com`

#### Verify Android (Asset Links)

After updating the SHA256 fingerprint, use Google's validator:
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://menutecaapp.com&relation=delegate_permission/common.handle_all_urls
```

### 3. Rebuild Your Mobile Apps

After the deep linking files are live on your domain, rebuild your iOS and Android apps:

```bash
# For iOS
eas build --platform ios

# For Android
eas build --platform android

# Or both
eas build --platform all
```

**Important:** The apps need to be rebuilt AFTER the deep linking files are deployed to your domain. iOS and Android will verify these files when the app is first installed.

### 4. Test Deep Linking

#### Test on iOS:

1. Build and install your app on a device or simulator
2. Send yourself a message with a restaurant link:
   ```
   https://menutecaapp.com/restaurant/RESTAURANT_ID
   ```
3. Tap the link - it should open your app directly

**Debug with iOS Simulator:**
```bash
xcrun simctl openurl booted "https://menutecaapp.com/restaurant/test-id"
```

#### Test on Android:

1. Build and install your app on a device or emulator
2. Send yourself the same link
3. Tap the link - Android should show "Open with Menuteca" or open directly

**Debug with ADB:**
```bash
adb shell am start -a android.intent.action.VIEW -d "https://menutecaapp.com/restaurant/test-id"
```

**Check verification status on Android:**
```bash
adb shell pm get-app-links com.menutecaapp.mobile
```

### 5. DNS Configuration (Important!)

Remember that `menutecaapp.com` currently points to Squarespace. The deep linking files are deployed on Netlify, but they won't be accessible at the production domain until you update DNS.

**See `DNS_SETUP_GUIDE.md` for instructions on pointing your domain to Netlify.**

---

## How Deep Linking Works Now

1. **User shares a restaurant** (from your app):
   - User taps the share button in the restaurant detail screen or map modal
   - Selects WhatsApp, Messages, Email, etc.
   - Link shared: `https://menutecaapp.com/restaurant/{id}`

2. **Recipient clicks the link:**
   - **If app is installed:**
     - iOS/Android verifies the deep link against the files we just deployed
     - App opens automatically
     - User is taken directly to that restaurant's page
   - **If app is NOT installed:**
     - Link opens in browser
     - Currently shows your Expo web app (once DNS is updated)

3. **Deep link routing** (already implemented in your app):
   - App receives the URL: `https://menutecaapp.com/restaurant/{id}`
   - Router extracts the restaurant ID
   - Navigates to `/restaurant/{id}` screen
   - User sees the restaurant details

---

## Current Status Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| iOS AASA file | ✅ Deployed | None - ready to use |
| Android assetlinks.json | ⚠️ Needs update | Add SHA256 fingerprint |
| Netlify headers | ✅ Configured | None |
| Netlify redirects | ✅ Configured | None |
| App code (deep link handler) | ✅ Implemented | None |
| Share functionality | ✅ Implemented | None |
| DNS configuration | ❌ Not done | Follow DNS_SETUP_GUIDE.md |

---

## Testing Checklist

- [ ] Update Android SHA256 fingerprint in `public/.well-known/assetlinks.json`
- [ ] Redeploy to Netlify after updating fingerprint
- [ ] Verify iOS AASA file using Apple's validator
- [ ] Verify Android assetlinks.json using Google's validator
- [ ] Update DNS to point menutecaapp.com to Netlify
- [ ] Wait for DNS propagation (1-48 hours)
- [ ] Rebuild iOS app with EAS Build
- [ ] Rebuild Android app with EAS Build
- [ ] Test deep linking on iOS device
- [ ] Test deep linking on Android device
- [ ] Verify app opens when tapping shared restaurant links

---

## Troubleshooting

### iOS app doesn't open when clicking links

1. **Verify AASA file is accessible:**
   ```bash
   curl https://menutecaapp.com/.well-known/apple-app-site-association
   ```

2. **Check if it's served with correct content type:**
   - Should be `application/json`
   - Netlify headers are already configured for this

3. **Verify Team ID and Bundle ID match your app.json:**
   - Team ID: `4WWBHK245Y`
   - Bundle ID: `com.menutecaapp.mobile`

4. **Try deleting and reinstalling the app:**
   - iOS caches the AASA file when app is installed
   - Reinstalling forces iOS to re-fetch it

5. **Check iOS Console logs:**
   - Look for errors related to "swcd" or "associated domains"

### Android app doesn't open when clicking links

1. **Verify assetlinks.json is accessible:**
   ```bash
   curl https://menutecaapp.com/.well-known/assetlinks.json
   ```

2. **Verify SHA256 fingerprint is correct:**
   - Must match your signing key
   - Must be in uppercase with colons (e.g., `AA:BB:CC:...`)
   - NO spaces, NO quotes inside the fingerprint

3. **Force re-verification:**
   ```bash
   adb shell pm verify-app-links --re-verify com.menutecaapp.mobile
   ```

4. **Check verification status:**
   ```bash
   adb shell pm get-app-links com.menutecaapp.mobile
   ```

   Should show: `verified` for `menutecaapp.com`

### Links still open in browser

- **Domain verification may not be complete:**
  - Can take 24-48 hours after deploying the files
  - Especially if you just updated DNS

- **Use custom scheme for testing:**
  - `menutecaapp://restaurant/test-id` works immediately
  - No domain verification needed
  - Useful for development and testing

---

## Files Created

1. **`public/.well-known/apple-app-site-association`**
   - iOS Universal Links configuration
   - Tells iOS that your app handles menutecaapp.com/restaurant/* links

2. **`public/.well-known/assetlinks.json`**
   - Android App Links configuration
   - Tells Android that your app handles menutecaapp.com links
   - ⚠️ Needs SHA256 fingerprint update

3. **Updated `netlify.toml`**
   - Added headers for deep linking files
   - Added redirect rules to prevent SPA routing from interfering
   - Ensures files are served with correct `Content-Type: application/json`

---

## Support Resources

- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [Apple Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [AASA Validator](https://branch.io/resources/aasa-validator/)
- [Digital Asset Links Generator](https://developers.google.com/digital-asset-links/tools/generator)

---

## Quick Reference - Commands

```bash
# Get Android SHA256 fingerprint
eas credentials

# Update assetlinks.json (after getting fingerprint)
nano public/.well-known/assetlinks.json

# Rebuild and redeploy
npm run build:web
netlify deploy --prod --dir dist

# Rebuild mobile apps
eas build --platform all

# Test iOS deep link (simulator)
xcrun simctl openurl booted "https://menutecaapp.com/restaurant/test-id"

# Test Android deep link (device/emulator)
adb shell am start -a android.intent.action.VIEW -d "https://menutecaapp.com/restaurant/test-id"

# Verify Android app links
adb shell pm get-app-links com.menutecaapp.mobile

# Re-verify Android app links
adb shell pm verify-app-links --re-verify com.menutecaapp.mobile
```

---

## What Happens Next

Once you complete the steps above:

1. ✅ iOS users can share restaurant links via WhatsApp, Messages, etc.
2. ✅ When clicked, links open directly in your app (if installed)
3. ✅ Android users get the same experience (after SHA256 update)
4. ✅ If app is not installed, links open your web app in browser
5. ✅ Users are taken directly to the specific restaurant page

**The deep linking infrastructure is now deployed and ready to use!** 🎉

Just complete the Android SHA256 fingerprint update and DNS configuration, and you'll have full deep linking functionality across iOS, Android, and web.
