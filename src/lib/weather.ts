export interface DayForecast {
  code: number;
  max: number;
  min: number;
  precip: number | null;
}

export interface WeatherData {
  available: boolean;
  current: { code: number; temp: number } | null;
  /** ISO date (yyyy-mm-dd) -> forecast */
  days: Record<string, DayForecast>;
}

/** Map a WMO weather code to an emoji + short label. */
export function weatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: 'Clear' };
  if (code === 1 || code === 2) return { emoji: '🌤️', label: 'Partly cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Cloudy' };
  if (code === 45 || code === 48) return { emoji: '🌫️', label: 'Fog' };
  if (code >= 51 && code <= 57) return { emoji: '🌦️', label: 'Drizzle' };
  if (code >= 61 && code <= 67) return { emoji: '🌧️', label: 'Rain' };
  if (code >= 71 && code <= 77) return { emoji: '🌨️', label: 'Snow' };
  if (code >= 80 && code <= 82) return { emoji: '🌧️', label: 'Showers' };
  if (code === 85 || code === 86) return { emoji: '🌨️', label: 'Snow showers' };
  if (code >= 95) return { emoji: '⛈️', label: 'Storm' };
  return { emoji: '🌡️', label: '—' };
}
