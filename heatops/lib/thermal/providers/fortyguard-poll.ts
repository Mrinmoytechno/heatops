import {
  getEnvironment,
} from "@/lib/config/env";

import {
  FortyGuardApiError,
} from "./fortyguard-error";

import {
  FortyGuardClient,
} from "./fortyguard-client";

export async function waitForFortyGuardResult(
  client: FortyGuardClient,
  activityId: string
): Promise<unknown> {
  const environment =
    getEnvironment();

  const interval =
    environment.FORTYGUARD_POLL_INTERVAL_MS ??
    5000;

  const maxAttempts =
    environment.FORTYGUARD_MAX_POLL_ATTEMPTS ??
    24;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    const response =
      await client.getStatus(
        activityId
      );

    const status =
      response.data?.status
        ?.toLowerCase();

    if (
      status === "completed" ||
      status === "succeeded"
    ) {
      if (
        response.data?.result ===
        undefined
      ) {
        throw new FortyGuardApiError({
          message:
            "FortyGuard marked the activity completed but returned no result.",
          code:
            "FORTYGUARD_EMPTY_RESULT",
          details: response,
        });
      }

      return response.data.result;
    }

    if (
      status === "failed" ||
      status === "error"
    ) {
      throw new FortyGuardApiError({
        message:
          "FortyGuard thermal analysis failed.",
        code:
          "FORTYGUARD_JOB_FAILED",
        details: response,
      });
    }

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          interval
        )
    );
  }

  throw new FortyGuardApiError({
    message:
      "FortyGuard thermal analysis timed out while waiting for completion.",
    code:
      "FORTYGUARD_JOB_TIMEOUT",
    details: {
      activityId,
      maxAttempts,
    },
  });
}