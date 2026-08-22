import type {
  LocationProvider,
} from "@/types/location";

let locationProvider:
  | LocationProvider
  | null = null;

export function registerLocationProvider(
  provider: LocationProvider,
): void {
  locationProvider =
    provider;
}

export function getLocationProvider(): LocationProvider {
  if (!locationProvider) {
    throw new Error(
      "LOCATION_PROVIDER_NOT_CONFIGURED",
    );
  }

  return locationProvider;
}
