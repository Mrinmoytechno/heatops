import { z } from "zod";

export const ThermalObservationSchema =
  z.object({
    timestamp: z.string().datetime(),

    latitude: z
      .number()
      .min(-90)
      .max(90),

    longitude: z
      .number()
      .min(-180)
      .max(180),

    temperatureC: z.number().finite(),

    source: z
      .string()
      .min(1),
  });

export type ThermalObservation =
  z.infer<
    typeof ThermalObservationSchema
  >;

export const ThermalForecastSchema =
  z.object({
    siteId: z.string().uuid(),

    observations: z.array(
      ThermalObservationSchema
    ),

    generatedAt:
      z.string().datetime(),

    provider: z
      .string()
      .min(1),
  });

export type ThermalForecast =
  z.infer<
    typeof ThermalForecastSchema
  >;