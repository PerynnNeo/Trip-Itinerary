'use client';

import { money } from '@/lib/format';
import { PEOPLE } from '@/lib/people';
import type { ActivityActual, Currency, SpendMode } from '@/lib/types';
import { usePerson } from './PersonProvider';

interface ActualSpendProps {
  currency: Currency;
  actual: ActivityActual | undefined;
  onChange: (actual: ActivityActual | null) => void;
}

const ACCENT = '#0E9F6E';

/** Per-activity "what we actually spent": one combined bill, or split per person. */
export function ActualSpend({ currency, actual, onChange }: ActualSpendProps) {
  const { person } = usePerson();
  const a: ActivityActual = actual ?? { mode: 'all' };
  const mode = a.mode;

  const total =
    mode === 'all' ? a.all ?? 0 : (a.jolin ?? 0) + (a.perris ?? 0) + (a.perynn ?? 0);
  const hasAny = mode === 'all' ? a.all != null : a.jolin != null || a.perris != null || a.perynn != null;

  const setField = (field: 'all' | 'jolin' | 'perris' | 'perynn', raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    const next: ActivityActual = { ...a, mode };
    if (cleaned === '') delete next[field];
    else next[field] = Math.min(100_000_000, Number(cleaned));
    const stillHas = next.all != null || next.jolin != null || next.perris != null || next.perynn != null;
    onChange(stillHas ? next : mode === 'all' ? null : next);
  };

  const setMode = (m: SpendMode) => onChange({ ...a, mode: m });

  const seg = (on: boolean) => ({
    fontSize: 12,
    fontWeight: 700 as const,
    padding: '5px 11px',
    border: 'none',
    cursor: 'pointer',
    background: on ? ACCENT : '#fff',
    color: on ? '#fff' : '#1A1310',
  });

  return (
    <div style={{ background: '#EFFBF4', border: '2px solid #BFE9D4', borderRadius: 13, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, color: ACCENT, letterSpacing: '.04em' }}>
          <Coin />
          ACTUALLY SPENT
        </div>
        <div style={{ display: 'inline-flex', border: `2px solid ${ACCENT}`, borderRadius: 999, overflow: 'hidden' }}>
          <button type="button" onClick={() => setMode('all')} aria-pressed={mode === 'all'} style={seg(mode === 'all')}>
            One bill
          </button>
          <button type="button" onClick={() => setMode('each')} aria-pressed={mode === 'each'} style={seg(mode === 'each')}>
            Each
          </button>
        </div>
      </div>

      {mode === 'all' ? (
        <AmountInput label="Total paid" value={a.all} onChange={(v) => setField('all', v)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PEOPLE.map((p) => (
            <AmountInput
              key={p.key}
              label={p.name}
              labelColor={p.color}
              you={person === p.key}
              value={a[p.key]}
              onChange={(v) => setField(p.key, v)}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#6B5E54', fontWeight: 600 }}>
          {mode === 'each' ? 'Group total' : 'Logged'}
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 15, color: hasAny ? ACCENT : '#B7A99C' }}>
          {hasAny ? money(total, currency, false) : '—'}
        </span>
      </div>
    </div>
  );
}

function AmountInput({
  label,
  labelColor = '#1A1310',
  you = false,
  value,
  onChange,
}: {
  label: string;
  labelColor?: string;
  you?: boolean;
  value: number | undefined;
  onChange: (raw: string) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', minWidth: 0 }}>
      <span style={{ flex: '0 0 72px', fontSize: 13, fontWeight: 700, color: labelColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
        {you && <span style={{ color: '#9A8C81', fontWeight: 500 }}> ·you</span>}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: '#fff',
          border: `2px solid ${you ? labelColor : '#1A1310'}`,
          borderRadius: 10,
          padding: '6px 10px',
        }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#9A8C81', fontSize: 13 }}>₩</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            fontSize: 14,
            color: '#1A1310',
          }}
        />
      </span>
    </label>
  );
}

function Coin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h3.5a1.8 1.8 0 0 1 0 3.6H9.5h3.8a1.8 1.8 0 0 1 0 3.6H9.5" />
    </svg>
  );
}
