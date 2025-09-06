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

describe('sescApi.pricing', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('returns pricing from first sessoes item when present', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessoes: [
          {
            valorInteiraFmt: '$50.00',
            valorMeiaFmt: '$25.00',
            valorComerciarioFmt: '$15.00',
            gratuito: false,
          },
        ],
      }),
      text: async () => '',
      status: 200,
      statusText: 'OK',
    });
    const { fetchSessionPricingByIdJava } = await import('../src/sescApi.js');
    const pricing = await fetchSessionPricingByIdJava('123');
    expect(pricing).toEqual({
      valorInteiraFmt: '$50.00',
      valorMeiaFmt: '$25.00',
      valorComerciarioFmt: '$15.00',
      gratuito: false,
      dataInicialVendaOnlineFmt: null,
    });
  });

  test('falls back to ultimaSessao when sessoes is missing/empty', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessoes: [],
        ultimaSessao: {
          valorInteiraFmt: '$40.00',
          valorMeiaFmt: '$20.00',
          valorComerciarioFmt: '$12.00',
          gratuito: true,
          dataInicialVendaOnlineFmt: '2025-08-19T17:00',
        },
      }),
      text: async () => '',
      status: 200,
      statusText: 'OK',
    });
    const { fetchSessionPricingByIdJava } = await import('../src/sescApi.js');
    const pricing = await fetchSessionPricingByIdJava('456');
    expect(pricing).toEqual({
      valorInteiraFmt: '$40.00',
      valorMeiaFmt: '$20.00',
      valorComerciarioFmt: '$12.00',
      gratuito: true,
      dataInicialVendaOnlineFmt: '2025-08-19T17:00',
    });
  });

  test('returns null when idJava is falsy', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockClear();
    const { fetchSessionPricingByIdJava } = await import('../src/sescApi.js');
    const pricing = await fetchSessionPricingByIdJava(undefined as any);
    expect(pricing).toBeNull();
    expect(fetchMod.default).not.toHaveBeenCalled();
  });

  test('throws on non-ok response', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal',
      text: async () => 'boom',
    });
    const { fetchSessionPricingByIdJava } = await import('../src/sescApi.js');
    await expect(fetchSessionPricingByIdJava('789')).rejects.toThrow(
      /Failed to fetch session pricing/,
    );
  });

  test('non-ok response with text() reject still throws with fallback message', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: async () => {
        throw new Error('fail text');
      },
    });
    const { fetchSessionPricingByIdJava } = await import('../src/sescApi.js');
    await expect(fetchSessionPricingByIdJava('123')).rejects.toThrow(
      /Failed to fetch session pricing/,
    );
  });

  test('returns null when both sessoes and ultimaSessao are missing', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
      text: async () => '',
      status: 200,
      statusText: 'OK',
    });
    const { fetchSessionPricingByIdJava } = await import('../src/sescApi.js');
    const pricing = await fetchSessionPricingByIdJava('999');
    expect(pricing).toBeNull();
  });

  test('maps gratuito to null when missing in payload', async () => {
    const fetchMod: any = await import('node-fetch');
    fetchMod.default.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessoes: [{ valorInteiraFmt: '$10.00' }] }),
      text: async () => '',
      status: 200,
      statusText: 'OK',
    });
    const { fetchSessionPricingByIdJava } = await import('../src/sescApi.js');
    const pricing = await fetchSessionPricingByIdJava('1000');
    expect(pricing).toEqual({
      valorInteiraFmt: '$10.00',
      valorMeiaFmt: null,
      valorComerciarioFmt: null,
      gratuito: null,
      dataInicialVendaOnlineFmt: null,
    });
  });
});

describe('sescApi.normalize.extras', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('maps conjunto and acaoFormativa arrays', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const raw: any = {
      id: 1,
      conjunto: [{ name: null, link: null }],
      acaoFormativa: [{ name: 'n', link: 'l' }],
    };
    const e: any = normalizeEvent(raw);
    expect(e.conjunto).toEqual([{ name: null, link: null }]);
    expect(e.acaoFormativa).toEqual([{ name: 'n', link: 'l' }]);
  });

  test('sets conjunto and acaoFormativa to null when not arrays', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const raw: any = { id: 2, conjunto: null, acaoFormativa: 'x' };
    const e: any = normalizeEvent(raw);
    expect(e.conjunto).toBeNull();
    expect(e.acaoFormativa).toBeNull();
  });

  test('maps id_java, qtdeIngressosRede, codigoStatusEvento, quantDatas, imagens and totem', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const raw: any = {
      id: 3,
      id_java: '250053',
      qtdeIngressosRede: 7,
      codigoStatusEvento: '2',
      quantDatas: '',
      imagens: {
        medium: { file: 'a.jpg', width: 1, height: 1, 'mime-type': 'image/jpeg', filesize: 10 },
      },
      totem: { ativo: 1, andar: null, recomendacao_etaria: null, tags: null },
    };
    const e: any = normalizeEvent(raw);
    expect(e.id_java).toBe('250053');
    expect(e.qtdeIngressosRede).toBe(7);
    expect(e.codigoStatusEvento).toBe('2');
    expect(e.quantDatas).toBe('');
    expect(e.imagens).toBeTruthy();
    expect(e.totem).toEqual({ ativo: true, andar: null, recomendacao_etaria: null, tags: null });
  });

  test('acaoFormativa/conjunto mapping tolerates undefined items and missing fields', async () => {
    const { normalizeEvent } = await import('../src/sescApi.js');
    const raw: any = {
      id: 4,
      acaoFormativa: [undefined, { name: undefined, link: 'only-link' }],
      conjunto: [{ name: 'only-name' }],
    };
    const e: any = normalizeEvent(raw);
    expect(e.acaoFormativa).toEqual([
      { name: null, link: null },
      { name: null, link: 'only-link' },
    ]);
    expect(e.conjunto).toEqual([{ name: 'only-name', link: null }]);
  });
});
