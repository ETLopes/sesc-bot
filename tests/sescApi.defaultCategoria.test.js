import { fetchSescEvents } from '../src/sescApi.js';
import fetch from 'node-fetch';

jest.mock('node-fetch');

test('fetchSescEvents uses DEFAULT_CATEGORIA when categoria not provided', async() => {
    fetch.mockResolvedValueOnce({ ok: true, json: async() => ({ atividade: [] }) });
    await fetchSescEvents();
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('categoria=musica');
});