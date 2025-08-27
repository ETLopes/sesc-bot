test('sendNoNewEventsMessage uses default message when not provided', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID = '@c';
    delete process.env.TELEGRAM_CHANNEL_ID_MUSICA;
    delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
    const { sendNoNewEventsMessage } = await
    import ('../src/telegram.js');
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendNoNewEventsMessage({ categoria: 'musica' }, injectedBot);
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith(
        expect.any(String),
        'Sem novos eventos', { disable_web_page_preview: true }
    );
});