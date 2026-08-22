import {
  analyzeOperation,
} from "@/lib/analysis/analyze-operation";

import type {
  OperationAnalysisInput,
  OperationAnalysisResult,
} from "@/lib/analysis/analyze-operation";

import type {
  OperatingPlanItem,
} from "@/lib/operating-plan";

import type {
  ScenarioChange,
  ScenarioInput,
  ScenarioResult,
  SimulatedOperationResult,
  SimulationComparison,
  SimulationOperationContext,
} from "./types";

function timeToMinutes(
  time: string,
): number {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(
  totalMinutes: number,
): string {
  const normalized =
    ((totalMinutes % 1440) + 1440) %
    1440;

  const hours = Math.floor(
    normalized / 60,
  );

  const minutes =
    normalized % 60;

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function getDurationMinutes(
  start: string,
  end: string,
): number {
  const startMinutes =
    timeToMinutes(start);

  const endMinutes =
    timeToMinutes(end);

  if (endMinutes >= startMinutes) {
    return (
      endMinutes -
      startMinutes
    );
  }

  return (
    1440 -
    startMinutes +
    endMinutes
  );
}

function cloneOperatingPlanItem(
  item: OperatingPlanItem,
): OperatingPlanItem {
  return {
    ...item,

    currentSchedule: {
      ...item.currentSchedule,
    },

    recommendedSchedule:
      item.recommendedSchedule
        ? {
            ...item.recommendedSchedule,
          }
        : null,
  };
}

function applyChange(
  item: OperatingPlanItem,
  change: ScenarioChange,
): OperatingPlanItem {
  const updatedItem =
    cloneOperatingPlanItem(item);

  switch (change.type) {
    case "move_earlier": {
      const startMinutes =
        timeToMinutes(
          item.currentSchedule.start,
        );

      const endMinutes =
        timeToMinutes(
          item.currentSchedule.end,
        );

      updatedItem.currentSchedule = {
        start: minutesToTime(
          startMinutes -
            change.minutes,
        ),

        end: minutesToTime(
          endMinutes -
            change.minutes,
        ),
      };

      break;
    }

    case "move_later": {
      const startMinutes =
        timeToMinutes(
          item.currentSchedule.start,
        );

      const endMinutes =
        timeToMinutes(
          item.currentSchedule.end,
        );

      updatedItem.currentSchedule = {
        start: minutesToTime(
          startMinutes +
            change.minutes,
        ),

        end: minutesToTime(
          endMinutes +
            change.minutes,
        ),
      };

      break;
    }

    case "set_schedule": {
      updatedItem.currentSchedule = {
        start: change.start,

        end: change.end,
      };

      break;
    }

    case "apply_recommendation": {
      if (item.recommendedSchedule) {
        updatedItem.currentSchedule = {
          ...item.recommendedSchedule,
        };
      }

      break;
    }

    case "maintain":
      break;
  }

  return updatedItem;
}

function applyScheduleToAnalysisInput(
  input: OperationAnalysisInput,
  item: OperatingPlanItem,
): OperationAnalysisInput {
  return {
    ...input,

    operation: {
      ...input.operation,

      scheduledStart:
        item.currentSchedule.start,

      scheduledEnd:
        item.currentSchedule.end,
    },
  };
}

function createScenarioItem(
  originalItem: OperatingPlanItem,
  scenarioAnalysis: OperationAnalysisResult,
): OperatingPlanItem {
  const scenarioRisk =
    scenarioAnalysis.risk.score;

  const recommendedAction =
    scenarioAnalysis.decision
      .recommendedAction;

  return {
    ...cloneOperatingPlanItem(
      originalItem,
    ),

    currentSchedule: {
      ...originalItem.currentSchedule,
    },

    decision:
      scenarioAnalysis.decision,

    riskBefore:
      scenarioRisk,

    projectedRiskAfter:
      scenarioRisk,

    reason:
      recommendedAction.description,

    summary:
      recommendedAction.description,
  };
}

function calculateExposureMinutes(
  items: OperatingPlanItem[],
): number {
  return items.reduce(
    (total, item) => {
      const duration =
        getDurationMinutes(
          item.currentSchedule.start,
          item.currentSchedule.end,
        );

      const riskWeight =
        item.riskBefore / 100;

      return (
        total +
        duration * riskWeight
      );
    },
    0,
  );
}

function calculateAverageRisk(
  items: OperatingPlanItem[],
): number {
  if (items.length === 0) {
    return 0;
  }

  const totalRisk =
    items.reduce(
      (total, item) =>
        total + item.riskBefore,
      0,
    );

  return Number(
    (
      totalRisk /
      items.length
    ).toFixed(1),
  );
}

function calculateOperationalDisruption(
  originalItems: OperatingPlanItem[],
  scenarioItems: OperatingPlanItem[],
): number {
  return scenarioItems.reduce(
    (total, scenarioItem) => {
      const originalItem =
        originalItems.find(
          (item) =>
            item.operationId ===
            scenarioItem.operationId,
        );

      if (!originalItem) {
        return total;
      }

      const originalStart =
        timeToMinutes(
          originalItem.currentSchedule.start,
        );

      const scenarioStart =
        timeToMinutes(
          scenarioItem.currentSchedule.start,
        );

      return (
        total +
        Math.abs(
          scenarioStart -
            originalStart,
        )
      );
    },
    0,
  );
}

function calculateComparison(
  baselineRisk: number,
  scenarioRisk: number,
  baselineExposure: number,
  scenarioExposure: number,
  disruptionMinutes: number,
): SimulationComparison {
  return {
    baselineRisk:
      Number(
        baselineRisk.toFixed(1),
      ),

    scenarioRisk:
      Number(
        scenarioRisk.toFixed(1),
      ),

    riskReduction:
      Number(
        (
          baselineRisk -
          scenarioRisk
        ).toFixed(1),
      ),

    baselineExposureMinutes:
      Number(
        baselineExposure.toFixed(1),
      ),

    scenarioExposureMinutes:
      Number(
        scenarioExposure.toFixed(1),
      ),

    exposureReductionMinutes:
      Number(
        (
          baselineExposure -
          scenarioExposure
        ).toFixed(1),
      ),

    operationalDisruptionMinutes:
      disruptionMinutes,
  };
}

function getOperationContext(
  contexts: SimulationOperationContext[],
  operationId: string,
): SimulationOperationContext | null {
  return (
    contexts.find(
      (context) =>
        context.operationId ===
        operationId,
    ) ?? null
  );
}

async function getBaselineAnalysis(
  context: SimulationOperationContext,
): Promise<OperationAnalysisResult> {
  if (context.baselineAnalysis) {
    return context.baselineAnalysis;
  }

  return analyzeOperation(
    context.analysisInput,
  );
}

export async function runSimulation(
  input: ScenarioInput,
): Promise<ScenarioResult> {
  const operationResults:
    SimulatedOperationResult[] = [];

  for (
    const originalItem of input
      .operatingPlan.items
  ) {
    const context =
      getOperationContext(
        input.operationContexts,
        originalItem.operationId,
      );

    if (!context) {
      throw new Error(
        `Missing simulation context for operation ${originalItem.operationId}.`,
      );
    }

    const change =
      input.changes.find(
        (candidate) =>
          candidate.operationId ===
          originalItem.operationId,
      );

    const scenarioItem =
      change
        ? applyChange(
            originalItem,
            change,
          )
        : cloneOperatingPlanItem(
            originalItem,
          );

    const baselineAnalysis =
      await getBaselineAnalysis(
        context,
      );

    const scenarioInput =
      applyScheduleToAnalysisInput(
        context.analysisInput,
        scenarioItem,
      );

    const scenarioAnalysis =
      await analyzeOperation(
        scenarioInput,
      );

    const analyzedScenarioItem =
      createScenarioItem(
        scenarioItem,
        scenarioAnalysis,
      );

    operationResults.push({
      item: analyzedScenarioItem,

      baselineAnalysis,

      scenarioAnalysis,
    });
  }

  const scenarioItems =
    operationResults.map(
      (result) => result.item,
    );

  const baselineRisk =
    calculateAverageRisk(
      input.operatingPlan.items,
    );

  const scenarioRisk =
    calculateAverageRisk(
      scenarioItems,
    );

  const baselineExposure =
    calculateExposureMinutes(
      input.operatingPlan.items,
    );

  const scenarioExposure =
    calculateExposureMinutes(
      scenarioItems,
    );

  const disruptionMinutes =
    calculateOperationalDisruption(
      input.operatingPlan.items,
      scenarioItems,
    );

  return {
    scenarioId:
      crypto.randomUUID(),

    siteId:
      input.operatingPlan.siteId,

    name: input.name,

    description:
      input.description ?? null,

    createdAt:
      new Date().toISOString(),

    items: scenarioItems,

    operationResults,

    comparison:
      calculateComparison(
        baselineRisk,
        scenarioRisk,
        baselineExposure,
        scenarioExposure,
        disruptionMinutes,
      ),
  };
}