test('sendNoNewEventsMessage returns early when missing bot/channel', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = '';
    process.env.TELEGRAM_CHANNEL_ID = '';
    delete process.env.TELEGRAM_CHANNEL_ID_MUSICA;
    delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
    const { sendNoNewEventsMessage } = await
    import ('../src/telegram.js');
    await expect(sendNoNewEventsMessage({ categoria: 'musica' })).resolves.toBeUndefined();
});