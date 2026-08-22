import type {
  LocationSearchResult,
  LocationTimezoneResult,
} from "@/types/location";

import {
  getLocationProvider,
} from "./location-provider";

export async function searchLocations(
  query: string,
  limit = 5,
): Promise<LocationSearchResult[]> {
  const normalizedQuery =
    query.trim();

  if (
    normalizedQuery.length < 2
  ) {
    return [];
  }

  const provider =
    getLocationProvider();

  return provider.searchLocations({
    query:
      normalizedQuery,

    limit:
      Math.min(
        Math.max(
          limit,
          1,
        ),
        10,
      ),
  });
}

export async function resolveTimezone(
  latitude: number,
  longitude: number,
): Promise<LocationTimezoneResult> {
  if (
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(
      "INVALID_LATITUDE",
    );
  }

  if (
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "INVALID_LONGITUDE",
    );
  }

  const provider =
    getLocationProvider();

  return provider.getTimezone(
    latitude,
    longitude,
  );
}
