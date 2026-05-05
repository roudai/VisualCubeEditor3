// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ColorSchemeControl from '../../src/components/ColorSchemeControl.vue'
import { useRenderOptionsStore } from '../../src/stores/renderOptions.js'
import { DEFAULT_COLOR_SCHEME } from '../../src/render/defaults.js'

describe('ColorSchemeControl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('6つのカラーピッカーが存在する', () => {
    const wrapper = mount(ColorSchemeControl, { global: { plugins: [createPinia()] } })
    expect(wrapper.findAll('input[type="color"]')).toHaveLength(6)
  })

  it('U面ピッカー（インデックス0）の値変更で store.colorScheme[0] が更新される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ColorSchemeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.findAll('input[type="color"]')[0]!.setValue('#aabbcc')

    expect(store.colorScheme[0]).toBe('#aabbcc')
  })

  it('"x" ボタンクリックで rotateX が実行される（U←B の色変化を確認）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ColorSchemeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    const beforeB = store.colorScheme[3]
    const xBtn = wrapper.findAll('button').find((b) => b.text() === 'x')
    await xBtn!.trigger('click')

    expect(store.colorScheme[0]).toBe(beforeB) // U ← B
  })

  it('"y" ボタンクリックで rotateY が実行される（F←R の色変化を確認）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ColorSchemeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    const beforeR = store.colorScheme[4]
    const yBtn = wrapper.findAll('button').find((b) => b.text() === 'y')
    await yBtn!.trigger('click')

    expect(store.colorScheme[2]).toBe(beforeR) // F ← R
  })

  it('"z" ボタンクリックで rotateZ が実行される（U←L の色変化を確認）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ColorSchemeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    const beforeL = store.colorScheme[5]
    const zBtn = wrapper.findAll('button').find((b) => b.text() === 'z')
    await zBtn!.trigger('click')

    expect(store.colorScheme[0]).toBe(beforeL) // U ← L
  })

  it('"Reset" ボタンクリックで resetColorScheme が実行される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ColorSchemeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    store.colorScheme = { 0: '#111111', 1: '#222222', 2: '#333333', 3: '#444444', 4: '#555555', 5: '#666666' }
    await wrapper.find('[data-testid="reset-btn"]').trigger('click')

    expect(store.colorScheme).toEqual(DEFAULT_COLOR_SCHEME)
  })
})
