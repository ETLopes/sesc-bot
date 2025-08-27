import { sendEventNotification } from '../src/telegram.js';

test('sendEventNotification title fallback and no optional fields', async() => {
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID = '@chan';
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendEventNotification({ id: 1, titulo: null }, injectedBot);
    const [, caption] = injectedBot.telegram.sendMessage.mock.calls[0];
    expect(caption).toContain('Sem título');
});

test('sendEventNotification includes link and categorias and ingressos', async() => {
    process.env.TELEGRAM_BOT_TOKEN = 'x';
    process.env.TELEGRAM_CHANNEL_ID = '@chan';
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendEventNotification({
        id: 2,
        titulo: 't',
        link: 'https://a',
        categorias: 'musica',
        qtdeIngressosWeb: 0,
    }, injectedBot);
    const [, caption] = injectedBot.telegram.sendMessage.mock.calls[0];
    expect(caption).toContain('🔗 https://a');
    expect(caption).toContain('Categorias: musica');
    expect(caption).toContain('Ingressos (web): 0');
});