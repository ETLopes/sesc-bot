// Covers branches in CATEGORIES resolution (env set vs falsy, trimming and empty entries)

describe('config CATEGORIES branches', () => {
    const originalEnv = {...process.env };

    afterEach(() => {
        process.env = {...originalEnv };
    });

    test('CATEGORIES env set (with spaces and empty items) is parsed and trimmed', async() => {
        jest.resetModules();
        process.env.CATEGORIA_DEFAULT = 'musica';
        process.env.CATEGORIES = '  musica ,  teatro ,  ,  ';
        const mod = await
        import ('../src/config.js');
        expect(mod.CATEGORIES).toEqual(['musica', 'teatro']);
    });

    test('CATEGORIES falsy (empty string) falls back to DEFAULT_CATEGORIA', async() => {
        jest.resetModules();
        process.env.CATEGORIA_DEFAULT = 'teatro';
        process.env.CATEGORIES = '';
        const mod = await
        import ('../src/config.js');
        expect(mod.CATEGORIES).toEqual(['teatro']);
    });
});