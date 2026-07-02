# SignalScout Deployment Guide

This guide moves SignalScout from a local prototype to a Vercel-hosted app with a Supabase database.

## 1. Create Supabase

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Copy these values from Project Settings:
   - Project URL
   - anon public key
   - service role key, only if/when server-side writes are added

## 2. Configure Authentication

For the current prototype, the UI still includes a local user switcher. To make this production-grade:

1. Enable Supabase Auth.
2. Add your colleagues as users.
3. Insert corresponding rows into `profiles`.
4. Replace the local user switcher with Supabase Auth session identity.

Recommended first profile insert:

```sql
insert into public.profiles (id, full_name, email, role, team)
values ('<auth-user-id>', 'Your Name', 'you@company.com', 'Admin', 'Global');
```

## 3. Create Vercel Project

1. Push this folder to a Git provider.
2. In Vercel, create a new project from that repository.
3. Framework preset: Next.js.
4. Build command: `npm.cmd run build` or `npm run build`.
5. Install command: `npm.cmd install --no-audit --no-fund --cache ./.npm-cache` or `npm install --no-audit --no-fund`.

## 4. Add Vercel Environment Variables

Add these in Vercel Project Settings:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Optional later:

```text
SUPABASE_SERVICE_ROLE_KEY=...
```

Never expose the service role key as `NEXT_PUBLIC_*`.

## 5. Deploy

1. Trigger a Vercel deploy.
2. After deploy, visit `/api/health`.
3. Expected result:

```json
{"ok":true,"product":"SignalScout"}
```

## 6. Current Prototype Storage State

Important: the UI currently uses browser-local storage for most interactive state, including user switching, notes, activity, watchlist, and saved signals.

The Supabase schema and seed data are ready, but the final production step is to replace the local storage adapter in `lib/storage.ts` with Supabase-backed reads/writes.

Recommended port order:

1. `profiles` and auth session identity.
2. `companies` and `target_accounts`.
3. `signals`.
4. `news_articles`.
5. `notes`, `activity_events`, and `company_watchers`.
6. Settings tables or per-user JSON settings.

## 7. Governance Reminder

SignalScout is for public-source signal research only. Do not enter confidential company, customer, CRM, pricing, pipeline, or internal campaign information.

Do not add:

- CRM integration
- Gong integration
- LinkedIn scraping or automation
- Email automation
- internal Board collateral or campaign links
- contact databases or enrichment tools

## 8. Suggested Colleague Rollout

For a pilot:

1. Deploy to Vercel.
2. Share the Vercel URL.
3. Ask colleagues to use public URLs only.
4. Have each user validate the workflow:
   - scan public news
   - add a signal
   - review signal-to-play mapping
   - copy briefing
   - manually record follow-up outside SignalScout

For a shared-data pilot, complete the Supabase storage adapter before broad circulation.
