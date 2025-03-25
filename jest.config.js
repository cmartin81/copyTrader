module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/__tests__/integration/'],
    },
    {
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/**/*.integration.test.ts'],
      testTimeout: 30000,
      setupFiles: ['<rootDir>/jest.setup.js'],
    },
  ],
}; 