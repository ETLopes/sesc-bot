import fs from 'fs';
import path from 'path';
import { openDatabase, ensureSchema, insertEvent, closeDatabase } from '../src/db.js';

describe('db schema and inserts', () => {
    const tmpDir = path.resolve('./data-test');
    const tmpDb = path.join(tmpDir, 'test.db');

    beforeAll(() => {
        process.env.DATABASE_PATH = tmpDb;
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb);
    });

    afterAll(() => {
        try { if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb); } catch {}
    });

    test('ensureSchema and insertEvent', async() => {
        const db = openDatabase();
        await ensureSchema(db);
        const ok = await insertEvent(db, {
            id: 1,
            titulo: 'Teste',
            complemento: 'Sub',
            link: 'http://x',
            dataPrimeiraSessao: null,
            dataUltimaSessao: null,
            dataProxSessao: null,
            unidade: 'Santo André',
            qtdeIngressosWeb: '5',
            categorias: 'Música',
            imagem: null,
        });
        expect(ok).toBe(true);
        await closeDatabase(db);
    });
});