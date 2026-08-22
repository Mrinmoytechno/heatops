import {
  registerLocationProvider,
} from "./location-provider";

import {
  OpenMeteoLocationProvider,
} from "./providers/open-meteo-location-provider";

let initialized =
  false;

export function initializeLocationProvider(): void {
  if (initialized) {
    return;
  }

  registerLocationProvider(
    new OpenMeteoLocationProvider(),
  );

  initialized =
    true;
}
