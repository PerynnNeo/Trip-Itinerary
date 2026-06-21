import { ACCENT_MAP } from './itinerary';
import type { AccentName, ActivityActual, Currency, TripState, ViewKey } from './types';

const CURRENCIES: Currency[] = ['SGD', 'KRW'];
const ACCENTS = Object.keys(ACCENT_MAP) as AccentName[];

/** Max number of keys we'll accept in each map (guards against blob abuse). */
const MAX_MAP_KEYS = 500;
/** Sane upper bound for a single logged spend (₩100,000,000). */
const MAX_AMOUNT = 100_000_000;

function cleanBoolMap(input: unknown): Record<string, boolean> | undefined {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return undefined;
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length > MAX_MAP_KEYS) return undefined;
  const out: Record<string, boolean> = {};
  for (const [k, v] of entries) {
    if (typeof k !== 'string' || k.length > 64) continue;
    if (typeof v === 'boolean') out[k] = v;
  }
  return out;
}

function cleanView(input: unknown): ViewKey | undefined {
  if (input === 'trip' || input === 'budget' || input === 'info' || input === 'prep' || input === 'pack') return input;
  if (typeof input === 'number' && Number.isInteger(input) && input >= 1 && input <= 8) return input;
  return undefined;
}

function cleanAmount(v: unknown): number | undefined {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > MAX_AMOUNT) return undefined;
  return Math.round(v);
}

function cleanActuals(input: unknown): Record<string, ActivityActual> | undefined {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return undefined;
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length > MAX_MAP_KEYS) return undefined;
  const out: Record<string, ActivityActual> = {};
  for (const [k, v] of entries) {
    if (typeof k !== 'string' || k.length > 64) continue;
    if (typeof v !== 'object' || v === null) continue;
    const raw = v as Record<string, unknown>;
    const entry: ActivityActual = { mode: raw.mode === 'each' ? 'each' : 'all' };
    const all = cleanAmount(raw.all);
    const jolin = cleanAmount(raw.jolin);
    const perris = cleanAmount(raw.perris);
    const perynn = cleanAmount(raw.perynn);
    if (all !== undefined) entry.all = all;
    if (jolin !== undefined) entry.jolin = jolin;
    if (perris !== undefined) entry.perris = perris;
    if (perynn !== undefined) entry.perynn = perynn;
    out[k] = entry;
  }
  return out;
}

/**
 * Strict, allowlist-based sanitiser for an incoming state patch. Only known keys
 * with valid shapes/values survive; everything else (unknown keys, bad enums,
 * oversized maps) is dropped. Returns the set of accepted fields only.
 */
export function sanitizeStatePatch(input: unknown): Partial<TripState> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return {};
  const src = input as Record<string, unknown>;
  const out: Partial<TripState> = {};

  const view = cleanView(src.view);
  if (view !== undefined) out.view = view;

  const expanded = cleanBoolMap(src.expanded);
  if (expanded) out.expanded = expanded;
  const checked = cleanBoolMap(src.checked);
  if (checked) out.checked = checked;
  const todos = cleanBoolMap(src.todos);
  if (todos) out.todos = todos;
  const actuals = cleanActuals(src.actuals);
  if (actuals) out.actuals = actuals;

  if (CURRENCIES.includes(src.currency as Currency)) out.currency = src.currency as Currency;
  if (ACCENTS.includes(src.accent as AccentName)) out.accent = src.accent as AccentName;
  if (typeof src.perPerson === 'boolean') out.perPerson = src.perPerson;
  if (typeof src.showKorean === 'boolean') out.showKorean = src.showKorean;

  return out;
}
