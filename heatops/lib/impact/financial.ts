export function calculateOperationalCost(
  productiveHoursAtRisk: number,
  laborCostPerHour: number
): number {
  return (
    productiveHoursAtRisk *
    laborCostPerHour
  );
}

export function calculateInventoryExposure(
  exposureHours: number,
  inventoryExposureValue: number,
  exposureRatePerHour: number
): number {
  return (
    exposureHours *
    inventoryExposureValue *
    exposureRatePerHour
  );
}
