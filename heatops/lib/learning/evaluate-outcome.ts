import type {
  OutcomeEvaluationStatus,
  RecommendationEvidence,
  RecommendationEvidenceInput,
} from "./types";

function round(
  value: number,
  decimals = 2,
): number {
  const factor =
    10 ** decimals;

  return Math.round(
    value * factor,
  ) / factor;
}

function determineStatus(
  modeledValue: number | null,
  actualValue: number | null,
  tolerancePercentage: number,
): OutcomeEvaluationStatus {
  if (
    modeledValue === null ||
    actualValue === null
  ) {
    return "insufficient_data";
  }

  if (modeledValue === 0) {
    return "insufficient_data";
  }

  const variancePercentage =
    ((actualValue - modeledValue) /
      Math.abs(modeledValue)) *
    100;

  if (
    Math.abs(variancePercentage) <=
    tolerancePercentage
  ) {
    return "consistent_with_model";
  }

  if (actualValue < modeledValue) {
    return "better_than_modeled";
  }

  return "worse_than_modeled";
}

function calculateConfidence(
  modeledValue: number | null,
  actualValue: number | null,
): number | null {
  if (
    modeledValue === null ||
    actualValue === null ||
    modeledValue === 0
  ) {
    return null;
  }

  const errorPercentage =
    Math.abs(
      ((actualValue - modeledValue) /
        Math.abs(modeledValue)) *
        100,
    );

  return round(
    Math.max(
      0,
      100 - errorPercentage,
    ),
  );
}

function createSummary(
  metricLabel: string,
  status: OutcomeEvaluationStatus,
  modeledValue: number | null,
  actualValue: number | null,
  variancePercentage: number | null,
): string {
  if (
    status === "insufficient_data"
  ) {
    return `Insufficient data to compare the modeled ${metricLabel} with the recorded outcome.`;
  }

  if (
    modeledValue === null ||
    actualValue === null ||
    variancePercentage === null
  ) {
    return `Outcome evidence is incomplete for ${metricLabel}.`;
  }

  const difference =
    Math.abs(
      variancePercentage,
    );

  if (
    status ===
    "consistent_with_model"
  ) {
    return `Recorded ${metricLabel} was within ${round(
      difference,
    )}% of the modeled result.`;
  }

  if (
    status ===
    "better_than_modeled"
  ) {
    return `Recorded ${metricLabel} performed ${round(
      difference,
    )}% better than the modeled result.`;
  }

  return `Recorded ${metricLabel} performed ${round(
    difference,
  )}% worse than the modeled result.`;
}

export function evaluateOutcome(
  input: RecommendationEvidenceInput,
): RecommendationEvidence {
  const tolerancePercentage =
    input.tolerancePercentage ?? 15;

  const status =
    determineStatus(
      input.modeledValue,
      input.actualValue,
      tolerancePercentage,
    );

  const variance =
    input.modeledValue !== null &&
    input.actualValue !== null
      ? round(
          input.actualValue -
            input.modeledValue,
        )
      : null;

  const variancePercentage =
    input.modeledValue !== null &&
    input.actualValue !== null &&
    input.modeledValue !== 0
      ? round(
          ((input.actualValue -
            input.modeledValue) /
            Math.abs(
              input.modeledValue,
            )) *
            100,
        )
      : null;

  return {
    recommendationId:
      input.recommendationId,

    operationId:
      input.operationId,

    decisionId:
      input.decisionId,

    siteId:
      input.siteId,

    outcomeId:
      input.outcomeId,

    evaluationStatus:
      status,

    modeledValue:
      input.modeledValue,

    actualValue:
      input.actualValue,

    variance,

    variancePercentage,

    confidenceScore:
      calculateConfidence(
        input.modeledValue,
        input.actualValue,
      ),

    evidenceSummary:
      createSummary(
        input.metricLabel,
        status,
        input.modeledValue,
        input.actualValue,
        variancePercentage,
      ),

    evaluatedAt:
      new Date().toISOString(),
  };
  }
