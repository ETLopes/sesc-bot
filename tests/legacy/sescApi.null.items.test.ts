import { jest } from '@jest/globals';

test('normalizeEvent returns null for invalid items and keeps valid ones', async() => {
    jest.resetModules();
    const { normalizeEvent } = await
    import ('../src/sescApi.js');
    const rawItems = [null, {}, { id: 1, link: '/x' }];
    const events = rawItems.map(normalizeEvent).filter(Boolean);
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe(1);
});