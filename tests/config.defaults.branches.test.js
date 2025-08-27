describe('config default branches', () => {
    test('DEFAULT_CATEGORIA fallback when CATEGORIA_DEFAULT unset', async() => {
        jest.resetModules();
        delete process.env.CATEGORIA_DEFAULT;
        const mod = await
        import ('../src/config.js');
        expect(mod.DEFAULT_CATEGORIA).toBe('musica');
    });

    test('telegram channel IDs default to empty strings when unset', async() => {
        jest.resetModules();
        process.env.TELEGRAM_CHANNEL_ID = '';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
        process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
        const mod = await
        import ('../src/config.js');
        expect(mod.TELEGRAM_CHANNEL_ID).toBe('');
        expect(mod.TELEGRAM_CHANNEL_ID_MUSICA).toBe('');
        expect(mod.TELEGRAM_CHANNEL_ID_TEATRO).toBe('');
    });
});