const fetch = jest.fn(async () => ({
  ok: true,
  json: async () => ({ atividade: [] }),
  text: async () => '',
  status: 200,
  statusText: 'OK',
}));

export default fetch;
