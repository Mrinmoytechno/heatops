import {
  celsiusToFahrenheit,
} from "@/lib/thermal/temperature";

export function toFahrenheit(
  temperatureC: number
): number {
  return celsiusToFahrenheit(
    temperatureC
  );
}
