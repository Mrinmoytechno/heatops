import {
  ActualOutcomeMetric,
  CreateManagerDecisionInput,
  CreateOutcomeRecordInput,
  ManagerDecision,
  OutcomeComparison,
  OutcomeRecord,
  RecordActualOutcomeInput,
} from "./types";

function createId(): string {
  return crypto.randomUUID();
}

function calculateDifferencePercent(
  modeledValue: number,
  actualValue: number,
): number | null {
  if (modeledValue === 0) {
    return null;
  }

  return (
    ((actualValue - modeledValue) / Math.abs(modeledValue)) *
    100
  );
}

function buildComparisons(
  outcome: OutcomeRecord,
): OutcomeComparison[] {
  const actualMetricsByKey = new Map(
    outcome.actualMetrics.map((metric) => [
      metric.key,
      metric,
    ]),
  );

  return outcome.modeledMetrics.map((modeledMetric) => {
    const actualMetric =
      actualMetricsByKey.get(modeledMetric.key);

    if (!actualMetric) {
      return {
        key: modeledMetric.key,
        label: modeledMetric.label,
        unit: modeledMetric.unit,
        modeledValue: modeledMetric.value,
        actualValue: null,
        difference: null,
        differencePercent: null,
      };
    }

    const difference =
      actualMetric.value - modeledMetric.value;

    return {
      key: modeledMetric.key,
      label: modeledMetric.label,
      unit: modeledMetric.unit,
      modeledValue: modeledMetric.value,
      actualValue: actualMetric.value,
      difference,
      differencePercent:
        calculateDifferencePercent(
          modeledMetric.value,
          actualMetric.value,
        ),
    };
  });
}

export function createManagerDecision(
  input: CreateManagerDecisionInput,
): ManagerDecision {
  const decidedAt =
    input.decidedAt ?? new Date().toISOString();

  return {
    id: createId(),

    siteId: input.siteId,

    recommendationId:
      input.recommendationId ?? null,

    operationId:
      input.operationId ?? null,

    status: input.status,

    originalRecommendation:
      input.originalRecommendation,

    modifiedAction:
      input.modifiedAction ?? null,

    decidedAt,

    notes: input.notes ?? null,
  };
}

export function createOutcomeRecord(
  input: CreateOutcomeRecordInput,
): OutcomeRecord {
  const now = new Date().toISOString();

  const outcome: OutcomeRecord = {
    id: createId(),

    siteId: input.siteId,

    recommendationId:
      input.recommendationId ?? null,

    operationId:
      input.operationId ?? null,

    decisionId:
      input.decisionId ?? null,

    status:
      input.status ?? "pending",

    modeledMetrics:
      input.modeledMetrics ?? [],

    actualMetrics:
      input.actualMetrics ?? [],

    comparisons: [],

    createdAt: now,

    updatedAt: now,

    completedAt: null,
  };

  outcome.comparisons =
    buildComparisons(outcome);

  return outcome;
}

export function recordActualOutcome(
  outcome: OutcomeRecord,
  input: RecordActualOutcomeInput,
): OutcomeRecord {
  if (outcome.id !== input.outcomeId) {
    throw new Error(
      "OUTCOME_ID_MISMATCH",
    );
  }

  const completedAt =
    input.completedAt ??
    (input.status === "completed"
      ? new Date().toISOString()
      : outcome.completedAt);

  const updatedOutcome: OutcomeRecord = {
    ...outcome,

    actualMetrics: input.metrics,

    status:
      input.status ?? "completed",

    updatedAt: new Date().toISOString(),

    completedAt,
  };

  updatedOutcome.comparisons =
    buildComparisons(updatedOutcome);

  return updatedOutcome;
    }
