import fetch from 'node-fetch';
import {
  SESC_API_BASE,
  DEFAULT_CATEGORIA,
  LOCAL_IDS,
  GRATUITO_PARAM,
  ONLINE_PARAM,
} from './config.js';
import logger from './logger.js';

function normalizeUnit(unidade: any): string | null {
  if (!Array.isArray(unidade) || unidade.length === 0) return null;
  const first = unidade[0];
  return first && first.name ? first.name : null;
}

function normalizeCategories(categorias: any): string | null {
  if (!Array.isArray(categorias)) return null;
  const names = categorias.map((c) => (c && c.titulo ? c.titulo : null)).filter(Boolean);
  return names.join(', ');
}

type ImageVariant = {
  file: string;
  width: number;
  height: number;
  'mime-type': string;
  filesize: number;
};

export type NormalizedEvent = {
  id: number;
  id_java?: string | null;
  titulo?: string | null;
  complemento?: string | null;
  cancelado?: string | null;
  esgotado?: string | null;
  qtdeIngressosWeb?: number | string | null;
  qtdeIngressosRede?: number | null;
  codigoStatusEvento?: string | null;
  link?: string | null;
  dataPrimeiraSessao?: string | null;
  dataUltimaSessao?: string | null;
  dataProxSessao?: string | null;
  quantDatas?: string | null;
  unidade?: string | null;
  categorias?: string | null;
  imagem?: string | null;
  imagens?: {
    medium?: ImageVariant | null;
    thumbnail?: ImageVariant | null;
    medium_large?: ImageVariant | null;
    'homepage-thumb'?: ImageVariant | null;
    'projeto-thumb'?: ImageVariant | null;
    'atividade-img'?: ImageVariant | null;
    'sites-card-img'?: ImageVariant | null;
  } | null;
  conjunto?: Array<{ name: string | null; link: string | null }> | null;
  acaoFormativa?: Array<{ name: string | null; link: string | null }> | null;
  totem?: {
    ativo: boolean;
    andar: string | null;
    recomendacao_etaria: string | null;
    tags: string | null;
  } | null;
};

export function normalizeEvent(raw: any): NormalizedEvent | null {
  if (!raw || typeof raw !== 'object' || raw.id === null || raw.id === undefined) return null;
  return {
    id: raw.id,
    id_java: raw.id_java ?? null,
    titulo: raw.titulo,
    complemento: raw.complemento || null,
    cancelado: raw.cancelado ?? null,
    esgotado: raw.esgotado ?? null,
    qtdeIngressosWeb:
      typeof raw.qtdeIngressosWeb === 'number'
        ? raw.qtdeIngressosWeb
        : raw.qtdeIngressosWeb || null,
    qtdeIngressosRede: typeof raw.qtdeIngressosRede === 'number' ? raw.qtdeIngressosRede : null,
    codigoStatusEvento: raw.codigoStatusEvento ?? null,
    link: raw.link ? `https://www.sescsp.org.br${raw.link}` : null,
    dataPrimeiraSessao: raw.dataPrimeiraSessao || null,
    dataUltimaSessao: raw.dataUltimaSessao || null,
    dataProxSessao: raw.dataProxSessao || null,
    quantDatas: raw.quantDatas ?? null,
    unidade: normalizeUnit(raw.unidade),
    categorias: normalizeCategories(raw.categorias),
    imagem: raw.imagem || null,
    imagens: raw.imagens || null,
    conjunto: Array.isArray(raw.conjunto)
      ? raw.conjunto.map((c: any) => ({ name: c?.name ?? null, link: c?.link ?? null }))
      : null,
    acaoFormativa: Array.isArray(raw.acaoFormativa)
      ? raw.acaoFormativa.map((c: any) => ({ name: c?.name ?? null, link: c?.link ?? null }))
      : null,
    totem: raw.totem
      ? {
          ativo: Boolean(raw.totem.ativo),
          andar: raw.totem.andar ?? null,
          recomendacao_etaria: raw.totem.recomendacao_etaria ?? null,
          tags: raw.totem.tags ?? null,
        }
      : null,
  };
}

export function buildUrl({
  page,
  categoria,
  dataInicialIso,
  dataFinalIso,
}: {
  page: number;
  categoria?: string;
  dataInicialIso: string;
  dataFinalIso: string;
}): string {
  const params = new URLSearchParams();
  params.set('local', LOCAL_IDS);
  params.set('categoria', categoria || DEFAULT_CATEGORIA);
  params.set('gratuito', GRATUITO_PARAM);
  params.set('online', ONLINE_PARAM);
  params.set('data_inicial', dataInicialIso);
  params.set('data_final', dataFinalIso);
  params.set('tipo', 'atividade');
  params.set('dinamico', 'true');
  params.set('ppp', '1000');
  params.set('page', String(page));
  return `${SESC_API_BASE}?${params.toString()}`;
}

function todayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function oneYearFromTodayIsoDate() {
  const now = new Date();
  now.setFullYear(now.getFullYear() + 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function fetchSescEvents({
  categoria = DEFAULT_CATEGORIA,
}: { categoria?: string } = {}): Promise<NormalizedEvent[]> {
  const dataInicialIso = todayIsoDate();
  const dataFinalIso = oneYearFromTodayIsoDate();
  let page = 1;
  const allEvents: NormalizedEvent[] = [];

  for (; page <= 50; page += 1) {
    const url = buildUrl({ page, categoria, dataInicialIso, dataFinalIso });
    logger.debug({ url }, 'Fetching SESC events');
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch SESC events: ${res.status} ${res.statusText} - ${text}`);
    }
    const data: any = await res.json();
    const items = Array.isArray(data && (data as any).atividade) ? (data as any).atividade : [];
    if (items.length === 0) break;
    const normalized = items.map(normalizeEvent).filter(Boolean) as NormalizedEvent[];
    allEvents.push(...normalized);
  }

  return allEvents;
}

// Pricing/session details fetched from portal endpoint by id_java (idAtividade)
export type SessionPricing = {
  valorMeiaFmt?: string | null;
  valorInteiraFmt?: string | null;
  valorComerciarioFmt?: string | null;
  gratuito?: boolean | null;
  dataInicialVendaOnlineFmt?: string | null;
};

type SessaoDTO = {
  valorMeiaFmt?: string | null;
  valorInteiraFmt?: string | null;
  valorComerciarioFmt?: string | null;
  gratuito?: boolean | null;
  dataInicialVendaOnlineFmt?: string | null;
};

type AtividadeResponse = {
  sessoes?: SessaoDTO[];
  ultimaSessao?: SessaoDTO | null;
};

export async function fetchSessionPricingByIdJava(
  idJava: string | null | undefined,
): Promise<SessionPricing | null> {
  if (!idJava) return null;
  const url = `https://portal.sescsp.org.br/bilheteria/atividade.action?idAtividade=${encodeURIComponent(
    idJava,
  )}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch session pricing: ${res.status} ${res.statusText} - ${text}`);
  }
  const data = (await res.json()) as AtividadeResponse;
  const sessao: SessaoDTO | undefined =
    Array.isArray(data?.sessoes) && data.sessoes.length
      ? data.sessoes[0]
      : data?.ultimaSessao || undefined;
  if (!sessao) return null;
  return {
    valorMeiaFmt: sessao.valorMeiaFmt ?? null,
    valorInteiraFmt: sessao.valorInteiraFmt ?? null,
    valorComerciarioFmt: sessao.valorComerciarioFmt ?? null,
    gratuito: sessao.gratuito ?? null,
    dataInicialVendaOnlineFmt: sessao.dataInicialVendaOnlineFmt ?? null,
  };
}
