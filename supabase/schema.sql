create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  industry text not null,
  website text,
  owner_user_id uuid,
  assigned_bdr_user_id uuid,
  assigned_sales_user_id uuid,
  visibility text not null default 'Shared',
  priority text,
  status text not null default 'Not Reviewed',
  last_reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  full_name text not null,
  email text not null,
  role text not null,
  team text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.sales_plays (
  id uuid primary key default gen_random_uuid(),
  play_name text not null,
  play_category text not null,
  description text not null,
  trigger_signals text[] not null default '{}',
  likely_business_pain text not null,
  relevant_board_use_case text not null,
  suggested_discovery_question text not null,
  suggested_next_action text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source_url text not null,
  source_title text not null,
  source_date date,
  intent_source text not null default 'Public Signal',
  signal_type text not null,
  summary text not null,
  why_it_matters text not null,
  possible_business_pain text not null,
  board_use_case text not null,
  recommended_play_name text,
  recommended_play_reason text,
  suggested_manual_research_steps text,
  suggested_next_action text,
  copyable_internal_gpt_briefing text,
  opportunity_score integer not null check (opportunity_score between 0 and 100),
  suggested_discovery_question text not null,
  suggested_linkedin_comment text not null,
  suggested_connection_note text not null,
  suggested_first_message text not null,
  status text not null default 'New',
  created_by_user_id uuid,
  owner_user_id uuid,
  assigned_to_user_id uuid,
  play_id uuid references public.sales_plays(id) on delete set null,
  copied_to_internal_gpt boolean not null default false,
  copied_to_gong_flow boolean not null default false,
  manually_added_to_crm boolean not null default false,
  last_action_at timestamp with time zone,
  user_notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.company_watchers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  unique(company_id, user_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  signal_id uuid references public.signals(id) on delete cascade,
  user_id uuid not null,
  note_text text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  company_id uuid references public.companies(id) on delete cascade,
  signal_id uuid references public.signals(id) on delete cascade,
  user_id uuid not null,
  event_summary text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.scoring_rules (
  id uuid primary key default gen_random_uuid(),
  signal_type text not null unique,
  score integer not null check (score between 0 and 100),
  description text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.target_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  industry text not null,
  website text,
  notes text,
  priority text not null default 'Monitor',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  target_account_id uuid references public.target_accounts(id) on delete set null,
  account_name text not null,
  title text not null,
  url text not null unique,
  source text not null,
  intent_source text not null default 'News',
  published_at timestamp with time zone,
  snippet text,
  signal_id uuid references public.signals(id) on delete set null,
  found_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

insert into public.scoring_rules (signal_type, score, description)
values
  ('M&A / Acquisition / Divestment', 25, 'Consolidation, integration, reporting, and planning complexity.'),
  ('Earnings Miss / Guidance Change', 25, 'Forecasting, planning, margin, or demand issue.'),
  ('Inventory / Working Capital Issue', 20, 'Demand planning, supply-chain, or S&OP pressure.'),
  ('Supply Chain Disruption', 20, 'Production, logistics, supplier, or capacity volatility.'),
  ('Executive Change', 15, 'New leadership may reset planning, finance, or operations priorities.'),
  ('Job Advertisement Signal', 15, 'Hiring indicates active capability building or process gaps.'),
  ('Expansion / New Market / New Facility', 15, 'Operational planning, workforce, capacity, and supply-chain complexity.'),
  ('Technology / Transformation Signal', 15, 'ERP, finance, data, AI, or planning transformation.')
on conflict (signal_type) do update
set score = excluded.score,
    description = excluded.description,
    updated_at = now();

insert into public.sales_plays (
  play_name,
  play_category,
  description,
  trigger_signals,
  likely_business_pain,
  relevant_board_use_case,
  suggested_discovery_question,
  suggested_next_action
)
values
  ('Inventory Growth / Working Capital Pressure', 'Supply Chain Planning', 'Inventory build, working-capital pressure, or demand-supply mismatch.', array['Inventory / Working Capital Issue','Supply Chain Disruption'], 'Demand assumptions, inventory buffers, and working-capital targets may not be aligned.', 'IBP / S&OP', 'How are inventory and working-capital assumptions connected to your latest demand and supply plans?', 'Research recent financial commentary, look for planning or supply-chain leaders, and prepare an account hypothesis.'),
  ('Acquisition / Group Complexity', 'Group Reporting', 'Acquisitions, divestments, or subsidiaries create integration and reporting complexity.', array['M&A / Acquisition / Divestment'], 'New entities may be slow to integrate into consolidation, reporting, and forecast cycles.', 'Group Consolidation & Reporting', 'How quickly do acquired entities need to be incorporated into group reporting and planning?', 'Research group structure, acquired entities, integration timing, and finance leadership.'),
  ('Profit Warning / Guidance Downgrade', 'Enterprise Planning', 'Public guidance, margin, or profit commentary changes materially.', array['Earnings Miss / Guidance Change'], 'Finance teams may need faster scenario planning and clearer drivers of forecast change.', 'FP&A / Enterprise Planning', 'How quickly can operating changes be reflected in forecast and margin scenarios?', 'Research earnings commentary and identify finance leaders.'),
  ('New CFO / Finance Leadership Change', 'Finance Transformation', 'Finance leadership change may create a mandate to improve planning, reporting, or performance management.', array['Executive Change'], 'New finance leaders often reassess planning cadence, reporting quality, and transformation priorities.', 'Finance Transformation', 'What planning or reporting priorities are likely to change under the new finance leadership?', 'Research CFO mandate and recent company performance.'),
  ('Expansion / New Facility / New Market', 'Capacity Planning', 'New facilities, markets, or capacity changes create operational planning complexity.', array['Expansion / New Market / New Facility'], 'Growth plans may pressure workforce, capacity, supply-chain, and capital planning.', 'Workforce / Capacity Planning', 'How are expansion milestones connected to workforce, capacity, and supply plans?', 'Research the expansion plan and operational leadership.'),
  ('S&OP / FP&A / Planning Hiring', 'Planning Maturity', 'Public hiring suggests capability-building around planning, S&OP, demand planning, or FP&A.', array['Job Advertisement Signal','Technology / Transformation Signal'], 'The company may be addressing fragmented planning processes or manual forecast cycles.', 'IBP / S&OP', 'What planning-process improvement is the role or program expected to unlock?', 'Review the job description and infer capability gaps.');
