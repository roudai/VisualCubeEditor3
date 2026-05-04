// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ViewportRotationControl from '../../src/components/ViewportRotationControl.vue'
import { useRenderOptionsStore } from '../../src/stores/renderOptions.js'

describe('ViewportRotationControl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('3スロット分の軸セレクトが存在する', () => {
    const wrapper = mount(ViewportRotationControl, { global: { plugins: [createPinia()] } })
    expect(wrapper.findAll('select')).toHaveLength(3)
  })

  it('3スロット分のスライダーが存在する', () => {
    const wrapper = mount(ViewportRotationControl, { global: { plugins: [createPinia()] } })
    expect(wrapper.findAll('input[type="range"]')).toHaveLength(3)
  })

  it('3スロット分の数値入力が存在する', () => {
    const wrapper = mount(ViewportRotationControl, { global: { plugins: [createPinia()] } })
    expect(wrapper.findAll('input[type="number"]')).toHaveLength(3)
  })

  it('初期状態でスロット0の軸が y、角度が 45 である', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ViewportRotationControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    expect(store.viewportRotations[0]).toEqual(['y', 45])
    const rangeInput = wrapper.findAll('input[type="range"]')[0]!
    expect((rangeInput.element as HTMLInputElement).value).toBe('45')
  })

  it('スロット0のスライダー変更で store.viewportRotations[0] の角度が更新される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ViewportRotationControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.findAll('input[type="range"]')[0]!.setValue('90')

    expect(store.viewportRotations[0]![1]).toBe(90)
  })

  it('スロット0の数値入力変更で store.viewportRotations[0] の角度が更新される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ViewportRotationControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.findAll('input[type="number"]')[0]!.setValue('-90')

    expect(store.viewportRotations[0]![1]).toBe(-90)
  })

  it('スロット0の Reset ボタンクリックでデフォルト値（y/45）に戻る', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ViewportRotationControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.findAll('input[type="range"]')[0]!.setValue('90')
    expect(store.viewportRotations[0]![1]).toBe(90)

    const resetBtns = wrapper.findAll('button').filter((b) => b.text() === 'Reset')
    await resetBtns[0]!.trigger('click')

    expect(store.viewportRotations[0]).toEqual(['y', 45])
  })

  it('スロット1の Reset ボタンクリックでデフォルト値（x/-34）に戻る', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(ViewportRotationControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.findAll('input[type="range"]')[1]!.setValue('0')

    const resetBtns = wrapper.findAll('button').filter((b) => b.text() === 'Reset')
    await resetBtns[1]!.trigger('click')

    expect(store.viewportRotations[1]).toEqual(['x', -34])
  })
})
