import {
  ThermalForecastSchema,
  type ThermalForecast,
} from "@/types/thermal";

export function normalizeThermalForecast(
  data: unknown
): ThermalForecast {
  return ThermalForecastSchema.parse(
    data
  );
}