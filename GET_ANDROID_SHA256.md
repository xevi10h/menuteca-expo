# How to Get Android SHA256 Fingerprint

You need to add your Android app's SHA256 signing certificate fingerprint to enable Android App Links (deep linking).

## Step 1: Get the SHA256 Fingerprint

### For Production (Recommended)

Use EAS credentials to get your production signing key fingerprint:

```bash
eas credentials
```

Follow the prompts:
1. Select your project: **menuteca-expo**
2. Select platform: **Android**
3. Select build profile: **production**
4. Select: **Keystore: Manage everything needed to build your project**
5. Select: **View credentials**
6. **Copy the SHA256 Fingerprint**

The fingerprint will look like:
```
AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
```

### For Development/Testing (Optional)

To test deep linking during development, also add the debug keystore fingerprint:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the line that says:
```
SHA256: AA:BB:CC:DD:...
```

Copy the value after `SHA256:`

### Alternative: Google Play Console

If your app is already on Google Play:

1. Go to: https://play.google.com/console
2. Select your app
3. Navigate to: **Setup** → **App integrity**
4. Find: **App signing key certificate**
5. Copy the **SHA-256 certificate fingerprint**

## Step 2: Update the assetlinks.json File

Edit the file:

```bash
nano public/.well-known/assetlinks.json
```

Or open it in your editor and update the `sha256_cert_fingerprints` array:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.menutecaapp.mobile",
      "sha256_cert_fingerprints": [
        "YOUR_PRODUCTION_SHA256_HERE"
      ]
    }
  }
]
```

### To Support Both Debug and Production

If you want deep linking to work in both debug and production builds, add both fingerprints:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.menutecaapp.mobile",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99",
        "11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF"
      ]
    }
  }
]
```

**Important:**
- Use uppercase letters (A-F)
- Include colons between each pair of characters
- No spaces
- No quotes around the fingerprint itself (only around the entire string)

## Step 3: Deploy the Updated File

After updating the file, redeploy to Netlify:

```bash
npm run web:deploy
```

This will:
1. Build the web app
2. Copy the updated assetlinks.json to dist/.well-known/
3. Deploy to Netlify

## Step 4: Verify the File

Check that your file is live and correctly formatted:

### Using curl:
```bash
curl https://menutecaapp.com/.well-known/assetlinks.json
```

### Using Google's validator:
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://menutecaapp.com&relation=delegate_permission/common.handle_all_urls
```

You should see your fingerprint(s) in the response.

## Step 5: Test Deep Linking

### On Android Device/Emulator:

```bash
# Test deep link
adb shell am start -a android.intent.action.VIEW -d "https://menutecaapp.com/restaurant/test-id"

# Check verification status
adb shell pm get-app-links com.menutecaapp.mobile
```

The output should show:
```
com.menutecaapp.mobile:
  ID: ...
  Signatures: ...
  Domain verification state:
    menutecaapp.com: verified
```

### Force Re-verification:

If the domain shows as `not verified`, force Android to re-verify:

```bash
adb shell pm verify-app-links --re-verify com.menutecaapp.mobile
```

## Troubleshooting

### "Domain not verified" on Android

**Possible causes:**
1. SHA256 fingerprint doesn't match your signing key
2. assetlinks.json file is not accessible
3. Package name doesn't match
4. Need to reinstall the app

**Solutions:**
1. Double-check the SHA256 fingerprint matches exactly
2. Verify the file is accessible: `curl https://menutecaapp.com/.well-known/assetlinks.json`
3. Verify package name is: `com.menutecaapp.mobile`
4. Uninstall and reinstall the app
5. Run: `adb shell pm verify-app-links --re-verify com.menutecaapp.mobile`

### Can't get SHA256 from EAS

If `eas credentials` hangs or doesn't work:

1. Make sure you're logged in: `eas login`
2. Try building first: `eas build --platform android`
3. Check the build logs for the fingerprint
4. Or get it from Google Play Console after the app is uploaded

### Wrong fingerprint format

The fingerprint must be:
- ✅ Correct: `"AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"`
- ❌ Wrong: `"AABBCCDDEEFF..."` (missing colons)
- ❌ Wrong: `"aa:bb:cc:dd..."` (lowercase)
- ❌ Wrong: `AA:BB:CC:...` (missing quotes)

## Quick Reference

```bash
# Get production SHA256
eas credentials

# Get debug SHA256
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Edit assetlinks.json
nano public/.well-known/assetlinks.json

# Deploy
npm run web:deploy

# Verify
curl https://menutecaapp.com/.well-known/assetlinks.json

# Test on Android
adb shell am start -a android.intent.action.VIEW -d "https://menutecaapp.com/restaurant/test-id"

# Check verification
adb shell pm get-app-links com.menutecaapp.mobile

# Force re-verify
adb shell pm verify-app-links --re-verify com.menutecaapp.mobile
```

## Summary

1. ✅ Get SHA256 fingerprint from EAS credentials
2. ✅ Update `public/.well-known/assetlinks.json` with the fingerprint
3. ✅ Deploy with `npm run web:deploy`
4. ✅ Verify the file is accessible online
5. ✅ Test deep linking on Android device
6. ✅ Rebuild your Android app with `eas build --platform android`

Once complete, Android users will be able to tap restaurant links and have them open directly in your app! 🎉
