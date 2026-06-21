'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { usePhotos } from './PhotosProvider';

/** Longest edge (px) we keep — plenty sharp on phones, well under the upload limit. */
const MAX_EDGE = 2048;
/** Target byte ceiling — comfortably under Vercel's ~4.5 MB function body limit. */
const SIZE_CEILING = 3_800_000;

/**
 * Downscale + JPEG-compress an image in the browser so the upload fits the
 * serverless request-body limit (and the photo grid loads faster). Respects EXIF
 * orientation. Falls back to the original bytes if it can't be decoded (e.g. an
 * animated GIF, or an unsupported codec) so nothing is ever silently dropped.
 */
async function shrinkImage(file: File): Promise<{ blob: Blob; type: string }> {
  if (file.type === 'image/gif') return { blob: file, type: file.type };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return { blob: file, type: file.type };
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return { blob: file, type: file.type };
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = 0.85;
  let out = await toJpeg(canvas, quality);
  while (out && out.size > SIZE_CEILING && quality > 0.4) {
    quality -= 0.12;
    out = await toJpeg(canvas, quality);
  }

  // Prefer the smaller result, but never hand back an original that itself
  // exceeds the limit when we have a compressed alternative.
  if (!out) return { blob: file, type: file.type };
  if (file.size <= out.size && file.size <= SIZE_CEILING) return { blob: file, type: file.type };
  return { blob: out, type: 'image/jpeg' };
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', quality));
}

interface ImageSlotProps {
  slotId: string;
  placeholder?: string;
  /** Accessible description of the slot's content (used as the <img> alt once filled). */
  alt?: string;
  shape?: 'rect' | 'rounded';
  radius?: number;
  style?: CSSProperties;
}

/**
 * A user-fillable image slot. Click/Enter to browse or drag-and-drop an image; it
 * is uploaded to the backend (PUT /api/photos/:slotId) and persists across devices.
 * Replaces the original bundle's <image-slot> web component.
 */
export function ImageSlot({ slotId, placeholder = 'Drop a photo here', alt, shape = 'rect', radius = 0, style }: ImageSlotProps) {
  const { getVersion, setVersion, clear } = usePhotos();
  const version = getVersion(slotId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const src = version != null ? `/api/photos/${slotId}?v=${version}` : null;
  const borderRadius = shape === 'rounded' ? radius : 0;

  async function upload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // Phone photos are routinely 3–8 MB, but Vercel functions reject request
      // bodies over ~4.5 MB (FUNCTION_PAYLOAD_TOO_LARGE). Downscale + compress in
      // the browser first so the upload always fits — and the gallery loads faster.
      const { blob, type } = await shrinkImage(file);
      const res = await fetch(`/api/photos/${slotId}`, {
        method: 'PUT',
        headers: { 'content-type': type },
        body: blob,
      });
      if (!res.ok) {
        if (res.status === 413) throw new Error('Photo too large even after shrinking — try another image.');
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Upload failed (${res.status})`);
      }
      setVersion(slotId, Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy(true);
    try {
      await fetch(`/api/photos/${slotId}`, { method: 'DELETE' });
      clear(slotId);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={src ? `Replace ${alt ?? 'photo'}` : alt ? `Add ${alt}` : placeholder}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void upload(file);
      }}
      title={src ? 'Click to replace photo' : 'Click or drop an image'}
      style={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius,
        background: src ? '#1A1310' : dragOver ? '#FFE9F2' : '#FBF1E6',
        // Use an inset box-shadow (not outline) for the drag state so the
        // keyboard :focus-visible outline remains available.
        boxShadow: dragOver ? 'inset 0 0 0 2px #FF2E88' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = '';
        }}
      />

      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? placeholder}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12.5,
            fontWeight: 700,
            color: '#B7A99C',
            letterSpacing: '.02em',
            textAlign: 'center',
            padding: 12,
            userSelect: 'none',
          }}
        >
          {busy ? 'Uploading…' : error ?? placeholder}
        </span>
      )}

      {src && !busy && (
        <button
          onClick={remove}
          title="Remove photo"
          aria-label="Remove photo"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 26,
            height: 26,
            borderRadius: 8,
            border: '2px solid #1A1310',
            background: '#fff',
            color: '#1A1310',
            cursor: 'pointer',
            fontWeight: 800,
            lineHeight: 1,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
