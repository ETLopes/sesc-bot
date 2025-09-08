// ESLint flat config
import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [{
    ignores: ['**/node_modules/**', '**/dist/**', 'data/**'],
},
js.configs.recommended,
{
    languageOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        parser: tsParser,
        globals: {
            ...globals.node,
        },
    },
    plugins: {
        '@typescript-eslint': tsPlugin,
    },
    rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': 'off',
        eqeqeq: ['error', 'always'],
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': ['error', 'always'],
        'arrow-body-style': ['error', 'as-needed'],
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
    ignores: ['node_modules/', 'data/', 'dist/'],
},
{
    files: ['tests/**/*.test.{js,ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
        parser: tsParser,
        globals: {
            ...globals.node,
            ...globals.jest,
        },
    },
    rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
},
];