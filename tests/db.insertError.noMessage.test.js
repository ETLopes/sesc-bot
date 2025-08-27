import { insertEvent } from '../src/db.js';

test('insertEvent rethrows when error has no message (covers message||\'\')', async() => {
    const fakeDb = {
        run() {
            throw {};
        },
    };
    await expect(insertEvent(fakeDb, { id: 7 })).rejects.toBeDefined();
});