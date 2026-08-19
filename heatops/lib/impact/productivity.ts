export function calculateProductiveHoursAtRisk(
  exposureHours: number,
  workforceCount: number,
  productivityLossPerHour: number,
  severityMultiplier: number
): number {
  return (
    exposureHours *
    workforceCount *
    productivityLossPerHour *
    severityMultiplier
  );
}
