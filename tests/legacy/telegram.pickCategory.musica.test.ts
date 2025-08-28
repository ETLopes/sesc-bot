test('sendNoNewEventsMessage routes to TELEGRAM_CHANNEL_ID_MUSICA when categoria=musica', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
    delete process.env.TELEGRAM_CHANNEL_ID_TEATRO;
    delete process.env.TELEGRAM_CHANNEL_ID;
    const { sendNoNewEventsMessage } = await
    import ('../src/telegram.js');
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendNoNewEventsMessage({ categoria: 'musica' }, injectedBot);
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith(
        '@musica',
        'Sem novos eventos', { disable_web_page_preview: true }
    );
});