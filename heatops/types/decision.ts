import type {
  ImpactAssessment,
} from "./impact";

import type {
  RiskAssessment,
} from "./risk";

export type DecisionActionType =
  | "maintain"
  | "move_earlier"
  | "move_later"
  | "split_operation"
  | "prioritize"
  | "reduce_exposure";

export type RecommendationPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type DecisionTradeOff = {
  riskScore: number;

  disruptionScore: number;

  modeledCost: number;

  overallScore: number;
};

export type CandidateDecision = {
  actionType: DecisionActionType;

  label: string;

  description: string;

  proposedStartTime: string | null;

  proposedEndTime: string | null;

  tradeOff: DecisionTradeOff;

  reasons: string[];
};

export type DecisionRecommendation = {
  operationId: string;

  zoneId: string | null;

  priority: RecommendationPriority;

  recommendedAction: CandidateDecision;

  alternatives: CandidateDecision[];

  impact: ImpactAssessment;

  risk: RiskAssessment;

  reasons: string[];

  assumptions: string[];
};
