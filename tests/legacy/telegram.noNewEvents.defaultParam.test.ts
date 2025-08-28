test('sendNoNewEventsMessage uses default param {} and empty categoria fallback', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID = '@c';
    delete process.env.TELEGRAM_CHANNEL_ID_MUSICA;
    delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
    const { sendNoNewEventsMessage } = await
    import ('../src/telegram.js');
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendNoNewEventsMessage(undefined, injectedBot);
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith(
        '@c',
        'Sem novos eventos', { disable_web_page_preview: true }
    );
});