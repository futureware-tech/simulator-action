import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    testTimeout: 600_000,
    hookTimeout: 600_000,
    include: ['__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/.direnv/**']
  }
})
