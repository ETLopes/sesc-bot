import 'dotenv/config';
import { openDatabase, ensureSchema, closeDatabase, markEventPosted } from '../dbProvider.js';
import { sendEventNotification } from '../telegram.js';
import logger from '../logger.js';

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
    const posted = await sendEventNotification(row as any);
    if (posted) {
      await markEventPosted(db, row.id);
      logger.info({ id: row.id }, 'Posted last event');
    } else {
      logger.info({ id: row.id }, 'Skipped posting last event (missing Telegram config/channel)');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to post last event');
    process.exitCode = 1;
  } finally {
    await closeDatabase(db);
  }
}

main();
