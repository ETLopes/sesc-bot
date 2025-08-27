import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { DATABASE_PATH as DEFAULT_DATABASE_PATH } from './config.js';

sqlite3.verbose();

function ensureDataDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function openDatabase() {
    const resolvedPath = process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH;
    ensureDataDirectoryExists(resolvedPath);
    const db = new sqlite3.Database(resolvedPath);
    return db;
}

function run(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function onRun(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// get(): not used here; defined where needed

function all(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export async function ensureSchema(db) {
    await run(
        db,
        `CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      titulo TEXT,
      complemento TEXT,
      link TEXT,
      dataPrimeiraSessao TEXT,
      dataUltimaSessao TEXT,
      dataProxSessao TEXT,
      unidade TEXT,
      qtdeIngressosWeb TEXT,
      categorias TEXT,
      imagem TEXT,
      created_at TEXT,
      updated_at TEXT
    )`,
    );

    await run(db, 'CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)');

    // Migrate: add missing columns if the table was created before
    const cols = await all(db, "PRAGMA table_info('events')");
    const colNames = new Set(cols.map((c) => c.name));
    if (!colNames.has('complemento')) {
        await run(db, 'ALTER TABLE events ADD COLUMN complemento TEXT');
    }
    if (!colNames.has('qtdeIngressosWeb')) {
        await run(db, 'ALTER TABLE events ADD COLUMN qtdeIngressosWeb TEXT');
    }
}

export async function getExistingEventIds(db) {
    const rows = await all(db, 'SELECT id FROM events');
    return new Set(rows.map((r) => r.id));
}

export async function insertEvent(db, event) {
    const nowIso = new Date().toISOString();
    try {
        await run(
            db,
            `INSERT INTO events(
        id, titulo, complemento, link, dataPrimeiraSessao, dataUltimaSessao, dataProxSessao,
        unidade, qtdeIngressosWeb, categorias, imagem, created_at, updated_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                event.id,
                event.titulo || null,
                event.complemento || null,
                event.link || null,
                event.dataPrimeiraSessao || null,
                event.dataUltimaSessao || null,
                event.dataProxSessao || null,
                event.unidade || null,
                event.qtdeIngressosWeb !== null && event.qtdeIngressosWeb !== undefined ?
                String(event.qtdeIngressosWeb) :
                null,
                event.categorias || null,
                event.imagem || null,
                nowIso,
                nowIso,
            ],
        );
        return true;
    } catch (err) {
        if (String(err.message || '').includes('SQLITE_CONSTRAINT')) {
            return false;
        }
        throw err;
    }
}

export function closeDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}