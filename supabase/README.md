# SignalScout Supabase Setup

Run these files in the Supabase SQL editor in this order:

1. `schema.sql`
2. `seed.sql`

The schema creates the shared tables for companies, signals, target accounts, sales plays, notes, activity, watchers, scoring rules, profiles, and discovered news articles.

For a trusted internal prototype, you can begin with RLS disabled while testing. Before broader rollout, enable RLS and add policies for authenticated users.
