import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { ensureSchema } from '../src/db.js';

function exec(db, sql) {
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => (err ? reject(err) : resolve()));
    });
}

function all(db, sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}

test('ensureSchema migrates missing columns', async() => {
    const tmpDir = path.resolve('./data-test');
    const tmpDb = path.join(tmpDir, 'legacy.db');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb);

    const db = new sqlite3.Database(tmpDb);
    // Legacy table without complemento and qtdeIngressosWeb
    await exec(
        db,
        `CREATE TABLE events (
      id INTEGER PRIMARY KEY,
      titulo TEXT,
      link TEXT,
      dataPrimeiraSessao TEXT,
      dataUltimaSessao TEXT,
      dataProxSessao TEXT,
      unidade TEXT,
      categorias TEXT,
      imagem TEXT,
      created_at TEXT,
      updated_at TEXT
    )`
    );

    await ensureSchema(db);
    const cols = await all(db, "PRAGMA table_info('events')");
    const colNames = new Set(cols.map((c) => c.name));
    expect(colNames.has('complemento')).toBe(true);
    expect(colNames.has('qtdeIngressosWeb')).toBe(true);
    db.close();
});