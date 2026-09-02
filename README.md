# Winter Arc

Build yourself. One day at a time.

Winter Arc is a social self-improvement and goal-tracking platform with RPG progression, streaks, badges, leaderboards, and friendly competition.

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel + Supabase

### 1. Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

Apply to **Production**, **Preview**, and **Development**.

**Important:** After adding or changing env vars, go to **Deployments → Redeploy** (env vars are baked in at build time).

Get values from **Supabase → Project Settings → API**.

### 2. Supabase Auth URLs

In **Supabase → Authentication → URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs** (add all of these):
  - `https://your-app.vercel.app/**`
  - `https://your-app.vercel.app/auth/callback`
  - `http://localhost:3000/**` (for local dev)

If you use Google sign-in, also add your Vercel URL in **Google Cloud Console → OAuth redirect URIs**:
- `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### 3. Run database SQL (once)

In **Supabase → SQL Editor**, run in order:

1. `supabase/schema.sql`
2. `supabase/auth-fix.sql`
3. `supabase/onboarding-fix.sql`
4. `supabase/rpc.sql`

### 4. Verify

- Login page should **not** show "Demo mode"
- Email/password signup and login should work
- Google sign-in redirects through `/auth/callback`

## Demo mode (local only)

If Supabase env vars are missing, the app runs in demo mode:

- Login: `anand@demo.com` (any password)

## Tech stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- Supabase (Auth + PostgreSQL)
- Zustand, Framer Motion, Recharts
