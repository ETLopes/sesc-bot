// Aggregated tests for telegram (inlined, no legacy requires)
import { Telegraf } from 'telegraf';

describe('telegram sendEventNotification', () => {
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = '';
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@teatro';
    (Telegraf as any).prototype.telegram.sendMessage.mockReset();
  });

  test('routes to teatro channel when categorias contains teatro', async () => {
    const ev = { categorias: 'teatro', titulo: 'Peça', link: 'http://x' } as any;
    jest.resetModules();
    const { sendEventNotification } = await import('../src/telegram.js');
    await sendEventNotification(ev, { telegram: (Telegraf as any).prototype.telegram } as any);
    expect((Telegraf as any).prototype.telegram.sendMessage).toHaveBeenCalled();
    const [chat] = (Telegraf as any).prototype.telegram.sendMessage.mock.calls[0];
    const { TELEGRAM_CHANNEL_ID_TEATRO } = await import('../src/config.js');
    expect(chat).toBe(TELEGRAM_CHANNEL_ID_TEATRO || '@teatro');
  });

  test('routes to musica channel otherwise', async () => {
    const ev = { categorias: 'Música, show', titulo: 'Show', link: 'http://x' } as any;
    jest.resetModules();
    const { sendEventNotification } = await import('../src/telegram.js');
    await sendEventNotification(ev, { telegram: (Telegraf as any).prototype.telegram } as any);
    expect((Telegraf as any).prototype.telegram.sendMessage).toHaveBeenCalled();
    const [chat] = (Telegraf as any).prototype.telegram.sendMessage.mock.calls[0];
    const { TELEGRAM_CHANNEL_ID_MUSICA } = await import('../src/config.js');
    expect(chat).toBe(TELEGRAM_CHANNEL_ID_MUSICA || '@musica');
  });
});

test('sendEventNotification logs info on success', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = 'x';
  process.env.TELEGRAM_CHANNEL_ID = '@c';
  const { sendEventNotification } = await import('../src/telegram.js');
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  await sendEventNotification({ id: 10, titulo: 'ok' } as any, injectedBot);
  expect(injectedBot.telegram.sendMessage).toHaveBeenCalled();
});

test('sendNoNewEventsMessage logs info on success', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = 'x';
  process.env.TELEGRAM_CHANNEL_ID = '@c';
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  await sendNoNewEventsMessage({ categoria: 'x' } as any, injectedBot);
  expect(injectedBot.telegram.sendMessage).toHaveBeenCalled();
});

test('sendEventNotification title fallback and no optional fields', async () => {
  jest.resetModules();
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
  process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  const { sendEventNotification } = await import('../src/telegram.js');
  await sendEventNotification({ id: 1, titulo: null, link: 'http://x' } as any, injectedBot);
  const [, caption] = (injectedBot.telegram.sendMessage as any).mock.calls[0];
  expect(caption).toContain('Sem título');
});

test('sendEventNotification includes link and categorias and ingressos', async () => {
  jest.resetModules();
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
  process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  const { sendEventNotification } = await import('../src/telegram.js');
  await sendEventNotification(
    { id: 2, titulo: 'X', link: 'https://a', categorias: 'musica', qtdeIngressosWeb: 0 } as any,
    injectedBot,
  );
  const [, caption] = (injectedBot.telegram.sendMessage as any).mock.calls[0];
  expect(caption).toContain('🔗 https://a');
  expect(caption).toContain('Categorias: musica');
  expect(caption).toContain('Ingressos (web): 0');
});

test('sendEventNotification handles invalid date formatting gracefully', async () => {
  const fakeBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  const { sendEventNotification } = await import('../src/telegram.js');
  await sendEventNotification(
    { titulo: 'X', dataProxSessao: 'not-a-date', link: 'http://x' } as any,
    fakeBot,
  );
  const [_chat, text] = (fakeBot.telegram.sendMessage as any).mock.calls[0];
  expect(text).toMatch('not-a-date');
});

test('sendEventNotification logs error when telegram send fails', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = 'x';
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  const mod = await import('../src/telegram.js');
  const fakeBot = {
    telegram: { sendMessage: jest.fn().mockRejectedValue(new Error('fail')) },
  } as any;
  await expect(
    mod.sendEventNotification({ categorias: '', titulo: 'X', link: 'http://x' } as any, fakeBot),
  ).rejects.toThrow('fail');
});

test('sendNoNewEventsMessage uses fallback TELEGRAM_CHANNEL_ID when others missing', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = 'x';
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  delete process.env.TELEGRAM_CHANNEL_ID_MUSICA;
  delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  await sendNoNewEventsMessage(
    { categoria: 'unknown', message: 'Sem novos eventos' } as any,
    injectedBot,
  );
  expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith('@fallback', 'Sem novos eventos', {
    disable_web_page_preview: true,
  });
});

describe('telegram routing fallbacks', () => {
  beforeEach(() => {
    (Telegraf as any).prototype.telegram.sendMessage.mockReset();
  });

  test('skips when TELEGRAM_BOT_TOKEN missing', async () => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = '';
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    await jest.isolateModulesAsync(async () => {
      const { sendEventNotification } = await import('../src/telegram.js');
      await sendEventNotification({ categorias: '', titulo: 'X', link: 'http://x' } as any);
    });
    expect((Telegraf as any).prototype.telegram.sendMessage).not.toHaveBeenCalled();
  });
});

describe('telegram message format', () => {
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = '';
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
    (Telegraf as any).prototype.telegram.sendMessage.mockReset();
  });

  test('includes title, complemento, date (DD/MM/YYYY), unidade and link', async () => {
    const ev = {
      titulo: 'Show Legal',
      complemento: 'Sub legal',
      dataProxSessao: '2025-08-30T17:00',
      unidade: 'Consolação',
      categorias: 'Música',
      link: 'https://example.com',
    } as any;
    const { sendEventNotification } = await import('../src/telegram.js');
    await sendEventNotification(ev, { telegram: (Telegraf as any).prototype.telegram } as any);
    expect((Telegraf as any).prototype.telegram.sendMessage).toHaveBeenCalledTimes(1);
    const [_chat, text] = (Telegraf as any).prototype.telegram.sendMessage.mock.calls[0];
    expect(text).toMatch('Sesc SP');
    expect(text).toMatch('Show Legal');
    expect(text).toMatch('Sub legal');
    expect(text).toMatch('30/08/2025');
    expect(text).toMatch('Unidade: Consolação');
    expect(text).toMatch('https://example.com');
  });
});

test('caption includes all optional fields when present', async () => {
  const fakeBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  const { sendEventNotification } = await import('../src/telegram.js');
  await sendEventNotification(
    {
      titulo: 'Show',
      complemento: 'Sub',
      dataProxSessao: '2025-09-01T10:00',
      unidade: 'Consolação',
      qtdeIngressosWeb: 5,
      categorias: 'Música',
      link: 'http://x',
    } as any,
    fakeBot,
  );
  const [_chat, text] = (fakeBot.telegram.sendMessage as any).mock.calls[0];
  expect(text).toMatch('Sub');
  expect(text).toMatch('Ingressos (web): 5');
  expect(text).toMatch('Categorias: Música');
});

test('caption omits optional fields when absent', async () => {
  const fakeBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  const { sendEventNotification } = await import('../src/telegram.js');
  await sendEventNotification({ titulo: 'X', link: 'http://x' } as any, fakeBot);
  const [_chat, text] = (fakeBot.telegram.sendMessage as any).mock.calls[0];
  expect(text).not.toMatch('Ingressos (web)');
  expect(text).not.toMatch('Categorias:');
});

test('sendNoNewEventsMessage uses injected bot and channel pick', async () => {
  const fakeBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  await sendNoNewEventsMessage({ categoria: 'teatro' } as any, fakeBot);
  expect(fakeBot.telegram.sendMessage).toHaveBeenCalled();
});

describe('telegram routing category branches in no-new-events', () => {
  test('for teatro/musica covers category routing branches', async () => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@m';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@t';
    const { sendNoNewEventsMessage } = await import('../src/telegram.js');
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
    await sendNoNewEventsMessage({ categoria: 'teatro' } as any, injectedBot);
    await sendNoNewEventsMessage({ categoria: 'musica' } as any, injectedBot);
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith('@t', 'Sem novos eventos', {
      disable_web_page_preview: true,
    });
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith('@m', 'Sem novos eventos', {
      disable_web_page_preview: true,
    });
  });
});

test('sendNoNewEventsMessage early exit when no bot and no channel', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = '';
  process.env.TELEGRAM_CHANNEL_ID = '';
  process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
  process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  // no injected bot, so getBot() will return null and channel will be falsy
  await expect(sendNoNewEventsMessage({ categoria: 'musica' } as any)).resolves.toBeUndefined();
});

test('sendEventNotification exits early when no channel resolved', async () => {
  jest.resetModules();
  process.env.TELEGRAM_CHANNEL_ID = '';
  process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
  process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
  const mod = await import('../src/telegram.js');
  const fakeBot = { telegram: { sendMessage: jest.fn() } } as any;
  await mod.sendEventNotification(
    { categorias: 'musica', titulo: 'X', link: 'http://x' } as any,
    fakeBot,
  );
  expect(fakeBot.telegram.sendMessage).not.toHaveBeenCalled();
});

test('sendNoNewEventsMessage uses default message when not provided', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = 'x';
  process.env.TELEGRAM_CHANNEL_ID = '@c';
  delete process.env.TELEGRAM_CHANNEL_ID_MUSICA;
  delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  await sendNoNewEventsMessage({ categoria: 'musica' } as any, injectedBot);
  expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith(
    expect.any(String),
    'Sem novos eventos',
    { disable_web_page_preview: true },
  );
});

test('sendNoNewEventsMessage uses default param {} and empty categoria fallback', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = 'x';
  process.env.TELEGRAM_CHANNEL_ID = '@c';
  delete process.env.TELEGRAM_CHANNEL_ID_MUSICA;
  delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  await sendNoNewEventsMessage(undefined as any, injectedBot);
  expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith('@c', 'Sem novos eventos', {
    disable_web_page_preview: true,
  });
});

test('sendNoNewEventsMessage propagates error on send failure', async () => {
  const fakeBot = {
    telegram: { sendMessage: jest.fn().mockRejectedValue(new Error('nn-fail')) },
  } as any;
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  await expect(sendNoNewEventsMessage({ categoria: 'musica' } as any, fakeBot)).rejects.toThrow(
    'nn-fail',
  );
});

test('sendNoNewEventsMessage with empty categoria falls back to TELEGRAM_CHANNEL_ID', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = 'x';
  process.env.TELEGRAM_CHANNEL_ID = '@fallback';
  delete process.env.TELEGRAM_CHANNEL_ID_MUSICA;
  delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  await sendNoNewEventsMessage({ categoria: '' } as any, injectedBot);
  expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith('@fallback', 'Sem novos eventos', {
    disable_web_page_preview: true,
  });
});

test('sendNoNewEventsMessage routes to TELEGRAM_CHANNEL_ID_MUSICA when categoria=musica', async () => {
  jest.resetModules();
  process.env.TELEGRAM_BOT_TOKEN = 'x';
  process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
  delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
  delete process.env.TELEGRAM_CHANNEL_ID;
  const { sendNoNewEventsMessage } = await import('../src/telegram.js');
  const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } } as any;
  await sendNoNewEventsMessage({ categoria: 'musica' } as any, injectedBot);
  expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith('@musica', 'Sem novos eventos', {
    disable_web_page_preview: true,
  });
});

describe('getBot instantiation and caching', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'TEST_TOKEN';
  });

  test('creates a new Telegraf instance when none exists and token is set', async () => {
    const telegram = await import('../src/telegram');
    const bot = telegram.getBot();
    expect(bot).toBeTruthy();
    expect(typeof (bot as any).telegram.getMe).toBe('function');
  });

  test('returns cached instance on subsequent calls', async () => {
    const telegram = await import('../src/telegram');
    const first = telegram.getBot();
    const second = telegram.getBot();
    expect(first).toBe(second);
  });

  test('returns null when token is missing', async () => {
    jest.resetModules();
    jest.doMock('../src/config', () => ({
      __esModule: true,
      TELEGRAM_BOT_TOKEN: '',
      TELEGRAM_CHANNEL_ID: '',
      TELEGRAM_CHANNEL_ID_MUSICA: '',
      TELEGRAM_CHANNEL_ID_TEATRO: '',
    }));
    const telegram = await import('../src/telegram');
    const bot = telegram.getBot();
    expect(bot).toBeNull();
  });
});
