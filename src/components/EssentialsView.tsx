'use client';

import { useState } from 'react';
import { EMBASSY, EMERGENCY, FLIGHTS, HOTELS, TIPS } from '@/lib/essentials';
import { Icon } from '@/lib/icons';

interface EssentialsViewProps {
  accent: string;
}

export function EssentialsView({ accent }: EssentialsViewProps) {
  return (
    <section style={{ animation: 'fadeUp .45s ease both' }}>
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(28px,5vw,44px)',
          letterSpacing: '-.03em',
          margin: '0 0 4px',
        }}
      >
        <Shield />
        Essentials
      </h1>
      <p style={{ margin: '0 0 22px', color: '#6B5E54', fontSize: 14.5, maxWidth: 560 }}>
        The page you hope you never need — works offline once the app is installed.
      </p>

      {/* Emergency */}
      <Label>EMERGENCY · TAP TO CALL</Label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 11, marginBottom: 26 }}>
        {EMERGENCY.map((e) => (
          <a
            key={e.number}
            href={`tel:${e.number}`}
            className="u-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              textDecoration: 'none',
              color: '#1A1310',
              background: e.danger ? '#FFF0F0' : '#fff',
              border: `2.5px solid ${e.danger ? '#B5341F' : '#1A1310'}`,
              borderRadius: 16,
              padding: '13px 15px',
              boxShadow: `4px 4px 0 ${e.danger ? '#B5341F' : '#1A1310'}`,
              transition: 'transform .14s ease, box-shadow .14s ease',
            }}
          >
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: e.danger ? '#B5341F' : accent,
                flex: 'none',
                minWidth: 44,
              }}
            >
              {e.number}
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>{e.label}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: '#6B5E54' }}>{e.sub}</span>
            </span>
          </a>
        ))}
      </div>

      {/* Hotels */}
      <Label>HOTELS · SHOW A DRIVER</Label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12, marginBottom: 26 }}>
        {HOTELS.map((h) => (
          <div
            key={h.name}
            style={{
              background: '#fff',
              border: '2.5px solid #1A1310',
              borderRadius: 18,
              padding: '15px 17px',
              boxShadow: '4px 4px 0 #1A1310',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{h.name}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: '#9A8C81' }}>{h.nights}</span>
            </div>
            <div
              lang="ko"
              style={{ fontSize: 19, fontWeight: 700, margin: '10px 0 4px', lineHeight: 1.3 }}
            >
              {h.korean}
            </div>
            <div style={{ fontSize: 13, color: '#6B5E54', marginBottom: 11 }}>{h.address}</div>
            <CopyButton text={h.korean} accent={accent} label="Copy Korean address" />
          </div>
        ))}
      </div>

      {/* Embassy */}
      <Label>SINGAPORE EMBASSY</Label>
      <div style={{ background: '#EAF2FF', border: '2.5px solid #1A1310', borderRadius: 18, padding: '15px 17px', boxShadow: '4px 4px 0 #1A1310', marginBottom: 26 }}>
        <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 6 }}>{EMBASSY.name}</div>
        <div lang="ko" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>{EMBASSY.korean}</div>
        <div style={{ fontSize: 13, color: '#3A322C', margin: '3px 0 10px' }}>{EMBASSY.address}</div>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 10 }}>
          <a href={`tel:${EMBASSY.phone}`} style={telBtn('#3B82F6')}>
            <Icon name="transport" color="#3B82F6" size={14} /> {EMBASSY.phone}
          </a>
          <CopyButton text={EMBASSY.korean} accent={accent} label="Copy address" />
        </div>
        <div style={{ fontSize: 12.5, color: '#6B5E54' }}>{EMBASSY.hours}</div>
        <div style={{ fontSize: 12.5, color: '#6B5E54', marginTop: 4 }}>
          After hours: <a href={`tel:${EMBASSY.afterHours.replace(/\s/g, '')}`} style={{ color: '#3B82F6', fontWeight: 700 }}>{EMBASSY.afterHours}</a> · {EMBASSY.afterHoursLabel}
        </div>
      </div>

      {/* Flights */}
      <Label>FLIGHTS</Label>
      <div style={{ display: 'grid', gap: 11, marginBottom: 26 }}>
        {FLIGHTS.map((f) => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: '2.5px solid #1A1310', borderRadius: 16, padding: '13px 15px', boxShadow: '4px 4px 0 #1A1310' }}>
            <Icon name="plane" color={accent} size={22} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>{f.value}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: '#6B5E54' }}>{f.label} · {f.sub}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Tips */}
      <Label>GOOD TO KNOW</Label>
      <div style={{ background: '#FFF7E8', border: '2px solid #F0D89A', borderRadius: 16, padding: '14px 16px' }}>
        {TIPS.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '5px 0' }}>
            <span style={{ flex: 'none', width: 7, height: 7, borderRadius: '50%', background: '#C28A00', marginTop: 7 }} />
            <span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#3A322C' }}>{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: '#9A8C81', letterSpacing: '.05em', margin: '0 0 11px' }}>
      {children}
    </div>
  );
}

function telBtn(color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 13,
    color,
    background: '#fff',
    border: `2px solid ${color}`,
    borderRadius: 999,
    padding: '6px 13px',
  };
}

function CopyButton({ text, accent, label }: { text: string; accent: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="u-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontWeight: 700,
        fontSize: 12.5,
        color: done ? '#12B886' : '#1A1310',
        background: '#fff',
        border: `2px solid ${done ? '#12B886' : '#1A1310'}`,
        borderRadius: 999,
        padding: '6px 13px',
        cursor: 'pointer',
        transition: 'transform .14s ease',
      }}
    >
      {done ? '✓ Copied' : label}
    </button>
  );
}

function Shield() {
  return (
    <span style={{ display: 'inline-flex', color: '#B5341F' }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    </span>
  );
}
