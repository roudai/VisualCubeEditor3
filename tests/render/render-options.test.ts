import { describe, it, expect } from 'vitest'
import { SrVisualizerAdapter } from '../../src/render/sr-visualizer/adapter.js'
import { createCube } from '../../src/logic/index.js'
import type { CubeState } from '../../src/logic/types.js'
import { ViewAxis } from '../../src/render/types.js'
import { DEFAULT_COLOR_SCHEME } from '../../src/render/defaults.js'

function solved(n: 2 | 3 | 4 | 5 | 6 | 7): CubeState {
  const r = createCube(n)
  if (!r.ok) throw new Error(r.error.message)
  return r.value
}

// ---------------------------------------------------------------------------
// US3: backgroundColor — 背景色適用
// ---------------------------------------------------------------------------

describe('RenderOptions — backgroundColor', () => {
  it('#1a2b3c を指定すると SVG に #1a2b3c が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { backgroundColor: '#1a2b3c' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain('#1a2b3c')
  })

  it('"transparent" を指定すると SVG に transparent が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { backgroundColor: 'transparent' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain('transparent')
  })

  it('異なる backgroundColor の SVG は互いに異なる', () => {
    const adapter = new SrVisualizerAdapter()
    const r1 = adapter.renderSVG(solved(3), { backgroundColor: '#ff0000' })
    const r2 = adapter.renderSVG(solved(3), { backgroundColor: '#0000ff' })
    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    if (!r1.ok || !r2.ok) return
    expect(r1.value).not.toBe(r2.value)
  })
})

// ---------------------------------------------------------------------------
// US3: width / height — サイズ適用
// ---------------------------------------------------------------------------

describe('RenderOptions — width / height', () => {
  it('width: 256 を指定すると SVG に width="256" が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { width: 256 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('width="256"')
  })

  it('height: 512 を指定すると SVG に height="512" が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { height: 512 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('height="512"')
  })

  it('オプション省略時は width="128" が含まれる（DEFAULT_RENDER_OPTIONS）', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('width="128"')
  })

  it('オプション省略時は height="128" が含まれる（DEFAULT_RENDER_OPTIONS）', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('height="128"')
  })

  it('width: 64 と width: 256 では SVG が異なる', () => {
    const adapter = new SrVisualizerAdapter()
    const r1 = adapter.renderSVG(solved(3), { width: 64 })
    const r2 = adapter.renderSVG(solved(3), { width: 256 })
    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    if (!r1.ok || !r2.ok) return
    expect(r1.value).not.toBe(r2.value)
  })
})

// ---------------------------------------------------------------------------
// US3: viewportRotations — viewport 角度適用
// ---------------------------------------------------------------------------

describe('RenderOptions — viewportRotations', () => {
  it('異なる viewportRotations では異なる SVG を返す', () => {
    const adapter = new SrVisualizerAdapter()
    const r1 = adapter.renderSVG(solved(3), {
      viewportRotations: [[ViewAxis.Y, 45], [ViewAxis.X, -34]],
    })
    const r2 = adapter.renderSVG(solved(3), {
      viewportRotations: [[ViewAxis.Y, 90], [ViewAxis.X, 0]],
    })
    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    if (!r1.ok || !r2.ok) return
    expect(r1.value).not.toBe(r2.value)
  })

  it('明示的にデフォルト viewport を指定しても ok を返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), {
      viewportRotations: [[ViewAxis.Y, 45], [ViewAxis.X, -34]],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('<svg')
  })
})

// ---------------------------------------------------------------------------
// US3: バリデーション — width / height ≤ 0 → INVALID_OPTIONS
// ---------------------------------------------------------------------------

describe('RenderOptions — バリデーション: width / height', () => {
  it('width: 0 は INVALID_OPTIONS エラーを返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { width: 0 })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_OPTIONS')
  })

  it('width: -1 は INVALID_OPTIONS エラーを返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { width: -1 })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_OPTIONS')
  })

  it('height: 0 は INVALID_OPTIONS エラーを返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { height: 0 })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_OPTIONS')
  })

  it('height: -100 は INVALID_OPTIONS エラーを返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { height: -100 })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_OPTIONS')
  })
})

// ---------------------------------------------------------------------------
// US3: バリデーション — 無効な backgroundColor → INVALID_COLOR
// ---------------------------------------------------------------------------

describe('RenderOptions — バリデーション: backgroundColor', () => {
  it('"notacolor" は INVALID_COLOR エラーを返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { backgroundColor: 'notacolor' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_COLOR')
  })

  it('"##zzzzzz" は INVALID_COLOR エラーを返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { backgroundColor: '##zzzzzz' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_COLOR')
  })

  it('"rgb(256, 0, 0)" は INVALID_COLOR エラーを返す（範囲外）', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { backgroundColor: 'rgb(256, 0, 0)' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_COLOR')
  })

  it('"#ffffff" は有効で ok を返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { backgroundColor: '#ffffff' })
    expect(result.ok).toBe(true)
  })

  it('"transparent" は有効で ok を返す', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { backgroundColor: 'transparent' })
    expect(result.ok).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// US4: DEFAULT_COLOR_SCHEME — オプション省略時の標準色適用
// デフォルト viewport（Y=45, X=-34）で Up・Right・Front の 3 面が可視
// ---------------------------------------------------------------------------

describe('US4: DEFAULT_COLOR_SCHEME — オプション省略時の標準色適用', () => {
  it('N=3 の SVG に White (#ffffff) が含まれる（Up 面 / 可視）', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain(DEFAULT_COLOR_SCHEME[0].toLowerCase())
  })

  it('N=3 の SVG に Red (#ff0000) が含まれる（Front 面 / 可視）', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain(DEFAULT_COLOR_SCHEME[2].toLowerCase())
  })

  it('N=3 の SVG に Blue (#0000ff) が含まれる（Right 面 / 可視）', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain(DEFAULT_COLOR_SCHEME[4].toLowerCase())
  })
})

// ---------------------------------------------------------------------------
// US4: colorScheme 部分上書き
// 指定した面のみ色が変わり、未指定面はデフォルト色が維持されること
// ---------------------------------------------------------------------------

describe('US4: colorScheme 部分上書き', () => {
  it('Up 面（key 0）を #aabbcc に上書きすると SVG に #aabbcc が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { colorScheme: { 0: '#aabbcc' } })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain('#aabbcc')
  })

  it('Up 面（key 0）を上書きすると White (#ffffff) は SVG に現れない', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { colorScheme: { 0: '#aabbcc' } })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // Up 面を置換したので #ffffff はステッカー色として使われない
    expect(result.value.toLowerCase()).not.toContain('#ffffff')
  })

  it('Up 面（key 0）を上書きしても Front 面（key 2）はデフォルト Red のまま', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { colorScheme: { 0: '#aabbcc' } })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain(DEFAULT_COLOR_SCHEME[2].toLowerCase())
  })

  it('Front 面（key 2）を #112233 に上書きすると SVG に #112233 が含まれる', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { colorScheme: { 2: '#112233' } })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain('#112233')
  })

  it('Front 面（key 2）を上書きしても Up 面（key 0）はデフォルト White のまま', () => {
    const adapter = new SrVisualizerAdapter()
    const result = adapter.renderSVG(solved(3), { colorScheme: { 2: '#112233' } })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain(DEFAULT_COLOR_SCHEME[0].toLowerCase())
  })

  it('部分上書きで変化しない面の色は renderSVG なしの場合と同一', () => {
    const adapter = new SrVisualizerAdapter()
    const defaultResult = adapter.renderSVG(solved(3))
    const overrideResult = adapter.renderSVG(solved(3), { colorScheme: { 0: '#aabbcc' } })
    expect(defaultResult.ok).toBe(true)
    expect(overrideResult.ok).toBe(true)
    if (!defaultResult.ok || !overrideResult.ok) return
    // Front 面 (Red) は両方に含まれる
    const color = DEFAULT_COLOR_SCHEME[2].toLowerCase()
    expect(defaultResult.value.toLowerCase()).toContain(color)
    expect(overrideResult.value.toLowerCase()).toContain(color)
  })
})
