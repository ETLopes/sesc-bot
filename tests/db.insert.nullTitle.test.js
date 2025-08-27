import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { openDatabase, ensureSchema, insertEvent, closeDatabase } from '../src/db.js';

test('insertEvent handles null title (titulo null)', async() => {
    const dir = path.resolve('./data-test/null-title');
    const dbPath = path.join(dir, 't.db');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    process.env.DATABASE_PATH = dbPath;
    const db = openDatabase();
    await ensureSchema(db);
    await expect(insertEvent(db, { id: 999, titulo: null })).resolves.toBe(true);
    // verify row exists with NULL title
    const row = await new Promise((resolve, reject) => {
        db.get('SELECT titulo FROM events WHERE id = 999', [], (err, r) => {
            if (err) reject(err);
            else resolve(r);
        });
    });
    expect(row.titulo).toBeNull();
    await closeDatabase(db);
});