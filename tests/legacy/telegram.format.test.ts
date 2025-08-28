import { jest } from '@jest/globals';
import { Telegraf } from 'telegraf';

describe('telegram message format', () => {
    beforeEach(() => {
        process.env.TELEGRAM_BOT_TOKEN = ''; // ensure getBot returns null path
        process.env.TELEGRAM_CHANNEL_ID = '@fallback';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
        Telegraf.prototype.telegram.sendMessage.mockReset();
    });

    test('includes title, complemento, date (DD/MM/YYYY), unidade and link', async() => {
        const ev = {
            titulo: 'Show Legal',
            complemento: 'Sub legal',
            dataProxSessao: '2025-08-30T17:00',
            unidade: 'Consolação',
            categorias: 'Música',
            link: 'https://example.com',
        };
        const { sendEventNotification } = await
        import ('../src/telegram.js');
        await sendEventNotification(ev, { telegram: Telegraf.prototype.telegram });
        expect(Telegraf.prototype.telegram.sendMessage).toHaveBeenCalledTimes(1);
        const [_chat, text] = Telegraf.prototype.telegram.sendMessage.mock.calls[0];
        expect(text).toMatch('Sesc SP');
        expect(text).toMatch('Show Legal');
        expect(text).toMatch('Sub legal');
        expect(text).toMatch('30/08/2025');
        expect(text).toMatch('Unidade: Consolação');
        expect(text).toMatch('https://example.com');
    });
});