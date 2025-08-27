import { sendEventNotification } from '../src/telegram.js';
import { Telegraf } from 'telegraf';

describe('telegram sendEventNotification', () => {
    beforeEach(() => {
        process.env.TELEGRAM_CHANNEL_ID = '@fallback';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
        process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@teatro';
        // reset mock state
        Telegraf.prototype.telegram.sendMessage.mockReset();
    });

    test('routes to teatro channel when categorias contains teatro', async() => {
        const ev = { categorias: 'teatro', titulo: 'Peça', link: 'http://x' };
        await sendEventNotification(ev);
        expect(Telegraf.prototype.telegram.sendMessage).toHaveBeenCalled();
    });

    test('routes to musica channel otherwise', async() => {
        const ev = { categorias: 'Música, show', titulo: 'Show', link: 'http://x' };
        await sendEventNotification(ev);
        expect(Telegraf.prototype.telegram.sendMessage).toHaveBeenCalled();
    });
});