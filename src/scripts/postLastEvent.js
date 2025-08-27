import 'dotenv/config';
import { openDatabase, ensureSchema, closeDatabase } from '../db.js';
import { sendEventNotification } from '../telegram.js';
import logger from '../logger.js';

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
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
    await sendEventNotification(row);
    logger.info({ id: row.id }, 'Posted last event');
  } catch (err) {
    logger.error({ err }, 'Failed to post last event');
    process.exitCode = 1;
  } finally {
    await closeDatabase(db);
  }
}

main();
