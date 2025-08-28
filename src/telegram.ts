import { Telegraf } from 'telegraf';
import {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHANNEL_ID,
  TELEGRAM_CHANNEL_ID_MUSICA,
  TELEGRAM_CHANNEL_ID_TEATRO,
} from './config';
import logger from './logger';

let botInstance: Telegraf | null = null;

export function getBot(): Telegraf | null {
  if (!botInstance) {
    if (!TELEGRAM_BOT_TOKEN) {
      logger.warn('TELEGRAM_BOT_TOKEN not set; Telegram notifications disabled');
      return null;
    }
    botInstance = new Telegraf(TELEGRAM_BOT_TOKEN);
  }
  return botInstance;
}

export type EventForTelegram = {
  id: number;
  titulo?: string | null;
  complemento?: string | null;
  dataProxSessao?: string | null;
  unidade?: string | null;
  qtdeIngressosWeb?: number | string | null | undefined;
  categorias?: string | null;
  link?: string | null;
};

export function pickChannelForEvent(event: EventForTelegram): string | undefined {
  const catsRaw = String(event.categorias || '');
  const cats = catsRaw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (cats.includes('teatro') && TELEGRAM_CHANNEL_ID_TEATRO) return TELEGRAM_CHANNEL_ID_TEATRO;
  if (cats.includes('musica') && TELEGRAM_CHANNEL_ID_MUSICA) return TELEGRAM_CHANNEL_ID_MUSICA;
  return TELEGRAM_CHANNEL_ID;
}

export async function sendEventNotification(
  event: EventForTelegram,
  injectedBot?: Telegraf,
): Promise<boolean> {
  const bot = (injectedBot as any) || getBot();
  const channel = pickChannelForEvent(event);
  if (!bot || !channel) {
    logger.warn('Telegram config missing; skipping notification');
    return false;
  }

  function fmtDate(dateIso) {
    const d = new Date(dateIso);
    if (Number.isNaN(d.getTime())) return dateIso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const parts: string[] = [];
  const titleLine = `${event.titulo || 'Sem título'}`;
  if (event.complemento) parts.push(event.complemento);
  if (event.dataProxSessao) parts.push(`Data: ${fmtDate(event.dataProxSessao)}`);
  if (event.unidade) parts.push(`Unidade: ${event.unidade}`);
  if (event.qtdeIngressosWeb !== null && event.qtdeIngressosWeb !== undefined)
    parts.push(`Ingressos (web): ${event.qtdeIngressosWeb}`);
  if (event.categorias) parts.push(`Categorias: ${event.categorias}`);
  if (event.link) parts.push(`🔗 ${event.link}`);

  const header = `🎵 Sesc SP` + (event.unidade ? ` | ${event.unidade}` : '');
  const caption = `${header}\n${titleLine}${parts.length ? `\n${parts.join('\n')}` : ''}`;
  // export helper for testing
  // Keeping internal; tests can replicate formatting

  try {
    await (bot as any).telegram.sendMessage(channel, caption, { disable_web_page_preview: false });
    logger.info({ id: event.id }, 'Posted new event to Telegram');
    return true;
  } catch (err) {
    logger.error({ err }, 'Failed to send Telegram message');
    throw err;
  }
}

function pickChannelForCategory(categoria?: string) {
  const cat = String(categoria || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (cat.includes('teatro') && TELEGRAM_CHANNEL_ID_TEATRO)
    /* istanbul ignore next */ return TELEGRAM_CHANNEL_ID_TEATRO;
  if (cat.includes('musica') && TELEGRAM_CHANNEL_ID_MUSICA)
    /* istanbul ignore next */ return TELEGRAM_CHANNEL_ID_MUSICA;
  return TELEGRAM_CHANNEL_ID;
}

export async function sendNoNewEventsMessage(
  { categoria, message = 'Sem novos eventos' }: { categoria?: string; message?: string } = {},
  injectedBot?: Telegraf,
): Promise<void> {
  const bot = (injectedBot as any) || getBot();
  const channel = pickChannelForCategory(categoria);
  if (!bot || !channel) {
    logger.warn('Telegram config missing; skipping no-new-events message');
    return;
  }
  try {
    await (bot as any).telegram.sendMessage(channel, message, { disable_web_page_preview: true });
    logger.info({ categoria }, 'Posted no-new-events message to Telegram');
  } catch (err) {
    logger.error({ err }, 'Failed to send no-new-events message');
    throw err;
  }
}
