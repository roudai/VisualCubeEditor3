import { describe, it, expect } from 'vitest'
import { SrVisualizerAdapter } from '../../src/render/sr-visualizer/adapter.js'
import { createCube } from '../../src/logic/index.js'
import { applyMove } from '../../src/logic/rotation.js'
import { Face, Direction, type CubeState } from '../../src/logic/types.js'
import { DEFAULT_COLOR_SCHEME } from '../../src/render/defaults.js'

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function solved(n: 2 | 3 | 4 | 5 | 6 | 7): CubeState {
  const r = createCube(n)
  if (!r.ok) throw new Error(r.error.message)
  return r.value
}

// ---------------------------------------------------------------------------
// renderSVG — 基本動作
// ---------------------------------------------------------------------------

describe('SrVisualizerAdapter.renderSVG — 基本動作', () => {
  it.each([2, 3, 4, 5, 6, 7] as const)('N=%i で ok を返し SVG 文字列を含む', (n) => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(n))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('<svg')
    expect(result.value).toContain('</svg>')
  })

  it('返値は文字列型', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(typeof result.value).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// renderSVG — SC-006: WCA 標準色比較
// デフォルト viewport（Y=45, X=-34）で U/R/F の 3 面が可視
// White (#FFFFFF) → Up, Blue (#0000FF) → Right, Red (#FF0000) → Front
// ---------------------------------------------------------------------------

describe('SrVisualizerAdapter.renderSVG — SC-006 標準色', () => {
  it('完成状態 N=3 の SVG に #ffffff（White / Up 面）が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain(DEFAULT_COLOR_SCHEME[0].toLowerCase())
  })

  it('完成状態 N=3 の SVG に #0000ff（Blue / Right 面）が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain(DEFAULT_COLOR_SCHEME[4].toLowerCase())
  })

  it('完成状態 N=3 の SVG に #ff0000（Red / Front 面）が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain(DEFAULT_COLOR_SCHEME[2].toLowerCase())
  })
})

// ---------------------------------------------------------------------------
// renderSVG — イミュータブル性
// CubeState は renderSVG 後も変更されていないこと
// ---------------------------------------------------------------------------

describe('SrVisualizerAdapter.renderSVG — イミュータブル性', () => {
  it('renderSVG 後に元の CubeState は変更されない', () => {
    const adapter = new SrVisualizerAdapter()
    const cube = solved(3)
    const before = JSON.stringify(cube.faces)
    adapter.renderSVG(cube)
    expect(JSON.stringify(cube.faces)).toBe(before)
  })

  it('N=7 でもイミュータブル性が保たれる', () => {
    const adapter = new SrVisualizerAdapter()
    const cube = solved(7)
    const before = JSON.stringify(cube.faces)
    adapter.renderSVG(cube)
    expect(JSON.stringify(cube.faces)).toBe(before)
  })
})

// ---------------------------------------------------------------------------
// renderSVG — スクランブル済み状態
// R CW 後: U 面右列が Red (#FF0000) になる → SVG に #ff0000 が含まれる
// さらに: スクランブル前後で SVG 文字列が異なること
// ---------------------------------------------------------------------------

describe('SrVisualizerAdapter.renderSVG — スクランブル済み状態', () => {
  it('R CW 後のキューブで SVG が変化する', () => {
    const adapter = new SrVisualizerAdapter()
    const s = solved(3)

    const solvedResult = adapter.renderSVG(s)
    expect(solvedResult.ok).toBe(true)
    if (!solvedResult.ok) return

    const moved = applyMove(s, { face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(moved.ok).toBe(true)
    if (!moved.ok) return

    const scrambledResult = adapter.renderSVG(moved.value)
    expect(scrambledResult.ok).toBe(true)
    if (!scrambledResult.ok) return

    expect(scrambledResult.value).not.toBe(solvedResult.value)
  })

  it('R CW 後の SVG は依然 <svg>...</svg> を含む', () => {
    const adapter = new SrVisualizerAdapter()
    const moved = applyMove(solved(3), { face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(moved.ok).toBe(true)
    if (!moved.ok) return

    const result = adapter.renderSVG(moved.value)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('<svg')
    expect(result.value).toContain('</svg>')
  })
})

// ---------------------------------------------------------------------------
// renderPNG — 基本動作
// ---------------------------------------------------------------------------

// PNG マジックナンバー: 89 50 4E 47 0D 0A 1A 0A
const PNG_MAGIC = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

describe('SrVisualizerAdapter.renderPNG — 基本動作', () => {
  it('N=3 で ok を返し Uint8Array を含む', async () => {
    const adapter = new SrVisualizerAdapter()
    const result = await adapter.renderPNG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toBeInstanceOf(Uint8Array)
  })

  it('先頭 8 バイトが PNG マジックナンバー（89 50 4E 47 0D 0A 1A 0A）', async () => {
    const adapter = new SrVisualizerAdapter()
    const result = await adapter.renderPNG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.subarray(0, 8)).toEqual(PNG_MAGIC)
  })

  it.each([2, 3, 4, 5, 6, 7] as const)('N=%i で PNG マジックナンバーを持つ', async (n) => {
    const adapter = new SrVisualizerAdapter()
    const result = await adapter.renderPNG(solved(n))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.subarray(0, 8)).toEqual(PNG_MAGIC)
  })
})

// ---------------------------------------------------------------------------
// renderPNG — 決定論的出力
// 同一入力 → 同一バイト列（乱数・タイムスタンプなし）
// ---------------------------------------------------------------------------

describe('SrVisualizerAdapter.renderPNG — 決定論的出力', () => {
  it('同一 CubeState を 2 回レンダリングすると同一バイト列を返す', async () => {
    const adapter = new SrVisualizerAdapter()
    const cube = solved(3)
    const r1 = await adapter.renderPNG(cube)
    const r2 = await adapter.renderPNG(cube)
    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    if (!r1.ok || !r2.ok) return
    expect(r1.value).toEqual(r2.value)
  })

  it('異なるアダプターインスタンスでも同一入力から同一出力', async () => {
    const cube = solved(3)
    const r1 = await new SrVisualizerAdapter().renderPNG(cube)
    const r2 = await new SrVisualizerAdapter().renderPNG(cube)
    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    if (!r1.ok || !r2.ok) return
    expect(r1.value).toEqual(r2.value)
  })
})

// ---------------------------------------------------------------------------
// renderPNG — イミュータブル性
// ---------------------------------------------------------------------------

describe('SrVisualizerAdapter.renderPNG — イミュータブル性', () => {
  it('renderPNG 後に元の CubeState は変更されない', async () => {
    const adapter = new SrVisualizerAdapter()
    const cube = solved(3)
    const before = JSON.stringify(cube.faces)
    await adapter.renderPNG(cube)
    expect(JSON.stringify(cube.faces)).toBe(before)
  })
})

// ---------------------------------------------------------------------------
// renderSVG — バリデーション
// ---------------------------------------------------------------------------

describe('SrVisualizerAdapter.renderSVG — バリデーション', () => {
  it('size=1（範囲外）は INVALID_CUBE_SIZE エラーを返す', () => {
    const adapter = new SrVisualizerAdapter()
    // TypeScript の型システムを迂回して意図的に不正なサイズを渡す
    const fakeCube = { size: 1 as 2, faces: [] as never }
    const result = adapter.renderSVG(fakeCube)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_SIZE')
  })

  it('size=8（範囲外）は INVALID_CUBE_SIZE エラーを返す', () => {
    const adapter = new SrVisualizerAdapter()
    const fakeCube = { size: 8 as 7, faces: [] as never }
    const result = adapter.renderSVG(fakeCube)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_SIZE')
  })
})
