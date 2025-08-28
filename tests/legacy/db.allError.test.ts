import { getExistingEventIds } from '../src/db.js';

test('getExistingEventIds propagates all() error', async() => {
    const fakeDb = {
        all(_sql, _params, cb) {
            cb(new Error('boom'));
        },
    };
    await expect(getExistingEventIds(fakeDb)).rejects.toThrow('boom');
});