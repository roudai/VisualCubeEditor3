import type { ColorScheme } from './types.js'

// WCA standard colors: Up=White, Down=Yellow, Front=Red, Back=Orange, Right=Blue, Left=Green
export const DEFAULT_COLOR_SCHEME: ColorScheme = {
  0: '#FFFFFF',
  1: '#FFFF00',
  2: '#FF0000',
  3: '#FF8800',
  4: '#0000FF',
  5: '#00FF00',
}

export const DEFAULT_RENDER_OPTIONS = {
  width: 128,
  height: 128,
} as const
