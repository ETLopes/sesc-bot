import { insertEvent } from '../src/db.js';

test('insertEvent rethrows non-constraint errors', async() => {
    const fakeDb = {
        run() {
            throw new Error('SQLITE_BUSY: database is locked');
        },
    };
    await expect(
        insertEvent(fakeDb, { id: 1, titulo: 'X' })
    ).rejects.toThrow(/locked/);
});