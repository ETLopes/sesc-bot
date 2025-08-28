import { fetchSescEvents } from '../src/sescApi.js';
import fetch from 'node-fetch';

jest.mock('node-fetch');

test('fetchSescEvents builds URL with categoria override and paginates once', async() => {
    fetch.mockResolvedValueOnce({ ok: true, json: async() => ({ atividade: [] }) });
    await fetchSescEvents({ categoria: 'teatro' });
    expect(fetch).toHaveBeenCalledTimes(1);
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('categoria=teatro');
    expect(url).toContain('ppp=1000');
    expect(url).toContain('dinamico=true');
    expect(url).toContain('page=1');
});