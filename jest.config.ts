import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: '<rootDir>/src/testing/custom-env.js',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
}

const jestConfig = async () => {
  const resolved = await createJestConfig(config)()
  resolved.transformIgnorePatterns = [
    '/node_modules/(?!(msw|rettime|until-async|@mswjs|@open-draft|headers-polyfill)/)',
  ]
  return resolved
}

export default jestConfig
