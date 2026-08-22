import {
  getThermalProvider,
} from "@/lib/thermal";

import {
  calculateImpact,
} from "@/lib/impact";

import {
  calculateRisk,
} from "@/lib/risk";

import {
  calculateDecision,
} from "@/lib/decision";

import type {
  ImpactAssessment,
} from "@/types/impact";

import type {
  RiskAssessment,
} from "@/types/risk";

import type {
  DecisionRecommendation,
} from "@/types/decision";

import type {
  ThermalForecast,
} from "@/types/thermal";

import type {
  ImpactEngineInput,
} from "@/types/impact-inputs";

import type {
  ForecastRequest,
} from "@/lib/thermal/providers/requests";

export type OperationAnalysisInput = {
  forecastRequest: ForecastRequest;

  impactInput: Omit<
    ImpactEngineInput,
    "thermalObservations"
  >;

  operation: {
    scheduledStart: string;

    scheduledEnd: string;

    operationalPriority?: number | null;

    workforceCount?: number;
  };

  decisionConstraints?: {
    allowEarlierMove?: boolean;

    allowLaterMove?: boolean;

    allowSplit?: boolean;

    allowPrioritization?: boolean;

    earliestStart?: string | null;

    latestEnd?: string | null;
  };
};

export type OperationAnalysisResult = {
  thermalForecast: ThermalForecast;

  impact: ImpactAssessment;

  risk: RiskAssessment;

  decision: DecisionRecommendation;
};

export async function analyzeOperation(
  input: OperationAnalysisInput
): Promise<OperationAnalysisResult> {
  const thermalProvider =
    getThermalProvider();

  const thermalForecast =
    await thermalProvider.getForecast(
      input.forecastRequest
    );

  const impact =
    calculateImpact({
      ...input.impactInput,

      thermalObservations:
        thermalForecast.observations,
    });

  const risk =
    calculateRisk({
      impact,

      operationalPriority:
        input.operation
          .operationalPriority ?? 0.5,
    });

  const decision =
    calculateDecision({
      impact,

      risk,

      operation: {
        scheduledStart:
          input.operation
            .scheduledStart,

        scheduledEnd:
          input.operation
            .scheduledEnd,

        operationalPriority:
          input.operation
            .operationalPriority ?? 0.5,

        workforceCount:
          input.operation
            .workforceCount ?? 0,
      },

      thermalForecast,

      constraints:
        input.decisionConstraints,
    });

  return {
    thermalForecast,

    impact,

    risk,

    decision,
  };
}