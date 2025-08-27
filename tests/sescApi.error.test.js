jest.mock('node-fetch', () => jest.fn());
import fetch from 'node-fetch';
import { fetchSescEvents } from '../src/sescApi.js';

test('fetchSescEvents throws on non-ok response', async() => {
    fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal',
        text: async() => 'boom',
    });
    await expect(fetchSescEvents({ categoria: 'musica' })).rejects.toThrow(/Failed to fetch/);
});