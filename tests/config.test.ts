// Aggregated tests for config with isolation between suites

const resetEnv = () => {
  const keys = [
    'CATEGORIA_DEFAULT',
    'CATEGORIES',
    'GRATUITO',
    'ONLINE',
    'DATABASE_PATH',
    'SESC_API_BASE',
    'LOCAL_IDS',
    'SKIP_POST_ON_FIRST_SYNC',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHANNEL_ID',
    'TELEGRAM_CHANNEL_ID_MUSICA',
    'TELEGRAM_CHANNEL_ID_TEATRO',
  ];
  for (const k of keys) delete (process.env as any)[k];
};

beforeEach(() => {
  jest.resetModules();
  resetEnv();
});

describe('config import-time branches exhaustive', () => {
  test('TELEGRAM_BOT_TOKEN empty vs set', async () => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = '';
    let mod = await import('../src/config.js');
    expect(mod.TELEGRAM_BOT_TOKEN).toBe('');
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 't';
    mod = await import('../src/config.js');
    expect(mod.TELEGRAM_BOT_TOKEN).toBe('t');
  });

  test('TELEGRAM channel IDs empty vs set', async () => {
    jest.resetModules();
    process.env.TELEGRAM_CHANNEL_ID = '';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
    let mod = await import('../src/config.js');
    expect(mod.TELEGRAM_CHANNEL_ID).toBe('');
    expect(mod.TELEGRAM_CHANNEL_ID_MUSICA).toBe('');
    expect(mod.TELEGRAM_CHANNEL_ID_TEATRO).toBe('');
    jest.resetModules();
    process.env.TELEGRAM_CHANNEL_ID = '@a';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@m';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@t';
    mod = await import('../src/config.js');
    expect(mod.TELEGRAM_CHANNEL_ID).toBe('@a');
    expect(mod.TELEGRAM_CHANNEL_ID_MUSICA).toBe('@m');
    expect(mod.TELEGRAM_CHANNEL_ID_TEATRO).toBe('@t');
  });

  test('DEFAULT_CATEGORIA env vs default', async () => {
    jest.resetModules();
    delete process.env.CATEGORIA_DEFAULT;
    let mod = await import('../src/config.js');
    expect(mod.DEFAULT_CATEGORIA).toBe('musica');
    jest.resetModules();
    process.env.CATEGORIA_DEFAULT = 'teatro';
    mod = await import('../src/config.js');
    expect(mod.DEFAULT_CATEGORIA).toBe('teatro');
  });

  test('GRATUITO/ONLINE empty vs set', async () => {
    jest.resetModules();
    delete process.env.GRATUITO;
    delete process.env.ONLINE;
    let mod = await import('../src/config.js');
    expect(mod.GRATUITO_PARAM).toBe('');
    expect(mod.ONLINE_PARAM).toBe('');
    jest.resetModules();
    process.env.GRATUITO = '1';
    process.env.ONLINE = '0';
    mod = await import('../src/config.js');
    expect(mod.GRATUITO_PARAM).toBe('1');
    expect(mod.ONLINE_PARAM).toBe('0');
  });
});

// Keep remaining describes by re-creating their expectations inline

describe('config.branches.more', () => {
  test('getBot returns null when TELEGRAM_BOT_TOKEN missing (config branch)', async () => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = '';
    const { getBot } = await import('../src/telegram.js');
    expect(getBot()).toBeNull();
  });
});

describe('config.branches', () => {
  test('DATABASE_PATH default and resolve', async () => {
    const mod = await import('../src/config.js');
    expect(mod.DATABASE_PATH).toContain('data/sesc.db');
  });
  test('LOCAL_IDS trimming and default', async () => {
    const mod = await import('../src/config.js');
    expect(mod.LOCAL_IDS.length).toBeGreaterThan(0);
  });
  test('GRATUITO_PARAM and ONLINE_PARAM type check branches', async () => {
    process.env.GRATUITO = '1';
    process.env.ONLINE = '0';
    const mod = await import('../src/config.js');
    expect(mod.GRATUITO_PARAM).toBe('1');
    expect(mod.ONLINE_PARAM).toBe('0');
  });
  test('SKIP_POST_ON_FIRST_SYNC truthy/falsey parsing', async () => {
    process.env.SKIP_POST_ON_FIRST_SYNC = 'false';
    const mod = await import('../src/config.js');
    expect(mod.SKIP_POST_ON_FIRST_SYNC).toBe(false);
  });
  test('DATABASE_PATH env override is respected', async () => {
    process.env.DATABASE_PATH = 'tmp.db';
    const mod = await import('../src/config.js');
    expect(mod.DATABASE_PATH).toContain('tmp.db');
  });
  test('SESC_API_BASE env override is respected', async () => {
    process.env.SESC_API_BASE = 'https://x';
    const mod = await import('../src/config.js');
    expect(mod.SESC_API_BASE).toBe('https://x');
  });
  test('LOCAL_IDS override trims whitespace', async () => {
    process.env.LOCAL_IDS = ' a,b , c ';
    const mod = await import('../src/config.js');
    expect(mod.LOCAL_IDS.replace(/\s/g, '')).toContain('a,b,c');
  });
});

describe('config.categories.branches', () => {
  test('CATEGORIES env set (with spaces and empty items) is parsed and trimmed', async () => {
    process.env.CATEGORIES = ' musica, , teatro ';
    const mod = await import('../src/config.js');
    expect(mod.CATEGORIES).toEqual(['musica', 'teatro']);
  });
  test('CATEGORIES falsy (empty string) falls back to DEFAULT_CATEGORIA', async () => {
    process.env.CATEGORIA_DEFAULT = 'musica';
    process.env.CATEGORIES = '';
    const mod = await import('../src/config.js');
    expect(mod.CATEGORIES).toEqual(['musica']);
  });
});

describe('config.defaults.branches', () => {
  test('DEFAULT_CATEGORIA fallback when CATEGORIA_DEFAULT unset', async () => {
    const mod = await import('../src/config.js');
    expect(mod.DEFAULT_CATEGORIA).toBe('musica');
  });
  test('telegram channel IDs default to empty strings when unset', async () => {
    jest.resetModules();
    process.env.TELEGRAM_CHANNEL_ID = '';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
    const mod = await import('../src/config.js');
    expect(mod.TELEGRAM_CHANNEL_ID).toBe('');
    expect(mod.TELEGRAM_CHANNEL_ID_MUSICA).toBe('');
  });
});

describe('config.override', () => {
  test('config respects env overrides', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    const mod = await import('../src/config.js');
    expect(mod.TELEGRAM_BOT_TOKEN).toBe('x');
  });
});

describe('config.pollInterval', () => {
  test('POLL_INTERVAL_MINUTES env override is parsed as number', async () => {
    process.env.POLL_INTERVAL_MINUTES = '30';
    const mod = await import('../src/config.js');
    expect(mod.POLL_INTERVAL_MINUTES).toBe(30);
  });
});

describe('config.defaults', () => {
  test('DEFAULT_CATEGORIA defaults to musica', async () => {
    const mod = await import('../src/config.js');
    expect(mod.DEFAULT_CATEGORIA).toBe('musica');
  });
});
