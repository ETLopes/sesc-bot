import { fetchSescEvents } from '../src/sescApi.js';
import fetch from 'node-fetch';

jest.mock('node-fetch');

test('fetchSescEvents handles missing atividade by treating as empty', async() => {
    fetch.mockResolvedValueOnce({ ok: true, json: async() => ({}) });
    const events = await fetchSescEvents({ categoria: 'musica' });
    expect(events).toEqual([]);
});