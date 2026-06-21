import { NextRequest, NextResponse } from 'next/server';
import { readState, writeState } from '@/lib/storage';
import { sanitizeStatePatch } from '@/lib/validate';
import { DEFAULT_STATE, type TripState } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/state — the saved shared trip state, merged over defaults. */
export async function GET() {
  const saved = await readState();
  return NextResponse.json({ ...DEFAULT_STATE, ...(saved ?? {}) } satisfies TripState);
}

/**
 * PUT /api/state — validate the incoming state and persist it. Unknown keys, bad
 * enum values and oversized maps are dropped; any field that is present (and valid)
 * replaces the stored one, fields that are absent keep their current value. The
 * client always sends the full state, so a wholesale replace of the boolean maps is
 * intended — that's what makes "reset progress" (an empty map) actually clear them.
 */
export async function PUT(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const patch = sanitizeStatePatch(raw);
  const current = { ...DEFAULT_STATE, ...((await readState()) ?? {}) };
  const merged: TripState = { ...current, ...patch };
  await writeState(merged);
  return NextResponse.json(merged);
}
