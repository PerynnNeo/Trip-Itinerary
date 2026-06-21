import type { Currency } from './types';

/** 1 SGD ≈ 1,100 KRW (matches the original itinerary's headline rate). */
export const CURRENCY_RATE = 1100;

/**
 * Format a KRW amount in the chosen currency and scope.
 * Mirrors the original: SGD rounds to whole dollars; KRW rounds to the nearest ₩100.
 */
export function money(
  krw: number | null | undefined,
  currency: Currency,
  perPerson: boolean,
): string {
  if (krw == null) return '';
  const div = perPerson ? 3 : 1;
  let v = currency === 'SGD' ? krw / CURRENCY_RATE : krw;
  v = v / div;
  if (currency === 'SGD') return 'S$' + Math.round(v).toLocaleString('en-US');
  return '₩' + (Math.round(v / 100) * 100).toLocaleString('en-US');
}

/** Derive a human duration ("2h 30m") from a "HH:MM – HH:MM" time range. */
export function duration(t: string): string {
  const m = String(t).match(/(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})/);
  if (!m) return '';
  const d = +m[3] * 60 + +m[4] - (+m[1] * 60 + +m[2]);
  if (d <= 0) return '';
  const h = Math.floor(d / 60);
  const mm = d % 60;
  return (h ? h + 'h' : '') + (mm ? (h ? ' ' : '') + mm + 'm' : '');
}

/** The leading time of a range, e.g. "10:30 – 12:00" -> "10:30". */
export function startTime(t: string): string {
  return (t.split('–')[0] || t).trim();
}

/** Maps search URLs for an activity (Google + Naver), Seoul-scoped. */
export function mapLinks(kr: string, ti: string) {
  const q = encodeURIComponent((kr || ti) + ' Seoul');
  return {
    gmaps: `https://www.google.com/maps/search/?api=1&query=${q}`,
    nmaps: `https://map.naver.com/p/search/${q}`,
  };
}
