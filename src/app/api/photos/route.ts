import { NextResponse } from 'next/server';
import { listPhotoSlots } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/photos — which slots currently have a photo (+ last-updated stamp). */
export async function GET() {
  return NextResponse.json({ slots: await listPhotoSlots() });
}
