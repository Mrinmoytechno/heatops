import type {
  ImpactAssessment,
} from "@/types/impact";

import type {
  ImpactEngineInput,
} from "@/types/impact-inputs";

import {
  calculateExposureHours,
} from "./schedule";

import {
  calculateSeverity,
} from "./severity";

import {
  getSeverityMultiplier,
} from "./multipliers";

import {
  calculateProductiveHoursAtRisk,
} from "./productivity";

import {
  calculateOperationalCost,
  calculateInventoryExposure,
} from "./financial";

import {
  toFahrenheit,
} from "./temperature";

export function calculateImpact(
  input: ImpactEngineInput
): ImpactAssessment {
  const temperaturesF =
    input.thermalObservations.map(
      (observation) =>
        toFahrenheit(
          observation.temperatureC
        )
    );

  const peakTemperatureF =
    temperaturesF.length > 0
      ? Math.max(
          ...temperaturesF
        )
      : 0;

  const exposureHours =
    calculateExposureHours(
      input.operation
        .scheduledStart,

      input.operation
        .scheduledEnd,

      input.thermalObservations.map(
        (observation) =>
          observation.timestamp
      )
    );

  const sensitivity =
    Math.max(
      input.zone
        ?.temperatureSensitivity ??
        0.5,

      input.inventory
        ?.temperatureSensitivity ??
        0
    );

  const severity =
    calculateSeverity(
      peakTemperatureF,
      exposureHours,
      sensitivity,
      input.assumptions
    );

  const severityMultiplier =
    getSeverityMultiplier(
      severity
    );

  const workforceExposureHours =
    exposureHours *
    input.operation
      .workforceCount;

  const productiveHoursAtRisk =
    calculateProductiveHoursAtRisk(
      exposureHours,
      input.operation
        .workforceCount,
      input.assumptions
        .productivityLossPerHour,
      severityMultiplier
    );

  const estimatedOperationalCost =
    calculateOperationalCost(
      productiveHoursAtRisk,
      input.assumptions
        .laborCostPerHour
    );

  const estimatedInventoryExposure =
    input.inventory
      ? calculateInventoryExposure(
          exposureHours,
          input.inventory
            .exposureValue,
          input.assumptions
            .inventoryExposureRatePerHour
        )
      : 0;

  const reasons: string[] =
    [];

  if (
    peakTemperatureF >=
    input.assumptions
      .elevatedTemperatureF
  ) {
    reasons.push(
      "Thermal conditions exceed the configured elevated threshold."
    );
  }

  if (
    exposureHours > 0
  ) {
    reasons.push(
      `The operation overlaps approximately ${exposureHours} hour(s) of elevated thermal exposure.`
    );
  }

  if (
    input.operation
      .workforceCount > 0
  ) {
    reasons.push(
      `The operation exposes ${input.operation.workforceCount} worker(s) during the affected window.`
    );
  }

  if (
    input.inventory &&
    input.inventory
      .temperatureSensitivity >=
      0.7
  ) {
    reasons.push(
      "Associated inventory has high temperature sensitivity."
    );
  }

  return {
    operationId:
      input.operation.id,

    zoneId:
      input.operation.zoneId,

    severity,

    peakTemperatureF,

    exposureHours,

    workforceExposureHours,

    productiveHoursAtRisk,

    estimatedOperationalCost,

    estimatedInventoryExposure,

    reasons,

    metrics: {
      peakTemperature: {
        value:
          peakTemperatureF,
        unit: "°F",
        classification:
          "observed",
      },

      exposureDuration: {
        value:
          exposureHours,
        unit: "hours",
        classification:
          "calculated",
      },

      workforceExposure: {
        value:
          workforceExposureHours,
        unit:
          "worker-hours",
        classification:
          "calculated",
      },

      productiveHours: {
        value:
          productiveHoursAtRisk,
        unit:
          "productive hours",
        classification:
          "modeled",
      },

      operationalCost: {
        value:
          estimatedOperationalCost,
        unit: "USD",
        classification:
          "modeled",
      },

      inventoryExposure: {
        value:
          estimatedInventoryExposure,
        unit: "USD",
        classification:
          "modeled",
      },
    },
  };
}
