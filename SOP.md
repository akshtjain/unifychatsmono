# UnifyChats - Standard Operating Procedure (SOP)

## Table of Contents
1. [Project Structure](#project-structure)
2. [Git Setup (Recommended)](#git-setup)
3. [Local Development Setup](#local-development-setup)
4. [Making Changes](#making-changes)
5. [Testing Locally](#testing-locally)
6. [Deployment](#deployment)
7. [Common Issues & Fixes](#common-issues)

---

## Project Structure

```
ai-chat-interface-for-masses/
├── manifest.json          # Chrome extension manifest
├── background.js          # Extension service worker
├── content/               # Content scripts
│   ├── content.js         # Main UI logic
│   ├── content.css        # Styles
│   ├── website-auth.js    # Auth bridge for website
│   └── providers/         # Site-specific parsers
├── popup/                 # Extension popup
├── _firefox/              # Firefox manifest override
├── website/               # Next.js website (has its own git)
│   ├── src/               # Source code
│   ├── convex/            # Backend functions
│   └── .env.local         # Environment variables
└── dist/                  # Build output (gitignored)
```

---

## Git Setup

### Recommended: Single Monorepo

Your website already has git. I recommend converting to a **single monorepo**:

```bash
# 1. Navigate to project root
cd /Users/akshtjain/dev/ai-chat-interface-for-masses

# 2. Remove git from website subfolder
rm -rf website/.git

# 3. Initialize git in root
git init

# 4. Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
website/node_modules/

# Build outputs
dist/
website/.next/
website/out/

# Environment files
.env
.env.local
website/.env.local

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Convex
website/.convex/
EOF

# 5. Add all files
git add .

# 6. Initial commit
git commit -m "Initial commit: UnifyChats extension + website"

# 7. Add remote (create repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/unifychats.git
git push -u origin main
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Chrome/Firefox browser
- Clerk account (free tier works)
- Convex account (free tier works)

### Step 1: Setup Website

```bash
cd website

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your values:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
# CLERK_SECRET_KEY=sk_test_xxx
# NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Step 2: Setup Convex

```bash
cd website

# Login to Convex
npx convex login

# Deploy backend (first time)
npx convex deploy

# For development (auto-sync changes)
npx convex dev
```

### Step 3: Setup Clerk JWT for Convex

1. Go to Clerk Dashboard → JWT Templates
2. Create new template named `convex`
3. Use this template:
```json
{
  "aud": "convex"
}
```
4. Copy your Clerk issuer domain (e.g., `https://xxx.clerk.accounts.dev`)
5. In Convex Dashboard → Settings → Environment Variables:
   - Add `CLERK_JWT_ISSUER_DOMAIN` = your Clerk domain

### Step 4: Start Website

```bash
cd website
npm run dev
# Website runs at http://localhost:3000
```

### Step 5: Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `ai-chat-interface-for-masses` folder (NOT website, NOT dist)
5. Extension should appear in your toolbar

---

## Making Changes

### Extension Changes (JS/CSS)

1. Edit files in root folder (`content/`, `popup/`, `background.js`)
2. Go to `chrome://extensions/`
3. Click the refresh icon on UnifyChats card
4. Reload the AI chat page you're testing on

### Website Changes (Next.js)

1. Edit files in `website/src/`
2. Changes auto-reload (Fast Refresh)
3. For Convex backend changes, `npx convex dev` auto-syncs

### Important: DEV_MODE Flag

Both `background.js` and `popup/popup.js` have a `DEV_MODE` flag:

```javascript
// Set to true for local development
const DEV_MODE = true;  // Uses localhost:3000
// const DEV_MODE = false;  // Uses unifychats.app
```

**Before deploying to production, set `DEV_MODE = false`**

---

## Testing Locally

### Test Login Flow

1. Start website: `cd website && npm run dev`
2. Load extension in Chrome (unpacked)
3. Open extension popup → Click "Connect to UnifyChats"
4. Sign in on website
5. Click "Generate Connection Token"
6. Check popup again - should show "Connected"

### Test Sync Flow

1. Ensure you're logged in (green dot in popup)
2. Go to chat.openai.com, claude.ai, etc.
3. Open a conversation
4. Click the floating UnifyChats button (bottom right)
5. Click "Sync" button
6. Check website dashboard - conversation should appear

### Debug Tips

- **Extension console**: Right-click extension icon → Inspect popup
- **Background script**: `chrome://extensions/` → Click "Service Worker"
- **Content script**: Open DevTools on AI chat page → Console
- **Website**: Browser DevTools as normal

---

## Deployment

### Deploy Website to Vercel

```bash
cd website

# Install Vercel CLI (first time)
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - NEXT_PUBLIC_CONVEX_URL
# - CLERK_JWT_ISSUER_DOMAIN
```

### Deploy Convex Backend

```bash
cd website
npx convex deploy --prod
```

### Build Extension for Distribution

```bash
# From project root
chmod +x build.sh
./build.sh

# Output in dist/:
# - dist/chrome/           (unpacked Chrome extension)
# - dist/firefox/          (unpacked Firefox extension)
# - dist/unifychats-chrome.zip
# - dist/unifychats-firefox.zip
```

### Publish to Chrome Web Store

1. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 fee (first time)
3. Click "New Item" → Upload `dist/unifychats-chrome.zip`
4. Fill in store listing details
5. Submit for review (takes 1-3 days)

### Publish to Firefox Add-ons

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Click "Submit a New Add-on"
3. Upload `dist/unifychats-firefox.zip`
4. Fill in listing details
5. Submit for review

---

## Common Issues

### "Not authenticated" when syncing

**Cause**: Auth token not transferred to extension
**Fix**:
1. Go to website dashboard
2. Click "Generate Connection Token"
3. Make sure extension popup shows "Connected"
4. If still failing, check browser console for errors

### Extension not detecting AI chat site

**Cause**: Content script not loaded
**Fix**:
1. Refresh the page
2. Check `chrome://extensions/` for errors
3. Ensure the URL matches manifest patterns

### Convex "Unauthorized" errors

**Cause**: JWT template misconfigured
**Fix**:
1. Verify Clerk JWT template exists named `convex`
2. Check `CLERK_JWT_ISSUER_DOMAIN` in Convex env vars
3. Redeploy Convex: `npx convex deploy`

### Changes not reflecting

**Extension**: Click refresh on `chrome://extensions/`
**Website**: Check terminal for build errors
**Convex**: Run `npx convex dev` to sync

---

## Quick Reference Commands

```bash
# Start website dev server
cd website && npm run dev

# Start Convex dev (auto-sync)
cd website && npx convex dev

# Build extension
./build.sh

# Deploy website
cd website && vercel --prod

# Deploy Convex
cd website && npx convex deploy --prod
```

---

## Checklist: Before Production Release

- [ ] Set `DEV_MODE = false` in `background.js`
- [ ] Set `DEV_MODE = false` in `popup/popup.js`
- [ ] Update version in `manifest.json`
- [ ] Update version in `_firefox/manifest.json`
- [ ] Update version in `popup/popup.html`
- [ ] Run `./build.sh`
- [ ] Test extension from `dist/` folder
- [ ] Deploy website to Vercel
- [ ] Deploy Convex to production
