import type {
  ThermalForecast,
  ThermalObservation,
} from "@/types/thermal";

export type ThermalConditions = {
  observedAt: string;
  latitude: number;
  longitude: number;
  observation: ThermalObservation;
  provider: string;
};

export type HeatmapResult = {
  generatedAt: string;
  provider: string;
  observations: ThermalObservation[];
};

export type EnvironmentalResult = {
  observedAt: string;
  latitude: number;
  longitude: number;

  parameters: Record<
    string,
    number | string | null
  >;

  provider: string;
};

export type NormalizedForecast =
  ThermalForecast;
