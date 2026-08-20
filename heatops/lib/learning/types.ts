export type OutcomeEvaluationStatus =
  | "better_than_modeled"
  | "consistent_with_model"
  | "worse_than_modeled"
  | "insufficient_data";

export type RecommendationEvidence = {
  id: string;

  recommendationId: string | null;

  operationId: string | null;

  decisionId: string | null;

  siteId: string;

  outcomeId: string;

  metricKey: string;

  metricLabel: string;

  evaluationStatus:
    OutcomeEvaluationStatus;

  modeledValue: number | null;

  actualValue: number | null;

  variance: number | null;

  variancePercentage: number | null;

  confidenceScore: number | null;

  evidenceSummary: string;

  evaluatedAt: string;

  createdAt: string;

  updatedAt: string;
};

export type RecommendationEvidenceInput = {
  siteId: string;

  outcomeId: string;

  recommendationId: string | null;

  operationId: string | null;

  decisionId: string | null;

  metricKey: string;

  modeledValue: number | null;

  actualValue: number | null;

  metricLabel: string;

  tolerancePercentage?: number;
};
