import type { TripState } from '../types';
import type { PhotoSlotInfo, StorageBackend, StoredPhoto } from './types';

export type { PhotoSlotInfo, StoredPhoto } from './types';

// Pick the backend once, lazily. Vercel Blob when its token is present (i.e. on
// Vercel with Blob storage added); otherwise the local SQLite file. Dynamic
// import keeps the unused backend — and its deps (better-sqlite3 / @vercel/blob)
// — out of the other environment's bundle.
let backendPromise: Promise<StorageBackend> | null = null;

function backend(): Promise<StorageBackend> {
  if (!backendPromise) {
    const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
    // On Vercel the filesystem is ephemeral/read-only, so SQLite can't persist.
    // Fail loudly with a fix rather than silently dropping everyone's data.
    if (process.env.VERCEL && !hasBlob) {
      throw new Error(
        'Persistent storage is not configured. Add "Blob" storage in your Vercel ' +
          "project's Storage tab (it sets BLOB_READ_WRITE_TOKEN), then redeploy.",
      );
    }
    backendPromise = hasBlob
      ? import('./blob').then((m) => m.blobBackend)
      : import('./sqlite').then((m) => m.sqliteBackend);
  }
  return backendPromise;
}

export async function readState(): Promise<Partial<TripState> | null> {
  return (await backend()).readState();
}
export async function writeState(state: TripState): Promise<void> {
  return (await backend()).writeState(state);
}
export async function readPhoto(slotId: string): Promise<StoredPhoto | undefined> {
  return (await backend()).readPhoto(slotId);
}
export async function writePhoto(slotId: string, mime: string, bytes: Buffer): Promise<void> {
  return (await backend()).writePhoto(slotId, mime, bytes);
}
export async function deletePhoto(slotId: string): Promise<void> {
  return (await backend()).deletePhoto(slotId);
}
export async function listPhotoSlots(): Promise<PhotoSlotInfo[]> {
  return (await backend()).listPhotoSlots();
}
