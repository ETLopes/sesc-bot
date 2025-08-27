import logger from '../src/logger.js';

describe('logger', () => {
    test('has info method', () => {
        expect(typeof logger.info).toBe('function');
    });
});