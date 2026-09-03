# Automating Supabase SQL (migrations)

Stop pasting into the SQL Editor for every change. Use **Supabase CLI migrations**.

## One-time setup

1. Install / use the CLI via npx (no global install required):

```bash
npx supabase --version
```

2. Log in (opens browser):

```bash
npm run db:login
```

3. Link this repo to your hosted project (Project Settings → General → Reference ID):

```bash
npm run db:link
# example ref: jdgyfgrztkbcpguebemm
```

4. **If you already ran SQL manually** in the dashboard, mark existing migrations as already applied so they are not re-run:

```bash
npx supabase migration list
npx supabase migration repair --status applied 20260902000001
npx supabase migration repair --status applied 20260902000002
npx supabase migration repair --status applied 20260902000003
npx supabase migration repair --status applied 20260902000004
npx supabase migration repair --status applied 20260902000005
npx supabase migration repair --status applied 20260902000006
npx supabase migration repair --status applied 20260902000007
```

(Only repair versions that you are sure already ran on that project.)

## Everyday workflow

### Create a new change

```bash
npm run db:new add_feature_name
```

This creates `supabase/migrations/<timestamp>_add_feature_name.sql`.  
Edit that file with your SQL (`CREATE OR REPLACE`, `ADD COLUMN IF NOT EXISTS`, etc.).

### Push to remote Supabase

```bash
npm run db:push
```

Only **new** (unapplied) migrations run. Old ones are tracked in `supabase_migrations.schema_migrations`.

### Check status

```bash
npm run db:status
```

## Optional: auto-push on GitHub deploy

Add secrets in GitHub → Settings → Secrets:

- `SUPABASE_ACCESS_TOKEN` — from [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
- `SUPABASE_PROJECT_REF` — your project ref
- `SUPABASE_DB_PASSWORD` — database password (Project Settings → Database)

Then the workflow `.github/workflows/supabase-migrate.yml` runs `db push` on pushes to `main` that touch `supabase/migrations/**`.

## Rules of thumb

- Put **every** schema/RPC change in a new migration file — never edit an already-pushed migration.
- Prefer idempotent SQL: `CREATE OR REPLACE`, `IF NOT EXISTS`, `DROP POLICY IF EXISTS`.
- Keep the loose files under `supabase/*.sql` as human-readable copies if you like; **migrations/** is the source of truth for automation.
