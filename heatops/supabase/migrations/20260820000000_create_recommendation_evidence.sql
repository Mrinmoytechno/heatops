create table if not exists public.recommendation_evidence (
  id uuid primary key default gen_random_uuid(),

  site_id uuid not null
    references public.sites(id)
    on delete cascade,

  outcome_id uuid not null
    references public.outcomes(id)
    on delete cascade,

  recommendation_id uuid null,

  operation_id uuid null
    references public.operations(id)
    on delete set null,

  decision_id uuid null
    references public.manager_decisions(id)
    on delete set null,

  metric_key text not null,

  metric_label text not null,

  evaluation_status text not null
    check (
      evaluation_status in (
        'better_than_modeled',
        'consistent_with_model',
        'worse_than_modeled',
        'insufficient_data'
      )
    ),

  modeled_value numeric null,

  actual_value numeric null,

  variance numeric null,

  variance_percentage numeric null,

  confidence_score numeric null,

  evidence_summary text not null,

  evaluated_at timestamptz not null
    default now(),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);

create index if not exists
  recommendation_evidence_site_id_idx
on public.recommendation_evidence(site_id);

create index if not exists
  recommendation_evidence_outcome_id_idx
on public.recommendation_evidence(outcome_id);

create index if not exists
  recommendation_evidence_recommendation_id_idx
on public.recommendation_evidence(recommendation_id);

create index if not exists
  recommendation_evidence_operation_id_idx
on public.recommendation_evidence(operation_id);

create index if not exists
  recommendation_evidence_decision_id_idx
on public.recommendation_evidence(decision_id);

alter table public.recommendation_evidence
  enable row level security;
