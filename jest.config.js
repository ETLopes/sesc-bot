export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.[jt]sx?$': ['babel-jest', { rootMode: 'upward' }],
    },
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js'],
    moduleNameMapper: {
        '^node-fetch$': '<rootDir>/tests/mocks/node-fetch.ts',
        '^telegraf$': '<rootDir>/tests/mocks/telegraf.ts',
        '^../src/(.*)\\.js$': '<rootDir>/src/$1.ts',
        '^@mocks/(.*)$': '<rootDir>/tests/mocks/$1'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!src/index.js',
        '!src/index.ts',
        '!src/scripts/**',
        '!src/**/mocks/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    verbose: true,
    testPathIgnorePatterns: ['/node_modules/', '/tests/legacy/'],
};