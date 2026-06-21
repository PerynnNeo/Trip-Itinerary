import type { TripState } from '../types';

/** A stored photo: either inline bytes (local SQLite) or a hosted URL (Vercel Blob). */
export interface StoredPhoto {
  mime: string;
  updatedAt: number;
  bytes?: Buffer;
  url?: string;
}

export interface PhotoSlotInfo {
  slotId: string;
  updatedAt: number;
}

/** Backend-agnostic persistence used by the API routes. */
export interface StorageBackend {
  readState(): Promise<Partial<TripState> | null>;
  writeState(state: TripState): Promise<void>;
  readPhoto(slotId: string): Promise<StoredPhoto | undefined>;
  writePhoto(slotId: string, mime: string, bytes: Buffer): Promise<void>;
  deletePhoto(slotId: string): Promise<void>;
  listPhotoSlots(): Promise<PhotoSlotInfo[]>;
}
