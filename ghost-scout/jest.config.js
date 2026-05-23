/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/phase1.test.ts',
        '<rootDir>/__tests__/phase2.test.ts',
        '<rootDir>/__tests__/phase3.test.ts',
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/__tests__/phase4.test.ts',
        '<rootDir>/__tests__/phase4.test.tsx',
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
            module: 'commonjs',
            moduleResolution: 'node',
            paths: { '@/*': ['./*'] },
          },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
    },
  ],
}
