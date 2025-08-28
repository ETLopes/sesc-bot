import 'dotenv/config';
import { openDatabase, ensureSchema, closeDatabase } from '../db';
import { sendEventNotification } from '../telegram';
import logger from '../logger';

function get(db: any, sql: string, params: unknown[] = []): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    db.get(sql, params, (err: any, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function main() {
  const db = openDatabase();
  try {
    await ensureSchema(db);
    const row = await get(db, 'SELECT * FROM events ORDER BY created_at DESC LIMIT 1');
    if (!row) {
      logger.warn('No events in DB to post');
      return;
    }
    await sendEventNotification(row as any);
    logger.info({ id: row.id }, 'Posted last event');
  } catch (err) {
    logger.error({ err }, 'Failed to post last event');
    process.exitCode = 1;
  } finally {
    await closeDatabase(db);
  }
}

main();
