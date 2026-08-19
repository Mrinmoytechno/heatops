export type OutcomeSource =
  | "observed"
  | "calculated"
  | "modeled"
  | "actual";

export type ManagerDecisionStatus =
  | "accepted"
  | "modified"
  | "rejected"
  | "pending";

export type OutcomeStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "unavailable";

export type ActualOutcomeMetric = {
  key: string;

  label: string;

  value: number;

  unit: string;

  source: OutcomeSource;

  recordedAt: string;

  notes?: string | null;
};

export type ModeledOutcomeMetric = {
  key: string;

  label: string;

  value: number;

  unit: string;

  source: "modeled";

  assumptions?: string[];

  calculatedAt: string;
};

export type OutcomeComparison = {
  key: string;

  label: string;

  unit: string;

  modeledValue: number | null;

  actualValue: number | null;

  difference: number | null;

  differencePercent: number | null;
};

export type ManagerDecision = {
  id: string;

  siteId: string;

  recommendationId: string | null;

  operationId: string | null;

  status: ManagerDecisionStatus;

  originalRecommendation: string;

  modifiedAction: string | null;

  decidedAt: string;

  notes: string | null;
};

export type OutcomeRecord = {
  id: string;

  siteId: string;

  recommendationId: string | null;

  operationId: string | null;

  decisionId: string | null;

  status: OutcomeStatus;

  modeledMetrics: ModeledOutcomeMetric[];

  actualMetrics: ActualOutcomeMetric[];

  comparisons: OutcomeComparison[];

  createdAt: string;

  updatedAt: string;

  completedAt: string | null;
};

export type CreateManagerDecisionInput = {
  siteId: string;

  recommendationId?: string | null;

  operationId?: string | null;

  status: ManagerDecisionStatus;

  originalRecommendation: string;

  modifiedAction?: string | null;

  notes?: string | null;

  decidedAt?: string;
};

export type CreateOutcomeRecordInput = {
  siteId: string;

  recommendationId?: string | null;

  operationId?: string | null;

  decisionId?: string | null;

  modeledMetrics?: ModeledOutcomeMetric[];

  actualMetrics?: ActualOutcomeMetric[];

  status?: OutcomeStatus;
};

export type RecordActualOutcomeInput = {
  outcomeId: string;

  metrics: ActualOutcomeMetric[];

  status?: OutcomeStatus;

  completedAt?: string | null;
};
