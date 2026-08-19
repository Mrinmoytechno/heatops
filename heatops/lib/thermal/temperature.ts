export function fahrenheitToCelsius(
  temperatureF: number
): number {
  return (temperatureF - 32) * (5 / 9);
}

export function celsiusToFahrenheit(
  temperatureC: number
): number {
  return temperatureC * (9 / 5) + 32;
}

export function roundTemperature(
  temperature: number,
  decimals = 1
): number {
  const factor = 10 ** decimals;

  return (
    Math.round(temperature * factor) /
    factor
  );
}