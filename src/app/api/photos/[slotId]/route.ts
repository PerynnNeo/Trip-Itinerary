import { NextRequest, NextResponse } from 'next/server';
import { deletePhoto, readPhoto, writePhoto } from '@/lib/storage';
import { getValidPhotoSlots } from '@/lib/itinerary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
// Concrete raster types only — deliberately excludes image/svg+xml (script vector).
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const VALID_SLOTS = getValidPhotoSlots();

type Ctx = { params: Promise<{ slotId: string }> };

function normalizeMime(header: string | null): string {
  return (header ?? '').split(';')[0].trim().toLowerCase();
}

/** GET /api/photos/:slotId — the image (404 if the slot is empty). */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slotId } = await params;
  const photo = await readPhoto(slotId);
  if (!photo) return new NextResponse('Not found', { status: 404 });

  // Blob backend: redirect to the hosted URL (cache-busted by the stored stamp).
  if (photo.url) {
    const target = `${photo.url}${photo.url.includes('?') ? '&' : '?'}v=${photo.updatedAt}`;
    return NextResponse.redirect(target, 307);
  }

  // SQLite backend: stream the bytes. Serve from our own allowlist, never the
  // stored (client-supplied) mime, and harden against sniffing / script execution.
  const bytes = photo.bytes ?? Buffer.alloc(0);
  const mime = ALLOWED_MIME.has(photo.mime) ? photo.mime : 'application/octet-stream';
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': mime,
      // The client busts the cache with ?v=<updatedAt>, so the bytes are immutable per URL.
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: `"${photo.updatedAt}"`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline; filename="photo"',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}

/** PUT /api/photos/:slotId — store an uploaded image (known slot, raster image only). */
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slotId } = await params;
  if (!VALID_SLOTS.has(slotId)) {
    return NextResponse.json({ error: 'Unknown photo slot' }, { status: 404 });
  }

  const mime = normalizeMime(req.headers.get('content-type'));
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 415 });
  }

  // Reject oversized bodies by declared length before reading anything.
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return NextResponse.json({ error: 'Image too large (max 10 MB)' }, { status: 413 });
  }

  // Stream with a hard cap so a spoofed/absent content-length can't exhaust memory.
  const buf = await readBounded(req, MAX_BYTES);
  if (buf === null) {
    return NextResponse.json({ error: 'Image too large (max 10 MB)' }, { status: 413 });
  }
  if (buf.length === 0) {
    return NextResponse.json({ error: 'Empty body' }, { status: 400 });
  }

  await writePhoto(slotId, mime, buf);
  return NextResponse.json({ ok: true, slotId, updatedAt: Date.now() });
}

/** DELETE /api/photos/:slotId — remove the stored image. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slotId } = await params;
  if (!VALID_SLOTS.has(slotId)) {
    return NextResponse.json({ error: 'Unknown photo slot' }, { status: 404 });
  }
  await deletePhoto(slotId);
  return NextResponse.json({ ok: true });
}

/** Read the request body, aborting (returns null) once it exceeds `limit` bytes. */
async function readBounded(req: NextRequest, limit: number): Promise<Buffer | null> {
  if (!req.body) return Buffer.alloc(0);
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.length;
      if (total > limit) {
        await reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}
