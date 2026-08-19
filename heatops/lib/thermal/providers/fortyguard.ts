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
      "Current conditions are not part of the HeatOps Heatmap MVP."
    );
  }

  async getHeatmap(
    _request: HeatmapRequest
  ): Promise<HeatmapResult> {
    throw new Error(
      "Use getForecast for the HeatOps Heatmap workflow."
    );
  }

  async getEnvironmentalParameters(
    _request: EnvironmentalRequest
  ): Promise<EnvironmentalResult> {
    throw new Error(
      "Environmental parameters will be added after the Heatmap MVP is verified."
    );
  }
        }
