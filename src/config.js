import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '';
export const TELEGRAM_CHANNEL_ID_MUSICA = process.env.TELEGRAM_CHANNEL_ID_MUSICA || '';
export const TELEGRAM_CHANNEL_ID_TEATRO = process.env.TELEGRAM_CHANNEL_ID_TEATRO || '';

export const DATABASE_PATH = process.env.DATABASE_PATH ?
    path.resolve(process.env.DATABASE_PATH) :
    /* istanbul ignore next */ path.resolve('data/sesc.db');

export const SESC_API_BASE =
    process.env.SESC_API_BASE || /* istanbul ignore next */ 'https://www.sescsp.org.br/wp-json/wp/v1/atividades/filter';

export const POLL_INTERVAL_MINUTES = Number(process.env.POLL_INTERVAL_MINUTES || /* istanbul ignore next */ 60);

export const DEFAULT_CATEGORIA = process.env.CATEGORIA_DEFAULT || /* istanbul ignore next */ 'musica';
export const LOCAL_IDS = (
    process.env.LOCAL_IDS ||
    /* istanbul ignore next */
    '761,2,43,47,48,49,50,730,51,52,53,54,71,55,56,57,80,58,60,61,62,63,64,65,66'
).trim();
export const GRATUITO_PARAM = typeof process.env.GRATUITO === 'string' ? process.env.GRATUITO : /* istanbul ignore next */ '';
export const ONLINE_PARAM = typeof process.env.ONLINE === 'string' ? process.env.ONLINE : /* istanbul ignore next */ '';

export const SKIP_POST_ON_FIRST_SYNC =
    String(process.env.SKIP_POST_ON_FIRST_SYNC || /* istanbul ignore next */ 'true').toLowerCase() === 'true';