'use client';

import { Icon } from '@/lib/icons';
import { duration, mapLinks, startTime } from '@/lib/format';
import type { Activity, ActivityActual, Currency, Itinerary } from '@/lib/types';
import { ActualSpend } from './ActualSpend';
import { PhotoTrio } from './PhotoTrio';

interface ActivityCardProps {
  act: Activity;
  id: string;
  index: number;
  itinerary: Itinerary;
  showKorean: boolean;
  expanded: boolean;
  checked: boolean;
  currency: Currency;
  actual: ActivityActual | undefined;
  /** True when this activity's time window contains "now" on today's day. */
  isNow?: boolean;
  onToggle: () => void;
  onCheck: () => void;
  onSetActual: (actual: ActivityActual | null) => void;
}

export function ActivityCard({
  act,
  id,
  index,
  itinerary,
  showKorean,
  expanded,
  checked,
  currency,
  actual,
  isNow = false,
  onToggle,
  onCheck,
  onSetActual,
}: ActivityCardProps) {
  const color = itinerary.typeColor[act.ty] ?? '#1A1310';
  const iconName = itinerary.typeIcon[act.ty] ?? 'activity';
  const tint = itinerary.typeTint[act.ty] ?? '#F2E8DC';
  const highlights = itinerary.highlights[id] ?? [];
  const dur = duration(act.t);
  const delay = `${index * 70}ms`;
  const { gmaps, nmaps } = mapLinks(act.kr, act.ti);
  const kr = showKorean ? act.kr : '';

  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      {/* time gutter */}
      <div style={{ width: 50, flex: 'none', textAlign: 'right', paddingTop: 17 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', color: '#7A6E64' }}>
          {startTime(act.t)}
        </span>
      </div>

      {/* timeline rail + dot */}
      <div style={{ width: 28, flex: 'none', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 4, bottom: -18, width: 3, background: '#E7D9CB' }} />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 15,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2.5px solid #1A1310',
            background: color,
            zIndex: 2,
            display: 'grid',
            placeItems: 'center',
            transform: 'translateX(-50%)',
            animation: 'pop .5s ease both',
            animationDelay: delay,
          }}
        >
          <Icon name={iconName} color="#fff" size={12} stroke={2.4} />
        </div>
      </div>

      {/* card */}
      <div
        className="u-act"
        style={{
          flex: 1,
          minWidth: 0,
          marginLeft: 12,
          marginBottom: 18,
          border: isNow ? `2.5px solid ${color}` : '2.5px solid #1A1310',
          borderRadius: 20,
          background: '#fff',
          boxShadow: isNow ? `0 0 0 3px ${color}55, 4px 4px 0 ${color}` : '4px 4px 0 #1A1310',
          overflow: 'hidden',
          transition: 'transform .14s ease, box-shadow .14s ease',
          animation: 'fadeUp .5s ease both',
          animationDelay: delay,
        }}
      >
        {isNow && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: color,
              color: '#fff',
              fontFamily: "'Space Mono', monospace",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '.08em',
              padding: '4px 14px',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 999, background: '#fff', animation: 'pulse 1.6s ease-in-out infinite' }} />
            HAPPENING NOW
          </div>
        )}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-label={`${act.ti} — ${expanded ? 'collapse' : 'expand'} details`}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle();
            }
          }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 15, cursor: 'pointer' }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 7 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: tint,
                  color,
                  border: `1.5px solid ${color}`,
                }}
              >
                <Icon name={iconName} color={color} size={13} />
                {act.ty}
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: '#9A8C81' }}>{act.t}</span>
              {dur && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#9A8C81',
                    background: '#F2E8DC',
                    borderRadius: 999,
                    padding: '2px 8px',
                  }}
                >
                  <Icon name="clock" color="#9A8C81" size={12} />
                  {dur}
                </span>
              )}
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 19, lineHeight: 1.15, letterSpacing: '-.01em', textWrap: 'pretty' }}>
              {act.ti}
            </div>
            {kr && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#B7A99C', marginTop: 2 }}>{kr}</div>}
            <div style={{ color: '#6B5E54', fontSize: 14, lineHeight: 1.45, marginTop: 7, textWrap: 'pretty' }}>{act.su}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, flex: 'none' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCheck();
              }}
              title="Tick off"
              aria-label={checked ? `Mark "${act.ti}" not done` : `Mark "${act.ti}" done`}
              aria-pressed={checked}
              className="u-check"
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                border: '2.5px solid #1A1310',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                background: checked ? '#12B886' : '#fff',
                transition: 'transform .12s ease, background .2s ease',
              }}
            >
              {checked && <Icon name="check" color="#fff" size={17} stroke={2.6} />}
            </button>
            <span style={{ display: 'inline-flex', color: '#9A8C81', transition: 'transform .25s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <Icon name="chevron" color="#9A8C81" size={20} />
            </span>
          </div>
        </div>

        {expanded && (
          <div style={{ borderTop: '2px dashed #E7D9CB', padding: '16px 15px 18px', animation: 'slideDown .32s ease both' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: '#9A8C81', letterSpacing: '.04em', marginBottom: 9 }}>
              PHOTOS · ONE EACH
            </div>
            <div style={{ marginBottom: 16 }}>
              <PhotoTrio base={`${id}-img`} context={act.ti} height={110} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 14 }}>
              {act.ad && (
                <MiniCard accent="#B07A3C" border="#EADBCB" bg="#FBF6EF" label="ADDRESS" icon="pin">
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>{act.ad}</div>
                </MiniCard>
              )}
              {act.ho && (
                <MiniCard accent="#2C8C6A" border="#EADBCB" bg="#FBF6EF" label="HOURS" icon="clock">
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>{act.ho}</div>
                </MiniCard>
              )}
              {act.pp && (
                <MiniCard accent="#C28A00" border="#F0D89A" bg="#FFF7E8" label="COST" icon="wallet">
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, lineHeight: 1.45 }}>
                    {act.pp}
                    {act.to && <span style={{ display: 'block', fontWeight: 500, color: '#9A7B2E', fontSize: 12 }}>{act.to}</span>}
                  </div>
                </MiniCard>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <ActualSpend currency={currency} actual={actual} onChange={onSetActual} />
            </div>

            <div style={{ marginBottom: 13 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: '#1A1310', letterSpacing: '.04em', marginBottom: 5 }}>
                WHAT TO DO
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#3A322C', textWrap: 'pretty' }}>{act.wh}</p>
            </div>

            {highlights.length > 0 && (
              <div style={{ background: '#FBF6EF', border: '2px solid #EADBCB', borderRadius: 13, padding: '12px 14px', marginBottom: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, color: '#1A1310', letterSpacing: '.04em', marginBottom: 6 }}>
                  <span style={{ width: 14, height: 3, borderRadius: 2, background: color }} />
                  DON&apos;T MISS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '0 16px' }}>
                  {highlights.map((h, hi) => (
                    <div key={hi} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '4px 0' }}>
                      <span style={{ flex: 'none', width: 7, height: 7, borderRadius: '50%', background: color, marginTop: 6 }} />
                      <span style={{ fontSize: 13, lineHeight: 1.4, color: '#3A322C' }}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {act.ip && (
              <div style={{ background: '#F3EEFF', border: '2px solid #C9B8F2', borderRadius: 13, padding: '11px 14px', marginBottom: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, color: '#6D3FD1', letterSpacing: '.04em' }}>
                  <Icon name="bulb" color="#6D3FD1" size={13} />
                  INSIDER TIP
                </div>
                <p style={{ margin: '5px 0 0', fontSize: 13.5, lineHeight: 1.5, color: '#3A322C', textWrap: 'pretty' }}>{act.ip}</p>
              </div>
            )}

            {(act.ad || act.book) && (
              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 13 }}>
                {act.ad && (
                  <>
                    <a href={gmaps} target="_blank" rel="noopener noreferrer" className="u-mapg" style={mapBtn('#1A1310')}>
                      <Icon name="pin" color="currentColor" size={14} />
                      Google Maps
                    </a>
                    <a href={nmaps} target="_blank" rel="noopener noreferrer" className="u-mapn" style={mapBtn('#03C75A')}>
                      <Icon name="pin" color="currentColor" size={14} />
                      Naver Maps
                    </a>
                  </>
                )}
                {act.book && (
                  <a href={act.book.url} target="_blank" rel="noopener noreferrer" className="u-book" style={mapBtn('#FF2E88')}>
                    <Icon name="camera" color="currentColor" size={14} />
                    {act.book.label}
                  </a>
                )}
              </div>
            )}

            {act.on && (
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: '#6B5E54' }}>
                <span style={{ display: 'inline-flex', flex: 'none', marginTop: 1 }}>
                  <Icon name="arrow" color={color} size={16} />
                </span>
                <span style={{ lineHeight: 1.45 }}>
                  <b style={{ color: '#1A1310' }}>Onward:</b> {act.on}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({
  accent,
  border,
  bg,
  label,
  icon,
  children,
}: {
  accent: string;
  border: string;
  bg: string;
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="u-mini" style={{ background: bg, border: `2px solid ${border}`, borderRadius: 13, padding: '11px 13px', transition: 'transform .12s ease, box-shadow .12s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, color: accent, letterSpacing: '.04em' }}>
        <Icon name={icon} color={accent} size={13} />
        {label}
      </div>
      {children}
    </div>
  );
}

function mapBtn(color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 12.5,
    color,
    background: '#fff',
    border: `2px solid ${color}`,
    borderRadius: 999,
    padding: '6px 13px',
    transition: 'transform .12s ease, background .15s ease, color .15s ease',
  };
}
