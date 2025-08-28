import fs from 'fs';
import path from 'path';
import { openDatabase, closeDatabase } from '../src/db.js';

test('openDatabase uses env DATABASE_PATH', async() => {
    const dir = path.resolve('./data-test/open-env');
    const dbPath = path.join(dir, 'file.db');
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true });
    process.env.DATABASE_PATH = dbPath;
    const db = openDatabase();
    expect(fs.existsSync(dir)).toBe(true);
    await closeDatabase(db);
});

test('openDatabase uses default path when env not set', async() => {
    delete process.env.DATABASE_PATH;
    const db = openDatabase();
    await closeDatabase(db);
});