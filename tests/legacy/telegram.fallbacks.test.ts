import { Telegraf } from 'telegraf';

describe('telegram routing fallbacks', () => {
    beforeEach(() => {
        Telegraf.prototype.telegram.sendMessage.mockReset();
    });

    test('skips when TELEGRAM_BOT_TOKEN missing', async() => {
        jest.resetModules();
        process.env.TELEGRAM_BOT_TOKEN = '';
        process.env.TELEGRAM_CHANNEL_ID = '@fallback';
        await jest.isolateModulesAsync(async() => {
            const { sendEventNotification } = await
            import ('../src/telegram.js');
            await sendEventNotification({ categorias: '', titulo: 'X', link: 'http://x' });
        });
        expect(Telegraf.prototype.telegram.sendMessage).not.toHaveBeenCalled();
    });
});