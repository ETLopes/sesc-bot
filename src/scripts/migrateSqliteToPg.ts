import 'dotenv/config';
import {
  openDatabase as openSqlite,
  ensureSchema as ensureSqlite,
  closeDatabase as closeSqlite,
} from '../db.js';
import {
  openDatabase as openPg,
  ensureSchema as ensurePg,
  closeDatabase as closePg,
  insertEvent as insertPg,
  markEventPosted as markPostedPg,
} from '../db.pg.js';
import logger from '../logger.js';

function all<T = any>(db: any, sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err: any, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows as unknown as T[]);
    });
  });
}

type Row = {
  id: number;
  titulo?: string | null;
  complemento?: string | null;
  link?: string | null;
  dataPrimeiraSessao?: string | null;
  dataUltimaSessao?: string | null;
  dataProxSessao?: string | null;
  unidade?: string | null;
  qtdeIngressosWeb?: string | null;
  categorias?: string | null;
  imagem?: string | null;
  posted?: number | null;
};

async function main() {
  const sqlite = openSqlite();
  const pg = openPg();
  try {
    await ensureSqlite(sqlite);
    await ensurePg(pg);
    const rows = await all<Row>(sqlite, 'SELECT * FROM events ORDER BY created_at ASC');
    logger.info({ count: rows.length }, 'Migrating events from SQLite to Postgres');
    let inserted = 0;
    for (const r of rows) {
      const ok = await insertPg(pg, {
        id: r.id,
        titulo: r.titulo ?? null,
        complemento: r.complemento ?? null,
        link: r.link ?? null,
        dataPrimeiraSessao: r.dataPrimeiraSessao ?? null,
        dataUltimaSessao: r.dataUltimaSessao ?? null,
        dataProxSessao: r.dataProxSessao ?? null,
        unidade: r.unidade ?? null,
        qtdeIngressosWeb: r.qtdeIngressosWeb ?? null,
        categorias: r.categorias ?? null,
        imagem: r.imagem ?? null,
      } as any);
      if (ok) inserted += 1;
      if (r.posted) {
        await markPostedPg(pg, r.id);
      }
    }
    logger.info({ inserted }, 'Migration completed');
  } catch (err) {
    logger.error({ err }, 'Migration failed');
    process.exitCode = 1;
  } finally {
    await closeSqlite(sqlite);
    await closePg(pg);
  }
}

main();
