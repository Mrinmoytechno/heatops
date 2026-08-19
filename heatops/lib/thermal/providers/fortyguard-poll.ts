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
    3000;

  const maxAttempts =
    environment.FORTYGUARD_MAX_POLL_ATTEMPTS ??
    200;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    const status =
      await client.getStatus(
        activityId
      );

    const normalizedStatus =
      String(
        status.status ?? ""
      ).toLowerCase();

    if (
      normalizedStatus ===
        "completed" ||
      normalizedStatus ===
        "succeeded"
    ) {
      if (
        status.result ===
        undefined
      ) {
        throw new FortyGuardApiError({
          message:
            "FortyGuard completed the activity but returned no result.",
          code:
            "FORTYGUARD_EMPTY_RESULT",
          details: status,
        });
      }

      return status.result;
    }

    if (
      normalizedStatus ===
        "failed" ||
      normalizedStatus ===
        "error"
    ) {
      throw new FortyGuardApiError({
        message:
          "FortyGuard thermal analysis failed.",
        code:
          "FORTYGUARD_JOB_FAILED",
        details: status,
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
      "FortyGuard thermal analysis timed out.",
    code:
      "FORTYGUARD_JOB_TIMEOUT",
    details: {
      activityId,
      maxAttempts,
    },
  });
}
