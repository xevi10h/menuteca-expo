# Deep Linking Setup Guide for Menuteca

## Overview
Deep linking has been implemented to allow users to share restaurant links that open directly in the app. When users click on a shared link like `https://menutecaapp.com/restaurant/{id}`, it will open the app and navigate to that specific restaurant.

## Code Changes Completed ✅

1. **Utility Functions** (`shared/functions/utils.ts`)
   - `generateRestaurantDeepLink(restaurantId, domain)` - Generates deep link URLs
   - `generateRestaurantShareMessage(restaurantName, deepLink, language)` - Creates localized share messages

2. **Share Functionality**
   - Restaurant detail screen (`app/restaurant/[id]/index.tsx`) - Share button now functional
   - Map modal component (`components/ExpandableMapRestaurantModal.tsx`) - Share button now functional
   - Both use the native Share API to share via WhatsApp, Messages, etc.

3. **Deep Link Routing** (`app/_layout.tsx`)
   - Configured to handle incoming deep links
   - Routes users to the correct restaurant screen when clicking shared links

4. **App Configuration** (`app.json`)
   - Updated for both iOS and Android deep linking
   - Configured associated domains and intent filters

## What You Need to Do 🚀

### 1. iOS Universal Links Setup

For iOS to properly handle deep links, you need to host an Apple App Site Association (AASA) file on your domain.

**Create the file:** `https://menutecaapp.com/.well-known/apple-app-site-association`

**File content:**
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "4WWBHK245Y.com.menutecaapp.mobile",
        "paths": [
          "/restaurant/*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": [
      "4WWBHK245Y.com.menutecaapp.mobile"
    ]
  }
}
```

**Important:**
- The file must be served with `Content-Type: application/json`
- The file must be accessible via HTTPS
- No redirect should occur when accessing this file
- The file should be at the root: `https://menutecaapp.com/.well-known/apple-app-site-association`

**Also create:** `https://www.menutecaapp.com/.well-known/apple-app-site-association` (same content)

**Verify your setup:**
- Use Apple's AASA validator: https://search.developer.apple.com/appsearch-validation-tool/
- Or use: https://branch.io/resources/aasa-validator/

### 2. Android App Links Setup

For Android to verify your app links, you need to host a Digital Asset Links file.

**Create the file:** `https://menutecaapp.com/.well-known/assetlinks.json`

**File content:**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.menutecaapp.mobile",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT_HERE"
      ]
    }
  }
]
```

**To get your SHA256 fingerprint:**

For debug builds:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

For release builds (using EAS Build):
```bash
eas credentials
# Select your project
# Select Android
# Select Production
# View your keystore
# Copy the SHA256 fingerprint
```

Or directly from your keystore:
```bash
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias-name
```

**Important:**
- Replace `YOUR_SHA256_FINGERPRINT_HERE` with your actual SHA256 fingerprint (in uppercase, with colons)
- The file must be served with `Content-Type: application/json`
- The file must be accessible via HTTPS
- Also create: `https://www.menutecaapp.com/.well-known/assetlinks.json` (same content)

**Verify your setup:**
- Use Google's verification tool: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://menutecaapp.com&relation=delegate_permission/common.handle_all_urls

### 3. Web Server Configuration

Ensure your web server serves the well-known files correctly:

**Nginx example:**
```nginx
location /.well-known/apple-app-site-association {
    default_type application/json;
    add_header Access-Control-Allow-Origin *;
}

location /.well-known/assetlinks.json {
    default_type application/json;
    add_header Access-Control-Allow-Origin *;
}
```

**Apache example:**
```apache
<Files "apple-app-site-association">
    ForceType application/json
    Header set Access-Control-Allow-Origin "*"
</Files>

<Files "assetlinks.json">
    ForceType application/json
    Header set Access-Control-Allow-Origin "*"
</Files>
```

### 4. Rebuild Your App

After making these changes, you need to rebuild your app:

```bash
# For iOS
eas build --platform ios

# For Android
eas build --platform android

# Or both
eas build --platform all
```

### 5. Testing Deep Links

**Test on iOS:**
1. Send yourself an iMessage with the link: `https://menutecaapp.com/restaurant/some-restaurant-id`
2. Long press the link and select "Open in Menuteca"
3. Or tap the link - it should open in the app automatically

**Test on Android:**
1. Send yourself the link via any messaging app: `https://menutecaapp.com/restaurant/some-restaurant-id`
2. Tap the link - it should show "Open with Menuteca" or open directly in the app

**Test during development:**
```bash
# iOS (using Simulator)
xcrun simctl openurl booted "https://menutecaapp.com/restaurant/test-id"

# iOS (using device via terminal)
xcrun devicectl device info url open --device <DEVICE_ID> "https://menutecaapp.com/restaurant/test-id"

# Android (using ADB)
adb shell am start -a android.intent.action.VIEW -d "https://menutecaapp.com/restaurant/test-id"

# Test with custom scheme (works immediately without domain verification)
# iOS
xcrun simctl openurl booted "menutecaapp://restaurant/test-id"

# Android
adb shell am start -a android.intent.action.VIEW -d "menutecaapp://restaurant/test-id"
```

## How It Works

1. **User shares a restaurant:**
   - Taps the share button (share-outline icon)
   - Selects WhatsApp, Messages, or any other app
   - Link is shared: `https://menutecaapp.com/restaurant/{id}`

2. **Recipient clicks the link:**
   - iOS/Android detects the link matches your app
   - App opens automatically
   - Deep link handler in `app/_layout.tsx` processes the URL
   - User is navigated to `/restaurant/{id}` screen

3. **Fallback behavior:**
   - If app is not installed, link opens in browser (you can create a web page that encourages app download)
   - Custom scheme `menutecaapp://` can be used as backup

## Troubleshooting

### iOS not opening the app
- Verify AASA file is accessible and valid
- Check the Team ID matches: `4WWBHK245Y`
- Ensure Bundle ID is correct: `com.menutecaapp.mobile`
- Try deleting and reinstalling the app
- Check Console.app for any errors related to "swcd" or "associated domains"

### Android not opening the app
- Verify assetlinks.json is accessible and valid
- Check SHA256 fingerprint matches your signing key
- Ensure package name is correct: `com.menutecaapp.mobile`
- Run: `adb shell pm get-app-links com.menutecaapp.mobile` to check verification status
- Try: `adb shell pm verify-app-links --re-verify com.menutecaapp.mobile`

### Link opens in browser instead of app
- Domain verification may not have completed (can take 24-48 hours)
- AASA or assetlinks.json file may not be properly configured
- Try the custom scheme (`menutecaapp://`) which doesn't require verification

## Additional Resources

- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [Apple Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [AASA Validator](https://branch.io/resources/aasa-validator/)
- [Digital Asset Links Validator](https://developers.google.com/digital-asset-links/tools/generator)

## Support

If you encounter any issues, check:
1. The AASA and assetlinks.json files are accessible
2. Your app has been rebuilt after configuration changes
3. Domain verification has completed (may take up to 48 hours)
4. Console logs show the deep link is being received

The deep link handler in the app will log messages like:
- `🔗 Deep link received: {url}`
- `🍽️ Navigating to restaurant: {id}`

Check these logs to debug any routing issues.
