// Trip-date helpers. All "today" logic assumes the device is on Seoul time while
// on the trip (which it will be), so plain local-Date math is correct.

function isoToLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function fmtISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const DAY_MS = 86_400_000;

export function tripDayCount(startISO: string, endISO: string): number {
  return Math.round((isoToLocal(endISO).getTime() - isoToLocal(startISO).getTime()) / DAY_MS) + 1;
}

/** Current trip day number (1..N) if `now` is within the trip, else null. */
export function currentTripDay(startISO: string, endISO: string, now: Date): number | null {
  const diff = Math.round((startOfDay(now).getTime() - isoToLocal(startISO).getTime()) / DAY_MS);
  if (diff < 0 || diff >= tripDayCount(startISO, endISO)) return null;
  return diff + 1;
}

/** Whole days until the trip starts (0 once it has begun). */
export function daysUntilTrip(startISO: string, now: Date): number {
  return Math.max(0, Math.round((isoToLocal(startISO).getTime() - startOfDay(now).getTime()) / DAY_MS));
}

/** ISO date (yyyy-mm-dd) of a given trip day number. */
export function dayDateISO(startISO: string, dayNum: number): string {
  const d = isoToLocal(startISO);
  d.setDate(d.getDate() + (dayNum - 1));
  return fmtISO(d);
}

/** Index of the activity whose time range contains `now` (-1 if none). */
export function currentActivityIndex(acts: { t: string }[], now: Date): number {
  const mins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < acts.length; i++) {
    const m = String(acts[i].t).match(/(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})/);
    if (!m) continue;
    const start = +m[1] * 60 + +m[2];
    const end = +m[3] * 60 + +m[4];
    if (mins >= start && mins < end) return i;
  }
  return -1;
}
