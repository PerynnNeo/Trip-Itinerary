'use client';

import type { AccentName, Itinerary, ViewKey } from '@/lib/types';
import { Settings } from './Settings';

interface HeaderProps {
  itinerary: Itinerary;
  view: ViewKey;
  accent: string;
  accentName: AccentName;
  showKorean: boolean;
  /** Current trip day (1..N) when the trip is underway, else null. */
  todayDay: number | null;
  onView: (v: ViewKey) => void;
  onAccent: (a: AccentName) => void;
  onShowKorean: (v: boolean) => void;
  onReset: () => void;
}

export function Header({ itinerary, view, accent, accentName, showKorean, todayDay, onView, onAccent, onShowKorean, onReset }: HeaderProps) {
  const navItems: { key: ViewKey; label: string }[] = [
    { key: 'trip', label: 'Trip' },
    ...itinerary.days.map((d) => ({ key: d.day as ViewKey, label: String(d.day) })),
    { key: 'budget', label: 'Budget' },
  ];

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button type="button" onClick={() => onView('trip')} aria-label="Go to trip overview" className="app-logo">
          <span style={{ color: accent }}>SEOUL</span>
          <span style={{ color: '#1A1310', margin: '0 4px' }} aria-hidden="true">×</span>
          <span style={{ color: '#1A1310' }}>INCHEON</span>
        </button>

        <div className="app-header-actions">
          <nav className="app-nav" aria-label="Sections">
            {todayDay !== null && (
              <button
                onClick={() => onView(todayDay)}
                aria-current={view === todayDay ? 'page' : undefined}
                aria-label={`Jump to today — day ${todayDay}`}
                className="u-nav app-nav-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 13.5,
                  padding: '8px 13px',
                  borderRadius: 999,
                  border: `2px solid ${accent}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'transform .16s ease',
                  background: view === todayDay ? accent : '#FFF6EC',
                  color: view === todayDay ? '#fff' : accent,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 999, background: view === todayDay ? '#fff' : accent }} />
                Today
              </button>
            )}
            {navItems.map((n) => {
              const active = String(view) === String(n.key);
              return (
                <button
                  key={String(n.key)}
                  onClick={() => onView(n.key)}
                  aria-current={active ? 'page' : undefined}
                  className="u-nav app-nav-pill"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 13.5,
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: '2px solid #1A1310',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'transform .16s ease, background .16s ease',
                    background: active ? accent : '#ffffff',
                    color: active ? '#ffffff' : '#1A1310',
                  }}
                >
                  {n.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => onView('info')}
            aria-label="Essentials & emergency info"
            aria-current={view === 'info' ? 'page' : undefined}
            title="Essentials & emergency info"
            className="u-nav"
            style={{
              width: 40,
              height: 40,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 999,
              border: '2px solid #1A1310',
              background: view === 'info' ? '#B5341F' : '#fff',
              color: view === 'info' ? '#fff' : '#B5341F',
              cursor: 'pointer',
              flex: 'none',
              transition: 'transform .16s ease, background .16s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </button>

          <Settings
            accent={accentName}
            showKorean={showKorean}
            onAccent={onAccent}
            onShowKorean={onShowKorean}
            onReset={onReset}
          />
        </div>
      </div>
    </header>
  );
}
