import fs from 'fs';
import path from 'path';
import { openDatabase, ensureSchema, insertEvent, closeDatabase } from '../src/db.js';

describe('db negative cases', () => {
    const tmpDir = path.resolve('./data-test');
    const tmpDb = path.join(tmpDir, 'test2.db');

    beforeAll(() => {
        process.env.DATABASE_PATH = tmpDb;
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb);
    });

    test('duplicate insert returns false', async() => {
        const db = openDatabase();
        await ensureSchema(db);
        const event = {
            id: 7,
            titulo: 'Dup',
            complemento: null,
            link: 'http://x',
            dataPrimeiraSessao: null,
            dataUltimaSessao: null,
            dataProxSessao: null,
            unidade: 'Unit',
            qtdeIngressosWeb: null,
            categorias: null,
            imagem: null,
        };
        const ok1 = await insertEvent(db, event);
        const ok2 = await insertEvent(db, event);
        expect(ok1).toBe(true);
        expect(ok2).toBe(false);
        await closeDatabase(db);
    });
});