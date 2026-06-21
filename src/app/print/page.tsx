import type { Metadata } from 'next';
import { EMBASSY, EMERGENCY, HOTELS } from '@/lib/essentials';
import { money } from '@/lib/format';
import { getItinerary } from '@/lib/itinerary';
import type { Activity, Day } from '@/lib/types';
import { PrintButton } from './PrintButton';

export const metadata: Metadata = { title: 'Seoul × Incheon · Printable Itinerary' };

// ---------------------------------------------------------------------------
// 30-minute timeline grid
// ---------------------------------------------------------------------------

function parseRange(t: string): { start: number; end: number } | null {
  const m = String(t).match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (m) return { start: +m[1] * 60 + +m[2], end: +m[3] * 60 + +m[4] };
  const single = String(t).match(/^\s*(\d{1,2}):(\d{2})/);
  if (single) {
    const s = +single[1] * 60 + +single[2];
    return { start: s, end: s };
  }
  return null;
}

function hhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Strip decorative symbols from itinerary text so the printout stays clean. */
function clean(s: string): string {
  return s.replace(/[★✓✦◆➜→]/g, '').replace(/\s{2,}/g, ' ').trim();
}

interface Block {
  startIdx: number;
  span: number;
  actIdx: number; // -1 = free / transit
}

function buildTimeline(acts: Activity[]): { slots: number[]; blocks: Block[] } {
  const ranges = acts.map((a) => parseRange(a.t));
  const valid = ranges.map((r, i) => ({ r, i })).filter((x) => x.r) as { r: { start: number; end: number }; i: number }[];
  if (!valid.length) return { slots: [], blocks: [] };

  const minStart = Math.min(...valid.map((v) => v.r.start));
  const maxEnd = Math.max(...valid.map((v) => Math.max(v.r.end, v.r.start + 1)));
  const gridStart = Math.floor(minStart / 30) * 30;
  const gridEnd = Math.ceil(maxEnd / 30) * 30;

  const slots: number[] = [];
  for (let m = gridStart; m < gridEnd; m += 30) slots.push(m);

  // Each slot belongs to the latest activity (in order) whose range overlaps it.
  const slotAct = slots.map((slotStart) => {
    const slotEnd = slotStart + 30;
    let chosen = -1;
    for (const { r, i } of valid) {
      const aEnd = r.end > r.start ? r.end : r.start + 1;
      if (r.start < slotEnd && aEnd > slotStart) chosen = i;
    }
    return chosen;
  });

  const blocks: Block[] = [];
  let i = 0;
  while (i < slots.length) {
    const cur = slotAct[i];
    let j = i;
    while (j < slots.length && slotAct[j] === cur) j++;
    blocks.push({ startIdx: i, span: j - i, actIdx: cur });
    i = j;
  }
  return { slots, blocks };
}

// ---------------------------------------------------------------------------
// Styles (inline + print rules)
// ---------------------------------------------------------------------------

const PRINT_CSS = `
  .pw { max-width: 860px; margin: 0 auto; padding: 28px 24px 64px; color: #1a1310;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pw h1 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; letter-spacing: -.02em; }
  .mono { font-family: 'Space Mono', monospace; }
  .day { margin-bottom: 30px; }
  .day-head { border-bottom: 2.5px solid #1a1310; padding-bottom: 7px; margin-bottom: 10px; }
  table.tl { width: 100%; border-collapse: collapse; }
  table.tl th { text-align: left; font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700;
    letter-spacing: .06em; color: #888; padding: 4px 8px; border-bottom: 1.5px solid #1a1310; }
  table.tl td { border-bottom: 1px solid #e7ddcf; vertical-align: top; padding: 7px 8px; }
  td.tl-time { width: 56px; white-space: nowrap; font-family: 'Space Mono', monospace; font-size: 11px;
    color: #9a8c81; text-align: right; border-right: 1px solid #e7ddcf; }
  td.tl-gap { color: #b7a99c; font-style: italic; font-size: 12px; }
  .a-row { break-inside: avoid; }
  @media print {
    .no-print { display: none !important; }
    .pw { max-width: none; padding: 0 8px; }
    .day { break-before: page; }
    .day:first-of-type { break-before: avoid; }
    table.tl td, table.tl th { border-color: #999; }
    body { background: #fff; }
  }
`;

export default function PrintPage() {
  const it = getItinerary();
  const { meta, days, budget } = it;

  return (
    <div className="pw">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <a href="/" style={{ fontWeight: 700, fontSize: 13, textDecoration: 'none', color: '#6B5E54' }}>← Back to app</a>
        <PrintButton />
      </div>

      <h1 style={{ fontSize: 34, margin: '0 0 2px' }}>{meta.title}</h1>
      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', marginBottom: 6 }}>{meta.dateRange}</div>
      <p style={{ margin: '0 0 26px', color: '#444', fontSize: 13.5, lineHeight: 1.5, maxWidth: 620 }}>{meta.subtitle}</p>

      {days.map((d) => (
        <DayTable key={d.day} day={d} typeColor={it.typeColor} />
      ))}

      {/* Budget */}
      <div className="day">
        <div className="day-head">
          <h1 style={{ fontSize: 20, margin: 0 }}>Budget</h1>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Total for {meta.pax}, excluding accommodation &amp; personal shopping.</div>
        </div>
        <table className="tl">
          <tbody>
            {budget.cats.map((c) => (
              <tr key={c.name}>
                <td style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</td>
                <td className="mono" style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, width: 200 }}>
                  {money(c.krw, 'SGD', false)} · {money(c.krw, 'KRW', false)}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ fontWeight: 800, fontSize: 14, borderTop: '2px solid #1a1310' }}>Total</td>
              <td className="mono" style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, borderTop: '2px solid #1a1310' }}>
                {money(budget.base.grand, 'SGD', false)} · {money(budget.base.grand, 'KRW', false)}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
          Shopping (variable): {money(budget.base.shopLow, 'SGD', false)} – {money(budget.base.shopHigh, 'SGD', false)}
        </div>
      </div>

      {/* Essentials */}
      <div className="day">
        <div className="day-head">
          <h1 style={{ fontSize: 20, margin: 0 }}>Essentials</h1>
        </div>
        <table className="tl">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Number</th>
              <th>Emergency</th>
            </tr>
          </thead>
          <tbody>
            {EMERGENCY.map((e) => (
              <tr key={e.number}>
                <td className="mono" style={{ fontWeight: 800, fontSize: 14 }}>{e.number}</td>
                <td style={{ fontSize: 13 }}>
                  <b>{e.label}</b> — {e.sub}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="tl" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th style={{ width: 200 }}>Hotel</th>
              <th>Address (show a driver)</th>
            </tr>
          </thead>
          <tbody>
            {HOTELS.map((h) => (
              <tr key={h.name}>
                <td style={{ fontSize: 13 }}>
                  <b>{h.name}</b>
                  <div style={{ color: '#888', fontSize: 11 }}>{h.nights}</div>
                </td>
                <td style={{ fontSize: 13 }}>
                  <span lang="ko" style={{ fontWeight: 700 }}>{h.korean}</span>
                  <div style={{ color: '#666', fontSize: 11.5 }}>{h.address}</div>
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ fontSize: 13 }}>
                <b>Singapore Embassy</b>
                <div style={{ color: '#888', fontSize: 11 }}>{EMBASSY.phone}</div>
              </td>
              <td style={{ fontSize: 13 }}>
                <span lang="ko" style={{ fontWeight: 700 }}>{EMBASSY.korean}</span>
                <div style={{ color: '#666', fontSize: 11.5 }}>{EMBASSY.address}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="no-print" style={{ textAlign: 'center', marginTop: 24 }}>
        <PrintButton />
      </div>
    </div>
  );
}

function DayTable({ day, typeColor }: { day: Day; typeColor: Record<string, string> }) {
  const { slots, blocks } = buildTimeline(day.acts);

  return (
    <div className="day">
      <div className="day-head">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: day.color }}>Day {day.day}</span>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: '#888' }}>{day.weekday} · {day.date}</span>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: '#555', marginLeft: 'auto' }}>{day.spend}</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{clean(day.theme)}</div>
        <div style={{ fontSize: 12, color: '#555', marginTop: 1 }}>Stay: {day.hotel}</div>
        {day.note && <div style={{ fontSize: 11.5, color: '#B5341F', marginTop: 4, fontWeight: 600 }}>Note: {clean(day.note)}</div>}
      </div>

      <table className="tl">
        <thead>
          <tr>
            <th style={{ textAlign: 'right' }}>Time</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) =>
            Array.from({ length: block.span }).map((_, k) => {
              const slotMin = slots[block.startIdx + k];
              const first = k === 0;
              return (
                <tr key={`${block.startIdx}-${k}`} className={first ? 'a-row' : undefined}>
                  <td className="tl-time">{hhmm(slotMin)}</td>
                  {first &&
                    (block.actIdx >= 0 ? (
                      <td rowSpan={block.span}>
                        <ActivityCell a={day.acts[block.actIdx]} color={typeColor[day.acts[block.actIdx].ty] ?? '#555'} />
                      </td>
                    ) : (
                      <td rowSpan={block.span} className="tl-gap">
                        Free time / transit
                      </td>
                    ))}
                </tr>
              );
            }),
          )}
        </tbody>
      </table>
    </div>
  );
}

function ActivityCell({ a, color }: { a: Activity; color: string }) {
  const logistics = [a.ad ? `Where: ${a.ad}` : '', a.ho ? `Hours: ${a.ho}` : '', a.pp ? `Cost: ${a.pp}${a.to ? ` (${a.to})` : ''}` : '']
    .filter(Boolean)
    .join('  ·  ');
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 800, fontSize: 13.5 }}>{clean(a.ti)}</span>
        {a.kr && <span className="mono" style={{ fontSize: 10.5, color: '#999' }}>{a.kr}</span>}
        <span className="mono" style={{ fontSize: 9.5, fontWeight: 700, color, letterSpacing: '.05em' }}>{a.ty}</span>
        <span className="mono" style={{ fontSize: 10.5, color: '#777', marginLeft: 'auto' }}>{a.t}</span>
      </div>
      {a.su && <div style={{ fontSize: 12, color: '#3a322c', marginTop: 2, lineHeight: 1.4 }}>{clean(a.su)}</div>}
      {logistics && <div style={{ fontSize: 10.5, color: '#777', marginTop: 3, lineHeight: 1.4 }}>{logistics}</div>}
      {a.ip && <div style={{ fontSize: 10.5, color: '#6D3FD1', marginTop: 2, lineHeight: 1.4 }}>Tip: {clean(a.ip)}</div>}
    </div>
  );
}
