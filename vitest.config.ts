import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['tests/**/*.test.ts'],
    environmentMatchGlobs: [
      ['tests/components/**', 'happy-dom'],
      ['tests/stores/**', 'happy-dom'],
      ['tests/composables/**', 'happy-dom'],
    ],
    coverage: {
      provider: 'v8',
      include: [
        'src/logic/**/*.ts',
        'src/render/**/*.ts',
        'src/stores/**/*.ts',
        'src/composables/**/*.ts',
        'src/components/**/*.vue',
        'src/App.vue',
      ],
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
