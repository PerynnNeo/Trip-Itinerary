import {
  RAW_DAYS,
  HIGHLIGHTS,
  TODO_LIST,
  TYPE_COLOR,
  TYPE_TINT,
  TYPE_ICON,
} from './itinerary-data';
import { PEOPLE, PERSON_KEYS } from './people';
import type { AccentName, Itinerary } from './types';

/** Accent colour options surfaced in the UI (matches the original DC prop). */
export const ACCENT_MAP: Record<AccentName, string> = {
  Pink: '#FF2E88',
  Violet: '#8B5CF6',
  Coral: '#FF5A3C',
  Blue: '#3B82F6',
};

export function accentHex(name: AccentName | string | undefined): string {
  return (ACCENT_MAP as Record<string, string>)[name ?? ''] ?? ACCENT_MAP.Pink;
}

/**
 * The complete set of photo-slot ids the UI actually references — the trip hero
 * (single), plus a per-person slot for each day hero and every activity image
 * (`<base>-<personKey>`). Used to allowlist uploads so an unauthenticated caller
 * can't create unbounded arbitrary slots.
 */
export function getValidPhotoSlots(): Set<string> {
  const slots = new Set<string>(['seoul-hero']);
  for (const d of RAW_DAYS) {
    for (const pk of PERSON_KEYS) {
      slots.add(`day${d.day}-hero-${pk}`);
      d.acts.forEach((_, idx) => slots.add(`d${d.day}-${idx}-img-${pk}`));
    }
  }
  return slots;
}

const ROUTE_NAMES = [
  'Myeongdong',
  'Jongno',
  'Gangnam',
  'Hongdae',
  'Seongsu',
  '→ Songdo',
  'Songdo',
  'Incheon',
];

const ROUTE_SUBS = [
  'Namdaemun · night market',
  'Palaces · hanbok · Insadong',
  'Apgujeong · galbi · Garosu-gil',
  'Indie art & cafés',
  'Colour analysis · fashion',
  'Cheonggyecheon → outlet',
  'Outlet, full sweep',
  'Departure day',
];

const BUDGET_BASE = {
  transport: 175000,
  food: 1260000,
  activities: 780000,
  grand: 2215000,
  shopLow: 640000,
  shopHigh: 4100000,
};

/**
 * Builds the full itinerary payload served by the API. The day/activity content
 * comes straight from the generated data module; meta, route and budget framing
 * are assembled here so the front-end never hard-codes trip content.
 */
export function getItinerary(): Itinerary {
  return {
    meta: {
      title: 'Seoul & Incheon',
      subtitle:
        'Eight days of palaces, hanboks, K-beauty, viral mochi, personal colour analysis and outlet hauls — a mother-and-daughters trip from Singapore.',
      dateRange: '7–14 NOV 2026 · 8 DAYS · 3 PAX',
      startDate: '2026-11-07',
      endDate: '2026-11-14',
      lat: 37.5665,
      lng: 126.978,
      pax: 3,
      currencyRate: 1100,
      travellers: PEOPLE.map((p) => ({
        initial: p.name[0],
        name: p.name,
        role: p.role,
        color: p.color,
        bg: p.bg,
      })),
      facts: [
        {
          label: 'WEATHER',
          value: '5–12°C, dry & sunny',
          note: 'Golden autumn foliage — pack a warm jacket.',
          color: '#FF5A3C',
        },
        {
          label: 'CURRENCY',
          value: '1 SGD ≈ 1,100 KRW',
          note: 'All prices shown per person + total for 3.',
          color: '#12B886',
        },
        {
          label: 'STAY',
          value: '2 hotels',
          note: 'New Seoul Myeongdong (5n) → Orakai Songdo (2n).',
          color: '#3B82F6',
        },
        {
          label: 'FLIGHT HOME',
          value: 'SQ608 · 14 Nov',
          note: 'Dep 08:50 ICN → arr 14:25 Changi T2.',
          color: '#8B5CF6',
        },
      ],
      accentOptions: ['Pink', 'Violet', 'Coral', 'Blue'],
    },
    days: RAW_DAYS,
    todos: TODO_LIST,
    route: RAW_DAYS.map((d, i) => ({
      day: d.day,
      name: ROUTE_NAMES[i],
      sub: ROUTE_SUBS[i],
      color: d.color,
    })),
    budget: {
      base: BUDGET_BASE,
      cats: [
        {
          name: 'Transport',
          icon: 'transport',
          krw: BUDGET_BASE.transport,
          color: '#12B886',
          note: 'Airport limousine bus + subway (incl. the Songdo move) & city taxis',
        },
        {
          name: 'Food & Drink',
          icon: 'dining',
          krw: BUDGET_BASE.food,
          color: '#FF5A3C',
          note: 'Every meal, café and snack across 8 days',
        },
        {
          name: 'Activities & Entry',
          icon: 'activity',
          krw: BUDGET_BASE.activities,
          color: '#8B5CF6',
          note: 'Hanbok, Gyeongbokgung photoshoot & COCORY analysis (palace free)',
        },
      ],
    },
    typeColor: TYPE_COLOR,
    typeTint: TYPE_TINT,
    typeIcon: TYPE_ICON,
    highlights: HIGHLIGHTS,
  };
}
