'use client';

import { Icon } from '@/lib/icons';
import { PACKING_TOTAL } from '@/lib/packing';
import type { Itinerary, TripState, ViewKey } from '@/lib/types';
import { ImageSlot } from './ImageSlot';
import { usePerson } from './PersonProvider';
import { WeatherStrip } from './WeatherStrip';

interface TripOverviewProps {
  itinerary: Itinerary;
  state: TripState;
  accent: string;
  onView: (v: ViewKey) => void;
}

export function TripOverview({ itinerary, state, accent, onView }: TripOverviewProps) {
  const { meta, route, days, todos } = itinerary;
  const { person } = usePerson();

  const total = days.reduce((a, d) => a + d.acts.length, 0);
  const done = Object.values(state.checked).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  // Progress for the two prep pages. The "before you fly" checklist is shared
  // (numeric-index keys); packing is per-traveller ("pk:{person}:{g}-{i}" keys),
  // so the card shows THIS device's own packing progress.
  const prepTotal = todos.length;
  const prepDone = Object.entries(state.todos).filter(([k, v]) => v && /^\d+$/.test(k)).length;
  const packDone = person ? Object.entries(state.todos).filter(([k, v]) => v && k.startsWith(`pk:${person}:`)).length : 0;

  return (
    <section style={{ animation: 'fadeUp .5s ease both' }}>
      {/* Hero */}
      <div
        style={{
          position: 'relative',
          border: '3px solid #1A1310',
          borderRadius: 30,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '9px 9px 0 #1A1310',
          marginBottom: 34,
        }}
      >
        <ImageSlot
          slotId="seoul-hero"
          placeholder="Drop a Seoul hero photo here"
          alt="Seoul trip hero photo"
          style={{ width: '100%', height: 'clamp(180px,32vw,320px)' }}
        />
        <div style={{ padding: 'clamp(20px,4vw,34px)' }}>
          <div
            style={{
              display: 'inline-block',
              background: '#FFE14D',
              border: '2px solid #1A1310',
              borderRadius: 999,
              padding: '5px 14px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {meta.dateRange}
          </div>
          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(36px,7vw,68px)',
              lineHeight: 0.96,
              letterSpacing: '-.03em',
              margin: '16px 0 10px',
            }}
          >
            {meta.title}
          </h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: '#6B5E54', maxWidth: 580, textWrap: 'pretty' }}>
            {meta.subtitle}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {meta.travellers.map((t) => (
              <div
                key={t.name}
                className="u-chip"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  background: t.bg,
                  border: '2px solid #1A1310',
                  borderRadius: 999,
                  padding: '5px 14px 5px 5px',
                  transition: 'transform .14s ease',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: t.color,
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {t.initial}
                </span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  {t.name} <span style={{ color: '#9A8C81', fontWeight: 500 }}>· {t.role}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fact cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
          gap: 14,
          marginBottom: 36,
        }}
      >
        {meta.facts.map((f) => (
          <div
            key={f.label}
            className="u-card"
            style={{
              background: '#fff',
              border: '2.5px solid #1A1310',
              borderRadius: 18,
              padding: 15,
              boxShadow: '4px 4px 0 #1A1310',
              transition: 'transform .14s ease, box-shadow .14s ease',
            }}
          >
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: f.color, letterSpacing: '.05em' }}>
              {f.label}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 5 }}>{f.value}</div>
            <div style={{ color: '#6B5E54', fontSize: 13, marginTop: 2 }}>{f.note}</div>
          </div>
        ))}
      </div>

      {/* Live weather (only once the trip is within forecast range) */}
      <WeatherStrip itinerary={itinerary} />

      {/* Route */}
      <h2
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(24px,4vw,34px)',
          letterSpacing: '-.02em',
          margin: '0 0 4px',
        }}
      >
        The route
      </h2>
      <p style={{ margin: '0 0 14px', color: '#6B5E54', fontSize: 14 }}>Tap any stop to jump to that day.</p>
      <div style={{ position: 'relative', padding: '22px 2px 26px', overflowX: 'auto', marginBottom: 38 }}>
        <div style={{ position: 'absolute', left: 30, right: 30, top: 54, borderTop: '3px dashed #D8C7B6', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 16, minWidth: 'max-content', padding: '0 4px' }}>
          {route.map((stop, i) => (
            <button
              key={stop.day}
              onClick={() => onView(stop.day)}
              className="u-route"
              style={{
                display: 'block',
                textAlign: 'left',
                background: '#fff',
                border: '2.5px solid #1A1310',
                borderRadius: 18,
                padding: '11px 14px 13px',
                cursor: 'pointer',
                minWidth: 138,
                boxShadow: '3px 3px 0 #1A1310',
                transition: 'transform .14s ease, box-shadow .14s ease',
                animation: 'sweep .45s ease both',
                animationDelay: `${i * 60}ms`,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  fontSize: 11,
                  color: '#fff',
                  background: stop.color,
                  border: '2px solid #1A1310',
                  borderRadius: 999,
                  padding: '2px 9px',
                }}
              >
                DAY {stop.day}
              </span>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 17, marginTop: 9, letterSpacing: '-.01em' }}>
                {stop.name}
              </div>
              <div style={{ color: '#6B5E54', fontSize: 12.5, marginTop: 2 }}>{stop.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: '#1A1310', borderRadius: 24, padding: 'clamp(20px,4vw,30px)', color: '#FFF6EC', marginBottom: 38 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(22px,4vw,30px)', letterSpacing: '-.02em', margin: 0 }}>
            Trip progress
          </h2>
          <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 15, color: '#FFE14D' }}>
            {done} / {total} stops done
          </div>
        </div>
        <div style={{ marginTop: 16, height: 16, borderRadius: 999, background: 'rgba(255,255,255,.14)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(90deg,#FF2E88,#FFB800)',
              transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
              width: `${pct}%`,
            }}
          />
        </div>
        <p style={{ margin: '14px 0 0', color: 'rgba(255,246,236,.7)', fontSize: 13.5 }}>
          Tick off activities as you go inside each day — your progress saves automatically and syncs across devices.
        </p>
      </div>

      {/* Plan & pack */}
      <h2
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(24px,4vw,34px)',
          letterSpacing: '-.02em',
          margin: '0 0 4px',
        }}
      >
        Before you go
      </h2>
      <p style={{ margin: '0 0 14px', color: '#6B5E54', fontSize: 14 }}>Two checklists to work through before you leave.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
        <PlanCard
          onClick={() => onView('prep')}
          icon="clipboard"
          title="Before you fly"
          sub="Bookings, e-Arrival Card, mobile data & travel docs."
          progress={`${prepDone} / ${prepTotal} sorted`}
          accent={accent}
          tint="#FFF0F6"
        />
        <PlanCard
          onClick={() => onView('pack')}
          icon="suitcase"
          title="Packing list"
          sub="What to pack for cold-weather Seoul, room for the hauls."
          progress={`${packDone} / ${PACKING_TOTAL} packed`}
          accent={accent}
          tint="#EAF2FF"
        />
      </div>
    </section>
  );
}

function PlanCard({
  onClick,
  icon,
  title,
  sub,
  progress,
  accent,
  tint,
}: {
  onClick: () => void;
  icon: string;
  title: string;
  sub: string;
  progress: string;
  accent: string;
  tint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="u-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        textAlign: 'left',
        background: tint,
        border: '2.5px solid #1A1310',
        borderRadius: 20,
        padding: 18,
        boxShadow: '5px 5px 0 #1A1310',
        cursor: 'pointer',
        transition: 'transform .14s ease, box-shadow .14s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: '#fff',
            border: '2.5px solid #1A1310',
            display: 'grid',
            placeItems: 'center',
            color: accent,
          }}
        >
          <Icon name={icon} color="currentColor" size={24} />
        </span>
        <Icon name="arrow" color="#1A1310" size={20} />
      </div>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 21, letterSpacing: '-.01em' }}>{title}</div>
      <div style={{ fontSize: 13.5, color: '#6B5E54', lineHeight: 1.4 }}>{sub}</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 12.5, color: accent }}>{progress}</div>
    </button>
  );
}
