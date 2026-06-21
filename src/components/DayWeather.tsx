'use client';

import { useWeather } from '@/hooks/useWeather';
import { weatherInfo } from '@/lib/weather';

/** A small forecast chip for a day hero; renders nothing until the date is in range. */
export function DayWeather({ dateISO }: { dateISO: string }) {
  const w = useWeather();
  const f = w?.days?.[dateISO];
  if (!f) return null;
  const { emoji, label } = weatherInfo(f.code);
  const rain = f.precip != null && f.precip >= 30 ? ` · ${f.precip}% rain` : '';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#E7FBF2',
        border: '2px solid #1A1310',
        borderRadius: 999,
        padding: '5px 12px',
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <span aria-hidden="true">{emoji}</span>
      {f.max}° / {f.min}°
      <span style={{ color: '#6B5E54', fontWeight: 500 }}>
        {label}
        {rain}
      </span>
    </span>
  );
}
