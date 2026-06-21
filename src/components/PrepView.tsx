'use client';

import { Icon } from '@/lib/icons';
import type { Itinerary, TripState } from '@/lib/types';

interface PrepViewProps {
  itinerary: Itinerary;
  state: TripState;
  accent: string;
  onToggleTodo: (key: number | string) => void;
}

export function PrepView({ itinerary, state, accent, onToggleTodo }: PrepViewProps) {
  const todos = itinerary.todos;
  const done = todos.filter((_, i) => state.todos[i]).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <section style={{ animation: 'fadeUp .45s ease both' }}>
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(28px,5vw,44px)',
          letterSpacing: '-.03em',
          margin: '0 0 4px',
        }}
      >
        <span style={{ color: accent, display: 'inline-flex' }}>
          <Icon name="clipboard" color="currentColor" size={32} />
        </span>
        Before you fly
      </h1>
      <p style={{ margin: '0 0 18px', color: '#6B5E54', fontSize: 14.5, maxWidth: 580 }}>
        Everything to sort before you leave Singapore — bookings, entry documents, data and packing prep. Tick as you go; it syncs across everyone&apos;s phones.
      </p>

      {/* Progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: '#1A1310',
          borderRadius: 16,
          padding: '13px 17px',
          color: '#FFF6EC',
          marginBottom: 22,
        }}
      >
        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14, color: '#FFE14D', flex: 'none' }}>
          {done} / {todos.length}
        </div>
        <div style={{ flex: 1, height: 12, borderRadius: 999, background: 'rgba(255,255,255,.14)', overflow: 'hidden' }}>
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 11 }}>
        {todos.map((text, i) => {
          const on = !!state.todos[i];
          return (
            <button
              key={i}
              onClick={() => onToggleTodo(i)}
              className="u-todo"
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                textAlign: 'left',
                background: '#fff',
                border: '2.5px solid #1A1310',
                borderRadius: 16,
                padding: '13px 15px',
                cursor: 'pointer',
                boxShadow: '3px 3px 0 #1A1310',
                transition: 'transform .14s ease, box-shadow .14s ease',
                animation: 'sweep .4s ease both',
                animationDelay: `${i * 35}ms`,
              }}
            >
              <span
                style={{
                  flex: 'none',
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  border: '2.5px solid #1A1310',
                  display: 'grid',
                  placeItems: 'center',
                  marginTop: 1,
                  background: on ? '#12B886' : '#fff',
                  transition: 'background .2s ease',
                }}
              >
                {on && <Icon name="check" color="#fff" size={15} stroke={2.6} />}
              </span>
              <span
                style={{
                  fontSize: 14,
                  lineHeight: 1.4,
                  fontWeight: 600,
                  color: on ? '#9A8C81' : '#1A1310',
                  textDecoration: on ? 'line-through' : 'none',
                }}
              >
                {text}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
