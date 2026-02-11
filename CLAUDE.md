# CLAUDE.md — UnifyChats Monorepo

## Project Overview

UnifyChats is a browser extension + web dashboard that provides unified navigation, cloud sync, search, and management of conversations across multiple AI chat platforms (ChatGPT, Claude, Gemini, Grok, Perplexity).

**Production URL**: https://unifychats.app
**Extension Version**: 1.1.0

## Repository Structure

```
unifychatsmono/
├── manifest.json                 # Chrome Manifest V3
├── firefox-manifest/             # Firefox V2 manifest override
├── background.js                 # Extension service worker
├── config.js                     # Shared env config (DEV_MODE flag)
├── content/
│   ├── content.js                # Main extension UI (floating panel, sync, bookmarks)
│   ├── content.css               # Extension styles (injected into AI sites)
│   ├── website-auth.js           # Auth bridge between extension ↔ website
│   └── providers/                # Per-platform DOM parsers
│       ├── chatgpt.js            # chat.openai.com, chatgpt.com
│       ├── claude.js             # claude.ai
│       ├── gemini.js             # gemini.google.com
│       ├── grok.js               # grok.com, x.com/i/grok
│       └── perplexity.js         # perplexity.ai
├── popup/                        # Extension popup (login status, quick actions)
├── onboarding/                   # Post-install welcome page
├── icons/                        # Extension icons (16/48/128px)
├── logos/                        # AI platform logos
├── build.sh                      # Build & package script (Chrome + Firefox zips)
├── website/                      # Next.js 15 dashboard + Convex backend
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui primitives
│   │   │   └── dashboard/        # Dashboard feature components
│   │   ├── lib/                  # Utilities (cn, helpers)
│   │   └── middleware.ts         # Clerk auth middleware
│   ├── convex/                   # Convex backend (serverless DB + API)
│   │   ├── schema.ts             # Database schema
│   │   ├── auth.config.ts        # Clerk JWT validation
│   │   ├── http.ts               # HTTP endpoints (extension API)
│   │   ├── conversations.ts      # Conversation CRUD + sync
│   │   ├── messages.ts           # Full-text search
│   │   ├── bookmarks.ts          # Bookmark management
│   │   ├── projects.ts           # Project organization
│   │   └── exports.ts            # Export (JSON/Markdown)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── components.json           # shadcn/ui config (new-york style, slate base)
├── .mcp.json                     # MCP server config (shadcn, next-devtools)
├── DEPLOYMENT.md                 # Deployment guide
├── SOP.md                        # Standard operating procedures
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension | Chrome Manifest V3 / Firefox V2, vanilla JS |
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 3.4, shadcn/ui (new-york variant), CSS variables (HSL) |
| Backend | Convex (serverless real-time DB + functions) |
| Auth | Clerk (JWT tokens, OAuth providers) |
| Icons | Lucide React |
| Notifications | Sonner (toasts) |
| Dark mode | next-themes (class-based) |
| Package manager | npm |

## Development Setup

### Prerequisites
- Node.js 18+
- npm
- Clerk account with test keys
- Convex project

### Website (Next.js dashboard)
```bash
cd website
npm install
npx convex dev          # Start Convex dev server (auto-syncs schema/functions)
npm run dev             # Start Next.js on localhost:3000
```

### Extension (local development)
1. Keep `DEV_MODE: true` in `config.js` (default) — points to localhost:3000
2. Chrome: Go to `chrome://extensions` → Enable Developer mode → Load unpacked → select repo root
3. Firefox: Go to `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `firefox-manifest/manifest.json`

### Environment Variables
Create `website/.env.local` with:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

## Build & Distribution

```bash
./build.sh
```

This script:
1. Cleans `dist/`
2. Copies extension files to `dist/chrome/` and `dist/firefox/`
3. Sets `DEV_MODE: false` via sed (points to production URL)
4. Creates zip archives for web store submission
5. Copies zips to `website/public/` for download links on the website

**Note**: `build.sh` uses `sed -i ''` (macOS syntax). On Linux, remove the empty string argument.

**Output**:
- `dist/chrome/` — unpacked Chrome extension
- `dist/firefox/` — unpacked Firefox extension
- `dist/unifychats-chrome.zip` — Chrome Web Store package
- `dist/unifychats-firefox.zip` — Firefox Add-ons package

## Available Scripts (website/)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx convex dev` | Start Convex dev server with live sync |
| `npx convex deploy --prod` | Deploy Convex functions to production |

## Database Schema (Convex)

Defined in `website/convex/schema.ts`:

| Table | Purpose |
|-------|---------|
| `projects` | User-created folders to organize conversations |
| `conversations` | Synced AI conversations (indexed by userId, provider, externalId) |
| `messages` | Individual messages with full-text search index on `content` |
| `bookmarks` | User bookmarks on specific messages with optional notes |
| `exports` | Export job tracking (JSON/Markdown/PDF) |
| `syncTokens` | Incremental sync tokens per user+provider |

**Supported providers**: `chatgpt`, `claude`, `gemini`, `grok`, `perplexity`

All Convex functions authenticate via Clerk JWT (`ctx.auth.getUserIdentity()`).

## HTTP API (Extension ↔ Backend)

Endpoints in `website/convex/http.ts`, all require Bearer token (Clerk JWT):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/health` | Health check |
| POST | `/sync` | Sync conversation from extension |
| GET | `/search` | Search messages (query param: `q`, optional: `provider`, `limit`) |
| POST | `/bookmark` | Toggle bookmark on a message |
| POST | `/bookmarks/status` | Get bookmarked message indices for a conversation |

All endpoints have CORS preflight (OPTIONS) handlers.

## Provider Implementation Pattern

Each provider in `content/providers/<platform>.js` registers on `window.AIChatIndexProviders` and implements:

```javascript
window.AIChatIndexProviders.example = {
  id: 'example',
  name: 'Example',
  isActive()                  // Returns true if current URL matches this platform
  getConversationContainer()  // Returns DOM element holding all messages
  getMessageSelector()        // CSS selector for individual message elements
  getMessages()               // Returns NodeList of message elements
  parseMessage(element)       // Extracts { element, role, preview, fullText }
};
```

`content/content.js` auto-detects the active provider and uses these methods to build the floating index panel, sync messages, and manage bookmarks.

## Key Architecture Decisions

- **No bundler for extension code**: Extension JS is vanilla (no webpack/vite). Content scripts and providers are loaded directly via manifest.
- **Config.js as env switch**: `config.js` is the single source of truth for dev/prod URLs. `build.sh` patches it at build time.
- **Convex as full backend**: No separate API server. Convex handles DB, auth, real-time subscriptions, HTTP endpoints, and full-text search.
- **Clerk JWT flow**: Extension gets tokens via `website-auth.js` bridge (content script on unifychats.app) → stored in `chrome.storage.local` → sent as Bearer token to Convex HTTP endpoints.
- **Denormalized userId in messages**: Messages store `userId` directly (not just via conversation) for efficient querying and search filtering.
- **shadcn/ui components**: UI primitives are copied into `website/src/components/ui/` (not imported from a package). Configured as `new-york` style with `slate` base color.

## Coding Conventions

- **Extension code**: Vanilla JavaScript (no TypeScript, no imports). Uses `window` globals for cross-script communication.
- **Website code**: TypeScript with strict mode. Path alias `@/*` maps to `./src/*`.
- **Styling**: Tailwind utility classes. Custom platform-specific colors defined in `tailwind.config.ts` (e.g., `chatgpt: '#10a37f'`, `claude: '#d97757'`).
- **Component structure**: shadcn/ui primitives in `components/ui/`, feature components in `components/dashboard/`.
- **Convex functions**: Use `query()`, `mutation()`, `action()` from `convex/server`. Always validate user identity at the start of every function.
- **No automated tests**: Currently no test framework is configured.
- **No CI/CD**: Builds and deployments are manual.
- **Commit style**: Short imperative messages (e.g., "Add Perplexity AI support", "Fix design issues").

## Common Tasks

### Adding a new AI platform provider
1. Create `content/providers/<platform>.js` implementing the provider interface above
2. Add the provider literal to `providerType` in `website/convex/schema.ts`
3. Add URL patterns to `manifest.json` (`content_scripts.matches` and `host_permissions`)
4. Add URL patterns to `firefox-manifest/manifest.json`
5. Add the script to `manifest.json` `content_scripts.js` array
6. Add platform color to `website/tailwind.config.ts`

### Adding a shadcn/ui component
```bash
cd website
npx shadcn@latest add <component-name>
```
Components are installed to `src/components/ui/`.

### Modifying the database schema
1. Edit `website/convex/schema.ts`
2. If running `npx convex dev`, changes auto-sync
3. For production: `npx convex deploy --prod`

## Deployment

### Website → Vercel
```bash
cd website && vercel --prod
```
Set environment variables in Vercel dashboard.

### Backend → Convex
```bash
cd website && npx convex deploy --prod
```
Set `CLERK_JWT_ISSUER_DOMAIN` in Convex environment settings.

### Extension → Web Stores
```bash
./build.sh
# Upload dist/unifychats-chrome.zip to Chrome Web Store
# Upload dist/unifychats-firefox.zip to Firefox Add-ons
```

## Files to Never Commit
- `.env`, `.env.local`, `.env*.local` — contain secrets
- `node_modules/`, `website/node_modules/`
- `dist/` — build output
- `website/.next/` — Next.js build cache
- `.vercel/` — Vercel config
