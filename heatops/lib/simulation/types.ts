import type {
  HeatAdaptiveOperatingPlan,
  OperatingPlanItem,
} from "@/lib/operating-plan";

import type {
  OperationAnalysisInput,
  OperationAnalysisResult,
} from "@/lib/analysis/analyze-operation";

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

export type SimulationOperationContext = {
  operationId: string;

  analysisInput: OperationAnalysisInput;

  baselineAnalysis?: OperationAnalysisResult;
};

export type ScenarioInput = {
  name: string;

  description?: string | null;

  operatingPlan: HeatAdaptiveOperatingPlan;

  changes: ScenarioChange[];

  operationContexts: SimulationOperationContext[];
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

export type SimulatedOperationResult = {
  item: OperatingPlanItem;

  baselineAnalysis: OperationAnalysisResult | null;

  scenarioAnalysis: OperationAnalysisResult | null;
};

export type ScenarioResult = {
  scenarioId: string;

  siteId: string;

  name: string;

  description: string | null;

  createdAt: string;

  items: OperatingPlanItem[];

  operationResults: SimulatedOperationResult[];

  comparison: SimulationComparison;
};
