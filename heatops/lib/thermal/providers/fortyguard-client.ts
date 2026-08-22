import {
  getEnvironment,
} from "@/lib/config/env";

import {
  FortyGuardApiError,
} from "./fortyguard-error";

type SubmitResponse = {
  error?: boolean;
  message?: string;
  data?: {
    activity_id?: string;
  };
};

export type FortyGuardStatusData = {
  activity_id?: string;
  status?: string;
  result?: unknown;
  message?: string;
};

type StatusResponse = {
  error?: boolean;
  message?: string;
  data?: FortyGuardStatusData;
};

export class FortyGuardClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    const environment =
      getEnvironment();

    const baseUrl =
      environment.FORTYGUARD_BASE_URL;

    if (!baseUrl) {
      throw new FortyGuardApiError({
        message:
          "FortyGuard base URL is not configured.",
        code:
          "FORTYGUARD_CONFIGURATION_ERROR",
      });
    }

    if (!environment.FORTYGUARD_API_KEY) {
      throw new FortyGuardApiError({
        message:
          "FORTYGUARD_API_KEY is not configured.",
        code:
          "FORTYGUARD_CONFIGURATION_ERROR",
      });
    }

    this.baseUrl =
      baseUrl.replace(/\/$/, "");

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
    payload: Record<string, unknown>
  ): Promise<string> {
    const response =
      await this.request<SubmitResponse>(
        "/v1/heatmap",
        {
          method: "POST",
          body: JSON.stringify(
            payload
          ),
        }
      );

    if (response.error) {
      throw new FortyGuardApiError({
        message:
          response.message ??
          "FortyGuard heatmap submission failed.",
        code:
          "FORTYGUARD_SUBMISSION_FAILED",
        details: response,
      });
    }

    const activityId =
      response.data?.activity_id;

    if (!activityId) {
      throw new FortyGuardApiError({
        message:
          "FortyGuard did not return an activity ID.",
        code:
          "FORTYGUARD_INVALID_SUBMISSION_RESPONSE",
        details: response,
      });
    }

    return activityId;
  }

  async getStatus(
    activityId: string
  ): Promise<FortyGuardStatusData> {
    const response =
      await fetch(
        `${this.baseUrl}/v1/status/${encodeURIComponent(
          activityId
        )}`,
        {
          headers: {
            "api-key":
              this.apiKey,
          },
          cache: "no-store",
        }
      );

    /*
     * FortyGuard documents a short period immediately
     * after submission where the activity may not yet
     * be visible. Treat that as pending.
     */
    if (response.status === 404) {
      return {
        activity_id: activityId,
        status: "pending",
      };
    }

    const text =
      await response.text();

    let payload: StatusResponse;

    try {
      payload =
        JSON.parse(text) as StatusResponse;
    } catch {
      throw new FortyGuardApiError({
        message:
          "FortyGuard returned an invalid status response.",
        statusCode:
          response.status,
        code:
          "FORTYGUARD_INVALID_STATUS_RESPONSE",
        details: text,
      });
    }

    if (!response.ok) {
      throw new FortyGuardApiError({
        message:
          `FortyGuard status request failed with HTTP ${response.status}.`,
        statusCode:
          response.status,
        code:
          response.status === 429
            ? "FORTYGUARD_RATE_LIMIT"
            : "FORTYGUARD_STATUS_ERROR",
        details: payload,
      });
    }

    if (payload.error) {
      throw new FortyGuardApiError({
        message:
          payload.message ??
          "FortyGuard status lookup failed.",
        code:
          "FORTYGUARD_STATUS_ERROR",
        details: payload,
      });
    }

    return (
      payload.data ?? {
        activity_id: activityId,
        status: "pending",
      }
    );
  }
}