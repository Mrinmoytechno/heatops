export type CurrentConditionsRequest = {
  latitude: number;
  longitude: number;
};

export type ForecastRequest = {
  siteId: string;

  latitude: number;
  longitude: number;

  startTime: string;
  endTime: string;

  /**
   * GeoJSON Polygon or FeatureCollection defining
   * the site's area of interest.
   *
   * Coordinates use [longitude, latitude].
   */
  polygonAoi: GeoJsonFeatureCollection;
};

export type HeatmapRequest = {
  latitude: number;
  longitude: number;

  startTime: string;
  endTime: string;

  polygonAoi: GeoJsonFeatureCollection;
};

export type EnvironmentalRequest = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";

  features: Array<{
    type: "Feature";

    properties: Record<string, unknown>;

    geometry: {
      type: "Polygon";

      coordinates: number[][][];
    };
  }>;
};