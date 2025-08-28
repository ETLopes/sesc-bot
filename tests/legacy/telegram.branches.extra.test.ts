test('sendEventNotification logs info on success', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID = '@c';
    const { sendEventNotification } = await
    import ('../src/telegram.js');
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendEventNotification({ id: 10, titulo: 'ok' }, injectedBot);
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalled();
});

test('sendNoNewEventsMessage logs info on success', async() => {
    jest.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID = '@c';
    const { sendNoNewEventsMessage } = await
    import ('../src/telegram.js');
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendNoNewEventsMessage({ categoria: 'x' }, injectedBot);
    expect(injectedBot.telegram.sendMessage).toHaveBeenCalled();
});