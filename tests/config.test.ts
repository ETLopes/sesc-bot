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

describe('config.branches.imports', () => {
  require('./legacy/config.branches.imports.test');
});

describe('config.branches.more', () => {
  require('./legacy/config.branches.more.test');
});

describe('config.branches', () => {
  require('./legacy/config.branches.test');
});

describe('config.categories.branches', () => {
  require('./legacy/config.categories.branches.test');
});

describe('config.defaults.branches', () => {
  require('./legacy/config.defaults.branches.test');
});

describe('config.override', () => {
  require('./legacy/config.override.test');
});

describe('config.pollInterval', () => {
  require('./legacy/config.pollInterval.test');
});

describe('config.defaults', () => {
  require('./legacy/config.test');
});
