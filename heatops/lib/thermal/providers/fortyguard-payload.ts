import type {
  ForecastRequest,
} from "./requests";

function toFortyGuardDateTime(
  value: string
) {
  const date =
    new Date(value);

  return {
    start_date:
      date
        .toISOString()
        .slice(0, 10),

    start_time:
      date
        .toISOString()
        .slice(11, 16),
  };
}

export function buildHeatmapPayload(
  request: ForecastRequest
) {
  const start =
    toFortyGuardDateTime(
      request.startTime
    );

  const end =
    toFortyGuardDateTime(
      request.endTime
    );

  return {
    polygon_aoi:
      request.polygonAoi,

    date_time: {
      start_date:
        start.start_date,

      start_time:
        start.start_time,

      end_time:
        end.start_time,

      filter_type: 2,
    },

    granularity: 100,

    analytic_type: "tcm",
  };
}