/* Simple runtime provider selection based on env var DB_PROVIDER: 'pg' or 'sqlite' (default) */
import * as sqliteMod from './db.js';
// Avoid importing Postgres provider in test to prevent ESM/pg issues
let pgMod: any = null;
const usePg = (process.env.DB_PROVIDER || '').toLowerCase() === 'pg';
const isTest = (process.env.NODE_ENV || '') === 'test';
if (usePg && !isTest) {
  // In test (CJS), require is available; in prod (ESM), we won't execute this until we switch to PG.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  pgMod = require('./db.pg.js');
}
const mod = usePg && pgMod ? (pgMod as any) : (sqliteMod as any);

export const openDatabase = mod.openDatabase as typeof sqliteMod.openDatabase;
export const ensureSchema = mod.ensureSchema as typeof sqliteMod.ensureSchema;
export const getExistingEventIds = mod.getExistingEventIds as typeof sqliteMod.getExistingEventIds;
export const insertEvent = mod.insertEvent as typeof sqliteMod.insertEvent;
export const closeDatabase = mod.closeDatabase as typeof sqliteMod.closeDatabase;
export const getUnpostedEvents = mod.getUnpostedEvents as typeof sqliteMod.getUnpostedEvents;
export const markEventPosted = mod.markEventPosted as typeof sqliteMod.markEventPosted;
export type EventRecord = typeof sqliteMod extends { EventRecord: infer T } ? T : any;
