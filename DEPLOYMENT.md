# Deployment Guide

This guide covers deploying both the website and publishing the browser extension.

---

## Part 1: Website Deployment

### Stack Overview

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS with custom design system
- **Auth**: Clerk
- **Hosting**: Vercel (recommended) or any Node.js host

### Prerequisites

1. Node.js 18+ installed
2. A [Clerk](https://clerk.com) account (free tier available)
3. A [Vercel](https://vercel.com) account (free tier available)

### Step 1: Set Up Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Choose your sign-in options (Email, Google, GitHub, etc.)
4. Copy your API keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Step 2: Local Development

```bash
cd website

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Clerk keys to .env.local
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the site.

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd website
vercel

# Follow the prompts, then add environment variables:
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Set the root directory to `website`
5. Add environment variables in the dashboard
6. Click Deploy

### Step 4: Configure Clerk for Production

1. In Clerk Dashboard, go to **API Keys**
2. Switch to **Production** instance
3. Copy the production keys
4. Update your Vercel environment variables with production keys
5. Redeploy

### Step 5: Add Extension Downloads

After building the extension:

```bash
# From project root
./build.sh

# Copy zip files to website public folder
# Copy zip files to website public folder
cp dist/unifychats-chrome.zip website/public/
cp dist/unifychats-firefox.zip website/public/

# Redeploy
cd website && vercel --prod
```

---

## Part 2: Chrome Web Store Publishing

### Prerequisites

1. A Google account
2. $5 one-time developer registration fee
3. The extension packaged as a ZIP file

### Step 1: Register as a Developer

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the $5 registration fee
3. Complete your developer profile

### Step 2: Prepare Store Assets

Create these images in the `store-assets/` folder:

| Asset | Size | Description |
|-------|------|-------------|
| Icon | 128x128 | High-res extension icon |
| Small promo | 440x280 | Promotional tile |
| Screenshot 1 | 1280x800 | Extension in action on ChatGPT |
| Screenshot 2 | 1280x800 | Extension on Claude |
| Screenshot 3 | 1280x800 | Index panel close-up |

### Step 3: Write Store Listing

**Short Description** (132 chars max):
```
Navigate your AI conversations with a floating index. Works with ChatGPT, Claude, Gemini & Grok.
```

**Detailed Description**:
```
UnifyChats adds a floating navigation panel to your favorite AI chat interfaces.

FEATURES:
• Floating index button - appears on supported AI chat sites
• Message previews - see all messages at a glance
• Quick navigation - click to jump to any message
• Filter by role - show only your messages or AI responses
• Draggable panel - position it anywhere on screen
• Live updates - automatically detects new messages

SUPPORTED PLATFORMS:
• ChatGPT (chat.openai.com, chatgpt.com)
• Claude (claude.ai)
• Gemini (gemini.google.com)
• Grok (grok.com, x.com)

PRIVACY:
• No data collection
• No external network requests
• Works entirely locally
• Open source

HOW TO USE:
1. Visit any supported AI chat site
2. Look for the purple button in the bottom-right corner
3. Click to open the message index
4. Click any message to jump to it

This extension is free and open source.
```

### Step 4: Submit for Review

1. In the Developer Dashboard, click **New Item**
2. Upload `dist/unifychats-chrome.zip`
3. Fill in store listing details
4. Add screenshots and promotional images
5. Set category to **Productivity**
6. Set visibility (Public or Unlisted for testing)
7. Submit for review

Review typically takes 1-3 business days.

### Step 5: After Approval

Once approved:
1. Update your website with the Chrome Web Store link
2. Add an "Install from Chrome Web Store" button
3. Consider setting up automatic updates

---

## Part 3: Firefox Add-ons Publishing

### Step 1: Create Mozilla Account

1. Go to [addons.mozilla.org](https://addons.mozilla.org)
2. Create a Firefox account
3. Go to **Developer Hub**

### Step 2: Submit Add-on

1. Click **Submit a New Add-on**
2. Upload `dist/unifychats-firefox.zip`
3. Choose **On this site** for distribution
4. Fill in listing details (similar to Chrome)
5. Submit for review

Firefox reviews are typically faster (24-48 hours).

---

## Maintenance

### Updating the Extension

1. Update version in `manifest.json`
2. Make your changes
3. Run `./build.sh`
4. Upload new ZIP to respective stores

### Updating the Website

```bash
cd website
# Make changes
vercel --prod
```

### Monitoring

- Set up Vercel Analytics for website traffic
- Monitor Chrome Web Store reviews
- Check for DOM changes on AI chat sites (they update frequently)

---

## Troubleshooting

### Extension not working on a site

AI chat sites update their DOM frequently. Check:
1. Open DevTools and inspect message elements
2. Update selectors in `content/providers/[platform].js`
3. Test locally, then publish update

### Clerk auth not working

1. Verify environment variables are set correctly
2. Check Clerk dashboard for errors
3. Ensure domain is added to Clerk allowed origins

### Build failing

```bash
cd website
rm -rf node_modules .next
npm install
npm run build
```
