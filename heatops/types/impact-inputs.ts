export type ImpactEngineInput = {
  operation: {
    id: string;
    zoneId: string | null;

    scheduledStart: string;
    scheduledEnd: string;

    workforceCount: number;
    operationalPriority: number;
  };

  thermalObservations: Array<{
    timestamp: string;
    temperatureC: number;
    latitude: number;
    longitude: number;
  }>;

  zone: {
    temperatureSensitivity: number;
    operationalPriority: number;
  } | null;

  inventory: {
    temperatureSensitivity: number;
    exposureValue: number;
  } | null;

  assumptions: {
    referenceTemperatureF: number;
    elevatedTemperatureF: number;
    highTemperatureF: number;
    criticalTemperatureF: number;

    productivityLossPerHour: number;

    laborCostPerHour: number;

    inventoryExposureRatePerHour: number;
  };
};
