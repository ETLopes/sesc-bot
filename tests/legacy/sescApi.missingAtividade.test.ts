import { fetchSescEvents } from '../src/sescApi.js';
import fetch from 'node-fetch';

jest.mock('node-fetch', () => ({ __esModule: true, default: jest.fn() }));

test('fetchSescEvents handles missing atividade by treating as empty', async () => {
  (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
  const events = await fetchSescEvents({ categoria: 'musica' });
  expect(events).toEqual([]);
});
