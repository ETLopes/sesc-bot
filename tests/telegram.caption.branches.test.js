import { jest } from '@jest/globals';
import { sendEventNotification } from '../src/telegram.js';

test('sendEventNotification title fallback and no optional fields', async() => {
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendEventNotification({ id: 1, titulo: null, link: 'http://x' }, injectedBot);
    const [, caption] = injectedBot.telegram.sendMessage.mock.calls[0];
    expect(caption).toContain('Sem título');
});

test('sendEventNotification includes link and categorias and ingressos', async() => {
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    const injectedBot = { telegram: { sendMessage: jest.fn().mockResolvedValue({}) } };
    await sendEventNotification({ id: 2, titulo: 'X', link: 'https://a', categorias: 'musica', qtdeIngressosWeb: 0 }, injectedBot);
    const [, caption] = injectedBot.telegram.sendMessage.mock.calls[0];
    expect(caption).toContain('🔗 https://a');
    expect(caption).toContain('Categorias: musica');
    expect(caption).toContain('Ingressos (web): 0');
})