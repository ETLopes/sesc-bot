import { normalizeEvent } from '../src/sescApi.js';

describe('sescApi.normalizeEvent', () => {
    test('maps fields and builds absolute link', () => {
        const raw = {
            id: 123,
            titulo: 'Show',
            complemento: 'Sub',
            qtdeIngressosWeb: 10,
            link: '/programacao/foo',
            dataPrimeiraSessao: '2025-08-01T10:00',
            dataUltimaSessao: '2025-08-02T10:00',
            dataProxSessao: '2025-08-03T10:00',
            unidade: [{ name: 'Santo André' }],
            categorias: [{ titulo: 'Música' }, { titulo: 'show' }],
            imagem: 'https://example/img.jpg',
        };
        const ev = normalizeEvent(raw);
        expect(ev.id).toBe(123);
        expect(ev.titulo).toBe('Show');
        expect(ev.complemento).toBe('Sub');
        expect(ev.qtdeIngressosWeb).toBe(10);
        expect(ev.link).toBe('https://www.sescsp.org.br/programacao/foo');
        expect(ev.unidade).toBe('Santo André');
        expect(ev.categorias).toBe('Música, show');
        expect(ev.imagem).toBe('https://example/img.jpg');
    });
});