import type {
  OutcomeEvaluationStatus,
  RecommendationEvidence,
} from "./types";

export type EvidenceStrength =
  | "none"
  | "limited"
  | "emerging"
  | "moderate"
  | "strong";

export type RecommendationPerformanceProfile = {
  recommendationId: string;

  totalEvidenceRecords: number;

  evaluatedRecords: number;

  insufficientDataRecords: number;

  betterThanModeledCount: number;

  consistentWithModelCount: number;

  worseThanModeledCount: number;

  averageConfidenceScore: number | null;

  averageVariancePercentage: number | null;

  averageAbsoluteVariancePercentage: number | null;

  evidenceStrength: EvidenceStrength;

  summary: string;
};

function round(
  value: number,
  decimals = 2,
): number {
  const factor =
    10 ** decimals;

  return (
    Math.round(value * factor) /
    factor
  );
}

function average(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  return round(
    total / values.length,
  );
}

function getEvidenceStrength(
  evaluatedRecords: number,
): EvidenceStrength {
  if (evaluatedRecords === 0) {
    return "none";
  }

  if (evaluatedRecords <= 2) {
    return "limited";
  }

  if (evaluatedRecords <= 5) {
    return "emerging";
  }

  if (evaluatedRecords <= 15) {
    return "moderate";
  }

  return "strong";
}

function createSummary(
  strength: EvidenceStrength,
  evaluatedRecords: number,
  consistentCount: number,
  betterCount: number,
  worseCount: number,
  averageConfidenceScore: number | null,
): string {
  if (strength === "none") {
    return "No completed evidence is available yet. Future outcomes should be recorded before using performance history.";
  }

  const consistentPercentage =
    evaluatedRecords > 0
      ? round(
          (consistentCount /
            evaluatedRecords) *
            100,
        )
      : 0;

  const betterPercentage =
    evaluatedRecords > 0
      ? round(
          (betterCount /
            evaluatedRecords) *
            100,
        )
      : 0;

  const worsePercentage =
    evaluatedRecords > 0
      ? round(
          (worseCount /
            evaluatedRecords) *
            100,
        )
      : 0;

  const confidenceText =
    averageConfidenceScore === null
      ? "No average confidence is available yet."
      : `Average model agreement score is ${averageConfidenceScore}%.`;

  return `${strength.charAt(
    0,
  ).toUpperCase()}${strength.slice(
    1,
  )} evidence based on ${evaluatedRecords} evaluated outcome${
    evaluatedRecords === 1
      ? ""
      : "s"
  }: ${consistentPercentage}% consistent with the model, ${betterPercentage}% better than modeled, and ${worsePercentage}% worse than modeled. ${confidenceText}`;
}

export function buildRecommendationPerformanceProfile(
  recommendationId: string,
  evidence: RecommendationEvidence[],
): RecommendationPerformanceProfile {
  const statusCounts:
    Record<
      OutcomeEvaluationStatus,
      number
    > = {
      better_than_modeled: 0,
      consistent_with_model: 0,
      worse_than_modeled: 0,
      insufficient_data: 0,
    };

  const confidenceScores:
    number[] = [];

  const variancePercentages:
    number[] = [];

  const absoluteVariancePercentages:
    number[] = [];

  for (
    const record of evidence
  ) {
    statusCounts[
      record.evaluationStatus
    ] += 1;

    if (
      record.confidenceScore !== null
    ) {
      confidenceScores.push(
        record.confidenceScore,
      );
    }

    if (
      record.variancePercentage !== null
    ) {
      variancePercentages.push(
        record.variancePercentage,
      );

      absoluteVariancePercentages.push(
        Math.abs(
          record.variancePercentage,
        ),
      );
    }
  }

  const evaluatedRecords =
    evidence.length -
    statusCounts.insufficient_data;

  const evidenceStrength =
    getEvidenceStrength(
      evaluatedRecords,
    );

  const averageConfidenceScore =
    average(confidenceScores);

  const averageVariancePercentage =
    average(variancePercentages);

  const averageAbsoluteVariancePercentage =
    average(
      absoluteVariancePercentages,
    );

  return {
    recommendationId,

    totalEvidenceRecords:
      evidence.length,

    evaluatedRecords,

    insufficientDataRecords:
      statusCounts.insufficient_data,

    betterThanModeledCount:
      statusCounts.better_than_modeled,

    consistentWithModelCount:
      statusCounts.consistent_with_model,

    worseThanModeledCount:
      statusCounts.worse_than_modeled,

    averageConfidenceScore,

    averageVariancePercentage,

    averageAbsoluteVariancePercentage,

    evidenceStrength,

    summary: createSummary(
      evidenceStrength,
      evaluatedRecords,
      statusCounts.consistent_with_model,
      statusCounts.better_than_modeled,
      statusCounts.worse_than_modeled,
      averageConfidenceScore,
    ),
  };
       }
