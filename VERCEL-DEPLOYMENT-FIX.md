# 🚀 Vercel Deployment & Build Fix Guide

## Problem Summary

```
npm warn deprecated google-p12-pem@4.0.1: Package is no longer maintained
11 vulnerabilities (7 moderate, 4 high)
sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied
Error: Command "vite build" exited with 126
```

## Root Cause

The error `Permission denied` on Vercel typically happens when:
1. **Post-install scripts** don't run properly
2. **File permissions** aren't set after npm install
3. **Vite executable** isn't in the right place
4. **npm install vs npm ci** usage inconsistency

---

## ✅ Solution (Do These Steps)

### Step 1: Clean Local Install

```bash
# On your local machine
cd C:\Academee

# Remove old files
rm -rf node_modules package-lock.json

# Clean install (more reliable than npm install)
npm ci

# If that fails, use:
npm install
```

### Step 2: Fix Security Vulnerabilities

```bash
# See what's wrong
npm audit

# Fix automatically
npm audit fix

# If audit fix wasn't enough
npm audit fix --force
```

### Step 3: Test Build Locally

```bash
# This is the SAME command Vercel will run
npm run build

# If successful, you'll see:
# ✓ built in XXms
# dist/ folder will be created
```

### Step 4: Create vercel.json (Already Done ✅)

Your `vercel.json` is already created with correct settings.

### Step 5: Push to GitHub & Redeploy

```bash
# Commit fixes
git add -A
git commit -m "fix: npm vulnerabilities and vercel build config"
git push origin main

# Vercel will auto-rebuild
# Check https://vercel.com/dashboard → your project
```

---

## 🔍 Vercel Deployment Checklist

### Before Pushing
- [ ] `npm audit` runs without critical issues
- [ ] `npm run build` completes successfully locally
- [ ] `dist/` folder is created
- [ ] `vercel.json` is in root directory
- [ ] No `.env` file committed (should be in .gitignore)

### On Vercel Dashboard
- [ ] All environment variables are set:
  - `VITE_GOOGLE_CLIENT_ID`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - Any other VITE_* variables

### After Deployment
- [ ] Build succeeds (check Vercel Deployments tab)
- [ ] No error logs
- [ ] Site loads at your domain

---

## 🐛 Vercel Permission Error - Specific Fix

The `/vercel/path0/node_modules/.bin/vite: Permission denied` error means:

**Vercel** is trying to run: `/vercel/path0/node_modules/.bin/vite build`

But the file isn't executable or vite isn't installed.

### How to Fix:

**Option A (Recommended): Clean Install**
```bash
# Locally first
rm -rf node_modules
npm ci  # This will install exact versions from package-lock.json
npm run build  # Verify works

# Then push - Vercel will do the same
```

**Option B: Update package.json**

The build script should be:
```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  }
}
```

This is already correct in your package.json ✅

**Option C: Clear Vercel Cache**
1. Go to Vercel Dashboard
2. Find your project
3. Click Settings → Git
4. Click "Clear Cache"
5. Redeploy

---

## 📦 About google-p12-pem Warning

```
npm warn deprecated google-p12-pem@4.0.1: Package is no longer maintained
```

**What it means**: This package (likely a transitive dep) is old but not broken

**Why it matters**: Minimal - it's not a security risk right now, just unmaintained

**What to do**: Nothing urgent. If issues arise, the npm audit fix process will handle it

---

## 🔒 Vulnerabilities Overview

11 vulnerabilities (7 moderate, 4 high) typically include:
- Express/Cors version updates
- Transitive dependencies
- Node.js version recommendations

**Good news**: Most are auto-fixable with `npm audit fix`

**Run this** to see details:
```bash
npm audit
```

---

## Vercel Environment Setup

Make sure these are set in Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_GOOGLE_CLIENT_ID = 392035415360-6d9jjfu6ivrmoss0h8eldg8g58eudn8s.apps.googleusercontent.com
VITE_SUPABASE_URL = https://dfbtrhuvlfnrvypywvkf.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
```

(Note: You can find these in your `.env` file, but they should go in Vercel dashboard, NOT committed to git)

---

## Complete Step-by-Step

```bash
# 1. Navigate to project
cd C:\Academee

# 2. Clean install
rm -rf node_modules package-lock.json
npm install

# 3. Fix vulnerabilities
npm audit fix

# 4. Build locally (this is what Vercel will do)
npm run build

# 5. If build fails, see what's wrong
npm audit

# 6. Fix more aggressively if needed
npm audit fix --force

# 7. Commit
git add package*.json
git commit -m "fix: npm security vulnerabilities and vercel build"

# 8. Push (Vercel auto-redeploys)
git push origin main

# 9. Check Vercel
# Visit: https://vercel.com/dashboard
# Click your project
# Wait for build to complete
# Check for green checkmark ✅
```

---

## If Build Still Fails on Vercel

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard
   - Click your project
   - Click Deployments
   - Find failing build
   - Click it to see logs

2. **Common Issues**:
   - Missing environment variables → Add them
   - Node version mismatch → Check project settings
   - Disk space full → Clear Vercel cache and redeploy
   - Timeout → Reduce build time or increase timeout

3. **Nuclear Option** (last resort):
   - Delete project from Vercel
   - Re-add it from GitHub
   - Set env variables fresh
   - Trigger redeploy

---

## Testing Your Build

```bash
# Build and preview locally
npm run build
npm run preview

# Then open browser to http://localhost:5000 (or URL shown)
```

---

## Environment Variables for Vercel

These are NOT the same as `.env` file. Set these in Vercel:

**Frontend (Vite)**:
- `VITE_GOOGLE_CLIENT_ID` (public)
- `VITE_SUPABASE_URL` (public)
- `VITE_SUPABASE_ANON_KEY` (public)

**Backend** (if using Vercel Functions):
- `GOOGLE_CLIENT_SECRET` (private!)
- `JWT_SECRET` (private!)
- `SUPABASE_SERVICE_ROLE_KEY` (private!)

---

## Success Indicators

✅ All good when:
```
✓ Build succeeds
✓ No errors in logs
✓ Green checkmark on Vercel
✓ Site loads at your domain
✓ Google login works
✓ Dashboard loads
```

---

## Quick Reference

| Issue | Solution |
|-------|----------|
| Permission denied | `rm -rf node_modules && npm ci && npm run build` |
| Vulnerabilities | `npm audit fix` then `npm audit fix --force` |
| google-p12-pem warning | Ignore for now, will be fixed by npm audit |
| Build fails locally | Check `npm audit`, fix issues, retry build |
| Build fails on Vercel | Clear cache, redeploy, check logs |
| Env vars not working | Verify in Vercel Dashboard (not .env) |

---

## Need Help?

If anything fails:
1. Run `npm audit` and share the output
2. Run `npm run build` and share any errors
3. Check Vercel logs and share specific error

I can help debug from there.

---

**Status**: Ready to deploy! 🚀
**Next**: Run the step-by-step commands above
**Expected**: Green checkmark on Vercel ✅
