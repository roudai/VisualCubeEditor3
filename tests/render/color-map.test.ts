import { describe, it, expect } from 'vitest'
import { buildStickerColors } from '../../src/render/sr-visualizer/color-map.js'
import { createCube } from '../../src/logic/index.js'
import { applyMove } from '../../src/logic/rotation.js'
import { Face, Direction } from '../../src/logic/types.js'
import { DEFAULT_COLOR_SCHEME } from '../../src/render/defaults.js'
import type { ColorScheme } from '../../src/render/types.js'

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function solved(n: 2 | 3 | 4 | 5 | 6 | 7) {
  const r = createCube(n)
  if (!r.ok) throw new Error(r.error.message)
  return r.value
}

// ---------------------------------------------------------------------------
// 配列長
// ---------------------------------------------------------------------------

describe('buildStickerColors — 配列長', () => {
  it.each([2, 3, 4, 5, 6, 7] as const)('N=%i のとき配列長が 6*N*N になる', (n) => {
    const colors = buildStickerColors(solved(n), DEFAULT_COLOR_SCHEME)
    expect(colors).toHaveLength(6 * n * n)
  })
})

// ---------------------------------------------------------------------------
// 完成状態の色マッピング（sr-visualizer AllFaces 順: U,R,F,D,L,B）
// CubeState Face 順との対応:
//   sr-U(0) → faces[0] Up  (Color.White  → #FFFFFF)
//   sr-R(1) → faces[4] Right (Color.Blue → #0000FF)
//   sr-F(2) → faces[2] Front (Color.Red  → #FF0000)
//   sr-D(3) → faces[1] Down  (Color.Yellow → #FFFF00)
//   sr-L(4) → faces[5] Left  (Color.Green → #00FF00)
//   sr-B(5) → faces[3] Back  (Color.Orange → #FF8800)
// ---------------------------------------------------------------------------

describe('buildStickerColors — 完成状態・色マッピング', () => {
  const n = 3
  const N2 = n * n

  it('sr-U スロット（positions 0..N²-1）は #FFFFFF（White）', () => {
    const colors = buildStickerColors(solved(n), DEFAULT_COLOR_SCHEME)
    for (let i = 0; i < N2; i++) {
      expect(colors[i]).toBe('#FFFFFF')
    }
  })

  it('sr-R スロット（positions N²..2N²-1）は #0000FF（Blue）', () => {
    const colors = buildStickerColors(solved(n), DEFAULT_COLOR_SCHEME)
    for (let i = N2; i < 2 * N2; i++) {
      expect(colors[i]).toBe('#0000FF')
    }
  })

  it('sr-F スロット（positions 2N²..3N²-1）は #FF0000（Red）', () => {
    const colors = buildStickerColors(solved(n), DEFAULT_COLOR_SCHEME)
    for (let i = 2 * N2; i < 3 * N2; i++) {
      expect(colors[i]).toBe('#FF0000')
    }
  })

  it('sr-D スロット（positions 3N²..4N²-1）は #FFFF00（Yellow）', () => {
    const colors = buildStickerColors(solved(n), DEFAULT_COLOR_SCHEME)
    for (let i = 3 * N2; i < 4 * N2; i++) {
      expect(colors[i]).toBe('#FFFF00')
    }
  })

  it('sr-L スロット（positions 4N²..5N²-1）は #00FF00（Green）', () => {
    const colors = buildStickerColors(solved(n), DEFAULT_COLOR_SCHEME)
    for (let i = 4 * N2; i < 5 * N2; i++) {
      expect(colors[i]).toBe('#00FF00')
    }
  })

  it('sr-B スロット（positions 5N²..6N²-1）は #FF8800（Orange）', () => {
    const colors = buildStickerColors(solved(n), DEFAULT_COLOR_SCHEME)
    for (let i = 5 * N2; i < 6 * N2; i++) {
      expect(colors[i]).toBe('#FF8800')
    }
  })

  it('全ステッカーが # で始まる hex 文字列', () => {
    const colors = buildStickerColors(solved(n), DEFAULT_COLOR_SCHEME)
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-fA-F]+$/)
    }
  })
})

// ---------------------------------------------------------------------------
// カスタム ColorScheme
// ---------------------------------------------------------------------------

describe('buildStickerColors — カスタム ColorScheme', () => {
  it('Color.White (0) を別色に上書きすると sr-U スロットに反映される', () => {
    const custom: ColorScheme = { ...DEFAULT_COLOR_SCHEME, 0: '#AABBCC' }
    const colors = buildStickerColors(solved(3), custom)
    for (let i = 0; i < 9; i++) {
      expect(colors[i]).toBe('#AABBCC')
    }
  })

  it('Color.Blue (4) を別色に上書きすると sr-R スロットに反映される', () => {
    const custom: ColorScheme = { ...DEFAULT_COLOR_SCHEME, 4: '#112233' }
    const colors = buildStickerColors(solved(3), custom)
    for (let i = 9; i < 18; i++) {
      expect(colors[i]).toBe('#112233')
    }
  })
})

// ---------------------------------------------------------------------------
// スクランブル済み状態
// R CW 後: Up 面の右列（col 2）が Red (#FF0000) になる
//   → sr-U の index 2, 5, 8（row-major, col=2）= #FF0000
// ---------------------------------------------------------------------------

describe('buildStickerColors — スクランブル済み状態', () => {
  it('R CW 後: sr-U の右列（positions 2,5,8）が #FF0000（Red）になる', () => {
    const s = solved(3)
    const moved = applyMove(s, { face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(moved.ok).toBe(true)
    if (!moved.ok) return

    const colors = buildStickerColors(moved.value, DEFAULT_COLOR_SCHEME)

    // sr-U = CubeState.Up（faces[0]）: row-major, col=2 → indices 2,5,8
    expect(colors[2]).toBe('#FF0000')
    expect(colors[5]).toBe('#FF0000')
    expect(colors[8]).toBe('#FF0000')
    // 残り（col=0,1）は依然 White
    expect(colors[0]).toBe('#FFFFFF')
    expect(colors[1]).toBe('#FFFFFF')
    expect(colors[3]).toBe('#FFFFFF')
    expect(colors[4]).toBe('#FFFFFF')
    expect(colors[6]).toBe('#FFFFFF')
    expect(colors[7]).toBe('#FFFFFF')
  })

  it('スクランブル前後で stickerColors 配列の内容が異なる', () => {
    const s = solved(3)
    const solvedColors = buildStickerColors(s, DEFAULT_COLOR_SCHEME)

    const moved = applyMove(s, { face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(moved.ok).toBe(true)
    if (!moved.ok) return
    const scrambledColors = buildStickerColors(moved.value, DEFAULT_COLOR_SCHEME)

    expect(scrambledColors).not.toEqual(solvedColors)
  })
})
