jest.mock('node-fetch', () => ({ __esModule: true, default: jest.fn() }));
import fetch from 'node-fetch';
import { fetchSescEvents } from '../src/sescApi.js';

test('fetchSescEvents throws on non-ok response', async () => {
  (fetch as any).mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: 'Internal',
    text: async () => 'boom',
  });
  await expect(fetchSescEvents({ categoria: 'musica' })).rejects.toThrow(/Failed to fetch/);
});
