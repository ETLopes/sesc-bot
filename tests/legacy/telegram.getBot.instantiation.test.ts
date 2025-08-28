describe('getBot instantiation and caching', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'TEST_TOKEN';
  });

  test('creates a new Telegraf instance when none exists and token is set', async () => {
    const telegram = await import('../../src/telegram');
    const bot = telegram.getBot();
    expect(bot).toBeTruthy();
    expect(typeof (bot as any).telegram.getMe).toBe('function');
  });

  test('returns cached instance on subsequent calls', async () => {
    const telegram = await import('../../src/telegram');
    const first = telegram.getBot();
    const second = telegram.getBot();
    expect(first).toBe(second);
  });

  test('returns null when token is missing', async () => {
    jest.resetModules();
    jest.doMock('../../src/config', () => ({
      __esModule: true,
      TELEGRAM_BOT_TOKEN: '',
      TELEGRAM_CHANNEL_ID: '',
      TELEGRAM_CHANNEL_ID_MUSICA: '',
      TELEGRAM_CHANNEL_ID_TEATRO: '',
    }));
    const telegram = await import('../../src/telegram');
    const bot = telegram.getBot();
    expect(bot).toBeNull();
  });
});
