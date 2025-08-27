import fetch from 'node-fetch';

jest.mock('node-fetch');

test('fetchSescEvents reflects GRATUITO_PARAM and ONLINE_PARAM in URL', async() => {
    jest.resetModules();
    process.env.GRATUITO = 'sim';
    process.env.ONLINE = 'nao';
    const { default: fetchMock } = await
    import ('node-fetch');
    fetchMock.mockResolvedValueOnce({ ok: true, json: async() => ({ atividade: [] }) });
    const { fetchSescEvents: fetchFn } = await
    import ('../src/sescApi.js');
    await fetchFn({ categoria: 'musica' });
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('gratuito=sim');
    expect(url).toContain('online=nao');
});