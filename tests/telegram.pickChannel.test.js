describe('pickChannelForEvent', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test('teatro category routes to teatro channel', async() => {
        process.env.TELEGRAM_CHANNEL_ID = '@fallback';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
        process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@teatro';
        const { pickChannelForEvent } = await
        import ('../src/telegram.js');
        const ch = pickChannelForEvent({ categorias: 'Teatro' });
        expect(ch).toBe('@teatro');
    });

    test('musica default routes to musica channel', async() => {
        process.env.TELEGRAM_CHANNEL_ID = '@fallback';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '@musica';
        process.env.TELEGRAM_CHANNEL_ID_TEATRO = '@teatro';
        const { pickChannelForEvent } = await
        import ('../src/telegram.js');
        const ch = pickChannelForEvent({ categorias: 'Música' });
        expect(ch).toBe('@musica');
    });

    test('fallback channel used when others unset', async() => {
        process.env.TELEGRAM_CHANNEL_ID = '@fallback';
        process.env.TELEGRAM_CHANNEL_ID_MUSICA = '';
        process.env.TELEGRAM_CHANNEL_ID_TEATRO = '';
        const { pickChannelForEvent } = await
        import ('../src/telegram.js');
        const ch = pickChannelForEvent({ categorias: '' });
        expect(ch).toBe('@fallback');
    });
});