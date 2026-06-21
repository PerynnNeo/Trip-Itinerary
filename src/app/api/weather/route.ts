import { NextResponse } from 'next/server';
import { getItinerary } from '@/lib/itinerary';
import type { WeatherData } from '@/lib/weather';

export const runtime = 'nodejs';
// Cache the forecast for 30 minutes (Open-Meteo updates hourly; this also lets the
// service worker serve it offline).
export const revalidate = 1800;

const EMPTY: WeatherData = { available: false, current: null, days: {} };

/** GET /api/weather — live Seoul forecast for the trip dates via Open-Meteo (no key). */
export async function GET() {
  const { lat, lng, startDate, endDate } = getItinerary().meta;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&current=temperature_2m,weather_code&timezone=Asia%2FSeoul` +
    `&start_date=${startDate}&end_date=${endDate}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return NextResponse.json(EMPTY);
    const data = (await res.json()) as {
      current?: { temperature_2m: number; weather_code: number };
      daily?: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max?: number[];
      };
    };

    const days: WeatherData['days'] = {};
    const d = data.daily;
    if (d?.time) {
      d.time.forEach((date, i) => {
        days[date] = {
          code: d.weather_code[i],
          max: Math.round(d.temperature_2m_max[i]),
          min: Math.round(d.temperature_2m_min[i]),
          precip: d.precipitation_probability_max?.[i] ?? null,
        };
      });
    }
    const current = data.current
      ? { code: data.current.weather_code, temp: Math.round(data.current.temperature_2m) }
      : null;

    return NextResponse.json({ available: Object.keys(days).length > 0, current, days } satisfies WeatherData);
  } catch {
    return NextResponse.json(EMPTY);
  }
}
