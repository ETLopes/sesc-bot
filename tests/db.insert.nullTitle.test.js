import _sqlite3 from 'sqlite3';
import { openDatabase, ensureSchema, insertEvent, closeDatabase } from '../src/db.js';

test('insertEvent handles null title (titulo null)', async() => {
    const db = openDatabase();
    await ensureSchema(db);
    const uniqueId = Math.floor(Date.now() / 1000); // reasonably unique per run
    const ok = await insertEvent(db, {
        id: uniqueId,
        titulo: null,
        complemento: null,
        link: 'http://x',
        dataPrimeiraSessao: null,
        dataUltimaSessao: null,
        dataProxSessao: null,
        unidade: null,
        qtdeIngressosWeb: null,
        categorias: null,
        imagem: null,
    });
    // Duplicate insert should return false due to constraint; first insert true
    expect(ok).toBe(true);
    const dup = await insertEvent(db, { id: uniqueId });
    expect(dup).toBe(false);
    await closeDatabase(db);
})