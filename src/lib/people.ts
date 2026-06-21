// The three travellers. Single source of truth for names/colours, the per-person
// photo slots, "I am…" identity, and the per-person actual-spend fields.

export type PersonKey = 'jolin' | 'perris' | 'perynn';

export interface Person {
  key: PersonKey;
  name: string;
  role: string;
  color: string;
  bg: string;
}

export const PEOPLE: Person[] = [
  { key: 'jolin', name: 'Jolin', role: 'Mother', color: '#FF2E88', bg: '#FFF0F6' },
  { key: 'perris', name: 'Perris', role: 'Little sister', color: '#8B5CF6', bg: '#F3EEFF' },
  { key: 'perynn', name: 'Perynn', role: 'Big sister', color: '#12B886', bg: '#E7FBF2' },
];

export const PERSON_KEYS: PersonKey[] = PEOPLE.map((p) => p.key);

export function personByKey(key: string | null | undefined): Person | undefined {
  return PEOPLE.find((p) => p.key === key);
}
