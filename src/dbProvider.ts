/* Simple runtime provider selection based on env var DB_PROVIDER: 'pg' or 'sqlite' (default) */
import * as sqliteMod from './db.js';
import * as pgMod from './db.pg.js';

const usePg = (process.env.DB_PROVIDER || '').toLowerCase() === 'pg';
const mod = usePg ? (pgMod as any) : (sqliteMod as any);

export const openDatabase = mod.openDatabase as typeof sqliteMod.openDatabase;
export const ensureSchema = mod.ensureSchema as typeof sqliteMod.ensureSchema;
export const getExistingEventIds = mod.getExistingEventIds as typeof sqliteMod.getExistingEventIds;
export const insertEvent = mod.insertEvent as typeof sqliteMod.insertEvent;
export const closeDatabase = mod.closeDatabase as typeof sqliteMod.closeDatabase;
export const getUnpostedEvents = mod.getUnpostedEvents as typeof sqliteMod.getUnpostedEvents;
export const markEventPosted = mod.markEventPosted as typeof sqliteMod.markEventPosted;
export type EventRecord = typeof sqliteMod extends { EventRecord: infer T } ? T : any;
