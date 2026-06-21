'use client';

import { PEOPLE } from '@/lib/people';
import { ImageSlot } from './ImageSlot';
import { usePerson } from './PersonProvider';

interface PhotoTrioProps {
  /** Base slot id; each person's slot is `${base}-${personKey}`. */
  base: string;
  /** Height of each photo thumbnail. */
  height?: number;
  /** Context for alt text, e.g. "Day 1" or the activity title. */
  context?: string;
}

/**
 * A full-width row of three photo slots — one per traveller — each with a name
 * label below. Everyone uploads their own shot of the same day/activity. The
 * current device's person (set in Settings) is highlighted.
 */
export function PhotoTrio({ base, height = 124, context }: PhotoTrioProps) {
  const { person } = usePerson();

  return (
    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
      {PEOPLE.map((p) => {
        const you = person === p.key;
        return (
          <div key={p.key} style={{ flex: 1, minWidth: 0 }}>
            <ImageSlot
              slotId={`${base}-${p.key}`}
              placeholder={you ? '+ Add yours' : '+ Add'}
              alt={`${p.name}'s photo${context ? ` — ${context}` : ''}`}
              shape="rounded"
              radius={12}
              style={{
                width: '100%',
                height,
                border: you ? `3px solid ${p.color}` : '2px solid #1A1310',
                borderRadius: 12,
              }}
            />
            <div
              style={{
                marginTop: 6,
                textAlign: 'center',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11.5,
                fontWeight: 700,
                color: p.color,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {p.name}
              {you && <span style={{ color: '#9A8C81' }}> · you</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
