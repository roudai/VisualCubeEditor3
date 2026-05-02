import { describe, it, expect } from 'vitest'
import { renderSVG, renderPNG, createRenderer, DEFAULT_COLOR_SCHEME } from '../../src/render/index.js'
import { createCube } from '../../src/logic/index.js'

function solved(n: 2 | 3 | 4 | 5 | 6 | 7) {
  const r = createCube(n)
  if (!r.ok) throw new Error(r.error.message)
  return r.value
}

const PNG_MAGIC = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

// ---------------------------------------------------------------------------
// 公開 API — renderSVG
// ---------------------------------------------------------------------------

describe('公開 API: renderSVG', () => {
  it('ok を返し SVG 文字列を含む', () => {
    const result = renderSVG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toContain('<svg')
    expect(result.value).toContain('</svg>')
  })

  it('RenderOptions を受け付ける', () => {
    const result = renderSVG(solved(3), { backgroundColor: '#ff0000', width: 256 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.toLowerCase()).toContain('#ff0000')
  })

  it('不正オプションで err を返す', () => {
    const result = renderSVG(solved(3), { width: 0 })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_OPTIONS')
  })
})

// ---------------------------------------------------------------------------
// 公開 API — renderPNG
// ---------------------------------------------------------------------------

describe('公開 API: renderPNG', () => {
  it('ok を返し PNG マジックナンバーで始まる Uint8Array を含む', async () => {
    const result = await renderPNG(solved(3))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.subarray(0, 8)).toEqual(PNG_MAGIC)
  })
})

// ---------------------------------------------------------------------------
// 公開 API — createRenderer
// ---------------------------------------------------------------------------

describe('公開 API: createRenderer', () => {
  it('renderSVG / renderPNG を持つ Renderer を返す', () => {
    const renderer = createRenderer()
    expect(typeof renderer.renderSVG).toBe('function')
    expect(typeof renderer.renderPNG).toBe('function')
  })

  it('createRenderer().renderSVG は ok を返す', () => {
    const result = createRenderer().renderSVG(solved(3))
    expect(result.ok).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 公開 API — DEFAULT_COLOR_SCHEME
// ---------------------------------------------------------------------------

describe('公開 API: DEFAULT_COLOR_SCHEME', () => {
  it('6 面分の色マッピングを持つ', () => {
    expect(Object.keys(DEFAULT_COLOR_SCHEME)).toHaveLength(6)
  })

  it('Up 面（key 0）は White (#FFFFFF)', () => {
    expect(DEFAULT_COLOR_SCHEME[0].toUpperCase()).toBe('#FFFFFF')
  })
})
