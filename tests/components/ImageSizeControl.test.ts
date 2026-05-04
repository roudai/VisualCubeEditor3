// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ImageSizeControl from '../../src/components/ImageSizeControl.vue'
import { useRenderOptionsStore } from '../../src/stores/renderOptions.js'

describe('ImageSizeControl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('+1/−1/+10/−10/Reset の5ボタンが存在する', () => {
    const wrapper = mount(ImageSizeControl, { global: { plugins: [createPinia()] } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(5)
  })

  it('+10 ボタンクリックで store.imageSize が 10 増加する', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ImageSizeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    const before = store.imageSize
    const btn = wrapper.findAll('button').find((b) => b.text() === '+10')
    await btn!.trigger('click')

    expect(store.imageSize).toBe(before + 10)
  })

  it('−10 ボタンで 1px 未満にならない（下限クランプ）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ImageSizeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    store.imageSize = 5
    const btn = wrapper.findAll('button').find((b) => b.text() === '−10')
    await btn!.trigger('click')

    expect(store.imageSize).toBe(1)
  })

  it('Reset ボタンで imageSize が 128 に戻る', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ImageSizeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    store.imageSize = 256
    const btn = wrapper.findAll('button').find((b) => b.text() === 'Reset')
    await btn!.trigger('click')

    expect(store.imageSize).toBe(128)
  })

  it('スライダー変更で store.imageSize が更新される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ImageSizeControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.find('input[type="range"]').setValue('200')

    expect(store.imageSize).toBe(200)
  })
})
