# AI Chat Index

A browser extension that adds a floating index to navigate messages in AI chat interfaces.

**Supported platforms**: ChatGPT, Claude, Gemini, Grok

## Project Structure

```
ai-chat-index/
├── website/              # Next.js marketing site + dashboard
│   ├── src/
│   │   ├── app/          # Pages (landing, auth, dashboard)
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   ├── convex/           # Convex backend
│   │   ├── schema.ts     # Database schema
│   │   ├── conversations.ts  # Conversation queries/mutations
│   │   ├── messages.ts   # Message search
│   │   ├── bookmarks.ts  # Bookmark management
│   │   ├── exports.ts    # Export functionality
│   │   └── http.ts       # HTTP endpoints for extension
│   └── ...
├── content/              # Extension content scripts
│   └── providers/        # Site-specific selectors
├── popup/                # Extension popup
├── onboarding/           # Post-install welcome page
├── manifest.json         # Chrome manifest (v3)
├── _firefox/             # Firefox-specific manifest
├── build.sh              # Build script
└── DEPLOYMENT.md         # Full deployment guide
```

## Quick Start

### Run the Website Locally

```bash
cd website
npm install
cp .env.local.example .env.local
# Add your Clerk keys to .env.local
npm run dev
```

### Set Up Convex (Backend)

```bash
cd website
npx convex dev
# Follow prompts to log in and create a project
# This will add NEXT_PUBLIC_CONVEX_URL to your .env.local
```

For Clerk + Convex integration, add your Clerk JWT issuer domain to Convex:
1. Go to your Convex dashboard
2. Settings → Environment Variables
3. Add `CLERK_JWT_ISSUER_DOMAIN` with your Clerk domain

### Build the Extension

```bash
./build.sh
```

This creates:
- `dist/chrome/` - Load unpacked in Chrome
- `dist/firefox/` - Load in Firefox
- `dist/website/` - Static assets for hosting

### Load Extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `dist/chrome`

## Tech Stack

### Website
- **Framework**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS (Linear/Vercel-inspired dark theme)
- **Auth**: Clerk
- **Database**: Convex (real-time, fully typed)
- **Hosting**: Vercel (recommended)

### Extension
- **Manifest**: V3 (Chrome), V2 (Firefox)
- **Content Scripts**: Vanilla JavaScript
- **Styling**: Custom CSS

## Design System

The website uses a custom dark theme inspired by Linear and Vercel:

- **Background**: `#0a0a0b`
- **Surface**: `#141415`
- **Accent**: `#8b5cf6` (purple)
- **Typography**: Inter font family

Components are minimal and purposeful—no AI-generated slop.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions on:

1. Deploying the website to Vercel
2. Setting up Clerk authentication
3. Publishing to Chrome Web Store
4. Publishing to Firefox Add-ons

## Features

### Extension
- Floating button appears on supported AI chat sites
- Expandable index panel showing message previews
- Filter by user/assistant messages
- Click to jump to any message
- Draggable panel
- Live updates as conversation grows

### Website
- Landing page with feature showcase
- Step-by-step installation guide
- User authentication (Clerk)
- Real-time dashboard with Convex
- Cross-platform message search
- Bookmark management with notes
- Conversation export (JSON/Markdown)

## Features Roadmap

- [x] Chat sync across devices (Convex backend)
- [x] Search across all providers (full-text search)
- [x] Bookmarks with notes
- [x] Export conversations (JSON/Markdown)
- [ ] Chrome Web Store listing
- [ ] Firefox signed extension
- [ ] AI-powered insights on conversations

## Development

### Extension Development

After making changes:
1. Run `./build.sh`
2. Go to `chrome://extensions`
3. Click refresh on the extension
4. Reload the chat page

### Website Development

```bash
cd website
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Lint code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
