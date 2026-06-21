'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface PhotosContextValue {
  /** slotId -> updatedAt (used both as a "has photo" flag and a cache-bust key) */
  versions: Record<string, number>;
  getVersion: (slotId: string) => number | undefined;
  setVersion: (slotId: string, v: number) => void;
  clear: (slotId: string) => void;
}

const PhotosContext = createContext<PhotosContextValue | null>(null);

/** How often (ms) to pull photo changes from the server while the tab is visible. */
const PHOTO_POLL_MS = 9000;
/** Keep a just-uploaded local version even if the server poll hasn't caught up yet. */
const RECENT_UPLOAD_MS = 20000;

export function PhotosProvider({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<Record<string, number>>({});

  // Initial load + live polling so family members' photo uploads/removals appear.
  useEffect(() => {
    let alive = true;
    const pull = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      try {
        const data = (await (await fetch('/api/photos', { cache: 'no-store' })).json()) as {
          slots: { slotId: string; updatedAt: number }[];
        };
        if (!alive) return;
        const now = Date.now();
        setVersions((prev) => {
          const next: Record<string, number> = {};
          for (const s of data.slots) {
            // Take the freshest stamp so a new upload from anyone refreshes the image.
            next[s.slotId] = Math.max(s.updatedAt, prev[s.slotId] ?? 0);
          }
          // Preserve a very recent local upload the server list hasn't reflected yet.
          for (const [slotId, v] of Object.entries(prev)) {
            if (next[slotId] == null && now - v < RECENT_UPLOAD_MS) next[slotId] = v;
          }
          return next;
        });
      } catch {
        /* offline / transient — retry next tick */
      }
    };
    void pull();
    const id = setInterval(pull, PHOTO_POLL_MS);
    const onVisible = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') void pull();
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

  const getVersion = useCallback((slotId: string) => versions[slotId], [versions]);
  const setVersion = useCallback((slotId: string, v: number) => {
    setVersions((prev) => ({ ...prev, [slotId]: v }));
  }, []);
  const clear = useCallback((slotId: string) => {
    setVersions((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ versions, getVersion, setVersion, clear }),
    [versions, getVersion, setVersion, clear],
  );

  return <PhotosContext.Provider value={value}>{children}</PhotosContext.Provider>;
}

export function usePhotos(): PhotosContextValue {
  const ctx = useContext(PhotosContext);
  if (!ctx) throw new Error('usePhotos must be used within a PhotosProvider');
  return ctx;
}
