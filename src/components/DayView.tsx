'use client';

import { Icon } from '@/lib/icons';
import { currentActivityIndex, dayDateISO } from '@/lib/dates';
import type { ActivityActual, Itinerary, TripState, ViewKey } from '@/lib/types';
import { ActivityCard } from './ActivityCard';
import { DayWeather } from './DayWeather';
import { PhotoTrio } from './PhotoTrio';

interface DayViewProps {
  itinerary: Itinerary;
  dayNum: number;
  state: TripState;
  accent: string;
  now: Date;
  isToday: boolean;
  onView: (v: ViewKey) => void;
  onToggleExpand: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onSetActual: (id: string, actual: ActivityActual | null) => void;
}

export function DayView({ itinerary, dayNum, state, accent, now, isToday, onView, onToggleExpand, onToggleCheck, onSetActual }: DayViewProps) {
  const day = itinerary.days[dayNum - 1];
  if (!day) return null;

  const nowIdx = isToday ? currentActivityIndex(day.acts, now) : -1;

  const num2 = String(day.day).padStart(2, '0');
  const heroSlotId = `day${day.day}-hero`;

  // Linear flow: Trip → Day 1 … last day → Trip. Buttons are always actionable.
  const lastDay = itinerary.days.length;
  const prevTarget: ViewKey = day.day > 1 ? day.day - 1 : 'trip';
  const nextTarget: ViewKey = day.day < lastDay ? day.day + 1 : 'trip';
  const prevLabel = day.day > 1 ? `← Day ${day.day - 1}` : '← Trip';
  const nextLabel = day.day < lastDay ? `Day ${day.day + 1} →` : 'Done ✓';

  return (
    <section key={`day${dayNum}`} style={{ animation: 'fadeUp .45s ease both' }}>
      {/* Day hero */}
      <div
        style={{
          position: 'relative',
          border: '3px solid #1A1310',
          borderRadius: 28,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '8px 8px 0 #1A1310',
          marginBottom: 30,
        }}
      >
        <div>
          <div style={{ padding: 'clamp(20px,3.5vw,30px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(46px,9vw,82px)',
                  lineHeight: 0.8,
                  letterSpacing: '-.04em',
                  color: day.color,
                }}
              >
                {num2}
              </div>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, color: '#9A8C81' }}>{day.weekday}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{day.date}</div>
              </div>
            </div>
            <h1
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(24px,4vw,34px)',
                lineHeight: 1.05,
                letterSpacing: '-.02em',
                margin: '16px 0 0',
                textWrap: 'pretty',
              }}
            >
              {day.theme}
            </h1>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#EAF2FF', border: '2px solid #1A1310', borderRadius: 999, padding: '5px 13px', fontSize: 13, fontWeight: 600 }}>
                <Icon name="hotel" color="#1A1310" size={15} />
                {day.hotel}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF3D6', border: '2px solid #1A1310', borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                {day.spend}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', background: '#F3EEFF', border: '2px solid #1A1310', borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 700 }}>
                {day.acts.length} stops
              </span>
              <DayWeather dateISO={dayDateISO(itinerary.meta.startDate, day.day)} />
            </div>
            {day.note && (
              <div style={{ marginTop: 16, background: '#FFF0F0', border: '2px solid #FF5A3C', borderRadius: 14, padding: '11px 14px', fontSize: 13.5, fontWeight: 600, color: '#B5341F', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', flex: 'none', marginTop: 1 }}>
                  <Icon name="alert" color="#B5341F" size={16} />
                </span>
                <span>{day.note}</span>
              </div>
            )}
          </div>
          <div style={{ borderTop: '2px dashed #E7D9CB', background: '#FBF6EF', padding: 'clamp(16px,3vw,22px)' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: '#9A8C81', letterSpacing: '.04em', marginBottom: 11 }}>
              PHOTOS FROM THIS DAY · ONE EACH
            </div>
            <PhotoTrio base={heroSlotId} context={`Day ${day.day}`} height={140} />
          </div>
        </div>
      </div>

      {/* Activities */}
      <div>
        {day.acts.map((act, idx) => {
          const id = `d${day.day}-${idx}`;
          return (
            <ActivityCard
              key={id}
              act={act}
              id={id}
              index={idx}
              itinerary={itinerary}
              showKorean={state.showKorean}
              expanded={!!state.expanded[id]}
              checked={!!state.checked[id]}
              currency={state.currency}
              actual={state.actuals[id]}
              isNow={idx === nowIdx}
              onToggle={() => onToggleExpand(id)}
              onCheck={() => onToggleCheck(id)}
              onSetActual={(a) => onSetActual(id, a)}
            />
          );
        })}
      </div>

      {/* Prev / next */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
        <button
          onClick={() => onView(prevTarget)}
          className="u-btn"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            padding: '11px 18px',
            borderRadius: 14,
            border: '2.5px solid #1A1310',
            background: '#fff',
            cursor: 'pointer',
            boxShadow: '3px 3px 0 #1A1310',
            transition: 'transform .14s ease',
          }}
        >
          {prevLabel}
        </button>
        <button
          onClick={() => onView(nextTarget)}
          className="u-btn"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            padding: '11px 18px',
            borderRadius: 14,
            border: '2.5px solid #1A1310',
            background: '#1A1310',
            color: '#FFF6EC',
            cursor: 'pointer',
            boxShadow: `3px 3px 0 ${accent}`,
            transition: 'transform .14s ease',
          }}
        >
          {nextLabel}
        </button>
      </div>
    </section>
  );
}
