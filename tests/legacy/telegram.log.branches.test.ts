test('sendNoNewEventsMessage for teatro/musica covers category routing branches', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@m';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@t';
    const { sendNoNewEventsMessage } = await
    import ('../src/telegram.js');
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendNoNewEventsMessage({ categoria: 'teatro' }, injectedBot);
    await sendNoNewEventsMessage({ categoria: 'musica' }, injectedBot);
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith(
        '@t',
        'Sem novos eventos', { disable_web_page_preview: true }
    );
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalledWith(
        '@m',
        'Sem novos eventos', { disable_web_page_preview: true }
    );
});