import type {
      ThermalForecast,
      } from "@/types/thermal";

      export interface ThermalDataProvider {
        getForecast(
            request: ForecastRequest
              ): Promise<ThermalForecast>;
              }

              export type ForecastRequest = {
                latitude: number;
                  longitude: number;
                    startTime: string;
                      endTime: string;
                      };
