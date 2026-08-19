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

import type {
  ThermalDataProvider,
} from "./types";

import {
  FortyGuardClient,
} from "./fortyguard-client";

import {
  buildHeatmapPayload,
} from "./fortyguard-payload";

import {
  waitForFortyGuardResult,
} from "./fortyguard-poll";

import {
  normalizeHeatmapResult,
} from "../schemas/normalize";

export class FortyGuardThermalProvider
  implements ThermalDataProvider
{
  private readonly client =
    new FortyGuardClient();

  async getForecast(
    request: ForecastRequest
  ): Promise<ThermalForecast> {
    const payload =
      buildHeatmapPayload(
        request
      );

    const activityId =
      await this.client.submitHeatmap(
        payload
      );

    const result =
      await waitForFortyGuardResult(
        this.client,
        activityId
      );

    return normalizeHeatmapResult(
      result,
      {
        siteId:
          request.siteId,

        timestamp:
          request.startTime,
      }
    );
  }

  async getCurrentConditions(
    _request: CurrentConditionsRequest
  ): Promise<ThermalConditions> {
    throw new Error(
      "Current conditions are not yet supported by the FortyGuard provider."
    );
  }

  async getHeatmap(
    _request: HeatmapRequest
  ): Promise<HeatmapResult> {
    throw new Error(
      "Direct heatmap results are not yet exposed separately. Use getForecast for the current HeatOps thermal analysis workflow."
    );
  }

  async getEnvironmentalParameters(
    _request: EnvironmentalRequest
  ): Promise<EnvironmentalResult> {
    throw new Error(
      "Environmental parameters are not yet implemented in the FortyGuard provider."
    );
  }
}
