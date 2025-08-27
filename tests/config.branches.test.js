describe('config branches', () => {
    test('DATABASE_PATH default and resolve', async() => {
        delete process.env.DATABASE_PATH;
        const mod = await
        import ('../src/config.js');
        expect(mod.DATABASE_PATH.endsWith('data/sesc.db')).toBe(true);
    });

    test('LOCAL_IDS trimming and default', async() => {
        delete process.env.LOCAL_IDS;
        const mod = await
        import ('../src/config.js');
        expect(typeof mod.LOCAL_IDS).toBe('string');
        expect(mod.LOCAL_IDS.length).toBeGreaterThan(0);
    });

    test('GRATUITO_PARAM and ONLINE_PARAM type check branches', async() => {
        delete process.env.GRATUITO;
        delete process.env.ONLINE;
        const mod1 = await
        import ('../src/config.js');
        expect(mod1.GRATUITO_PARAM).toBe('');
        expect(mod1.ONLINE_PARAM).toBe('');

        jest.resetModules();
        process.env.GRATUITO = '1';
        process.env.ONLINE = '0';
        const mod2 = await
        import ('../src/config.js');
        expect(mod2.GRATUITO_PARAM).toBe('1');
        expect(mod2.ONLINE_PARAM).toBe('0');
    });

    test('SKIP_POST_ON_FIRST_SYNC truthy/falsey parsing', async() => {
        jest.resetModules();
        delete process.env.SKIP_POST_ON_FIRST_SYNC;
        const mod1 = await
        import ('../src/config.js');
        expect(mod1.SKIP_POST_ON_FIRST_SYNC).toBe(true);

        jest.resetModules();
        process.env.SKIP_POST_ON_FIRST_SYNC = 'false';
        const mod2 = await
        import ('../src/config.js');
        expect(mod2.SKIP_POST_ON_FIRST_SYNC).toBe(false);
    });

    test('DATABASE_PATH env override is respected', async() => {
        jest.resetModules();
        process.env.DATABASE_PATH = './data-test/custom.db';
        const mod = await
        import ('../src/config.js');
        expect(mod.DATABASE_PATH.endsWith('data-test/custom.db')).toBe(true);
    });

    test('SESC_API_BASE env override is respected', async() => {
        jest.resetModules();
        process.env.SESC_API_BASE = 'https://example.com/api';
        const mod = await
        import ('../src/config.js');
        expect(mod.SESC_API_BASE).toBe('https://example.com/api');
    });

    test('LOCAL_IDS override trims whitespace', async() => {
        jest.resetModules();
        process.env.LOCAL_IDS = '  1,2,3  ';
        const mod = await
        import ('../src/config.js');
        expect(mod.LOCAL_IDS).toBe('1,2,3');
    });
});