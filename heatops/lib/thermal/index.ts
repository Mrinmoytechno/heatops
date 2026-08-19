import type {
  ThermalDataProvider,
} from "./providers/types";

import {
  DevelopmentThermalProvider,
} from "./providers/development";

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
      throw new Error(
        "FortyGuard provider is not configured yet."
      );

    default:
      throw new Error(
        `Unsupported thermal provider: ${provider}`
      );
  }
}