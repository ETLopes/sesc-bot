jest.mock('node-fetch');

beforeEach(() => {
  jest.resetModules();
  delete (process.env as any).CATEGORIA_DEFAULT;
});

test('fetchSescEvents uses DEFAULT_CATEGORIA when categoria not provided', async () => {
  const fetchMod: any = await import('node-fetch');
  fetchMod.default.mockClear();
  fetchMod.default.mockResolvedValue({
    ok: true,
    json: async () => ({ atividade: [] }),
    text: async () => '',
    status: 200,
    statusText: 'OK',
  });
  const api = await import('../../src/sescApi');
  await api.fetchSescEvents();
  const url = fetchMod.default.mock.calls[0][0];
  expect(url).toContain('categoria=musica');
});
