'use client';

import { useEffect, useState } from 'react';
import type { WeatherData } from '@/lib/weather';

const EMPTY: WeatherData = { available: false, current: null, days: {} };

// Module-level cache so every consumer shares a single fetch.
let cache: Promise<WeatherData> | null = null;
function load(): Promise<WeatherData> {
  if (!cache) {
    cache = fetch('/api/weather')
      .then((r) => r.json() as Promise<WeatherData>)
      .catch(() => EMPTY);
  }
  return cache;
}

export function useWeather(): WeatherData | null {
  const [data, setData] = useState<WeatherData | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
