import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import type { TripState } from '../types';
import type { PhotoSlotInfo, StorageBackend, StoredPhoto } from './types';

// Local/dev backend: a single SQLite file under ./data. Synchronous under the
// hood, wrapped in async to satisfy the StorageBackend interface. This module is
// only ever imported when no Blob token is present (see storage/index.ts), so
// better-sqlite3 is never loaded in the Vercel/serverless runtime.

const DATA_DIR = path.join(process.cwd(), 'data');
const SHARED_ID = 'shared';

function createDb(): BetterSqlite3.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const database = new Database(path.join(DATA_DIR, 'trip.db'));
  database.pragma('journal_mode = WAL');
  database.exec(`
    CREATE TABLE IF NOT EXISTS trip_state (
      id         TEXT PRIMARY KEY,
      data       TEXT    NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS photos (
      slot_id    TEXT PRIMARY KEY,
      mime       TEXT    NOT NULL,
      bytes      BLOB    NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  return database;
}

const globalForDb = globalThis as unknown as { __seoulDb?: BetterSqlite3.Database };
function db(): BetterSqlite3.Database {
  return globalForDb.__seoulDb ?? (globalForDb.__seoulDb = createDb());
}

export const sqliteBackend: StorageBackend = {
  async readState(): Promise<Partial<TripState> | null> {
    const row = db().prepare('SELECT data FROM trip_state WHERE id = ?').get(SHARED_ID) as
      | { data: string }
      | undefined;
    if (!row) return null;
    try {
      return JSON.parse(row.data) as Partial<TripState>;
    } catch {
      return null;
    }
  },

  async writeState(state: TripState): Promise<void> {
    db()
      .prepare(
        `INSERT INTO trip_state (id, data, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
      )
      .run(SHARED_ID, JSON.stringify(state), Date.now());
  },

  async readPhoto(slotId: string): Promise<StoredPhoto | undefined> {
    const row = db()
      .prepare('SELECT mime, bytes, updated_at FROM photos WHERE slot_id = ?')
      .get(slotId) as { mime: string; bytes: Buffer; updated_at: number } | undefined;
    if (!row) return undefined;
    return { mime: row.mime, bytes: row.bytes, updatedAt: row.updated_at };
  },

  async writePhoto(slotId: string, mime: string, bytes: Buffer): Promise<void> {
    db()
      .prepare(
        `INSERT INTO photos (slot_id, mime, bytes, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(slot_id) DO UPDATE SET mime = excluded.mime, bytes = excluded.bytes, updated_at = excluded.updated_at`,
      )
      .run(slotId, mime, bytes, Date.now());
  },

  async deletePhoto(slotId: string): Promise<void> {
    db().prepare('DELETE FROM photos WHERE slot_id = ?').run(slotId);
  },

  async listPhotoSlots(): Promise<PhotoSlotInfo[]> {
    const rows = db().prepare('SELECT slot_id, updated_at FROM photos').all() as {
      slot_id: string;
      updated_at: number;
    }[];
    return rows.map((r) => ({ slotId: r.slot_id, updatedAt: r.updated_at }));
  },
};
