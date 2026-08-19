import type {
  ThermalForecast,
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

export interface ThermalDataProvider {
  getForecast(
    request: ForecastRequest
  ): Promise<ThermalForecast>;

  getCurrentConditions(
    request: CurrentConditionsRequest
  ): Promise<ThermalConditions>;

  getHeatmap(
    request: HeatmapRequest
  ): Promise<HeatmapResult>;

  getEnvironmentalParameters(
    request: EnvironmentalRequest
  ): Promise<EnvironmentalResult>;
}
