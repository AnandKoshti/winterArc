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

If you just signed up, confirm the verification email, then sign in. The link redirects through `/auth/callback`.

### 3. Database (automated migrations)

Do **not** paste SQL into the dashboard for every update. Use the CLI:

See full guide: [`supabase/MIGRATIONS.md`](./supabase/MIGRATIONS.md)

```bash
npm run db:login
npm run db:link          # paste your project ref
npm run db:push          # apply pending migrations
```

New schema change:

```bash
npm run db:new my_change   # edit the new file under supabase/migrations/
npm run db:push
```

Optional: GitHub Action auto-pushes migrations on `main` (needs `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD` secrets).

Legacy one-off files still live under `supabase/*.sql` for reference; **`supabase/migrations/`** is what gets applied.

### 4. Verify

- Login page should **not** show "Demo mode"
- Email/password signup shows a “check your email” prompt when confirmation is enabled
- After verifying, sign in works and continues to onboarding/dashboard

## Demo mode (local only)

If Supabase env vars are missing, the app runs in demo mode:

- Login: `anand@demo.com` (any password)

## Tech stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- Supabase (Auth + PostgreSQL)
- Zustand, Framer Motion, Recharts
