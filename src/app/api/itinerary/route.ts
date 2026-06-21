import { NextResponse } from 'next/server';
import { getItinerary } from '@/lib/itinerary';

export const runtime = 'nodejs';

/** GET /api/itinerary — the full trip content (days, route, budget, meta). */
export function GET() {
  return NextResponse.json(getItinerary());
}
