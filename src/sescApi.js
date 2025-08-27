import fetch from 'node-fetch';
import {
    SESC_API_BASE,
    DEFAULT_CATEGORIA,
    LOCAL_IDS,
    GRATUITO_PARAM,
    ONLINE_PARAM,
} from './config.js';
import logger from './logger.js';

function normalizeUnit(unidade) {
    if (!Array.isArray(unidade) || unidade.length === 0) return null;
    const first = unidade[0];
    return first && first.name ? first.name : null;
}

function normalizeCategories(categorias) {
    if (!Array.isArray(categorias)) return null;
    const names = categorias.map((c) => (c && c.titulo ? c.titulo : null)).filter(Boolean);
    return names.join(', ');
}

export function normalizeEvent(raw) {
    return {
        id: raw.id,
        titulo: raw.titulo,
        complemento: raw.complemento || null,
        qtdeIngressosWeb: typeof raw.qtdeIngressosWeb === 'number' ?
            raw.qtdeIngressosWeb :
            raw.qtdeIngressosWeb || null,
        link: raw.link ? `https://www.sescsp.org.br${raw.link}` : null,
        dataPrimeiraSessao: raw.dataPrimeiraSessao || null,
        dataUltimaSessao: raw.dataUltimaSessao || null,
        dataProxSessao: raw.dataProxSessao || null,
        unidade: normalizeUnit(raw.unidade),
        categorias: normalizeCategories(raw.categorias),
        imagem: raw.imagem || null,
    };
}

function buildUrl({ page, categoria, dataInicialIso, dataFinalIso }) {
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

export async function fetchSescEvents({ categoria = DEFAULT_CATEGORIA } = {}) {
    const dataInicialIso = todayIsoDate();
    const dataFinalIso = oneYearFromTodayIsoDate();
    let page = 1;
    const allEvents = [];

    for (; page <= 50; page += 1) {
        const url = buildUrl({ page, categoria, dataInicialIso, dataFinalIso });
        logger.debug({ url }, 'Fetching SESC events');
        const res = await fetch(url, { headers: { accept: 'application/json' } });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to fetch SESC events: ${res.status} ${res.statusText} - ${text}`);
        }
        const data = await res.json();
        const items = Array.isArray(data && data.atividade) ? data.atividade : [];
        if (items.length === 0) break;
        const normalized = items.map(normalizeEvent);
        allEvents.push(...normalized);
    }

    return allEvents;
}