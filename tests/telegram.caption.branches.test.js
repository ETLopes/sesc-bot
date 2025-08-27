import { jest } from '@jest/globals';

test('sendEventNotification title fallback and no optional fields', async() => {
    jest.resetModules();
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    const { sendEventNotification } = await
    import ('../src/telegram.js');
    await sendEventNotification({ id: 1, titulo: null, link: 'http://x' }, injectedBot);
    const [, caption] = injectedBot.telegram.sendMessage.mock.calls[0];
    expect(caption).toContain('Sem título');
});

test('sendEventNotification includes link and categorias and ingressos', async() => {
    jest.resetModules();
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
    process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    const { sendEventNotification } = await
    import ('../src/telegram.js');
    await sendEventNotification({ id: 2, titulo: 'X', link: 'https://a', categorias: 'musica', qtdeIngressosWeb: 0 }, injectedBot);
    const [, caption] = injectedBot.telegram.sendMessage.mock.calls[0];
    expect(caption).toContain('🔗 https://a');
    expect(caption).toContain('Categorias: musica');
    expect(caption).toContain('Ingressos (web): 0');
})