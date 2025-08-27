import fetch from 'node-fetch';

jest.mock('node-fetch');

test('buildUrl uses DEFAULT_CATEGORIA when categoria falsy', async() => {
    jest.resetModules();
    const { default: fetchMock } = await
    import ('node-fetch');
    const { fetchSescEvents } = await
    import ('../src/sescApi.js');
    fetchMock.mockResolvedValueOnce({ ok: true, json: async() => ({ atividade: [] }) });
    await fetchSescEvents({ categoria: '' });
    const url1 = fetchMock.mock.calls[0][0];
    expect(url1).toContain('categoria=musica');

    fetchMock.mockReset();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async() => ({ atividade: [] }) });
    await fetchSescEvents({ categoria: undefined });
    const url2 = fetchMock.mock.calls[0][0];
    expect(url2).toContain('categoria=musica');
});