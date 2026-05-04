// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SpecialViewControl from '../../src/components/SpecialViewControl.vue'
import { useRenderOptionsStore } from '../../src/stores/renderOptions.js'

describe('SpecialViewControl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('ラジオボタンが "normal" と "plan" の2択存在する', () => {
    const wrapper = mount(SpecialViewControl, { global: { plugins: [createPinia()] } })
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(2)
    const values = radios.map((r) => (r.element as HTMLInputElement).value)
    expect(values).toContain('normal')
    expect(values).toContain('plan')
  })

  it('初期状態では "normal" が選択されている', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(SpecialViewControl, { global: { plugins: [pinia] } })
    const normalRadio = wrapper.find('input[value="normal"]')
    expect((normalRadio.element as HTMLInputElement).checked).toBe(true)
  })

  it('"plan" ラジオを選択すると store.view が "plan" になる', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(SpecialViewControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    const radio = wrapper.find('input[value="plan"]')
    ;(radio.element as HTMLInputElement).checked = true
    await radio.trigger('change')

    expect(store.view).toBe('plan')
  })

  it('"normal" に戻すと store.view が "normal" になる', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(SpecialViewControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    const planRadio = wrapper.find('input[value="plan"]')
    ;(planRadio.element as HTMLInputElement).checked = true
    await planRadio.trigger('change')

    const normalRadio = wrapper.find('input[value="normal"]')
    ;(normalRadio.element as HTMLInputElement).checked = true
    await normalRadio.trigger('change')

    expect(store.view).toBe('normal')
  })
})
