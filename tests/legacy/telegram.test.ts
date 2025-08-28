import { jest } from '@jest/globals';
import { Telegraf } from 'telegraf';

describe('telegram sendEventNotification', () => {
    beforeEach(() => {
        process.env.TELEGRAM_BOT_TOKEN = '';
        process.env.TELEGRAM_CHANNEL_ID = '@fallback';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
        process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@teatro';
        Telegraf.prototype.telegram.sendMessage.mockReset();
    });

    test('routes to teatro channel when categorias contains teatro', async() => {
        const ev = { categorias: 'teatro', titulo: 'Peça', link: 'http://x' };
        jest.resetModules();
        const { sendEventNotification } = await
        import ('../src/telegram.js');
        await sendEventNotification(ev, { telegram: Telegraf.prototype.telegram });
        expect(Telegraf.prototype.telegram.sendMessage).toHaveBeenCalled();
        const [chat] = Telegraf.prototype.telegram.sendMessage.mock.calls[0];
        const { TELEGRAM_CHANNEL_ID_TEATRO } = await
        import ('../src/config.js');
        expect(chat).toBe(TELEGRAM_CHANNEL_ID_TEATRO || '@teatro');
    });

    test('routes to musica channel otherwise', async() => {
        const ev = { categorias: 'Música, show', titulo: 'Show', link: 'http://x' };
        jest.resetModules();
        const { sendEventNotification } = await
        import ('../src/telegram.js');
        await sendEventNotification(ev, { telegram: Telegraf.prototype.telegram });
        expect(Telegraf.prototype.telegram.sendMessage).toHaveBeenCalled();
        const [chat] = Telegraf.prototype.telegram.sendMessage.mock.calls[0];
        const { TELEGRAM_CHANNEL_ID_MUSICA } = await
        import ('../src/config.js');
        expect(chat).toBe(TELEGRAM_CHANNEL_ID_MUSICA || '@musica');
    });
});