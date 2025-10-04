# 🚀 Quick Start Guide

## Deploy to Netlify in 5 Minutes

### Method 1: GitHub + Netlify (Recommended)

```bash
# 1. Commit and push your code
git add .
git commit -m "Configure Netlify deployment"
git push origin main

# 2. Go to netlify.com and login

# 3. Click "Add new site" → "Import an existing project"

# 4. Connect your GitHub repository

# 5. Netlify auto-detects settings from netlify.toml
#    Just click "Deploy site"

# 6. Wait ~3 minutes for build

# 7. Your site is live! 🎉
```

### Method 2: CLI Deployment

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build:web

# 4. Deploy
netlify deploy --prod --dir dist

# Done! 🎉
```

## Test Locally First

```bash
# Build
npm run build:web

# Preview
npm run preview:web

# Visit http://localhost:3000
```

## Set Environment Variables

In Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_KEY`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GEMINI_API_KEY`

## Custom Domain Setup

1. In Netlify: Site Settings → Domain Management
2. Add custom domain: `menutecaapp.com`
3. Configure DNS:
   - **A Record**: `75.2.60.5`
   - Or **CNAME**: Point to your Netlify URL

## Deep Links Setup

### For iOS (Universal Links)

Host this file: `https://menutecaapp.com/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "4WWBHK245Y.com.menutecaapp.mobile",
      "paths": ["/restaurant/*"]
    }]
  }
}
```

### For Android (App Links)

Host this file: `https://menutecaapp.com/.well-known/assetlinks.json`

Get SHA256 fingerprint:
```bash
eas credentials
# Navigate to Android → Production → View keystore
```

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.menutecaapp.mobile",
    "sha256_cert_fingerprints": ["YOUR_SHA256_HERE"]
  }
}]
```

## Troubleshooting

### Build Fails
```bash
# Clear and rebuild
rm -rf dist node_modules
npm install
npm run build:web
```

### Routes Don't Work
- Check `public/_redirects` exists
- Check `netlify.toml` is committed
- Redeploy

### Share Button Not Working
- Check environment variables are set
- Check CORS settings on your API
- Check browser console for errors

## Common Commands

```bash
# Development
npm start              # Start dev server
npm run web           # Start web dev server

# Building
npm run build:web     # Build for production

# Deployment
netlify deploy        # Deploy to draft URL
netlify deploy --prod # Deploy to production
netlify open          # Open site in browser

# Utilities
netlify env:list      # List environment variables
netlify logs          # View function logs
```

## Documentation Links

- **Full Web Deployment Guide**: [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
- **Deep Linking Setup**: [DEEP_LINKING_SETUP.md](./DEEP_LINKING_SETUP.md)
- **Deployment Summary**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
- **Main README**: [README.md](./README.md)

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Expo Web Docs**: https://docs.expo.dev/guides/publishing-websites/
- **Issues**: Create an issue on GitHub

---

**That's it!** You're ready to deploy. 🚀

For detailed instructions, see the full documentation files.
