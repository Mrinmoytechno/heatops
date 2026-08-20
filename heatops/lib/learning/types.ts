export type OutcomeEvaluationStatus =
  | "better_than_modeled"
  | "consistent_with_model"
  | "worse_than_modeled"
  | "insufficient_data";

export type RecommendationEvidence = {
  recommendationId: string | null;

  operationId: string | null;

  decisionId: string | null;

  siteId: string;

  outcomeId: string;

  evaluationStatus:
    OutcomeEvaluationStatus;

  modeledValue: number | null;

  actualValue: number | null;

  variance: number | null;

  variancePercentage: number | null;

  confidenceScore: number | null;

  evidenceSummary: string;

  evaluatedAt: string;
};

export type RecommendationEvidenceInput = {
  siteId: string;

  outcomeId: string;

  recommendationId: string | null;

  operationId: string | null;

  decisionId: string | null;

  modeledValue: number | null;

  actualValue: number | null;

  metricLabel: string;

  tolerancePercentage?: number;
};
