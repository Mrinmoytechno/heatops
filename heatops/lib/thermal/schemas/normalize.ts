import {
  ThermalForecastSchema,
  type ThermalObservation,
  type ThermalForecast,
} from "@/types/thermal";

type GeoJsonGeometry = {
  type?: string;
  coordinates?: unknown;
};

type HeatmapFeature = {
  type?: string;

  properties?: {
    tile_id?: string | number;

    average_temperature?:
      | number
      | string;

    min_temperature?:
      | number
      | string;

    max_temperature?:
      | number
      | string;
  };

  geometry?: GeoJsonGeometry;
};

type HeatmapResult = {
  map_data?: {
    type?: string;
    features?: HeatmapFeature[];
  };

  stats_data?: unknown;
};

function numericValue(
  value: unknown
): number | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return undefined;
}

function getPolygonCentroid(
  coordinates: unknown
): {
  latitude: number;
  longitude: number;
} | null {
  if (
    !Array.isArray(
      coordinates
    )
  ) {
    return null;
  }

  const outerRing =
    coordinates[0];

  if (
    !Array.isArray(
      outerRing
    ) ||
    outerRing.length === 0
  ) {
    return null;
  }

  const points =
    outerRing.filter(
      (
        point
      ): point is number[] =>
        Array.isArray(point) &&
        point.length >= 2 &&
        typeof point[0] ===
          "number" &&
        typeof point[1] ===
          "number"
    );

  if (
    points.length === 0
  ) {
    return null;
  }

  const longitude =
    points.reduce(
      (sum, point) =>
        sum + point[0],
      0
    ) / points.length;

  const latitude =
    points.reduce(
      (sum, point) =>
        sum + point[1],
      0
    ) / points.length;

  return {
    latitude,
    longitude,
  };
}

function getFeatureCenter(
  geometry:
    | GeoJsonGeometry
    | undefined
) {
  if (
    !geometry ||
    geometry.type !==
      "Polygon"
  ) {
    return null;
  }

  return getPolygonCentroid(
    geometry.coordinates
  );
}

export function normalizeHeatmapResult(
  result: unknown,
  request: {
    siteId: string;
    timestamp: string;
  }
): ThermalForecast {
  const response =
    result as HeatmapResult;

  const features =
    response.map_data
      ?.features ?? [];

  const observations: ThermalObservation[] =
    [];

  for (
    const feature of features
  ) {
    const properties =
      feature.properties;

    if (!properties) {
      continue;
    }

    const averageTemperatureC =
      numericValue(
        properties.average_temperature
      );

    if (
      averageTemperatureC ===
      undefined
    ) {
      continue;
    }

    const center =
      getFeatureCenter(
        feature.geometry
      );

    if (!center) {
      continue;
    }

    const minTemperatureC =
      numericValue(
        properties.min_temperature
      );

    const maxTemperatureC =
      numericValue(
        properties.max_temperature
      );

    observations.push({
      timestamp:
        request.timestamp,

      latitude:
        center.latitude,

      longitude:
        center.longitude,

      temperatureC:
        averageTemperatureC,

      source:
        "fortyguard",

      tileId:
        properties.tile_id !==
        undefined
          ? String(
              properties.tile_id
            )
          : undefined,

      minTemperatureC,

      maxTemperatureC,
    });
  }

  return ThermalForecastSchema.parse(
    {
      siteId:
        request.siteId,

      observations,

      generatedAt:
        new Date().toISOString(),

      provider:
        "fortyguard",
    }
  );
}
