import _fetch from 'node-fetch';
import { buildUrl } from '../src/sescApi.js';

test('buildUrl uses DEFAULT_CATEGORIA when categoria falsy', async() => {
    process.env.CATEGORIA_DEFAULT = 'musica';
    const url = buildUrl({ categoria: '' });
    expect(url).toContain('categoria=musica');
})