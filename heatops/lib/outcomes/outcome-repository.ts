import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

import {
  ManagerDecision,
  OutcomeRecord,
} from "./types";

type ManagerDecisionRow = {
  id: string;

  site_id: string;

  recommendation_id: string | null;

  operation_id: string | null;

  status: ManagerDecision["status"];

  original_recommendation: string;

  modified_action: string | null;

  decided_at: string;

  notes: string | null;
};

type OutcomeRow = {
  id: string;

  site_id: string;

  recommendation_id: string | null;

  operation_id: string | null;

  decision_id: string | null;

  status: OutcomeRecord["status"];

  modeled_metrics:
    OutcomeRecord["modeledMetrics"];

  actual_metrics:
    OutcomeRecord["actualMetrics"];

  comparisons:
    OutcomeRecord["comparisons"];

  created_at: string;

  updated_at: string;

  completed_at: string | null;
};

function mapDecisionRow(
  row: ManagerDecisionRow,
): ManagerDecision {
  return {
    id: row.id,

    siteId: row.site_id,

    recommendationId:
      row.recommendation_id,

    operationId:
      row.operation_id,

    status: row.status,

    originalRecommendation:
      row.original_recommendation,

    modifiedAction:
      row.modified_action,

    decidedAt:
      row.decided_at,

    notes: row.notes,
  };
}

function mapOutcomeRow(
  row: OutcomeRow,
): OutcomeRecord {
  return {
    id: row.id,

    siteId: row.site_id,

    recommendationId:
      row.recommendation_id,

    operationId:
      row.operation_id,

    decisionId:
      row.decision_id,

    status: row.status,

    modeledMetrics:
      row.modeled_metrics ?? [],

    actualMetrics:
      row.actual_metrics ?? [],

    comparisons:
      row.comparisons ?? [],

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    completedAt:
      row.completed_at,
  };
}

export async function saveManagerDecision(
  decision: ManagerDecision,
): Promise<ManagerDecision> {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from("manager_decisions")
      .insert({
        id: decision.id,

        site_id:
          decision.siteId,

        recommendation_id:
          decision.recommendationId,

        operation_id:
          decision.operationId,

        status:
          decision.status,

        original_recommendation:
          decision.originalRecommendation,

        modified_action:
          decision.modifiedAction,

        notes:
          decision.notes,

        decided_at:
          decision.decidedAt,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return mapDecisionRow(
    data as ManagerDecisionRow,
  );
}

export async function saveOutcome(
  outcome: OutcomeRecord,
): Promise<OutcomeRecord> {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from("outcomes")
      .insert({
        id: outcome.id,

        site_id:
          outcome.siteId,

        recommendation_id:
          outcome.recommendationId,

        operation_id:
          outcome.operationId,

        decision_id:
          outcome.decisionId,

        status:
          outcome.status,

        modeled_metrics:
          outcome.modeledMetrics,

        actual_metrics:
          outcome.actualMetrics,

        comparisons:
          outcome.comparisons,

        created_at:
          outcome.createdAt,

        updated_at:
          outcome.updatedAt,

        completed_at:
          outcome.completedAt,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return mapOutcomeRow(
    data as OutcomeRow,
  );
}

export async function getOutcomeById(
  outcomeId: string,
): Promise<OutcomeRecord | null> {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from("outcomes")
      .select("*")
      .eq(
        "id",
        outcomeId,
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapOutcomeRow(
    data as OutcomeRow,
  );
}

export async function updateOutcome(
  outcome: OutcomeRecord,
): Promise<OutcomeRecord> {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from("outcomes")
      .update({
        status:
          outcome.status,

        modeled_metrics:
          outcome.modeledMetrics,

        actual_metrics:
          outcome.actualMetrics,

        comparisons:
          outcome.comparisons,

        updated_at:
          outcome.updatedAt,

        completed_at:
          outcome.completedAt,
      })
      .eq(
        "id",
        outcome.id,
      )
      .select()
      .single();

  if (error) {
    throw error;
  }

  return mapOutcomeRow(
    data as OutcomeRow,
  );
}

export async function getOutcomesBySiteId(
  siteId: string,
): Promise<OutcomeRecord[]> {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from("outcomes")
      .select("*")
      .eq(
        "site_id",
        siteId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  if (error) {
    throw error;
  }

  return (
    (data ?? []) as OutcomeRow[]
  ).map(mapOutcomeRow);
}

export async function getOutcomesByDecisionId(
  decisionId: string,
): Promise<OutcomeRecord[]> {
  const supabase =
    await createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from("outcomes")
      .select("*")
      .eq(
        "decision_id",
        decisionId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  if (error) {
    throw error;
  }

  return (
    (data ?? []) as OutcomeRow[]
  ).map(mapOutcomeRow);
}