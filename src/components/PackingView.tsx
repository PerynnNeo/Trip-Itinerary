'use client';

import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { PACKING, PACKING_TOTAL } from '@/lib/packing';
import { PEOPLE, type PersonKey } from '@/lib/people';
import type { TripState } from '@/lib/types';
import { usePerson } from './PersonProvider';

interface PackingViewProps {
  state: TripState;
  accent: string;
  onToggleTodo: (key: number | string) => void;
}

export function PackingView({ state, accent, onToggleTodo }: PackingViewProps) {
  const { person } = usePerson();
  // Show YOUR list by default (following the device identity once it resolves),
  // but let anyone switch to view/help with another traveller's list.
  const [override, setOverride] = useState<PersonKey | null>(null);
  const selected = override ?? person ?? PEOPLE[0].key;
  const selPerson = PEOPLE.find((p) => p.key === selected) ?? PEOPLE[0];
  const selColor = selPerson.color;
  const prefix = `pk:${selected}:`;

  const done = Object.entries(state.todos).filter(([k, v]) => v && k.startsWith(prefix)).length;
  const pct = PACKING_TOTAL ? Math.round((done / PACKING_TOTAL) * 100) : 0;

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
          <Icon name="suitcase" color="currentColor" size={32} />
        </span>
        Packing list
      </h1>
      <p style={{ margin: '0 0 16px', color: '#6B5E54', fontSize: 14.5, maxWidth: 580 }}>
        Cold-weather Seoul, 5–12 °C. Each traveller has their own list — pick yours below and tick as you pack. Lists sync live across phones.
      </p>

      {/* Whose list */}
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 18 }}>
        {PEOPLE.map((p) => {
          const active = selected === p.key;
          const isYou = person === p.key;
          const pDone = Object.entries(state.todos).filter(([k, v]) => v && k.startsWith(`pk:${p.key}:`)).length;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setOverride(p.key)}
              aria-pressed={active}
              className="u-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: `2.5px solid ${p.color}`,
                background: active ? p.color : '#fff',
                color: active ? '#fff' : p.color,
                borderRadius: 999,
                padding: '7px 14px 7px 7px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: 13.5,
                transition: 'transform .14s ease, background .14s ease',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: active ? 'rgba(255,255,255,.25)' : p.color,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {p.name[0]}
              </span>
              {p.name}
              {isYou && <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.85 }}>· you</span>}
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, opacity: 0.75 }}>
                {pDone}/{PACKING_TOTAL}
              </span>
            </button>
          );
        })}
      </div>

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
          marginBottom: 24,
        }}
      >
        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14, color: '#FFE14D', flex: 'none' }}>
          {done} / {PACKING_TOTAL}
        </div>
        <div style={{ flex: 1, height: 12, borderRadius: 999, background: 'rgba(255,255,255,.14)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 999,
              background: selColor,
              transition: 'width .6s cubic-bezier(.2,.8,.2,1), background .2s ease',
              width: `${pct}%`,
            }}
          />
        </div>
        <div style={{ fontWeight: 700, fontSize: 12.5, color: 'rgba(255,246,236,.75)', flex: 'none' }}>{selPerson.name}&rsquo;s bag</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, alignItems: 'start' }}>
        {PACKING.map((group, gi) => {
          const groupDone = group.items.filter((_, ii) => state.todos[`${prefix}${gi}-${ii}`]).length;
          return (
            <div
              key={group.title}
              style={{
                background: '#fff',
                border: '2.5px solid #1A1310',
                borderRadius: 20,
                boxShadow: '5px 5px 0 #1A1310',
                overflow: 'hidden',
                animation: 'sweep .4s ease both',
                animationDelay: `${gi * 55}ms`,
              }}
            >
              {/* Group header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  background: group.tint,
                  borderBottom: '2.5px solid #1A1310',
                  padding: '13px 16px',
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    flex: 'none',
                    borderRadius: 11,
                    background: '#fff',
                    border: '2px solid #1A1310',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#1A1310',
                  }}
                >
                  <Icon name={group.icon} color="currentColor" size={20} />
                </span>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-.01em', flex: 1 }}>
                  {group.title}
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 11.5, color: '#6B5E54', flex: 'none' }}>
                  {groupDone}/{group.items.length}
                </span>
              </div>

              {/* Items */}
              <div style={{ padding: '6px 16px 12px' }}>
                {group.items.map((item, ii) => {
                  const key = `${prefix}${gi}-${ii}`;
                  const on = !!state.todos[key];
                  return (
                    <button
                      key={key}
                      onClick={() => onToggleTodo(key)}
                      className="u-todo"
                      style={{
                        display: 'flex',
                        gap: 11,
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderTop: ii ? '1.5px solid #F0E6DA' : 'none',
                        padding: '11px 2px',
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        style={{
                          flex: 'none',
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          border: '2.5px solid #1A1310',
                          display: 'grid',
                          placeItems: 'center',
                          marginTop: 1,
                          background: on ? selColor : '#fff',
                          transition: 'background .2s ease',
                        }}
                      >
                        {on && <Icon name="check" color="#fff" size={14} stroke={2.6} />}
                      </span>
                      <span
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.4,
                          fontWeight: 600,
                          color: on ? '#9A8C81' : '#1A1310',
                          textDecoration: on ? 'line-through' : 'none',
                        }}
                      >
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
