'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PERSON_KEYS, type PersonKey } from '@/lib/people';

const STORAGE_KEY = 'seoul-itin-person';
const WELCOMED_KEY = 'seoul-itin-welcomed';

interface PersonContextValue {
  /** Who this device belongs to (null until chosen). Stored locally, not shared. */
  person: PersonKey | null;
  setPerson: (p: PersonKey) => void;
  /** True once the stored value has been read (avoids a flash of the welcome modal). */
  ready: boolean;
  /** Whether to show the first-run "who are you?" prompt. */
  showWelcome: boolean;
  /** Dismiss the welcome prompt without choosing ("just browsing"). */
  dismissWelcome: () => void;
}

const PersonContext = createContext<PersonContextValue | null>(null);

export function PersonProvider({ children }: { children: ReactNode }) {
  const [person, setPersonState] = useState<PersonKey | null>(null);
  const [ready, setReady] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (PERSON_KEYS as string[]).includes(stored)) setPersonState(stored as PersonKey);
      if (localStorage.getItem(WELCOMED_KEY) === '1') setWelcomeDismissed(true);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setPerson = useCallback((p: PersonKey) => {
    setPersonState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
      localStorage.setItem(WELCOMED_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    setWelcomeDismissed(true);
    try {
      localStorage.setItem(WELCOMED_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      person,
      setPerson,
      ready,
      showWelcome: ready && person === null && !welcomeDismissed,
      dismissWelcome,
    }),
    [person, setPerson, ready, welcomeDismissed, dismissWelcome],
  );

  return <PersonContext.Provider value={value}>{children}</PersonContext.Provider>;
}

export function usePerson(): PersonContextValue {
  const ctx = useContext(PersonContext);
  if (!ctx) throw new Error('usePerson must be used within a PersonProvider');
  return ctx;
}
