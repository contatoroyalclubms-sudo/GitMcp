module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server.js',
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'config/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};