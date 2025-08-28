import { fetchSescEvents } from '../src/sescApi.js';
import fetch from 'node-fetch';

jest.mock('node-fetch');

describe('sescApi pagination', () => {
    test('stops when atividade is empty', async() => {
        // first page returns two items, second returns empty
        fetch
            .mockResolvedValueOnce({ ok: true, json: async() => ({ atividade: [{ id: 1 }, { id: 2 }] }) })
            .mockResolvedValueOnce({ ok: true, json: async() => ({ atividade: [] }) });
        const events = await fetchSescEvents({ categoria: 'musica' });
        expect(events.length).toBe(2);
    });
});