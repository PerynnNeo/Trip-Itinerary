'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ACCENT_MAP } from '@/lib/itinerary';
import { PEOPLE } from '@/lib/people';
import type { AccentName } from '@/lib/types';
import { usePerson } from './PersonProvider';

interface SettingsProps {
  accent: AccentName;
  showKorean: boolean;
  onAccent: (a: AccentName) => void;
  onShowKorean: (v: boolean) => void;
  onReset: () => void;
}

const ACCENTS = Object.keys(ACCENT_MAP) as AccentName[];

/**
 * Gear button + a portal overlay for trip display preferences. Rendered into
 * document.body so the panel is never clipped by the header's backdrop-filter /
 * the nav's horizontal overflow. Bottom sheet on phones, popover on desktop.
 */
export function Settings({ accent, showKorean, onAccent, onShowKorean, onReset }: SettingsProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const accentHex = ACCENT_MAP[accent];
  const { person, setPerson } = usePerson();

  useEffect(() => setMounted(true), []);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Settings"
        aria-label="Settings"
        aria-haspopup="dialog"
        className="u-nav"
        style={{
          width: 40,
          height: 40,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 999,
          border: '2px solid #1A1310',
          background: open ? accentHex : '#fff',
          color: open ? '#fff' : '#1A1310',
          cursor: 'pointer',
          flex: 'none',
          transition: 'transform .16s ease, background .16s ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="settings-backdrop"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Trip settings"
          >
            <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
              <div className="settings-grabber" aria-hidden="true" />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, margin: 0 }}>Settings</h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close settings"
                  style={{ width: 34, height: 34, borderRadius: 10, border: '2px solid #1A1310', background: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                >
                  ×
                </button>
              </div>

              <div style={label}>I AM (THIS DEVICE)</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {PEOPLE.map((p) => {
                  const selected = person === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setPerson(p.key)}
                      aria-pressed={selected}
                      style={{
                        flex: 1,
                        padding: '9px 6px',
                        borderRadius: 12,
                        border: selected ? `3px solid ${p.color}` : '2px solid #1A1310',
                        background: selected ? p.bg : '#fff',
                        color: '#1A1310',
                        fontWeight: 700,
                        fontSize: 13.5,
                        cursor: 'pointer',
                      }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 12, lineHeight: 1.5, color: '#9A8C81' }}>
                Highlights your photo slot &amp; spend column. Saved on this device only.
              </p>

              <div style={label}>ACCENT COLOUR</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {ACCENTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => onAccent(a)}
                    title={a}
                    aria-label={a}
                    aria-pressed={accent === a}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      background: ACCENT_MAP[a],
                      border: accent === a ? '3px solid #1A1310' : '2px solid rgba(26,19,16,.22)',
                      cursor: 'pointer',
                      transform: accent === a ? 'scale(1.08)' : 'none',
                      transition: 'transform .14s ease',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20 }}>
                <span id="show-korean-label" style={{ fontSize: 15, fontWeight: 700 }}>
                  Show Korean names
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showKorean}
                  aria-labelledby="show-korean-label"
                  onClick={() => onShowKorean(!showKorean)}
                  style={{
                    width: 50,
                    height: 30,
                    borderRadius: 999,
                    border: '2px solid #1A1310',
                    background: showKorean ? accentHex : '#E7D9CB',
                    position: 'relative',
                    transition: 'background .2s ease',
                    flex: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: showKorean ? 23 : 2,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: '#fff',
                      border: '1.5px solid #1A1310',
                      transition: 'left .2s ease',
                    }}
                  />
                </button>
              </div>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.confirm('Clear all ticked stops and todos for everyone on this trip?')) {
                    onReset();
                    setOpen(false);
                  }
                }}
                className="u-btn"
                style={{
                  width: '100%',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '2.5px solid #B5341F',
                  background: '#FFF0F0',
                  color: '#B5341F',
                  cursor: 'pointer',
                  marginBottom: 14,
                  transition: 'transform .14s ease',
                }}
              >
                Reset all ticks &amp; todos
              </button>

              <a
                href="/print"
                target="_blank"
                rel="noopener"
                className="u-btn"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '2.5px solid #1A1310',
                  background: '#fff',
                  color: '#1A1310',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  marginBottom: 14,
                  transition: 'transform .14s ease',
                }}
              >
                🖨 Print / Save as PDF
              </a>

              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: '#9A8C81' }}>
                This trip is shared — accent, ticked stops, todos and photos sync to{' '}
                <b style={{ color: '#6B5E54' }}>everyone</b> on the link, no login needed.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

const label: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  fontWeight: 700,
  color: '#9A8C81',
  letterSpacing: '.05em',
  marginBottom: 10,
};
