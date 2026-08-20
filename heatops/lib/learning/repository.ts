import { createClient } from "@/lib/supabase/server";

import type {
  RecommendationEvidence,
} from "./types";

type RecommendationEvidenceRow = {
  id: string;

  site_id: string;

  outcome_id: string;

  recommendation_id: string | null;

  operation_id: string | null;

  decision_id: string | null;

  metric_key: string;

  metric_label: string;

  evaluation_status:
    RecommendationEvidence["evaluationStatus"];

  modeled_value: string | number | null;

  actual_value: string | number | null;

  variance: string | number | null;

  variance_percentage:
    string | number | null;

  confidence_score:
    string | number | null;

  evidence_summary: string;

  evaluated_at: string;

  created_at: string;

  updated_at: string;
};

function toNumber(
  value: string | number | null,
): number | null {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function mapRow(
  row: RecommendationEvidenceRow,
): RecommendationEvidence {
  return {
    id: row.id,

    siteId: row.site_id,

    outcomeId: row.outcome_id,

    recommendationId:
      row.recommendation_id,

    operationId:
      row.operation_id,

    decisionId:
      row.decision_id,

    metricKey:
      row.metric_key,

    metricLabel:
      row.metric_label,

    evaluationStatus:
      row.evaluation_status,

    modeledValue:
      toNumber(
        row.modeled_value,
      ),

    actualValue:
      toNumber(
        row.actual_value,
      ),

    variance:
      toNumber(
        row.variance,
      ),

    variancePercentage:
      toNumber(
        row.variance_percentage,
      ),

    confidenceScore:
      toNumber(
        row.confidence_score,
      ),

    evidenceSummary:
      row.evidence_summary,

    evaluatedAt:
      row.evaluated_at,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

export async function saveRecommendationEvidence(
  evidence: RecommendationEvidence,
): Promise<RecommendationEvidence> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("recommendation_evidence")
      .insert({
        id: evidence.id,

        site_id:
          evidence.siteId,

        outcome_id:
          evidence.outcomeId,

        recommendation_id:
          evidence.recommendationId,

        operation_id:
          evidence.operationId,

        decision_id:
          evidence.decisionId,

        metric_key:
          evidence.metricKey,

        metric_label:
          evidence.metricLabel,

        evaluation_status:
          evidence.evaluationStatus,

        modeled_value:
          evidence.modeledValue,

        actual_value:
          evidence.actualValue,

        variance:
          evidence.variance,

        variance_percentage:
          evidence.variancePercentage,

        confidence_score:
          evidence.confidenceScore,

        evidence_summary:
          evidence.evidenceSummary,

        evaluated_at:
          evidence.evaluatedAt,

        created_at:
          evidence.createdAt,

        updated_at:
          evidence.updatedAt,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return mapRow(
    data as RecommendationEvidenceRow,
  );
}

export async function getEvidenceByOutcomeId(
  outcomeId: string,
): Promise<RecommendationEvidence[]> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("recommendation_evidence")
      .select("*")
      .eq(
        "outcome_id",
        outcomeId,
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
    (data ?? []) as RecommendationEvidenceRow[]
  ).map(mapRow);
}

export async function getEvidenceByRecommendationId(
  recommendationId: string,
): Promise<RecommendationEvidence[]> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("recommendation_evidence")
      .select("*")
      .eq(
        "recommendation_id",
        recommendationId,
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
    (data ?? []) as RecommendationEvidenceRow[]
  ).map(mapRow);
  }
