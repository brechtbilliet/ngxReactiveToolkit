module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!**/node_modules/**'],
  coverageReporters: ['cobertura', 'lcov', 'json'],
  globals: {
    __TS_CONFIG__: './tsconfig.jest.json'
  },
  setupFilesAfterEnv: ['./test-bundle.js'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/jest-preprocessor.js'
  },
  testRegex: '(/src/.*\\.(spec.ts))$'
};
