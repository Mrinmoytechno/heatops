import {
  getEnvironment,
} from "@/lib/config/env";

import {
  FortyGuardApiError,
} from "./fortyguard-error";

type FortyGuardSubmitResponse = {
  error?: boolean;
  status_code?: number;
  message?: string;

  data?: {
    activity_id?: string;
  };
};

type FortyGuardStatusResponse = {
  error?: boolean;
  status_code?: number;
  message?: string;

  data?: {
    activity_id?: string;
    status?: string;
    result?: unknown;
  };
};

export class FortyGuardClient {
  private readonly baseUrl: string;

  private readonly apiKey: string;

  constructor() {
    const environment =
      getEnvironment();

    if (
      !environment.FORTYGUARD_API_BASE_URL
    ) {
      throw new FortyGuardApiError({
        message:
          "FORTYGUARD_API_BASE_URL is not configured.",
        code:
          "FORTYGUARD_CONFIGURATION_ERROR",
      });
    }

    if (
      !environment.FORTYGUARD_API_KEY
    ) {
      throw new FortyGuardApiError({
        message:
          "FORTYGUARD_API_KEY is not configured.",
        code:
          "FORTYGUARD_CONFIGURATION_ERROR",
      });
    }

    this.baseUrl =
      environment.FORTYGUARD_API_BASE_URL.replace(
        /\/$/,
        ""
      );

    this.apiKey =
      environment.FORTYGUARD_API_KEY;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(
      `${this.baseUrl}${path}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          "api-key":
            this.apiKey,

          ...(options.headers ?? {}),
        },

        cache: "no-store",
      }
    );

    const text =
      await response.text();

    let payload: unknown = null;

    if (text) {
      try {
        payload =
          JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      throw new FortyGuardApiError({
        message:
          `FortyGuard request failed with HTTP ${response.status}.`,
        statusCode:
          response.status,
        code:
          response.status === 401
            ? "FORTYGUARD_AUTH_ERROR"
            : response.status === 429
              ? "FORTYGUARD_RATE_LIMIT"
              : "FORTYGUARD_API_ERROR",
        details: payload,
      });
    }

    return payload as T;
  }

  async submitHeatmap(
    payload: unknown
  ): Promise<string> {
    const response =
      await this.request<FortyGuardSubmitResponse>(
        "/v1/heatmap",
        {
          method: "POST",

          body: JSON.stringify(
            payload
          ),
        }
      );

    const activityId =
      response.data?.activity_id;

    if (!activityId) {
      throw new FortyGuardApiError({
        message:
          "FortyGuard heatmap submission did not return an activity ID.",
        code:
          "FORTYGUARD_INVALID_SUBMISSION_RESPONSE",
        details: response,
      });
    }

    return activityId;
  }

  async getStatus(
    activityId: string
  ): Promise<FortyGuardStatusResponse> {
    return this.request<FortyGuardStatusResponse>(
      `/v1/status/${encodeURIComponent(
        activityId
      )}`
    );
  }
}