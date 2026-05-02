import type { CubeState } from '../../logic/index.js'
import type { ColorScheme } from '../types.js'

// sr-visualizer AllFaces order: U(0), R(1), F(2), D(3), L(4), B(5)
// Maps to CubeState.faces indices (Face: Up=0, Down=1, Front=2, Back=3, Right=4, Left=5)
const SR_FACE_TO_CUBE_FACE = [0, 4, 2, 1, 5, 3] as const

/**
 * CubeState の各ステッカー色を sr-visualizer の stickerColors 配列形式に変換する。
 * 順序は sr-visualizer AllFaces 順（U,R,F,D,L,B）、各面内は行優先（row-major）。
 */
export function buildStickerColors(state: CubeState, colorScheme: ColorScheme): string[] {
  const colors: string[] = []
  for (const cubeFaceIdx of SR_FACE_TO_CUBE_FACE) {
    const face = state.faces[cubeFaceIdx]
    if (!face) continue
    for (const row of face) {
      for (const color of row) {
        colors.push(colorScheme[color])
      }
    }
  }
  return colors
}
