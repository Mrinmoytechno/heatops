import type {
  ImpactSeverity,
} from "./impact";

export type RiskLevel =
  | "low"
  | "moderate"
  | "high"
  | "critical";

export type RiskDriver =
  | "thermal_severity"
  | "exposure_duration"
  | "workforce_exposure"
  | "zone_sensitivity"
  | "operational_priority"
  | "inventory_sensitivity";

export type RiskDriverAssessment = {
  driver: RiskDriver;

  score: number;

  weight: number;

  contribution: number;

  reason: string;
};

export type RiskAssessment = {
  operationId: string;

  zoneId: string | null;

  score: number;

  level: RiskLevel;

  impactSeverity: ImpactSeverity;

  drivers: RiskDriverAssessment[];

  reasons: string[];
};
