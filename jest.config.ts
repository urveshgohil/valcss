import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: {
                    module: "ESNext",
                    moduleResolution: "bundler",
                },
            },
        ],
    },
    testMatch: ["**/__tests__/**/*.test.ts", "**/*.spec.ts"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!src/**/index.ts",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
};

export default config;
