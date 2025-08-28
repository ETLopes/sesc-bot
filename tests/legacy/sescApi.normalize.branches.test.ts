import { normalizeEvent } from '../src/sescApi.js';

test('normalizeEvent handles missing unidade and categorias', () => {
    const e = normalizeEvent({ id: 1, titulo: 't' });
    expect(e.unidade).toBeNull();
    expect(e.categorias).toBeNull();
});

test('normalizeEvent maps unidade name and category titles', () => {
    const e = normalizeEvent({
        id: 2,
        titulo: 't',
        unidade: [{ name: 'SESC XYZ' }],
        categorias: [{ titulo: 'musica' }, { titulo: 'teatro' }],
    });
    expect(e.unidade).toBe('SESC XYZ');
    expect(e.categorias).toBe('musica, teatro');
});

test('normalizeEvent coerces qtdeIngressosWeb number to string downstream (non-null)', () => {
    const e = normalizeEvent({ id: 3, titulo: 't', qtdeIngressosWeb: 5 });
    expect(e.qtdeIngressosWeb).toBe(5); // stays number here; db later stringifies
});

test('normalizeEvent returns null unidade when first has no name', () => {
    const e = normalizeEvent({ id: 4, titulo: 't', unidade: [{}] });
    expect(e.unidade).toBeNull();
});

test('normalizeEvent ignores categorias without titulo', () => {
    const e = normalizeEvent({ id: 5, titulo: 't', categorias: [{}, { titulo: 'arte' }, null] });
    expect(e.categorias).toBe('arte');
});