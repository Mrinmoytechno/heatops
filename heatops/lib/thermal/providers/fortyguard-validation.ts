import {
  FortyGuardApiError,
} from "./fortyguard-error";

const MAX_FORECAST_HOURS = 12;

export function validateForecastWindow(
  startTime: string,
  endTime: string
): void {
  const start =
    new Date(startTime);

  const end =
    new Date(endTime);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new FortyGuardApiError({
      message:
        "Invalid thermal forecast date range.",
      code:
        "INVALID_DATE_RANGE",
    });
  }

  if (end <= start) {
    throw new FortyGuardApiError({
      message:
        "Forecast end time must be after start time.",
      code:
        "INVALID_DATE_RANGE",
    });
  }

  const hours =
    (end.getTime() -
      start.getTime()) /
    (1000 * 60 * 60);

  if (
    hours > MAX_FORECAST_HOURS
  ) {
    throw new FortyGuardApiError({
      message:
        "HeatOps forecast requests cannot exceed 12 hours for the live forecast workflow.",
      code:
        "INVALID_DATE_RANGE",
    });
  }

  const now =
    Date.now();

  const maxFuture =
    now +
    MAX_FORECAST_HOURS *
      60 *
      60 *
      1000;

  if (
    start.getTime() >
    maxFuture
  ) {
    throw new FortyGuardApiError({
      message:
        "Forecast start time is outside the supported live forecast window.",
      code:
        "INVALID_DATE_RANGE",
    });
  }
}