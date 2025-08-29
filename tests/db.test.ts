// Aggregated tests for db (inlined)
import fs from 'fs';
import os from 'os';
import path from 'path';

test('getExistingEventIds propagates all() error', async () => {
  const { getExistingEventIds } = await import('../src/db.js');
  const fakeDb = {
    all(_sql: any, _params: any, cb: any) {
      cb(new Error('boom'));
    },
  } as any;
  await expect(getExistingEventIds(fakeDb)).rejects.toThrow('boom');
});

test('insertEvent returns false on SQLITE_CONSTRAINT error branch', async () => {
  const { insertEvent } = await import('../src/db.js');
  const fakeDb = {
    run(_sql: any, _params: any, cb: any) {
      cb(new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: events.id'));
    },
  } as any;
  await expect(insertEvent(fakeDb, { id: 1 } as any)).resolves.toBe(false);
});

test('closeDatabase rejects on error', async () => {
  const { closeDatabase } = await import('../src/db.js');
  const fakeDb = {
    close(cb: any) {
      cb(new Error('x'));
    },
  } as any;
  await expect(closeDatabase(fakeDb)).rejects.toThrow('x');
});

test('openDatabase creates directory if missing', async () => {
  const mod = await import('../src/db.js');
  const tmpDir = path.join(os.tmpdir(), `sesc-test-${Date.now()}`);
  const dbFile = path.join(tmpDir, 'db.sqlite');
  expect(fs.existsSync(tmpDir)).toBe(false);
  process.env.DATABASE_PATH = dbFile;
  const db = await mod.openDatabase();
  expect(db).toBeTruthy();
  expect(fs.existsSync(tmpDir)).toBe(true);
});

test('getExistingEventIds returns inserted IDs', async () => {
  const mod = await import('../src/db.js');
  process.env.DATABASE_PATH = ':memory:';
  const db = await mod.openDatabase();
  await mod.ensureSchema(db);
  await mod.insertEvent(db, { id: 1, titulo: 'a' } as any);
  await mod.insertEvent(db, { id: 2, titulo: 'b' } as any);
  const ids = await mod.getExistingEventIds(db);
  expect(Array.from(ids)).toEqual([1, 2]);
});

test('insertEvent handles null title (titulo null)', async () => {
  const mod = await import('../src/db.js');
  const db = await mod.openDatabase(':memory:');
  await mod.ensureSchema(db);
  await expect(mod.insertEvent(db, { id: 3, titulo: null } as any)).resolves.toBe(true);
});

test('insertEvent coerces qtdeIngressosWeb to string when provided', async () => {
  const mod = await import('../src/db.js');
  process.env.DATABASE_PATH = ':memory:';
  const db = await mod.openDatabase();
  await mod.ensureSchema(db);
  await expect(
    mod.insertEvent(db, { id: 33, titulo: 't', qtdeIngressosWeb: 5 } as any),
  ).resolves.toBe(true);
});

test("insertEvent rethrows when error has no message (covers message||'')", async () => {
  const { insertEvent } = await import('../src/db.js');
  const fakeDb = {
    run(_sql: any, _params: any, cb: any) {
      cb(new Error(''));
    },
  } as any;
  await expect(insertEvent(fakeDb, { id: 5 } as any)).rejects.toThrow();
});

test('insertEvent rethrows non-constraint errors', async () => {
  const { insertEvent } = await import('../src/db.js');
  const fakeDb = {
    run(_sql: any, _params: any, cb: any) {
      cb(new Error('other'));
    },
  } as any;
  await expect(insertEvent(fakeDb, { id: 6 } as any)).rejects.toThrow('other');
});

test('ensureSchema migrates missing columns', async () => {
  const mod = await import('../src/db.js');
  process.env.DATABASE_PATH = ':memory:';
  const db = await mod.openDatabase();
  // create legacy table missing 'complemento' and 'qtdeIngressosWeb'
  await new Promise<void>((resolve, reject) =>
    (db as any).run(
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY,
        titulo TEXT,
        link TEXT,
        dataPrimeiraSessao TEXT,
        dataUltimaSessao TEXT,
        dataProxSessao TEXT,
        unidade TEXT,
        categorias TEXT,
        imagem TEXT,
        created_at TEXT,
        updated_at TEXT
      )`,
      (err: any) => (err ? reject(err) : resolve()),
    ),
  );
  await mod.ensureSchema(db);
  await expect(mod.insertEvent(db, { id: 7, titulo: 't' } as any)).resolves.toBe(true);
});

test('openDatabase uses env DATABASE_PATH', async () => {
  const mod = await import('../src/db.js');
  process.env.DATABASE_PATH = ':memory:';
  const db = await mod.openDatabase(process.env.DATABASE_PATH as string);
  expect(db).toBeTruthy();
});

test('openDatabase uses default path when env not set', async () => {
  const mod = await import('../src/db.js');
  delete process.env.DATABASE_PATH;
  const db = await mod.openDatabase(':memory:');
  expect(db).toBeTruthy();
});

describe('db negative cases', () => {
  test('duplicate insert returns false', async () => {
    const mod = await import('../src/db.js');
    process.env.DATABASE_PATH = ':memory:';
    const db = await mod.openDatabase();
    await mod.ensureSchema(db);
    await expect(mod.insertEvent(db, { id: 11, titulo: 'x' } as any)).resolves.toBe(true);
    await expect(mod.insertEvent(db, { id: 11, titulo: 'x' } as any)).resolves.toBe(false);
  });
});

describe('db schema and inserts', () => {
  test('ensureSchema and insertEvent', async () => {
    const mod = await import('../src/db.js');
    process.env.DATABASE_PATH = ':memory:';
    const db = await mod.openDatabase();
    await mod.ensureSchema(db);
    await expect(mod.insertEvent(db, { id: 22, titulo: 'ok' } as any)).resolves.toBe(true);
  });
});

test('closeDatabase resolves on success', async () => {
  const { openDatabase, closeDatabase } = await import('../src/db.js');
  process.env.DATABASE_PATH = ':memory:';
  const db = await openDatabase();
  await expect(closeDatabase(db)).resolves.toBeUndefined();
});

describe('posted backlog helpers', () => {
  test('getUnpostedEvents returns only unposted and markEventPosted updates record', async () => {
    const mod = await import('../src/db.js');
    process.env.DATABASE_PATH = ':memory:';
    const db = await mod.openDatabase();
    await mod.ensureSchema(db);
    await mod.insertEvent(db, { id: 101, titulo: 'a' } as any);
    await mod.insertEvent(db, { id: 102, titulo: 'b' } as any);
    const before = await mod.getUnpostedEvents(db);
    expect(before.map((e: any) => e.id)).toEqual([101, 102]);
    await mod.markEventPosted(db, 101);
    const after = await mod.getUnpostedEvents(db);
    expect(after.map((e: any) => e.id)).toEqual([102]);
  });
});
