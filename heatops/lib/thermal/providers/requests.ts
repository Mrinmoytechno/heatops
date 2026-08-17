export type CurrentConditionsRequest = {
  latitude: number;
  longitude: number;
};

export type ForecastRequest = {
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
};

export type HeatmapRequest = {
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
};

export type EnvironmentalRequest = {
  latitude: number;
  longitude: number;
  timestamp: string;
};
