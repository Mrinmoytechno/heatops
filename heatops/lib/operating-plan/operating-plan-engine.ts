import type { DecisionResult } from "@/lib/decision";
import type {
  HeatAdaptiveOperatingPlan,
  OperatingPlanItem,
  OperatingPlanItemStatus,
  OperatingPlanPriority,
} from "./types";

type CreateOperatingPlanItemInput = {
  siteId: string;
  operationId: string;
  operationName: string;
  zoneName?: string | null;

  scheduledStart: string;
  scheduledEnd: string;

  decision: DecisionResult;
};

type CreateOperatingPlanInput = {
  siteId: string;
  analysisTime: string;
  operations: CreateOperatingPlanItemInput[];
};

function getPriority(riskScore: number): OperatingPlanPriority {
  if (riskScore >= 80) return "critical";
  if (riskScore >= 60) return "high";
  if (riskScore >= 40) return "medium";

  return "low";
}

function getStatus(
  decision: DecisionResult,
  riskScore: number,
): OperatingPlanItemStatus {
  if (decision.recommendation.action === "maintain") {
    return riskScore >= 40 ? "monitor" : "no_change";
  }

  if (riskScore >= 80) {
    return "action_required";
  }

  return "recommended";
}

function getRecommendedSchedule(decision: DecisionResult) {
  const schedule = decision.recommendation.schedule;

  if (!schedule) {
    return null;
  }

  return {
    start: schedule.start,
    end: schedule.end,
  };
}

function getSummary(
  operationName: string,
  decision: DecisionResult,
): string {
  switch (decision.recommendation.action) {
    case "move_earlier":
      return `Move ${operationName} earlier to reduce thermal exposure.`;

    case "move_later":
      return `Move ${operationName} later to avoid the peak thermal window.`;

    case "split_operation":
      return `Split ${operationName} to reduce continuous heat exposure.`;

    case "prioritize":
      return `Prioritize ${operationName} before conditions become more severe.`;

    case "reduce_exposure":
      return `Reduce heat exposure during ${operationName}.`;

    case "maintain":
    default:
      return `Maintain the current schedule for ${operationName}.`;
  }
}

function getReason(decision: DecisionResult): string {
  return decision.recommendation.reason;
}

export function createOperatingPlan(
  input: CreateOperatingPlanInput,
): HeatAdaptiveOperatingPlan {
  const items: OperatingPlanItem[] = input.operations.map((operation) => {
    const riskScore = operation.decision.risk.score;

    return {
      operationId: operation.operationId,
      operationName: operation.operationName,
      zoneName: operation.zoneName ?? null,

      priority: getPriority(riskScore),

      status: getStatus(
        operation.decision,
        riskScore,
      ),

      currentSchedule: {
        start: operation.scheduledStart,
        end: operation.scheduledEnd,
      },

      recommendedSchedule: getRecommendedSchedule(
        operation.decision,
      ),

      decision: operation.decision,

      summary: getSummary(
        operation.operationName,
        operation.decision,
      ),

      reason: getReason(operation.decision),

      riskBefore: riskScore,

      projectedRiskAfter:
        operation.decision.projectedRisk?.score ?? null,

      createdAt: new Date().toISOString(),
    };
  });

  const actionsRequired = items.filter(
    (item) => item.status === "action_required",
  ).length;

  const recommendations = items.filter(
    (item) => item.status === "recommended",
  ).length;

  const monitoringItems = items.filter(
    (item) => item.status === "monitor",
  ).length;

  const totalActions = actionsRequired + recommendations;

  return {
    siteId: input.siteId,
    analysisTime: input.analysisTime,

    title: "Heat-Adapted Operating Plan",

    summary:
      totalActions > 0
        ? `${totalActions} operational ${
            totalActions === 1 ? "change is" : "changes are"
          } recommended based on the analyzed thermal conditions.`
        : "No immediate operational changes are recommended for the analyzed conditions.",

    items,

    totalOperationsAnalyzed: items.length,
    actionsRequired,
    recommendations,
    monitoringItems,

    generatedAt: new Date().toISOString(),
  };

