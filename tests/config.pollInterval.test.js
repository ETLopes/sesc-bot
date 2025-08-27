test('POLL_INTERVAL_MINUTES env override is parsed as number', async() => {
    jest.resetModules();
    process.env.POLL_INTERVAL_MINUTES = '5';
    const mod = await
    import ('../src/config.js');
    expect(mod.POLL_INTERVAL_MINUTES).toBe(5);
});