import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { Telegraf } from 'telegraf';
import {
    DATABASE_PATH,
    SESC_API_BASE,
    DEFAULT_CATEGORIA,
    LOCAL_IDS,
    GRATUITO_PARAM,
    ONLINE_PARAM,
    TELEGRAM_BOT_TOKEN,
} from '../config.js';

function ok(msg) {
    console.log(`OK: ${msg}`);
}

function fail(msg) {
    console.error(`FAIL: ${msg}`);
}

async function checkDbWritable() {
    try {
        const dir = path.dirname(DATABASE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.accessSync(dir, fs.constants.W_OK);
        ok('DB directory writable');
        return true;
    } catch (e) {
        fail(`DB dir not writable: ${e.message}`);
        return false;
    }
}

function buildUrlForPage(page) {
    const params = new URLSearchParams();
    params.set('local', LOCAL_IDS);
    params.set('categoria', DEFAULT_CATEGORIA);
    params.set('gratuito', GRATUITO_PARAM);
    params.set('online', ONLINE_PARAM);
    // Minimal dates: rely on API default if allowed; include required flags
    params.set('tipo', 'atividade');
    params.set('dinamico', 'true');
    params.set('ppp', '1');
    params.set('page', String(page));
    return `${SESC_API_BASE}?${params.toString()}`;
}

async function checkSescApi() {
    try {
        const url = buildUrlForPage(1);
        const res = await fetch(url, { method: 'GET', headers: { accept: 'application/json' } });
        if (!res.ok) {
            fail(`SESC API HTTP ${res.status}`);
            return false;
        }
        await res.json();
        ok('SESC API reachable');
        return true;
    } catch (e) {
        fail(`SESC API error: ${e.message}`);
        return false;
    }
}

async function checkTelegram() {
    if (!TELEGRAM_BOT_TOKEN) {
        ok('Telegram optional: token not set');
        return true;
    }
    try {
        const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
        const me = await bot.telegram.getMe();
        if (me && me.username) {
            ok(`Telegram bot ok: @${me.username}`);
            return true;
        }
        fail('Telegram getMe returned no username');
        return false;
    } catch (e) {
        fail(`Telegram error: ${e.message}`);
        return false;
    }
}

export async function runHealthcheck() {
    const results = await Promise.all([checkDbWritable(), checkSescApi(), checkTelegram()]);
    const healthy = results.every(Boolean);
    return healthy;
}

if (process.env.NODE_ENV !== 'test') {
    runHealthcheck().then((healthy) => process.exit(healthy ? 0 : 1));
}