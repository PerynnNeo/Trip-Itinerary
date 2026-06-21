'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { PEOPLE } from '@/lib/people';
import { usePerson } from './PersonProvider';

/**
 * First-run prompt: when a device has no stored identity, ask who's using it.
 * Tapping a traveller sets the per-device identity (highlights their photo slot
 * and spend column everywhere). Re-openable later from Settings.
 */
export function WelcomeModal() {
  const { showWelcome, setPerson, dismissWelcome } = usePerson();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!showWelcome) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showWelcome]);

  if (!mounted || !showWelcome || pathname?.startsWith('/print')) return null;

  return createPortal(
    <div className="welcome-backdrop" role="dialog" aria-modal="true" aria-label="Who is using this device?">
      <div className="welcome-panel">
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div
            style={{
              display: 'inline-block',
              background: '#FFE14D',
              border: '2px solid #1A1310',
              borderRadius: 999,
              padding: '4px 13px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            SEOUL × INCHEON
          </div>
          <h2
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(24px,6vw,30px)',
              letterSpacing: '-.02em',
              lineHeight: 1.05,
              margin: '0 0 8px',
            }}
          >
            Who&apos;s on this device?
          </h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#6B5E54' }}>
            Tap your name so your photos &amp; spend are labelled as you. You can change this anytime in Settings.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {PEOPLE.map((p) => (
            <button
              key={p.key}
              onClick={() => setPerson(p.key)}
              className="welcome-option"
              style={{ background: p.bg, '--ring': p.color } as CSSProperties}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: p.color,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 17,
                  flex: 'none',
                  border: '2px solid #1A1310',
                }}
              >
                {p.name[0]}
              </span>
              <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 16 }}>{p.name}</span>
                <span style={{ display: 'block', fontSize: 13, color: '#6B5E54', fontWeight: 500 }}>{p.role}</span>
              </span>
              <span style={{ flex: 'none', color: p.color, fontWeight: 800, fontSize: 20, lineHeight: 1 }}>→</span>
            </button>
          ))}
        </div>

        <button
          onClick={dismissWelcome}
          style={{
            display: 'block',
            margin: '16px auto 0',
            background: 'none',
            border: 'none',
            color: '#9A8C81',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          I&apos;m just browsing
        </button>
      </div>
    </div>,
    document.body,
  );
}
