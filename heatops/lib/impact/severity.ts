import type {
  ImpactSeverity,
} from "@/types/impact";

export function calculateSeverity(
  peakTemperatureF: number,
  exposureHours: number,
  sensitivity: number,
  assumptions: {
    elevatedTemperatureF: number;
    highTemperatureF: number;
    criticalTemperatureF: number;
  }
): ImpactSeverity {
  const {
    elevatedTemperatureF,
    highTemperatureF,
    criticalTemperatureF,
  } = assumptions;

  if (
    peakTemperatureF >=
      criticalTemperatureF &&
    exposureHours >= 2 &&
    sensitivity >= 0.7
  ) {
    return "critical";
  }

  if (
    peakTemperatureF >=
      criticalTemperatureF ||
    (
      peakTemperatureF >=
        highTemperatureF &&
      exposureHours >= 2
    )
  ) {
    return "high";
  }

  if (
    peakTemperatureF >=
      highTemperatureF ||
    (
      peakTemperatureF >=
        elevatedTemperatureF &&
      exposureHours >= 2
    )
  ) {
    return "moderate";
  }

  return "low";
}
