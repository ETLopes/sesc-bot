import fs from 'fs';
import path from 'path';

test('index module loads in test mode without running main', async() => {
    process.env.NODE_ENV = 'test';
    const mod = await
    import ('../src/index.js');
    expect(mod).toBeTruthy();
});