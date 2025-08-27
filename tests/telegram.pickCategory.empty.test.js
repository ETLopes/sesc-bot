test('sendNoNewEventsMessage with empty categoria falls back to TELEGRAM_CHANNEL_ID', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    delete process.env.TELEGRAM_CHANNEL_ID_MUSICA;
    delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
    const { sendNoNewEventsMessage } = await
    import ('../src/telegram.js');
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendNoNewEventsMessage({ categoria: '' }, injectedBot);
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith(
        '@fallback',
        'Sem novos eventos', { disable_web_page_preview: true }
    );
});