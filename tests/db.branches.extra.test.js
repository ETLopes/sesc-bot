import { insertEvent } from '../src/db.js';

test('insertEvent returns false on SQLITE_CONSTRAINT error branch', async() => {
    const fakeDb = {
        run(_sql, _params, cb) {
            cb(new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: events.id'));
        },
    };
    await expect(insertEvent(fakeDb, { id: 1 })).resolves.toBe(false);
});