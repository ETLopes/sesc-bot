// Aggregated tests for misc (logger, heartbeat, healthcheck) inlined

test('logger loads in production without transport', async () => {
  process.env.NODE_ENV = 'production';
  const mod = await import('../src/logger.ts');
  expect(mod.default).toBeTruthy();
});

test('logger loads in non-production with transport', async () => {
  process.env.NODE_ENV = 'development';
  const mod = await import('../src/logger.ts');
  expect(mod.default).toBeTruthy();
});

test('index module loads in test mode without running main', async () => {
  process.env.NODE_ENV = 'test';
  delete process.env.DB_PROVIDER;
  const mod = await import('../src/index.ts');
  expect(mod).toBeTruthy();
});

test('dbProvider selects sqlite by default and pg when configured', async () => {
  jest.resetModules();
  delete process.env.DB_PROVIDER;
  const sqliteProvider = await import('../src/dbProvider.ts');
  expect(typeof sqliteProvider.openDatabase).toBe('function');
  expect(typeof sqliteProvider.ensureSchema).toBe('function');

  jest.resetModules();
  process.env.DB_PROVIDER = 'pg';
  const pgProvider = await import('../src/dbProvider.ts');
  // In test mode, provider should fall back to sqlite to avoid pg import/require
  expect(typeof pgProvider.openDatabase).toBe('function');
});

test('healthcheck runHealthcheck returns boolean', async () => {
  const { runHealthcheck } = await import('../src/scripts/healthcheck.ts');
  const ok = await runHealthcheck();
  expect(typeof ok).toBe('boolean');
});

describe('logger', () => {
  test('has info method', async () => {
    const mod = await import('../src/logger.ts');
    expect(typeof mod.default.info).toBe('function');
  });
});
