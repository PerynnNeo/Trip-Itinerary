'use client';

import { useEffect, useState } from 'react';
import type { Itinerary } from '@/lib/types';

/** Loads the trip content from the backend once. */
export function useItinerary() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/itinerary')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Itinerary) => {
        if (alive) setItinerary(data);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load itinerary');
      });
    return () => {
      alive = false;
    };
  }, []);

  return { itinerary, error };
}
