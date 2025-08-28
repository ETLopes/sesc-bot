test('getBot returns null when TELEGRAM_BOT_TOKEN missing (config branch)', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = '';
    const { getBot } = await
    import ('../src/telegram.js');
    expect(getBot()).toBeNull();
});