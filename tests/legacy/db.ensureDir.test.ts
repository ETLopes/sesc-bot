import fs from 'fs';
import path from 'path';
import { openDatabase, closeDatabase } from '../src/db.js';

test('openDatabase creates directory if missing', async() => {
    const dir = path.resolve('./data-test/missing-dir');
    const dbPath = path.join(dir, 'ensure.db');
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true });
    process.env.DATABASE_PATH = dbPath;
    const db = openDatabase();
    expect(fs.existsSync(dir)).toBe(true);
    await closeDatabase(db);
});