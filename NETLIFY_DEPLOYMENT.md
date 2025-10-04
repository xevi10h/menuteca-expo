# Netlify Deployment Guide for Menuteca Web App

## Overview
Your Menuteca app is now configured for deployment to Netlify. This guide will walk you through the deployment process.

## Prerequisites

1. **Netlify Account**
   - Create a free account at [netlify.com](https://netlify.com)
   - Connect your GitHub account (recommended) or use Netlify CLI

2. **Node.js**
   - Ensure you have Node.js 18+ installed
   - Check version: `node --version`

## Configuration Files Created ✅

The following files have been created and configured:

1. **`netlify.toml`** - Main Netlify configuration
   - Build command: `npm run build:web`
   - Publish directory: `dist`
   - Redirects for client-side routing
   - Security headers
   - Cache control for optimal performance

2. **`public/_redirects`** - SPA routing support
   - Ensures all routes redirect to `index.html`
   - Critical for deep linking (e.g., `/restaurant/123`)

3. **`package.json`** - New scripts added
   - `npm run build:web` - Build for production
   - `npm run preview:web` - Preview locally
   - `npm run deploy:netlify` - Deploy to Netlify

4. **`.gitignore`** - Updated with Netlify folders

## Deployment Methods

### Method 1: Deploy via Netlify UI (Recommended for Continuous Deployment)

This method automatically deploys whenever you push to your git repository.

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Configure Netlify deployment"
git push origin main
```

#### Step 2: Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"** (or GitLab/Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your repository: `menuteca-expo`

#### Step 3: Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

- **Base directory**: (leave empty)
- **Build command**: `npm run build:web`
- **Publish directory**: `dist`
- **Build settings**: Automatic (uses netlify.toml)

#### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live at a temporary Netlify URL: `https://random-name-123.netlify.app`

#### Step 5: Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain: `menutecaapp.com` or `app.menutecaapp.com`
4. Follow DNS configuration instructions:

**For root domain (menutecaapp.com):**
- Add A record: `75.2.60.5`
- Or add CNAME: `apex-loadbalancer.netlify.com`

**For subdomain (app.menutecaapp.com):**
- Add CNAME record pointing to your Netlify site URL

5. Enable HTTPS (automatic with Netlify)

### Method 2: Deploy via Netlify CLI

This method is useful for manual deployments or testing.

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify
```bash
netlify login
```

This will open your browser for authentication.

#### Step 3: Initialize Site
```bash
netlify init
```

Follow the prompts:
- **What would you like to do?** → Create & configure a new site
- **Team:** Select your team
- **Site name:** Enter a name (e.g., `menuteca-app`)
- **Build command:** `npm run build:web`
- **Directory to deploy:** `dist`

#### Step 4: Build and Deploy
```bash
# Build the app
npm run build:web

# Deploy to production
npm run deploy:netlify
```

Or use the CLI directly:
```bash
# Deploy to draft URL for testing
netlify deploy --dir dist

# Deploy to production
netlify deploy --prod --dir dist
```

### Method 3: Drag and Drop (Quick Testing)

1. Build your app locally:
```bash
npm run build:web
```

2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `dist` folder
4. Your site will be instantly deployed

**Note:** This method doesn't support continuous deployment.

## Environment Variables

If your app uses environment variables, add them in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add your variables (e.g., API keys, backend URLs)

**Important:** Don't commit sensitive environment variables to git!

## Deep Linking Configuration

For deep links to work properly on your web deployment:

1. **Netlify handles redirects automatically** via `netlify.toml` and `public/_redirects`
2. **Test deep links** after deployment:
   - `https://your-site.netlify.app/restaurant/123`
   - Should load the app and navigate to the restaurant

3. **If using a custom domain**, update the deep link configuration:
   - In `shared/functions/utils.ts`, the domain defaults to `menutecaapp.com`
   - This should match your deployed domain

## Build Optimization Tips

### 1. Optimize Build Performance
```bash
# Use CI=true to skip warnings
CI=true npm run build:web
```

### 2. Analyze Bundle Size
Add to `package.json`:
```json
"analyze:web": "npx expo export -p web --analyze"
```

### 3. Enable Compression
Netlify automatically compresses files, but you can verify in the deploy logs.

## Testing Your Deployment

### Local Testing
```bash
# Build the app
npm run build:web

# Preview the build
npm run preview:web
```

Visit `http://localhost:3000` to test.

### Production Testing Checklist

- [ ] Home page loads correctly
- [ ] Navigation works (all routes)
- [ ] Deep links work (`/restaurant/123`)
- [ ] Images load correctly
- [ ] Forms submit properly
- [ ] Authentication works
- [ ] API calls succeed
- [ ] Mobile responsive
- [ ] Performance is acceptable

## Continuous Deployment

Once connected via Method 1:

1. **Automatic deploys on push to main branch**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Preview deploys for pull requests**
   - Netlify automatically creates preview URLs for PRs
   - Perfect for testing before merging

3. **Deploy contexts**
   - Production: `main` branch
   - Preview: Pull requests
   - Branch deploys: Other branches (if enabled)

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to **Deploys** in Netlify dashboard
2. Click on the failed deploy
3. Review the build log

**Common issues:**
- Missing dependencies → Check `package.json`
- Node version mismatch → Set in `netlify.toml`:
  ```toml
  [build.environment]
    NODE_VERSION = "18"
  ```
- Build timeout → Contact Netlify support for higher limits

### Routes Not Working (404 errors)

**Solution:**
- Verify `public/_redirects` file exists
- Verify `netlify.toml` has redirect rules
- Clear deploy cache and redeploy

### Assets Not Loading

**Check:**
- File paths are correct (relative paths work best)
- Asset files are in the `dist` folder after build
- No CORS issues (check browser console)

### Performance Issues

**Optimize:**
- Enable asset compression (automatic on Netlify)
- Use Netlify CDN (automatic)
- Optimize images before deployment
- Enable caching headers (already configured in `netlify.toml`)

## Monitoring and Analytics

### Netlify Analytics

1. Enable in **Site settings** → **Analytics**
2. Provides:
   - Page views
   - Unique visitors
   - Top pages
   - Bandwidth usage

### Custom Analytics

Integrate Google Analytics, Plausible, or other tools by adding tracking scripts to your app.

## Rollback Deployments

If a deployment breaks something:

1. Go to **Deploys** in Netlify
2. Find a working deploy
3. Click **"Publish deploy"**
4. Your site instantly reverts

## Performance Monitoring

After deployment, test performance:

1. **Lighthouse** (Chrome DevTools)
   - Open DevTools → Lighthouse tab
   - Run audit on your deployed site

2. **WebPageTest**
   - Visit [webpagetest.org](https://www.webpagetest.org)
   - Test your site from different locations

## Security Best Practices

### Already Configured ✅
- HTTPS enforced automatically
- Security headers set in `netlify.toml`
- XSS protection enabled
- Content Security Policy headers

### Additional Recommendations
- Enable two-factor authentication on Netlify
- Review access logs regularly
- Use environment variables for secrets
- Enable Netlify's DDoS protection

## Cost Considerations

**Netlify Free Tier includes:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS
- Continuous deployment

**Upgrade if you need:**
- More bandwidth
- More build minutes
- Team collaboration features
- Advanced analytics

## Support Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://answers.netlify.com)
- [Expo Web Documentation](https://docs.expo.dev/guides/publishing-websites/)
- [Netlify Status](https://www.netlifystatus.com)

## Quick Reference Commands

```bash
# Local development
npm start

# Build for web
npm run build:web

# Preview build locally
npm run preview:web

# Deploy to Netlify (after setup)
npm run deploy:netlify

# Netlify CLI commands
netlify login          # Login to Netlify
netlify init           # Initialize new site
netlify deploy         # Deploy to draft URL
netlify deploy --prod  # Deploy to production
netlify open           # Open site in browser
netlify env:list       # List environment variables
```

## Next Steps

1. **Deploy your site** using Method 1 (recommended)
2. **Configure custom domain** if needed
3. **Set up environment variables** in Netlify UI
4. **Test all functionality** on the live site
5. **Monitor performance** using Netlify Analytics
6. **Share your site** with users!

---

Your Menuteca web app is ready for deployment! 🚀

If you encounter any issues, refer to the troubleshooting section or check the Netlify documentation.
