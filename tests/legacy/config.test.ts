describe('config defaults', () => {
    test('DEFAULT_CATEGORIA defaults to musica', async() => {
        const mod = await
        import ('../src/config.js');
        expect(mod.DEFAULT_CATEGORIA).toBe('musica');
    });
});