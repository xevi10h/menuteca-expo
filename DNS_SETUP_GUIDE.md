# DNS Setup Guide - Point menutecaapp.com to Netlify

## Current Situation

✅ **Your Netlify deployment is working!**
- Netlify URL: `https://68e148f9a82e51b5b56506dc--menuteca.netlify.app`
- Production URL configured: `https://menutecaapp.com`

❌ **Problem:**
- Your domain `menutecaapp.com` is currently pointing to Squarespace
- DNS records need to be updated to point to Netlify instead

## Solution: Update DNS Records

### Step 1: Find Where Your Domain is Registered

Your domain `menutecaapp.com` is registered with a domain registrar. Common ones are:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- etc.

**Action:** Log in to your domain registrar's website.

### Step 2: Access DNS Settings

1. Find the DNS management section (usually called):
   - "DNS Management"
   - "DNS Settings"
   - "Name Servers"
   - "Domain Settings"

2. Look for your current DNS records

### Step 3: Update DNS Records for Netlify

You have two options:

#### **Option A: Use Netlify's DNS (Recommended)**

This is the easiest and most reliable method.

1. **In Netlify Dashboard:**
   - Go to: https://app.netlify.com/projects/menuteca/settings/domain
   - Click on "Set up Netlify DNS"
   - Follow the wizard

2. **In Your Domain Registrar:**
   - Change name servers to Netlify's:
     ```
     dns1.p05.nsone.net
     dns2.p05.nsone.net
     dns3.p05.nsone.net
     dns4.p05.nsone.net
     ```
   - Wait 24-48 hours for DNS propagation

#### **Option B: Use External DNS (Current Setup)**

Keep your current DNS provider but point records to Netlify.

**For root domain (menutecaapp.com):**

Delete existing A records pointing to Squarespace, then add:
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

**For www subdomain (www.menutecaapp.com):**

Delete existing CNAME pointing to Squarespace, then add:
```
Type: CNAME
Name: www
Value: menuteca.netlify.app
TTL: 3600
```

### Step 4: Verify DNS Configuration

After updating DNS:

1. **Check DNS propagation:**
   - Visit: https://dnschecker.org
   - Enter: `menutecaapp.com`
   - Check if it points to Netlify's IP: `75.2.60.5`

2. **Wait for propagation:**
   - DNS changes can take 1-48 hours
   - Usually completes within a few hours

3. **Test your site:**
   - Visit: `https://menutecaapp.com`
   - You should see your Menuteca app instead of Squarespace

### Step 5: Configure HTTPS in Netlify

Once DNS is pointing to Netlify:

1. Go to: https://app.netlify.com/projects/menuteca/settings/domain
2. Netlify will automatically provision an SSL certificate
3. HTTPS will be enabled (may take a few minutes)

## Quick Test While Waiting for DNS

You can test your deployed app immediately using the unique Netlify URL:

**Test URL:** `https://68e148f9a82e51b5b56506dc--menuteca.netlify.app`

This URL always works and shows your latest deployment.

## Troubleshooting

### "Still seeing Squarespace after 24 hours"

**Check these:**

1. **Verify DNS records are correct:**
   ```bash
   dig menutecaapp.com
   # Should show 75.2.60.5
   ```

2. **Clear browser cache:**
   - Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
   - Or use incognito mode

3. **Check Netlify domain settings:**
   - Go to: https://app.netlify.com/projects/menuteca/settings/domain
   - Ensure `menutecaapp.com` is listed as primary domain
   - Check for any warnings or errors

### "DNS doesn't propagate"

**Possible issues:**

1. **Name servers not updated:**
   - Verify in your domain registrar that name servers are correct
   - If using Option B, verify A and CNAME records are correct

2. **Registrar lock:**
   - Some registrars have a domain lock feature
   - Check if your domain is locked and unlock it temporarily

3. **TTL is too high:**
   - Old DNS records may have high TTL (Time To Live)
   - Wait for the TTL period to expire

## Current Deployment Status

✅ **What's Working:**
- Build process: ✅ Success
- Deployment to Netlify: ✅ Success
- App bundle: ✅ 3.54 MB
- Assets: ✅ 79 files
- Netlify site: ✅ Active

❌ **What Needs Fixing:**
- DNS pointing to Squarespace instead of Netlify

## Commands Reference

```bash
# Deploy to production
npm run build:web
netlify deploy --prod --dir dist

# Check deployment status
netlify status

# View site in browser (unique URL)
netlify open:site

# View Netlify admin panel
netlify open:admin

# Check DNS
dig menutecaapp.com
nslookup menutecaapp.com
```

## Next Steps

1. ✅ **Your app is deployed** - Working at unique Netlify URL
2. 🔧 **Update DNS** - Point `menutecaapp.com` to Netlify (follow Step 3 above)
3. ⏳ **Wait for DNS** - Allow 1-48 hours for propagation
4. ✅ **Test** - Visit `https://menutecaapp.com` when DNS propagates
5. ✅ **Setup deep links** - Follow `DEEP_LINKING_SETUP.md` after DNS works

## Important Notes

### Squarespace

If you're currently using Squarespace for `menutecaapp.com`:

1. **Export any content** you want to keep from Squarespace
2. **Cancel Squarespace** subscription (optional, after DNS works)
3. **Update DNS** as shown above
4. Your Squarespace site will no longer be accessible at this domain

### Email

If you have email set up for `@menutecaapp.com`:

⚠️ **Be careful!** Changing DNS might affect email delivery.

**To keep email working:**
1. Keep MX records as they are (don't delete)
2. Only update A and CNAME records for web traffic
3. Check with your email provider for specific instructions

## Support

**Netlify Support:**
- Dashboard: https://app.netlify.com/projects/menuteca
- Docs: https://docs.netlify.com/domains-https/custom-domains/
- Community: https://answers.netlify.com

**Domain Registrar:**
- Contact your registrar's support for DNS help
- They can guide you through their specific DNS interface

---

## Summary

Your app is deployed and working! You just need to update DNS:

1. Log in to your domain registrar
2. Update A record: `menutecaapp.com` → `75.2.60.5`
3. Update CNAME: `www.menutecaapp.com` → `menuteca.netlify.app`
4. Wait for DNS to propagate (1-48 hours)
5. Visit `https://menutecaapp.com` - your app will be live!

**Test now:** https://68e148f9a82e51b5b56506dc--menuteca.netlify.app
