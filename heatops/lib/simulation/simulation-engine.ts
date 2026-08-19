import type { OperatingPlanItem } from "@/lib/operating-plan";

import type {
  ScenarioChange,
  ScenarioInput,
  ScenarioResult,
  SimulationComparison,
} from "./types";

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const normalized =
    ((totalMinutes % 1440) + 1440) % 1440;

  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

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
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (endMinutes >= startMinutes) {
    return endMinutes - startMinutes;
  }

  return 1440 - startMinutes + endMinutes;
}

function applyChange(
  item: OperatingPlanItem,
  change: ScenarioChange,
): OperatingPlanItem {
  const updatedItem: OperatingPlanItem = {
    ...item,

    currentSchedule: {
      ...item.currentSchedule,
    },

    recommendedSchedule: item.recommendedSchedule
      ? {
          ...item.recommendedSchedule,
        }
      : null,
  };

  switch (change.type) {
    case "move_earlier": {
      const startMinutes = timeToMinutes(
        item.currentSchedule.start,
      );

      const endMinutes = timeToMinutes(
        item.currentSchedule.end,
      );

      updatedItem.currentSchedule = {
        start: minutesToTime(
          startMinutes - change.minutes,
        ),

        end: minutesToTime(
          endMinutes - change.minutes,
        ),
      };

      break;
    }

    case "move_later": {
      const startMinutes = timeToMinutes(
        item.currentSchedule.start,
      );

      const endMinutes = timeToMinutes(
        item.currentSchedule.end,
      );

      updatedItem.currentSchedule = {
        start: minutesToTime(
          startMinutes + change.minutes,
        ),

        end: minutesToTime(
          endMinutes + change.minutes,
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

function calculateExposureMinutes(
  items: OperatingPlanItem[],
): number {
  return items.reduce((total, item) => {
    const duration = getDurationMinutes(
      item.currentSchedule.start,
      item.currentSchedule.end,
    );

    const riskWeight = item.riskBefore / 100;

    return total + duration * riskWeight;
  }, 0);
}

function calculateAverageRisk(
  items: OperatingPlanItem[],
): number {
  if (items.length === 0) {
    return 0;
  }

  const totalRisk = items.reduce(
    (total, item) => total + item.riskBefore,
    0,
  );

  return Number(
    (totalRisk / items.length).toFixed(1),
  );
}

function calculateOperationalDisruption(
  originalItems: OperatingPlanItem[],
  scenarioItems: OperatingPlanItem[],
): number {
  return scenarioItems.reduce(
    (total, scenarioItem, index) => {
      const originalItem = originalItems[index];

      if (!originalItem) {
        return total;
      }

      const originalStart = timeToMinutes(
        originalItem.currentSchedule.start,
      );

      const scenarioStart = timeToMinutes(
        scenarioItem.currentSchedule.start,
      );

      return (
        total +
        Math.abs(
          scenarioStart - originalStart,
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
  const riskReduction = Number(
    (baselineRisk - scenarioRisk).toFixed(1),
  );

  const exposureReduction = Number(
    (
      baselineExposure - scenarioExposure
    ).toFixed(1),
  );

  return {
    baselineRisk,
    scenarioRisk,
    riskReduction,

    baselineExposureMinutes: Number(
      baselineExposure.toFixed(1),
    ),

    scenarioExposureMinutes: Number(
      scenarioExposure.toFixed(1),
    ),

    exposureReductionMinutes:
      exposureReduction,

    operationalDisruptionMinutes:
      disruptionMinutes,
  };
}

export function runSimulation(
  input: ScenarioInput,
): ScenarioResult {
  const scenarioItems =
    input.operatingPlan.items.map((item) => {
      const change = input.changes.find(
        (candidate) =>
          candidate.operationId === item.operationId,
      );

      if (!change) {
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

      return applyChange(item, change);
    });

  const baselineRisk = calculateAverageRisk(
    input.operatingPlan.items,
  );

  const scenarioRisk = calculateAverageRisk(
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
    scenarioId: crypto.randomUUID(),

    siteId: input.operatingPlan.siteId,

    name: input.name,

    description:
      input.description ?? null,

    createdAt: new Date().toISOString(),

    items: scenarioItems,

    comparison: calculateComparison(
      baselineRisk,
      scenarioRisk,
      baselineExposure,
      scenarioExposure,
      disruptionMinutes,
    ),
  };
     }
