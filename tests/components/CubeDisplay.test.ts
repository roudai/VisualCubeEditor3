// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// svgdom が happy-dom を上書きしないようレンダー層をモック
vi.mock('../../src/render/index.js', () => ({
  renderSVG: vi.fn(() => ({ ok: true, value: '<svg><rect width="128" height="128"/></svg>' })),
}))

import CubeDisplay from '../../src/components/CubeDisplay.vue'
import { useCubeStore } from '../../src/stores/cube.js'
import { renderSVG } from '../../src/render/index.js'
import { Face, Direction } from '../../src/logic/index.js'

describe('CubeDisplay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(renderSVG).mockReturnValue({ ok: true, value: '<svg><rect width="128" height="128"/></svg>' })
  })

  it('SVG をレンダリングする', () => {
    const wrapper = mount(CubeDisplay, { global: { plugins: [createPinia()] } })
    expect(wrapper.html()).toContain('<svg>')
  })

  it('キューブ状態が変わると renderSVG が再呼び出しされる', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(CubeDisplay, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    const callsBefore = vi.mocked(renderSVG).mock.calls.length
    store.applyMove({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    await wrapper.vm.$nextTick()

    expect(vi.mocked(renderSVG).mock.calls.length).toBeGreaterThan(callsBefore)
  })

  it('renderSVG が err を返した場合は空文字を表示する', () => {
    vi.mocked(renderSVG).mockReturnValueOnce({
      ok: false,
      error: { kind: 'INVALID_CUBE_SIZE', message: 'error' },
    })
    const wrapper = mount(CubeDisplay, { global: { plugins: [createPinia()] } })
    expect(wrapper.find('.cube-display').html()).not.toContain('<svg>')
  })
})
