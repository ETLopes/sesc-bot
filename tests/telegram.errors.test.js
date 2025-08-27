test('sendEventNotification logs error when telegram send fails', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    const mod = await
    import ('../src/telegram.js');
    const fakeBot = {
        telegram: { sendMessage: jest.fn().mockRejectedValue(new Error('fail')) },
    };
    await expect(
        mod.sendEventNotification({ categorias: '', titulo: 'X', link: 'http://x' }, fakeBot)
    ).rejects.toThrow('fail');
});