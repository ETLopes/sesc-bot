test('healthcheck runHealthcheck returns boolean', async() => {
    process.env.NODE_ENV = 'test';
    const mod = await
    import ('../src/scripts/healthcheck.js');
    expect(typeof mod.runHealthcheck).toBe('function');
    const ok = await mod.runHealthcheck();
    expect(typeof ok).toBe('boolean');
});