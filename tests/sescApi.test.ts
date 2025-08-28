// Aggregated tests for sescApi with isolation, inlined (no legacy requires)

const resetAll = () => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.resetAllMocks();
  delete (process.env as any).CATEGORIA_DEFAULT;
  delete (process.env as any).CATEGORIES;
  delete (process.env as any).GRATUITO;
  delete (process.env as any).ONLINE;
};

describe('sescApi.branches', () => {
  beforeEach(resetAll);

  test('fetchSescEvents builds URL with categoria override and paginates once', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({ ok: true, json: async () => ({ atividade: [] }) });
    const { fetchSescEvents } = await import('../src/sescApi.js');
    await fetchSescEvents({ categoria: 'teatro' });
    expect(fetchMod.default).toHaveBeenCalledTimes(1);
    const url = fetchMod.default.mock.calls[0][0];
    expect(url).toContain('categoria=teatro');
    expect(url).toContain('ppp=1000');
    expect(url).toContain('dinamico=true');
    expect(url).toContain('page=1');
  });
});

describe('sescApi.buildUrl', () => {
  beforeEach(resetAll);

  describe('sescApi pagination', () => {
    test('stops when atividade is empty', async () => {
      const fetchMod: any = await import('node-fetch');
      fetchMod.default
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ atividade: [{ id: 1 }, { id: 2 }] }),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ atividade: [] }) });
      const { fetchSescEvents } = await import('../src/sescApi.js');
      const events = await fetchSescEvents({ categoria: 'musica' });
      expect(events.length).toBe(2);
    });
  });
});

describe('sescApi.categoria.default.branch', () => {
  beforeEach(resetAll);

  test('buildUrl uses DEFAULT_CATEGORIA when categoria falsy', async () => {
    process.env.CATEGORIA_DEFAULT = 'musica';
    const { buildUrl } = await import('../src/sescApi.js');
    const url = buildUrl({ categoria: '' } as any);
    expect(url).toContain('categoria=musica');
  });
});

describe('sescApi.defaultCategoria', () => {
  beforeEach(resetAll);

  test('fetchSescEvents uses DEFAULT_CATEGORIA when categoria not provided', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockClear();
    fetchMod.default.mockResolvedValue({
      ok: true,
      json: async () => ({ atividade: [] }),
      text: async () => '',
      status: 200,
      statusText: 'OK',
    });
    const api = await import('../src/sescApi.js');
    await api.fetchSescEvents();
    const url = fetchMod.default.mock.calls[0][0];
    expect(url).toContain('categoria=musica');
  });
});

describe('sescApi.error', () => {
  beforeEach(resetAll);

  test('fetchSescEvents throws on non-ok response', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal',
      text: async () => 'boom',
    });
    const { fetchSescEvents } = await import('../src/sescApi.js');
    await expect(fetchSescEvents({ categoria: 'musica' })).rejects.toThrow(/Failed to fetch/);
  });
});

describe('sescApi.missingAtividade', () => {
  beforeEach(resetAll);

  test('fetchSescEvents handles missing atividade by treating as empty', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const { fetchSescEvents } = await import('../src/sescApi.js');
    const events = await fetchSescEvents({ categoria: 'musica' });
    expect(events).toEqual([]);
  });
});

describe('sescApi.normalize.branches', () => {
  beforeEach(resetAll);

  test('normalizeEvent handles missing unidade and categorias', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const e: any = normalizeEvent({ id: 1, titulo: 't' });
    expect(e.unidade).toBeNull();
    expect(e.categorias).toBeNull();
  });

  test('normalizeEvent maps unidade name and category titles', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const e: any = normalizeEvent({
      id: 2,
      titulo: 't',
      unidade: [{ name: 'SESC XYZ' }],
      categorias: [{ titulo: 'musica' }, { titulo: 'teatro' }],
    });
    expect(e.unidade).toBe('SESC XYZ');
    expect(e.categorias).toBe('musica, teatro');
  });

  test('normalizeEvent coerces qtdeIngressosWeb number to string downstream (non-null)', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const e: any = normalizeEvent({ id: 3, titulo: 't', qtdeIngressosWeb: 5 });
    expect(e.qtdeIngressosWeb).toBe(5);
  });

  test('normalizeEvent returns null unidade when first has no name', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const e: any = normalizeEvent({ id: 4, titulo: 't', unidade: [{}] });
    expect(e.unidade).toBeNull();
  });

  test('normalizeEvent ignores categorias without titulo', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const e: any = normalizeEvent({
      id: 5,
      titulo: 't',
      categorias: [{}, { titulo: 'arte' }, null],
    });
    expect(e.categorias).toBe('arte');
  });
});

describe('sescApi.null.items', () => {
  beforeEach(resetAll);

  test('normalizeEvent returns null for invalid items and keeps valid ones', async () => {
    jest.resetModules();
    const { normalizeEvent } = await import('../src/sescApi.js');
    const rawItems = [null, {}, { id: 1, link: '/x' }];
    const events = (rawItems as any).map(normalizeEvent).filter(Boolean);
    expect(events).toHaveLength(1);
    expect((events[0] as any).id).toBe(1);
  });
});

describe('sescApi.params.branches', () => {
  beforeEach(resetAll);

  test('fetchSescEvents reflects GRATUITO_PARAM and ONLINE_PARAM in URL', async () => {
    jest.resetModules();
    process.env.GRATUITO = '1';
    process.env.ONLINE = '0';
    const dataInicialIso = '2025-01-01';
    const dataFinalIso = '2026-01-01';
    const { buildUrl } = await import('../src/sescApi.js');
    const url = buildUrl({ categoria: 'musica', page: 2, dataInicialIso, dataFinalIso } as any);
    expect(url).toContain('gratuito=1');
    expect(url).toContain('online=0');
    expect(url).toContain('page=2');
  });
});

describe('sescApi.core', () => {
  beforeEach(resetAll);

  test('sescApi.normalizeEvent maps fields and builds absolute link', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const e: any = normalizeEvent({ id: 9, link: '/evento/abc', titulo: 'T' });
    expect(e.link).toMatch(/^https:\/\/www\.sescsp\.org\.br\//);
    expect(e.id).toBe(9);
  });
});
