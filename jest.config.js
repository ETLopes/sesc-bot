export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.[jt]s$': ['babel-jest', { rootMode: 'upward' }],
    },
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['js'],
    moduleNameMapper: {
        '^node-fetch$': '<rootDir>/tests/mocks/node-fetch.js',
        '^telegraf$': '<rootDir>/tests/mocks/telegraf.js',
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
        '!src/scripts/**',
        '!src/**/mocks/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 85,
            lines: 75,
            statements: 75,
        },
    },
    verbose: true,
};