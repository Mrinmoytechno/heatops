import type {
      ThermalDataProvider,
      } from "./providers/types";

      export function getThermalProvider(): ThermalDataProvider {
        const provider =
            process.env.THERMAL_PROVIDER ??
                "development";

                  switch (provider) {
                      case "development":
                            throw new Error(
                                    "Development thermal provider will be implemented in Build 004."
                                          );

                                              case "fortyguard":
                                                    throw new Error(
                                                            "FortyGuard provider will be implemented after official API access opens."
                                                                  );

                                                                      default:
                                                                            throw new Error(
                                                                                    `Unsupported thermal provider: ${provider}`
                                                                                          );
                                                                                            }
                                                                                            }