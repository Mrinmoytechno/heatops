import type {
  DecisionRecommendation,
} from "@/types/decision";

export type OperatingPlanPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type OperatingPlanItemStatus =
  | "action_required"
  | "recommended"
  | "monitor"
  | "no_change";

export type OperatingPlanItem = {
  operationId: string;

  operationName: string;

  zoneName?: string | null;

  priority: OperatingPlanPriority;

  status: OperatingPlanItemStatus;

  currentSchedule: {
    start: string;

    end: string;
  };

  recommendedSchedule?: {
    start: string;

    end: string;
  } | null;

  decision: DecisionRecommendation;

  summary: string;

  reason: string;

  riskBefore: number;

  projectedRiskAfter: number | null;

  createdAt: string;
};

export type HeatAdaptiveOperatingPlan = {
  siteId: string;

  analysisTime: string;

  title: string;

  summary: string;

  items: OperatingPlanItem[];

  totalOperationsAnalyzed: number;

  actionsRequired: number;

  recommendations: number;

  monitoringItems: number;

  generatedAt: string;
};