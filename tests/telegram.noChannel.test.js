import { sendEventNotification } from '../src/telegram.js';

test('sendEventNotification exits early when no channel resolved', async() => {
    jest.resetModules();
    process.env.TELEGRAM_CHANNEL_ID = '';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
    const mod = await
    import ('../src/telegram.js');
    const fakeBot = { telegram: { sendMessage: jest.fn() } };
    await mod.sendEventNotification({ categorias: 'musica', titulo: 'X', link: 'http://x' }, fakeBot);
    expect(fakeBot.telegram.sendMessage).not.toHaveBeenCalled();
});