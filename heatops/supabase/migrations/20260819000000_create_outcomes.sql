create table if not exists public.manager_decisions (
  id uuid primary key default gen_random_uuid(),

  site_id uuid not null
    references public.sites(id)
    on delete cascade,

  recommendation_id uuid null,

  operation_id uuid null
    references public.operations(id)
    on delete set null,

  status text not null
    check (
      status in (
        'accepted',
        'modified',
        'rejected',
        'pending'
      )
    ),

  original_recommendation text not null,

  modified_action text null,

  notes text null,

  decided_at timestamptz not null
    default now(),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);

create table if not exists public.outcomes (
  id uuid primary key default gen_random_uuid(),

  site_id uuid not null
    references public.sites(id)
    on delete cascade,

  recommendation_id uuid null,

  operation_id uuid null
    references public.operations(id)
    on delete set null,

  decision_id uuid null
    references public.manager_decisions(id)
    on delete set null,

  status text not null
    default 'pending'
    check (
      status in (
        'pending',
        'in_progress',
        'completed',
        'unavailable'
      )
    ),

  modeled_metrics jsonb not null
    default '[]'::jsonb,

  actual_metrics jsonb not null
    default '[]'::jsonb,

  comparisons jsonb not null
    default '[]'::jsonb,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  completed_at timestamptz null
);

create index if not exists
  manager_decisions_site_id_idx
on public.manager_decisions(site_id);

create index if not exists
  manager_decisions_operation_id_idx
on public.manager_decisions(operation_id);

create index if not exists
  outcomes_site_id_idx
on public.outcomes(site_id);

create index if not exists
  outcomes_operation_id_idx
on public.outcomes(operation_id);

create index if not exists
  outcomes_decision_id_idx
on public.outcomes(decision_id);

alter table public.manager_decisions
  enable row level security;

alter table public.outcomes
  enable row level security;
