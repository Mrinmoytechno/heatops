import type {
  ThermalForecast,
  ThermalObservation,
} from "@/types/thermal";

import type {
  CurrentConditionsRequest,
  EnvironmentalRequest,
  ForecastRequest,
  HeatmapRequest,
} from "./requests";

import type {
  EnvironmentalResult,
  HeatmapResult,
  ThermalConditions,
} from "./results";

import type {
  ThermalDataProvider,
} from "./types";

function createObservation(
  timestamp: Date,
  latitude: number,
  longitude: number,
  temperatureC: number
): ThermalObservation {
  return {
    timestamp:
      timestamp.toISOString(),

    latitude,
    longitude,

    temperatureC,

    source: "development",
  };
}

function generateTemperature(
  hour: number
): number {
  if (hour >= 8 && hour < 12) {
    return 30 + (hour - 8) * 1.5;
  }

  if (hour >= 12 && hour < 16) {
    return 36 + (hour - 12) * 0.8;
  }

  if (hour >= 16 && hour < 19) {
    return 37 - (hour - 16) * 1.5;
  }

  return 27;
}

export class DevelopmentThermalProvider
  implements ThermalDataProvider
{
  async getForecast(
    request: ForecastRequest
  ): Promise<ThermalForecast> {
    const start = new Date(
      request.startTime
    );

    const end = new Date(
      request.endTime
    );

    const observations: ThermalObservation[] =
      [];

    const current = new Date(start);

    while (current <= end) {
      observations.push(
        createObservation(
          new Date(current),
          request.latitude,
          request.longitude,
          generateTemperature(
            current.getHours()
          )
        )
      );

      current.setHours(
        current.getHours() + 1
      );
    }

    return {
      siteId:
        request.siteId,

      observations,

      generatedAt:
        new Date().toISOString(),

      provider: "development",
    };
  }

  async getCurrentConditions(
    request: CurrentConditionsRequest
  ): Promise<ThermalConditions> {
    const now = new Date();

    const observation =
      createObservation(
        now,
        request.latitude,
        request.longitude,
        generateTemperature(
          now.getHours()
        )
      );

    return {
      observedAt:
        now.toISOString(),

      latitude:
        request.latitude,

      longitude:
        request.longitude,

      observation,

      provider: "development",
    };
  }

  async getHeatmap(
    request: HeatmapRequest
  ): Promise<HeatmapResult> {
    const forecast =
      await this.getForecast({
        siteId:
          request.siteId,

        polygonAoi:
          request.polygonAoi,

        latitude:
          request.latitude,

        longitude:
          request.longitude,

        startTime:
          request.startTime,

        endTime:
          request.endTime,
      });

    return {
      generatedAt:
        forecast.generatedAt,

      provider: "development",

      observations:
        forecast.observations,
    };
  }

  async getEnvironmentalParameters(
    request: EnvironmentalRequest
  ): Promise<EnvironmentalResult> {
    return {
      observedAt:
        request.timestamp,

      latitude:
        request.latitude,

      longitude:
        request.longitude,

      parameters: {},

      provider: "development",
    };
  }
}