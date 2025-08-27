import { sendEventNotification, sendNoNewEventsMessage } from '../src/telegram.js';

test('caption includes all optional fields when present', async() => {
    const fakeBot = { telegram: { sendMessage: jest.fn().mockResolvedValue() } };
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    await sendEventNotification({
        titulo: 'Show',
        complemento: 'Sub',
        dataProxSessao: '2025-09-01T10:00',
        unidade: 'Consolação',
        qtdeIngressosWeb: 5,
        categorias: 'Música',
        link: 'http://x',
    }, fakeBot);
    const [_chat, text] = fakeBot.telegram.sendMessage.mock.calls[0];
    expect(text).toMatch('Sub');
    expect(text).toMatch('Ingressos (web): 5');
    expect(text).toMatch('Categorias: Música');
});

test('caption omits optional fields when absent', async() => {
    const fakeBot = { telegram: { sendMessage: jest.fn().mockResolvedValue() } };
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    await sendEventNotification({ titulo: 'X', link: 'http://x' }, fakeBot);
    const [_chat, text] = fakeBot.telegram.sendMessage.mock.calls[0];
    expect(text).not.toMatch('Ingressos (web)');
    expect(text).not.toMatch('Categorias:');
});

test('sendNoNewEventsMessage uses injected bot and channel pick', async() => {
    const fakeBot = { telegram: { sendMessage: jest.fn().mockResolvedValue() } };
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    await sendNoNewEventsMessage({ categoria: 'teatro' }, fakeBot);
    expect(fakeBot.telegram.sendMessage).toHaveBeenCalled();
});