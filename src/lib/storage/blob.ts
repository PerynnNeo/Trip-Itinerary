import { del, list, put } from '@vercel/blob';
import type { TripState } from '../types';
import type { PhotoSlotInfo, StorageBackend, StoredPhoto } from './types';

// Production backend (Vercel): trip state + photos live in Vercel Blob storage,
// which persists across serverless invocations. Activated when BLOB_READ_WRITE_TOKEN
// is present in the environment (auto-set when you add Blob storage in Vercel).

const STATE_KEY = 'trip/state.json';
const PHOTO_PREFIX = 'trip/photos/';

const photoKey = (slotId: string) => `${PHOTO_PREFIX}${slotId}`;

export const blobBackend: StorageBackend = {
  async readState(): Promise<Partial<TripState> | null> {
    const { blobs } = await list({ prefix: STATE_KEY, limit: 1 });
    const blob = blobs.find((b) => b.pathname === STATE_KEY);
    if (!blob) return null;
    const res = await fetch(blob.url, { cache: 'no-store' });
    if (!res.ok) return null;
    try {
      return (await res.json()) as Partial<TripState>;
    } catch {
      return null;
    }
  },

  async writeState(state: TripState): Promise<void> {
    await put(STATE_KEY, JSON.stringify(state), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  },

  async readPhoto(slotId: string): Promise<StoredPhoto | undefined> {
    const key = photoKey(slotId);
    const { blobs } = await list({ prefix: key, limit: 1 });
    const blob = blobs.find((b) => b.pathname === key);
    if (!blob) return undefined;
    return { mime: '', url: blob.url, updatedAt: new Date(blob.uploadedAt).getTime() };
  },

  async writePhoto(slotId: string, mime: string, bytes: Buffer): Promise<void> {
    await put(photoKey(slotId), bytes, {
      access: 'public',
      contentType: mime,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  },

  async deletePhoto(slotId: string): Promise<void> {
    const key = photoKey(slotId);
    const { blobs } = await list({ prefix: key, limit: 1 });
    const blob = blobs.find((b) => b.pathname === key);
    if (blob) await del(blob.url);
  },

  async listPhotoSlots(): Promise<PhotoSlotInfo[]> {
    const { blobs } = await list({ prefix: PHOTO_PREFIX });
    return blobs.map((b) => ({
      slotId: b.pathname.slice(PHOTO_PREFIX.length),
      updatedAt: new Date(b.uploadedAt).getTime(),
    }));
  },
};
