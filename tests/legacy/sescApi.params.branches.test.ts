import _fetch from 'node-fetch';

test('fetchSescEvents reflects GRATUITO_PARAM and ONLINE_PARAM in URL', async() => {
    jest.resetModules();
    process.env.GRATUITO = '1';
    process.env.ONLINE = '0';
    const dataInicialIso = '2025-01-01';
    const dataFinalIso = '2026-01-01';
    const { buildUrl } = await
    import ('../src/sescApi.js');
    const url = buildUrl({ categoria: 'musica', page: 2, dataInicialIso, dataFinalIso });
    expect(url).toContain('gratuito=1');
    expect(url).toContain('online=0');
    expect(url).toContain('page=2');
})