# AppNex

**The universal app distribution platform.** Paste any URL — PWA, APK, or web app — and AppNex automatically extracts metadata and generates a clean listing with a working install button.

![AppNex](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss) ![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?logo=supabase) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

---

## Features

- 🔗 **Paste any URL** — PWA, APK download link, or web app
- ⚡ **Auto-extraction** — fetches manifest, meta tags, favicon automatically
- 📱 **Universal install button** — PWA install prompt, APK download, or web open
- 🎨 **Dynamic animated background** — smooth colour-cycling hero section
- 🔐 **Auth pages** — Login, Sign Up with password strength indicator
- 💰 **Pricing page** — Free / Pro / Team / Enterprise tiers
- 🆘 **Support page** — FAQ accordion, contact form, documentation links
- 🗂️ **Play Store-style listing** — row cards with icon, type badge, star rating, install button
- 🌐 **Hamburger menu** — animated 3-strip button with slide-down drawer

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 15 (App Router)           |
| Styling    | Tailwind CSS v4                   |
| Database   | Supabase (PostgreSQL)             |
| Language   | TypeScript                        |
| Icons      | Lucide React                      |
| Scraping   | Cheerio (server-side)             |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/brainexstark/AppNex.git
cd AppNex
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up the database

Run the SQL in `supabase/schema.sql` in your Supabase SQL editor:

```sql
-- Creates the apps table with RLS policies
-- See supabase/schema.sql for full schema
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
AppNex/
├── app/
│   ├── page.tsx              # Homepage (hero + how it works + testimonials)
│   ├── apps/page.tsx         # Play Store-style app listing
│   ├── app/[id]/page.tsx     # Individual app page
│   ├── submit/page.tsx       # Submit an app
│   ├── login/page.tsx        # Login page
│   ├── signup/page.tsx       # Sign up page
│   ├── pricing/page.tsx      # Pricing tiers
│   ├── support/page.tsx      # FAQ + contact form
│   ├── api/
│   │   ├── extract/route.ts  # URL metadata extraction
│   │   └── apps/route.ts     # CRUD for apps
│   └── globals.css           # Global styles + animations
├── components/
│   ├── Navbar.tsx            # Sticky nav + hamburger drawer
│   ├── HomeHero.tsx          # Animated hero with rotating copy
│   ├── AppRowCard.tsx        # Play Store-style row card
│   ├── AppCard.tsx           # Grid card
│   ├── AppIcon.tsx           # Icon with fallback
│   ├── InstallButton.tsx     # Universal install handler
│   ├── UrlInput.tsx          # Debounced URL input
│   ├── PreviewCard.tsx       # Submission preview
│   └── AppsGrid.tsx          # Filterable app grid
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── extract.ts            # Client-side extract helper
│   └── supabase/             # Supabase client (browser + server)
└── supabase/
    └── schema.sql            # Database schema + RLS policies
```

---

## Database Schema

```sql
create table public.apps (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  type        text not null check (type in ('pwa', 'apk', 'web')),
  url         text not null unique,
  icon        text not null default '',
  theme_color text,
  created_at  timestamptz not null default now()
);
```

---

## Deployment

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brainexstark/AppNex)

Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in the Vercel dashboard.

---

## License

MIT © 2026 AppNex
