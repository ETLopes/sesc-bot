import { EventRecord as BaseEventRecord } from './db.js';
import { createRequire } from 'module';

export type PgDb = any;
export type EventRecord = BaseEventRecord;

export function openDatabase(): PgDb {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  if (!connectionString) throw new Error('DATABASE_URL/POSTGRES_URL not set for Postgres provider');
  // Lazy require in ESM context
  const requireModule = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = requireModule('pg');
  const pool = new Pool({ connectionString });
  return pool;
}

export async function closeDatabase(pool: PgDb): Promise<void> {
  await pool.end();
}

export async function ensureSchema(pool: PgDb): Promise<void> {
  await pool.query(
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
      posted BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ
    )`,
  );
  await pool.query('CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)');
}

export async function getExistingEventIds(pool: PgDb): Promise<Set<number>> {
  const res = await pool.query('SELECT id FROM events');
  return new Set(res.rows.map((r) => Number(r.id)));
}

export async function insertEvent(pool: PgDb, event: EventRecord): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const res = await pool.query(
    `INSERT INTO events(
      id, titulo, complemento, link, dataPrimeiraSessao, dataUltimaSessao, dataProxSessao,
      unidade, qtdeIngressosWeb, categorias, imagem, posted, created_at, updated_at
    ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    ON CONFLICT (id) DO NOTHING`,
    [
      event.id,
      event.titulo || null,
      event.complemento || null,
      event.link || null,
      event.dataPrimeiraSessao || null,
      event.dataUltimaSessao || null,
      event.dataProxSessao || null,
      event.unidade || null,
      event.qtdeIngressosWeb !== null && event.qtdeIngressosWeb !== undefined
        ? String(event.qtdeIngressosWeb)
        : null,
      event.categorias || null,
      event.imagem || null,
      false,
      nowIso,
      nowIso,
    ],
  );
  return res.rowCount === 1;
}

export async function getUnpostedEvents(pool: PgDb): Promise<EventRecord[]> {
  const res = await pool.query(
    `SELECT id, titulo, complemento, link, dataPrimeiraSessao, dataUltimaSessao, dataProxSessao,
            unidade, qtdeIngressosWeb, categorias, imagem
       FROM events
      WHERE posted = FALSE
      ORDER BY created_at ASC`,
  );
  return res.rows as EventRecord[];
}

export async function markEventPosted(pool: PgDb, id: number): Promise<void> {
  const nowIso = new Date().toISOString();
  await pool.query('UPDATE events SET posted = TRUE, updated_at = $1 WHERE id = $2', [nowIso, id]);
}
