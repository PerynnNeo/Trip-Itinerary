// Shared types for the Seoul itinerary app (used by both the API routes and the UI).

/** A single activity / stop within a day. Field names mirror the original data. */
export interface Activity {
  /** time range, e.g. "10:30 – 12:00" */
  t: string;
  /** title */
  ti: string;
  /** Korean name (may be empty) */
  kr: string;
  /** type: TRANSPORT | HOTEL | ACTIVITY | DINING | SHOPPING | CAFÉ */
  ty: string;
  /** short summary */
  su: string;
  /** address */
  ad: string;
  /** hours */
  ho: string;
  /** cost per person */
  pp: string;
  /** cost total */
  to: string;
  /** "what to do" longform */
  wh: string;
  /** insider tip */
  ip: string;
  /** onward directions */
  on: string;
  /** optional booking link (e.g. a tour/photoshoot to reserve) */
  book?: { url: string; label: string };
}

export interface Day {
  day: number;
  weekday: string;
  date: string;
  color: string;
  theme: string;
  hotel: string;
  spend: string;
  note: string;
  acts: Activity[];
}

export type Highlights = Record<string, string[]>;

export type Currency = 'SGD' | 'KRW';
export type AccentName = 'Pink' | 'Violet' | 'Coral' | 'Blue';
/** 'trip' | 'budget' | 'info' | 'prep' (before you fly) | 'pack' (packing list) | day number (1-8) */
export type ViewKey = 'trip' | 'budget' | 'info' | 'prep' | 'pack' | number;

/** How an activity's real spend was logged: one combined bill, or split per person. */
export type SpendMode = 'all' | 'each';

/** What was actually spent on an activity (KRW). */
export interface ActivityActual {
  mode: SpendMode;
  all?: number;
  jolin?: number;
  perris?: number;
  perynn?: number;
}

export interface RouteStop {
  day: number;
  name: string;
  sub: string;
  color: string;
}

export interface BudgetCat {
  name: string;
  icon: string;
  krw: number;
  color: string;
  note: string;
}

export interface Traveller {
  initial: string;
  name: string;
  role: string;
  color: string;
  bg: string;
}

export interface Fact {
  label: string;
  value: string;
  note: string;
  color: string;
}

export interface ItineraryMeta {
  title: string;
  subtitle: string;
  dateRange: string;
  /** Day 1 date, ISO yyyy-mm-dd (local Seoul). */
  startDate: string;
  /** Last day date, ISO yyyy-mm-dd. */
  endDate: string;
  /** Coordinates used for the live weather forecast. */
  lat: number;
  lng: number;
  pax: number;
  currencyRate: number;
  travellers: Traveller[];
  facts: Fact[];
  accentOptions: AccentName[];
}

export interface Itinerary {
  meta: ItineraryMeta;
  days: Day[];
  todos: string[];
  route: RouteStop[];
  budget: {
    base: {
      transport: number;
      food: number;
      activities: number;
      grand: number;
      shopLow: number;
      shopHigh: number;
    };
    cats: BudgetCat[];
  };
  typeColor: Record<string, string>;
  typeTint: Record<string, string>;
  typeIcon: Record<string, string>;
  highlights: Highlights;
}

/** Per-user (here: per shared trip) persisted UI state. */
export interface TripState {
  view: ViewKey;
  expanded: Record<string, boolean>;
  checked: Record<string, boolean>;
  todos: Record<string, boolean>;
  /** activity id -> what was really spent */
  actuals: Record<string, ActivityActual>;
  currency: Currency;
  perPerson: boolean;
  accent: AccentName;
  showKorean: boolean;
}

export const DEFAULT_STATE: TripState = {
  view: 'trip',
  expanded: {},
  checked: {},
  todos: {},
  actuals: {},
  currency: 'SGD',
  perPerson: false,
  accent: 'Pink',
  showKorean: true,
};
