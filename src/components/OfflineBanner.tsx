'use client';

import { useEffect, useState } from 'react';

/** A small bar shown while the device is offline. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(typeof navigator !== 'undefined' && navigator.onLine === false);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 150,
        background: '#1A1310',
        color: '#FFE14D',
        textAlign: 'center',
        fontSize: 12.5,
        fontWeight: 600,
        padding: '9px 16px',
        paddingBottom: 'calc(9px + var(--safe-bottom))',
        boxShadow: '0 -2px 12px rgba(0,0,0,.25)',
      }}
    >
      📴 Offline — changes save on this device and sync when you reconnect.
    </div>
  );
}
