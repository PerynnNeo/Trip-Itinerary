'use client';

import { useWeather } from '@/hooks/useWeather';
import { dayDateISO } from '@/lib/dates';
import { weatherInfo } from '@/lib/weather';
import type { Itinerary } from '@/lib/types';

/** Live 8-day Seoul forecast strip — renders only once the trip is inside the
 * ~16-day forecast window (before that, Open-Meteo has no data and this is hidden). */
export function WeatherStrip({ itinerary }: { itinerary: Itinerary }) {
  const w = useWeather();
  if (!w || !w.available) return null;
  const { startDate } = itinerary.meta;
  const cur = w.current ? weatherInfo(w.current.code) : null;

  return (
    <div style={{ background: '#fff', border: '2.5px solid #1A1310', borderRadius: 18, padding: '14px 16px', boxShadow: '4px 4px 0 #1A1310', marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: '#9A8C81', letterSpacing: '.05em' }}>
          SEOUL WEATHER · LIVE
        </span>
        {w.current && cur && (
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            Now {cur.emoji} {w.current.temp}°C
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 2 }}>
        {itinerary.days.map((d) => {
          const f = w.days[dayDateISO(startDate, d.day)];
          const info = f ? weatherInfo(f.code) : null;
          return (
            <div
              key={d.day}
              style={{
                flex: 'none',
                minWidth: 64,
                textAlign: 'center',
                background: '#FBF6EF',
                border: '2px solid #EADBCB',
                borderRadius: 13,
                padding: '9px 8px',
              }}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, color: '#9A8C81' }}>DAY {d.day}</div>
              <div style={{ fontSize: 20, margin: '3px 0' }}>{info ? info.emoji : '–'}</div>
              {f ? (
                <div style={{ fontSize: 12, fontWeight: 700 }}>
                  {f.max}°<span style={{ color: '#9A8C81' }}>/{f.min}°</span>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#B7A99C' }}>–</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
