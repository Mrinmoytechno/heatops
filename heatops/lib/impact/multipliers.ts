import type {
  ImpactSeverity,
} from "@/types/impact";

export function getSeverityMultiplier(
  severity: ImpactSeverity
): number {
  switch (severity) {
    case "low":
      return 0;

    case "moderate":
      return 0.5;

    case "high":
      return 0.75;

    case "critical":
      return 1;

    default:
      return 0;
  }
}
