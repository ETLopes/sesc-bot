import { jest } from '@jest/globals';

test('sendEventNotification handles invalid date formatting gracefully', async() => {
    const fakeBot = { telegram: { sendMessage: jest.fn().mockResolvedValue() } };
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    const { sendEventNotification } = await
    import ('../src/telegram.js');
    await sendEventNotification({ titulo: 'X', dataProxSessao: 'not-a-date', link: 'http://x' }, fakeBot);
    const [_chat, text] = fakeBot.telegram.sendMessage.mock.calls[0];
    expect(text).toMatch('not-a-date');
})