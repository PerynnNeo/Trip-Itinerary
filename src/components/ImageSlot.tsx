'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { usePhotos } from './PhotosProvider';

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
      const res = await fetch(`/api/photos/${slotId}`, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      });
      if (!res.ok) {
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
