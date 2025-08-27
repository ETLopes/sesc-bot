describe('config import-time branches exhaustive', () => {
    test('TELEGRAM_BOT_TOKEN empty vs set', async() => {
        jest.resetModules();
        process.env.TELEGRAM_BOT_TOKEN = '';
        let mod = await
        import ('../src/config.js');
        expect(mod.TELEGRAM_BOT_TOKEN).toBe('');
        jest.resetModules();
        process.env.TELEGRAM_BOT_TOKEN = 't';
        mod = await
        import ('../src/config.js');
        expect(mod.TELEGRAM_BOT_TOKEN).toBe('t');
    });

    test('TELEGRAM channel IDs empty vs set', async() => {
        jest.resetModules();
        process.env.TELEGRAM_CHANNEL_ID = '';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
        process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
        let mod = await
        import ('../src/config.js');
        expect(mod.TELEGRAM_CHANNEL_ID).toBe('');
        expect(mod.TELEGRAM_CHANNEL_ID_MUSICA).toBe('');
        expect(mod.TELEGRAM_CHANNEL_ID_TEATRO).toBe('');
        jest.resetModules();
        process.env.TELEGRAM_CHANNEL_ID = '@a';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@m';
        process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@t';
        mod = await
        import ('../src/config.js');
        expect(mod.TELEGRAM_CHANNEL_ID).toBe('@a');
        expect(mod.TELEGRAM_CHANNEL_ID_MUSICA).toBe('@m');
        expect(mod.TELEGRAM_CHANNEL_ID_TEATRO).toBe('@t');
    });

    test('DEFAULT_CATEGORIA env vs default', async() => {
        jest.resetModules();
        delete process.env.CATEGORIA_DEFAULT;
        let mod = await
        import ('../src/config.js');
        expect(mod.DEFAULT_CATEGORIA).toBe('musica');
        jest.resetModules();
        process.env.CATEGORIA_DEFAULT = 'teatro';
        mod = await
        import ('../src/config.js');
        expect(mod.DEFAULT_CATEGORIA).toBe('teatro');
    });

    test('GRATUITO/ONLINE empty vs set', async() => {
        jest.resetModules();
        delete process.env.GRATUITO;
        delete process.env.ONLINE;
        let mod = await
        import ('../src/config.js');
        expect(mod.GRATUITO_PARAM).toBe('');
        expect(mod.ONLINE_PARAM).toBe('');
        jest.resetModules();
        process.env.GRATUITO = '1';
        process.env.ONLINE = '0';
        mod = await
        import ('../src/config.js');
        expect(mod.GRATUITO_PARAM).toBe('1');
        expect(mod.ONLINE_PARAM).toBe('0');
    });
});