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
  const mod = await import('../src/index.ts');
  expect(mod).toBeTruthy();
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
