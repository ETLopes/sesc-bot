import { sendNoNewEventsMessage } from '../src/telegram.js';

test('sendNoNewEventsMessage propagates error on send failure', async() => {
    const fakeBot = { telegram: { sendMessage: jest.fn().mockRejectedValue(new Error('nn-fail')) } };
    process.env.TELEGRAM_CHANNEL_ID = '@fallback';
    await expect(sendNoNewEventsMessage({ categoria: 'musica' }, fakeBot)).rejects.toThrow('nn-fail');
});