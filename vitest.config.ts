import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/logic/**/*.ts', 'src/render/**/*.ts'],
      exclude: ['src/logic/index.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
      },
      reporter: ['text', 'lcov'],
    },
  },
})
