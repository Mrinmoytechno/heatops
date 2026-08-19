import type {
  ForecastRequest,
} from "./requests";

function getDateParts(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      `Invalid date: ${value}`
    );
  }

  return {
    date:
      date
        .toISOString()
        .slice(0, 10),

    time:
      date
        .toISOString()
        .slice(11, 16),
  };
}

export function buildHeatmapPayload(
  request: ForecastRequest
) {
  const start =
    getDateParts(
      request.startTime
    );

  const end =
    getDateParts(
      request.endTime
    );

  return {
    polygon_aoi:
      request.polygonAoi,

    date_time: {
      start_date:
        start.date,

      start_time:
        start.time,

      end_time:
        end.time,

      filter_type: 2,
    },

    granularity: 100,

    analytic_type: "tcm",
  };
      }
