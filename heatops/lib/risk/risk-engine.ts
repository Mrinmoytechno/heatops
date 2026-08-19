import type {
  ImpactAssessment,
  ImpactSeverity,
} from "@/types/impact";

import type {
  RiskAssessment,
  RiskDriverAssessment,
  RiskLevel,
} from "@/types/risk";

type RiskEngineInput = {
  impact: ImpactAssessment;

  zoneTemperatureSensitivity?: number | null;

  operationalPriority?: number | null;

  inventoryTemperatureSensitivity?: number | null;

  maxExpectedExposureHours?: number;

  maxExpectedWorkforceExposureHours?: number;
};

const DEFAULT_MAX_EXPOSURE_HOURS = 8;

const DEFAULT_MAX_WORKFORCE_EXPOSURE_HOURS = 80;

const WEIGHTS = {
  thermalSeverity: 0.3,
  exposureDuration: 0.2,
  workforceExposure: 0.15,
  zoneSensitivity: 0.15,
  operationalPriority: 0.1,
  inventorySensitivity: 0.1,
} as const;

function clamp(
  value: number,
  minimum = 0,
  maximum = 1
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function normalize(
  value: number,
  maximum: number
): number {
  if (maximum <= 0) {
    return 0;
  }

  return clamp(value / maximum);
}

function getSeverityScore(
  severity: ImpactSeverity
): number {
  switch (severity) {
    case "low":
      return 0.25;

    case "moderate":
      return 0.5;

    case "high":
      return 0.75;

    case "critical":
      return 1;
  }
}

function getRiskLevel(
  score: number
): RiskLevel {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 60) {
    return "high";
  }

  if (score >= 35) {
    return "moderate";
  }

  return "low";
}

function round(
  value: number,
  decimals = 1
): number {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

export function calculateRisk(
  input: RiskEngineInput
): RiskAssessment {
  const drivers: RiskDriverAssessment[] = [];

  const severityScore =
    getSeverityScore(
      input.impact.severity
    );

  const exposureScore =
    normalize(
      input.impact.exposureHours,
      input.maxExpectedExposureHours ??
        DEFAULT_MAX_EXPOSURE_HOURS
    );

  const workforceScore =
    normalize(
      input.impact.workforceExposureHours,
      input.maxExpectedWorkforceExposureHours ??
        DEFAULT_MAX_WORKFORCE_EXPOSURE_HOURS
    );

  const zoneSensitivityScore =
    clamp(
      input.zoneTemperatureSensitivity ??
        0.5
    );

  const operationalPriorityScore =
    clamp(
      input.operationalPriority ??
        0.5
    );

  const inventorySensitivityScore =
    clamp(
      input.inventoryTemperatureSensitivity ??
        0
    );

  drivers.push(
    {
      driver:
        "thermal_severity",

      score:
        round(severityScore * 100),

      weight:
        WEIGHTS.thermalSeverity,

      contribution:
        round(
          severityScore *
            WEIGHTS.thermalSeverity *
            100
        ),

      reason:
        `Impact severity is ${input.impact.severity}.`,
    },

    {
      driver:
        "exposure_duration",

      score:
        round(exposureScore * 100),

      weight:
        WEIGHTS.exposureDuration,

      contribution:
        round(
          exposureScore *
            WEIGHTS.exposureDuration *
            100
        ),

      reason:
        `The operation has ${round(
          input.impact.exposureHours
        )} hour(s) of thermal exposure.`,
    },

    {
      driver:
        "workforce_exposure",

      score:
        round(workforceScore * 100),

      weight:
        WEIGHTS.workforceExposure,

      contribution:
        round(
          workforceScore *
            WEIGHTS.workforceExposure *
            100
        ),

      reason:
        `The operation has ${round(
          input.impact.workforceExposureHours
        )} worker-hours of exposure.`,
    },

    {
      driver:
        "zone_sensitivity",

      score:
        round(
          zoneSensitivityScore * 100
        ),

      weight:
        WEIGHTS.zoneSensitivity,

      contribution:
        round(
          zoneSensitivityScore *
            WEIGHTS.zoneSensitivity *
            100
        ),

      reason:
        "Zone temperature sensitivity contributes to operational risk.",
    },

    {
      driver:
        "operational_priority",

      score:
        round(
          operationalPriorityScore *
            100
        ),

      weight:
        WEIGHTS.operationalPriority,

      contribution:
        round(
          operationalPriorityScore *
            WEIGHTS.operationalPriority *
            100
        ),

      reason:
        "Operational priority increases the consequence of disruption.",
    },

    {
      driver:
        "inventory_sensitivity",

      score:
        round(
          inventorySensitivityScore *
            100
        ),

      weight:
        WEIGHTS.inventorySensitivity,

      contribution:
        round(
          inventorySensitivityScore *
            WEIGHTS.inventorySensitivity *
            100
        ),

      reason:
        inventorySensitivityScore > 0
          ? "Temperature-sensitive inventory increases operational risk."
          : "No additional inventory sensitivity was included.",
    }
  );

  const totalScore =
    drivers.reduce(
      (
        total,
        driver
      ) =>
        total +
        driver.contribution,
      0
    );

  const score =
    round(
      Math.min(
        Math.max(
          totalScore,
          0
        ),
        100
      )
    );

  const level =
    getRiskLevel(score);

  const reasons =
    drivers
      .filter(
        (driver) =>
          driver.contribution >= 8
      )
      .sort(
        (a, b) =>
          b.contribution -
          a.contribution
      )
      .map(
        (driver) =>
          driver.reason
      );

  return {
    operationId:
      input.impact.operationId,

    zoneId:
      input.impact.zoneId,

    score,

    level,

    impactSeverity:
      input.impact.severity,

    drivers,

    reasons,
  };
}
