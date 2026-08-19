import type {
  HeatAdaptiveOperatingPlan,
  OperatingPlanItem,
} from "@/lib/operating-plan";

export type ScenarioChange =
  | {
      operationId: string;
      type: "move_earlier";
      minutes: number;
    }
  | {
      operationId: string;
      type: "move_later";
      minutes: number;
    }
  | {
      operationId: string;
      type: "set_schedule";
      start: string;
      end: string;
    }
  | {
      operationId: string;
      type: "apply_recommendation";
    }
  | {
      operationId: string;
      type: "maintain";
    };

export type ScenarioInput = {
  name: string;
  description?: string | null;

  operatingPlan: HeatAdaptiveOperatingPlan;

  changes: ScenarioChange[];
};

export type SimulationComparison = {
  baselineRisk: number;
  scenarioRisk: number;
  riskReduction: number;

  baselineExposureMinutes: number;
  scenarioExposureMinutes: number;
  exposureReductionMinutes: number;

  operationalDisruptionMinutes: number;
};

export type ScenarioResult = {
  scenarioId: string;

  siteId: string;

  name: string;
  description: string | null;

  createdAt: string;

  items: OperatingPlanItem[];

  comparison: SimulationComparison;
};
