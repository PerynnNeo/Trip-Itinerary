'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_STATE,
  type AccentName,
  type ActivityActual,
  type Currency,
  type TripState,
  type ViewKey,
} from '@/lib/types';

/** How often (ms) to pull collaborative changes from the server while the tab is visible. */
const POLL_MS = 7000;
/** localStorage mirror so offline edits survive a reload. */
const LOCAL_KEY = 'seoul-trip-state';

/**
 * Loads the shared trip state from the backend and persists changes back to it
 * (debounced, optimistic). While the tab is visible it also polls for the
 * *collaborative* fields — ticked stops + todos — so a family member's changes
 * appear within seconds, without their navigation or display prefs hijacking
 * yours (view / expanded / accent stay local during the session).
 */
export function useTripState() {
  const [state, setState] = useState<TripState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);
  const dirtyRef = useRef(false); // did the user edit before the load resolved?
  const skipNextSave = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSave = useRef(false); // a debounce timer is scheduled
  const inFlight = useRef(false); // a PUT is in progress
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initial load. On network failure (offline) fall back to the last state mirrored
  // to localStorage, so an installed/offline launch still shows your progress.
  useEffect(() => {
    let alive = true;
    fetch('/api/state')
      .then((r) => r.json())
      .then((s: TripState) => {
        if (!alive) return;
        // Merge the server snapshot UNDER any edits made during the load window.
        setState((prev) => (dirtyRef.current ? { ...DEFAULT_STATE, ...s, ...prev } : { ...DEFAULT_STATE, ...s }));
        if (!dirtyRef.current) skipNextSave.current = true;
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          if (raw && !dirtyRef.current) {
            setState({ ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<TripState>) });
            skipNextSave.current = true;
          }
        } catch {
          /* keep defaults */
        }
      })
      .finally(() => {
        if (!alive) return;
        loadedRef.current = true;
        setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Mirror every change to localStorage so offline edits survive a reload.
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable */
    }
  }, [state]);

  // When the connection returns, push the latest state up.
  useEffect(() => {
    const flush = () => {
      if (!loadedRef.current) return;
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(stateRef.current),
      }).catch(() => {});
    };
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, []);

  // Debounced persistence — only after the initial load has resolved.
  useEffect(() => {
    if (!loadedRef.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    pendingSave.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      pendingSave.current = false;
      inFlight.current = true;
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(stateRef.current),
      })
        .catch(() => {
          /* best-effort; UI already reflects the change */
        })
        .finally(() => {
          inFlight.current = false;
        });
    }, 350);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  // Live sync: pull collaborative fields (checked + todos) from the server.
  useEffect(() => {
    let alive = true;
    const pull = async () => {
      if (!loadedRef.current) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      // Don't overwrite a local edit that hasn't been saved yet.
      if (pendingSave.current || inFlight.current) return;
      try {
        const s = (await (await fetch('/api/state', { cache: 'no-store' })).json()) as TripState;
        if (!alive || pendingSave.current || inFlight.current) return;
        const cur = stateRef.current;
        const sameChecked = JSON.stringify(cur.checked) === JSON.stringify(s.checked ?? {});
        const sameTodos = JSON.stringify(cur.todos) === JSON.stringify(s.todos ?? {});
        const sameActuals = JSON.stringify(cur.actuals) === JSON.stringify(s.actuals ?? {});
        if (sameChecked && sameTodos && sameActuals) return;
        // Applying remote data — don't echo it straight back to the server.
        skipNextSave.current = true;
        setState((prev) => ({
          ...prev,
          checked: s.checked ?? prev.checked,
          todos: s.todos ?? prev.todos,
          actuals: s.actuals ?? prev.actuals,
        }));
      } catch {
        /* offline / transient — try again next tick */
      }
    };
    const id = setInterval(pull, POLL_MS);
    const onVisible = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') pull();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const update = useCallback((patch: Partial<TripState>) => {
    dirtyRef.current = true;
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setView = useCallback(
    (view: ViewKey) => {
      update({ view });
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [update],
  );

  const toggleExpand = useCallback((id: string) => {
    dirtyRef.current = true;
    setState((prev) => ({ ...prev, expanded: { ...prev.expanded, [id]: !prev.expanded[id] } }));
  }, []);

  const toggleCheck = useCallback((id: string) => {
    dirtyRef.current = true;
    setState((prev) => ({ ...prev, checked: { ...prev.checked, [id]: !prev.checked[id] } }));
  }, []);

  // Accepts a numeric index (the "before you fly" checklist) or a string key
  // (e.g. "pk:2-3" for the packing list) — both live in the synced todos map.
  const toggleTodo = useCallback((key: number | string) => {
    dirtyRef.current = true;
    setState((prev) => ({ ...prev, todos: { ...prev.todos, [key]: !prev.todos[key] } }));
  }, []);

  const setCurrency = useCallback((currency: Currency) => update({ currency }), [update]);
  const setPerPerson = useCallback((perPerson: boolean) => update({ perPerson }), [update]);
  const setAccent = useCallback((accent: AccentName) => update({ accent }), [update]);
  const setShowKorean = useCallback((showKorean: boolean) => update({ showKorean }), [update]);

  /** Set (or clear) the logged actual spend for an activity. */
  const setActual = useCallback((id: string, actual: ActivityActual | null) => {
    dirtyRef.current = true;
    setState((prev) => {
      const next = { ...prev.actuals };
      if (actual === null) delete next[id];
      else next[id] = actual;
      return { ...prev, actuals: next };
    });
  }, []);

  /** Clear all ticked stops + todos (shared across everyone on the trip). */
  const resetProgress = useCallback(() => {
    dirtyRef.current = true;
    setState((prev) => ({ ...prev, checked: {}, todos: {} }));
  }, []);

  return {
    state,
    loaded,
    actions: {
      setView,
      toggleExpand,
      toggleCheck,
      toggleTodo,
      setActual,
      setCurrency,
      setPerPerson,
      setAccent,
      setShowKorean,
      resetProgress,
    },
  };
}

export type TripActions = ReturnType<typeof useTripState>['actions'];
