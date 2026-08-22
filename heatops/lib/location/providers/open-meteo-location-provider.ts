import type {
  LocationProvider,
  LocationSearchOptions,
  LocationSearchResult,
  LocationTimezoneResult,
} from "@/types/location";

type OpenMeteoSearchResponse = {
  results?: Array<{
    id: number;

    name: string;

    latitude: number;

    longitude: number;

    country?: string;

    country_code?: string;

    admin1?: string;

    admin2?: string;
  }>;
};

type OpenMeteoForecastResponse = {
  timezone?: string;
};

function buildFormattedAddress(
  result: {
    name: string;

    country?: string;

    admin1?: string;

    admin2?: string;
  },
): string {
  return [
    result.name,
    result.admin2,
    result.admin1,
    result.country,
  ]
    .filter(
      Boolean,
    )
    .join(", ");
}

export class OpenMeteoLocationProvider
  implements LocationProvider
{
  async searchLocations(
    options: LocationSearchOptions,
  ): Promise<LocationSearchResult[]> {
    const searchParams =
      new URLSearchParams({
        name:
          options.query,

        count:
          String(
            options.limit ?? 5,
          ),

        language:
          "en",

        format:
          "json",
      });

    const response =
      await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${searchParams.toString()}`,
        {
          next: {
            revalidate: 60 * 60,
          },
        },
      );

    if (!response.ok) {
      throw new Error(
        "LOCATION_SEARCH_PROVIDER_FAILED",
      );
    }

    const data:
      OpenMeteoSearchResponse =
      await response.json();

    return (
      data.results ?? []
    ).map(
      (result) => ({
        id:
          String(
            result.id,
          ),

        name:
          result.name,

        formattedAddress:
          buildFormattedAddress(
            result,
          ),

        latitude:
          result.latitude,

        longitude:
          result.longitude,
      }),
    );
  }

  async getTimezone(
    latitude: number,
    longitude: number,
  ): Promise<LocationTimezoneResult> {
    const searchParams =
      new URLSearchParams({
        latitude:
          String(latitude),

        longitude:
          String(longitude),

        current:
          "temperature_2m",

        timezone:
          "auto",
      });

    const response =
      await fetch(
        `https://api.open-meteo.com/v1/forecast?${searchParams.toString()}`,
        {
          next: {
            revalidate: 60 * 60 * 24,
          },
        },
      );

    if (!response.ok) {
      throw new Error(
        "TIMEZONE_PROVIDER_FAILED",
      );
    }

    const data:
      OpenMeteoForecastResponse =
      await response.json();

    if (!data.timezone) {
      throw new Error(
        "TIMEZONE_NOT_FOUND",
      );
    }

    return {
      timezone:
        data.timezone,
    };
  }
