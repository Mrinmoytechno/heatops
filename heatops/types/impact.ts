export type ImpactSeverity =
  | "low"
  | "moderate"
  | "high"
  | "critical";

export type ImpactMetric = {
  value: number;
  unit: string;
  classification:
    | "observed"
    | "calculated"
    | "modeled"
    | "assumption";
};

export type ImpactAssessment = {
  operationId: string;
  zoneId: string | null;

  severity: ImpactSeverity;

  peakTemperatureF: number;
  exposureHours: number;

  workforceExposureHours: number;

  productiveHoursAtRisk: number;

  estimatedOperationalCost: number;

  estimatedInventoryExposure: number;

  reasons: string[];

  metrics: {
    peakTemperature: ImpactMetric;
    exposureDuration: ImpactMetric;
    workforceExposure: ImpactMetric;
    productiveHours: ImpactMetric;
    operationalCost: ImpactMetric;
    inventoryExposure: ImpactMetric;
  };
};
