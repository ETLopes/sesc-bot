test('config respects env overrides', async() => {
    process.env.CATEGORIA_DEFAULT = 'teatro';
    process.env.GRATUITO = 'sim';
    process.env.ONLINE = 'nao';
    process.env.SKIP_POST_ON_FIRST_SYNC = 'false';
    const mod = await
    import ('../src/config.js');
    expect(mod.DEFAULT_CATEGORIA).toBe('teatro');
    expect(mod.GRATUITO_PARAM).toBe('sim');
    expect(mod.ONLINE_PARAM).toBe('nao');
    expect(mod.SKIP_POST_ON_FIRST_SYNC).toBe(false);
});