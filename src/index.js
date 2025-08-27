import 'dotenv/config';
import {
    openDatabase,
    ensureSchema,
    getExistingEventIds,
    insertEvent,
    closeDatabase,
} from './db.js';
import fs from 'fs';
import path from 'path';
import { fetchSescEvents } from './sescApi.js';
import { sendEventNotification, sendNoNewEventsMessage } from './telegram.js';
import { POLL_INTERVAL_MINUTES, SKIP_POST_ON_FIRST_SYNC, DEFAULT_CATEGORIA, CATEGORIES } from './config.js';
import logger from './logger.js';

function getHeartbeatPath() {
    const dbPath = process.env.DATABASE_PATH || 'data/sesc.db';
    const dir = path.dirname(dbPath);
    return path.resolve(dir, 'heartbeat.json');
}

function writeHeartbeat({ ok = true, newCount = 0 } = {}) {
    try {
        const hbPath = getHeartbeatPath();
        const dir = path.dirname(hbPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const payload = { ts: new Date().toISOString(), ok: Boolean(ok), newCount };
        fs.writeFileSync(hbPath, JSON.stringify(payload));
    } catch (e) {
        logger.warn({ e }, 'Failed to write heartbeat');
    }
}

async function syncOnce({ isFirstRun = false, categoria = DEFAULT_CATEGORIA } = {}) {
    const db = openDatabase();
    try {
        await ensureSchema(db);
        const existingIds = await getExistingEventIds(db);

        const events = await fetchSescEvents({ categoria });
        logger.info({ total: events.length }, 'Fetched SESC events');

        let newCount = 0;
        let warnedTelegramMissing = false;
        for (const ev of events) {
            if (existingIds.has(ev.id)) continue;
            const inserted = await insertEvent(db, ev);
            if (inserted) {
                newCount += 1;
                if (!isFirstRun || !SKIP_POST_ON_FIRST_SYNC) {
                    try {
                        await sendEventNotification(ev);
                    } catch (err) {
                        const errMsg = err && err.message ? String(err.message) : '';
                        if (!warnedTelegramMissing && errMsg.includes('not set')) {
                            warnedTelegramMissing = true;
                            logger.warn('Telegram credentials missing; notifications disabled');
                        } else {
                            logger.error({ err, id: ev.id }, 'Error posting event');
                        }
                    }
                }
            }
        }
        logger.info({ newCount }, 'Sync complete');
        writeHeartbeat({ ok: true, newCount });
        if (newCount === 0 && (!isFirstRun || !SKIP_POST_ON_FIRST_SYNC)) {
            try {
                await sendNoNewEventsMessage({ categoria });
            } catch (err) {
                logger.error({ err }, 'Failed to send no-new-events message');
            }
        }
    } catch (err) {
        logger.error({ err }, 'syncOnce failed');
        writeHeartbeat({ ok: false, newCount: 0 });
    } finally {
        await closeDatabase(db);
    }
}

async function main() {
    writeHeartbeat({ ok: true, newCount: 0 });
    for (const cat of CATEGORIES) {
        // run first sync per category
        // eslint-disable-next-line no-await-in-loop
        await syncOnce({ isFirstRun: true, categoria: cat });
    }

    const intervalMs = POLL_INTERVAL_MINUTES * 60 * 1000;
    logger.info({ everyMinutes: POLL_INTERVAL_MINUTES }, 'Starting scheduler');
    setInterval(() => {
        (async() => {
            for (const cat of CATEGORIES) {
                // eslint-disable-next-line no-await-in-loop
                await syncOnce({ isFirstRun: false, categoria: cat });
            }
        })().catch((err) => logger.error({ err }, 'Scheduled sync failed'));
    }, intervalMs);
}

if (process.env.NODE_ENV !== 'test') {
    main().catch((err) => {
        logger.error({ err }, 'Fatal error');
        process.exit(1);
    });
}