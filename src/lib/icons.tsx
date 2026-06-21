import type { CSSProperties } from 'react';

/** Inline SVG path data for the icon set used throughout the itinerary. */
export const ICON_PATHS: Record<string, string> = {
  transport: '<rect x="4" y="3" width="16" height="13" rx="3"/><path d="M4 11h16M8 16l-2 4M16 16l2 4"/>',
  hotel: '<path d="M3 18V7M3 11h13a4 4 0 0 1 4 4v3M3 18h18"/><circle cx="7.5" cy="9.5" r="1.5"/>',
  activity: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
  dining: '<path d="M5 2v6a2 2 0 0 0 4 0V2"/><path d="M7 8v14"/><path d="M17 2c-1.8 1.2-2.6 3.8-2.6 6.4 0 2 1.1 3.3 2.6 3.6V22"/>',
  shopping: '<path d="M6 2 4 6v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4z"/><path d="M4 6h16"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  cafe: '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 1v3M10 1v3M14 1v3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v3"/><path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3"/><path d="M22 11v4h-4a2 2 0 0 1 0-4z"/>',
  bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.6c.6.5 1 1.3 1 2.4h6c0-1.1.4-1.9 1-2.4A7 7 0 0 0 12 2z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  alert: '<path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  plane: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M4 12l5 5 11-12"/>',
  camera: '<path d="M3 8a2 2 0 0 1 2-2h2.5L9 4h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.5"/>',
  suitcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 13l2 2 4-4"/>',
  plug: '<path d="M9 2v5M15 2v5M6 7h12v3a6 6 0 0 1-12 0zM12 16v6"/>',
  shirt: '<path d="M16 3l5 4-3 3-1-1v12H7V9L6 10 3 7l5-4 4 2z"/>',
  health: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
};

export interface IconProps {
  name: string;
  color?: string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}

/** Renders an inline stroke icon. `name` falls back to `activity` when unknown. */
export function Icon({ name, color = 'currentColor', size = 18, stroke = 2.1, style }: IconProps) {
  const p = ICON_PATHS[name] ?? ICON_PATHS.activity;
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flex: 'none',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
