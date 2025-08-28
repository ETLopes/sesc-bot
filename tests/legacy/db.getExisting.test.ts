import fs from 'fs';
import path from 'path';
import { openDatabase, ensureSchema, insertEvent, getExistingEventIds, closeDatabase } from '../src/db.js';

test('getExistingEventIds returns inserted IDs', async() => {
    const dir = path.resolve('./data-test/getexisting');
    const dbPath = path.join(dir, 'ids.db');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    process.env.DATABASE_PATH = dbPath;
    const db = openDatabase();
    await ensureSchema(db);
    await insertEvent(db, { id: 101, titulo: 'A' });
    await insertEvent(db, { id: 102, titulo: 'B' });
    const ids = await getExistingEventIds(db);
    expect(ids.has(101)).toBe(true);
    expect(ids.has(102)).toBe(true);
    await closeDatabase(db);
});