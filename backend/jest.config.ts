import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest/presets/default-esm', // Use ESM preset
    testEnvironment: 'node',
    extensionsToTreatAsEsm: [ '.ts' ],
    roots: [ '<rootDir>/src/tests' ],
    testMatch: [ '**/*.test.ts' ],
    moduleNameMapper: {
        '^@/(.*)\\.js$': '<rootDir>/src/$1.ts',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1', // Handle .js extensions in imports
    },
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    // Automatically clear mock calls, instances and results before every test
    clearMocks: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/services/**/*.ts',
        'src/repositories/**/*.ts',
        'src/controllers/**/*.ts',
        '!src/**/*.d.ts',
    ],
};

export default config;
