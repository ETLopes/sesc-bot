test('logger loads in production without transport', async() => {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    const mod = await
    import ('../src/logger.js');
    expect(typeof mod.default.info).toBe('function');
});

test('logger loads in non-production with transport', async() => {
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    const mod = await
    import ('../src/logger.js');
    expect(typeof mod.default.warn).toBe('function');
});