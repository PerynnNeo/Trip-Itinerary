'use client';

import { Icon } from '@/lib/icons';
import { money } from '@/lib/format';
import type { ActivityActual, Currency, Itinerary } from '@/lib/types';

interface BudgetViewProps {
  itinerary: Itinerary;
  currency: Currency;
  perPerson: boolean;
  accent: string;
  actuals: Record<string, ActivityActual>;
  onCurrency: (c: Currency) => void;
  onPerPerson: (v: boolean) => void;
}

function actualTotal(a: ActivityActual): number {
  return a.mode === 'all' ? a.all ?? 0 : (a.jolin ?? 0) + (a.perris ?? 0) + (a.perynn ?? 0);
}

export function BudgetView({ itinerary, currency, perPerson, accent, actuals, onCurrency, onPerPerson }: BudgetViewProps) {
  const { base, cats } = itinerary.budget;
  const maxCat = base.food;
  const grandLabel = (perPerson ? 'PER PERSON' : 'TOTAL FOR 3') + ' · EXCL. STAY & SHOPPING';

  const loggedEntries = Object.values(actuals).filter((a) => actualTotal(a) > 0);
  const spentSoFar = loggedEntries.reduce((sum, a) => sum + actualTotal(a), 0);

  const segStyle = (on: boolean) => ({
    fontWeight: 700,
    fontSize: 13.5,
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background .2s ease',
    background: on ? '#1A1310' : '#fff',
    color: on ? '#fff' : '#1A1310',
  });

  return (
    <section style={{ animation: 'fadeUp .45s ease both' }}>
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(30px,5vw,46px)',
          letterSpacing: '-.03em',
          margin: '0 0 4px',
        }}
      >
        Budget tracker <Icon name="wallet" color={accent} size={30} />
      </h1>
      <p style={{ margin: '0 0 20px', color: '#6B5E54', fontSize: 14.5, maxWidth: 560 }}>
        Estimates for all 3 travellers, excluding accommodation &amp; personal shopping. Toggle the view below.
      </p>

      {/* Toggles */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', border: '2.5px solid #1A1310', borderRadius: 999, overflow: 'hidden', background: '#fff' }}>
          <button onClick={() => onCurrency('SGD')} style={segStyle(currency === 'SGD')}>
            S$ SGD
          </button>
          <button onClick={() => onCurrency('KRW')} style={segStyle(currency === 'KRW')}>
            ₩ KRW
          </button>
        </div>
        <div style={{ display: 'inline-flex', border: '2.5px solid #1A1310', borderRadius: 999, overflow: 'hidden', background: '#fff' }}>
          <button onClick={() => onPerPerson(false)} style={segStyle(!perPerson)}>
            Total (3 pax)
          </button>
          <button onClick={() => onPerPerson(true)} style={segStyle(perPerson)}>
            Per person
          </button>
        </div>
      </div>

      {/* Grand total */}
      <div
        style={{
          background: 'linear-gradient(135deg,#FF2E88,#FF7A3C)',
          border: '3px solid #1A1310',
          borderRadius: 24,
          padding: 'clamp(22px,4vw,32px)',
          color: '#fff',
          boxShadow: '8px 8px 0 #1A1310',
          marginBottom: 24,
        }}
      >
        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: '.06em', opacity: 0.9 }}>{grandLabel}</div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(40px,9vw,72px)', lineHeight: 1, letterSpacing: '-.03em', marginTop: 6 }}>
          {money(base.grand, currency, perPerson)}
        </div>
        <div style={{ fontSize: 14, marginTop: 8, opacity: 0.92 }}>Transport + food + activities &amp; entries</div>
      </div>

      {/* Actually spent so far (logged on each activity) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          background: '#EFFBF4',
          border: '2.5px solid #1A1310',
          borderRadius: 18,
          padding: '15px 18px',
          boxShadow: '4px 4px 0 #1A1310',
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: '#0E9F6E', letterSpacing: '.05em' }}>
            ACTUALLY SPENT SO FAR
          </div>
          <div style={{ color: '#6B5E54', fontSize: 12.5, marginTop: 3 }}>
            {loggedEntries.length > 0
              ? `Logged on ${loggedEntries.length} stop${loggedEntries.length === 1 ? '' : 's'} — group total, real receipts`
              : 'Open any activity and tap “Actually spent” to log your real costs.'}
          </div>
        </div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(24px,6vw,34px)', color: '#0E9F6E', letterSpacing: '-.02em' }}>
          {money(spentSoFar, currency, false)}
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        {cats.map((c) => (
          <div
            key={c.name}
            className="u-card"
            style={{
              background: '#fff',
              border: '2.5px solid #1A1310',
              borderRadius: 18,
              padding: '16px 18px',
              boxShadow: '4px 4px 0 #1A1310',
              transition: 'transform .14s ease, box-shadow .14s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16 }}>
                <Icon name={c.icon} color={c.color} size={18} />
                {c.name}
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 17, color: c.color }}>
                {money(c.krw, currency, perPerson)}
              </span>
            </div>
            <div style={{ height: 13, borderRadius: 999, background: '#F2E8DC', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: c.color,
                  transformOrigin: 'left',
                  animation: 'growBar .7s cubic-bezier(.2,.8,.2,1) both',
                  width: `${Math.round((c.krw / maxCat) * 100)}%`,
                }}
              />
            </div>
            <div style={{ color: '#9A8C81', fontSize: 12.5, marginTop: 7 }}>{c.note}</div>
          </div>
        ))}
      </div>

      {/* Shopping + accommodation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
        <div className="u-card" style={{ background: '#FFF7E8', border: '2.5px solid #1A1310', borderRadius: 18, padding: 17, boxShadow: '4px 4px 0 #1A1310', transition: 'transform .14s ease, box-shadow .14s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <Icon name="shopping" color="#C28A00" size={19} />
            Shopping (variable)
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 20, marginTop: 8, color: '#C28A00' }}>
            {money(base.shopLow, currency, perPerson)} – {money(base.shopHigh, currency, perPerson)}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6B5E54', lineHeight: 1.5 }}>
            Olive Young, BAPE, Brandy Melville, Subdued, Garosu-gil and the big one — Hyundai Premium Outlet (Days 6–7).
          </p>
        </div>
        <div className="u-card" style={{ background: '#EAF2FF', border: '2.5px solid #1A1310', borderRadius: 18, padding: 17, boxShadow: '4px 4px 0 #1A1310', transition: 'transform .14s ease, box-shadow .14s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <Icon name="hotel" color="#3B82F6" size={19} />
            Accommodation
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#3A322C', lineHeight: 1.55 }}>
            Not included above — verify rates directly with each hotel.
            <br />
            <b>New Seoul Hotel Myeongdong</b> · 5 nights
            <br />
            <b>Orakai Songdo Park Hotel</b> · 2 nights
          </p>
        </div>
      </div>
    </section>
  );
}
