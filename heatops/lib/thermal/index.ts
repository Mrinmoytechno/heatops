import type {
  ThermalDataProvider,
} from "./providers/types";

import {
  DevelopmentThermalProvider,
} from "./providers/development";

import {
  FortyGuardThermalProvider,
} from "./providers/fortyguard";

export function getThermalProvider():
  ThermalDataProvider {
  const provider =
    process.env.THERMAL_PROVIDER ??
    "development";

  switch (provider) {
    case "development":
    case "mock":
      return new DevelopmentThermalProvider();

    case "fortyguard":
      return new FortyGuardThermalProvider();

    default:
      throw new Error(
        `Unsupported thermal provider: ${provider}`
      );
  }
}
