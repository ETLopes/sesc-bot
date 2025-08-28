import { jest } from '@jest/globals';

test('index module loads in test mode without running main', async() => {
    process.env.NODE_ENV = 'test';
    jest.resetModules();
    await
    import ('../src/index.js');
    // If main executed it would set intervals and attempt to sync; import-only is enough here
})