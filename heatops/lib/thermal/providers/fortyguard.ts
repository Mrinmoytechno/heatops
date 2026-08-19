import type {
  ThermalDataProvider,
} from "./types";

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
  ThermalForecast,
} from "../types";

export class FortyGuardThermalProvider
  implements ThermalDataProvider
{
  async getCurrentConditions(
    _request: CurrentConditionsRequest
  ): Promise<ThermalConditions> {
    throw new Error(
      "FortyGuard current conditions are not implemented yet."
    );
  }

  async getForecast(
    _request: ForecastRequest
  ): Promise<ThermalForecast> {
    throw new Error(
      "FortyGuard forecast is not implemented yet."
    );
  }

  async getHeatmap(
    _request: HeatmapRequest
  ): Promise<HeatmapResult> {
    throw new Error(
      "FortyGuard heatmap is not implemented yet."
    );
  }

  async getEnvironmentalParameters(
    _request: EnvironmentalRequest
  ): Promise<EnvironmentalResult> {
    throw new Error(
      "FortyGuard environmental parameters are not implemented yet."
    );
  }
}