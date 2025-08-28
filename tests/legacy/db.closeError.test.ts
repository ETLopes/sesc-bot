import { closeDatabase } from '../src/db.js';

test('closeDatabase rejects on error', async() => {
    const db = { close: (cb) => cb(new Error('close-fail')) };
    await expect(closeDatabase(db)).rejects.toThrow('close-fail');
});