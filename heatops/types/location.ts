export type LocationSearchResult = {
  id: string;

  name: string;

  formattedAddress: string;

  latitude: number;

  longitude: number;
};

export type LocationTimezoneResult = {
  timezone: string;
};

export type LocationSearchOptions = {
  query: string;

  limit?: number;
};

export interface LocationProvider {
  searchLocations(
    options: LocationSearchOptions,
  ): Promise<LocationSearchResult[]>;

  getTimezone(
    latitude: number,
    longitude: number,
  ): Promise<LocationTimezoneResult>;
}
