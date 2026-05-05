// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StageMaskControl from '../../src/components/StageMaskControl.vue'
import { useRenderOptionsStore } from '../../src/stores/renderOptions.js'

describe('StageMaskControl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('マスク未選択時は maskAlg セレクトが disabled', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StageMaskControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()
    expect(store.mask).toBe('')
    const selects = wrapper.findAll('select')
    const maskAlgSelect = selects[1]
    expect((maskAlgSelect!.element as HTMLSelectElement).disabled).toBe(true)
  })

  it('"OLL" を選択すると store.mask が "oll" になる', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StageMaskControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.findAll('select')[0]!.setValue('oll')

    expect(store.mask).toBe('oll')
  })

  it('マスク選択後は maskAlg セレクトが有効になる', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StageMaskControl, { global: { plugins: [pinia] } })

    await wrapper.findAll('select')[0]!.setValue('oll')
    await nextTick()

    const maskAlgSelect = wrapper.findAll('select')[1]
    expect((maskAlgSelect!.element as HTMLSelectElement).disabled).toBe(false)
  })

  it('Mask Alg で "y" を選ぶと store.maskAlg が "y" になる', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StageMaskControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    store.mask = 'oll'
    await nextTick()

    await wrapper.findAll('select')[1]!.setValue('y')

    expect(store.maskAlg).toBe('y')
  })

  it('マスクを空に戻すと store.mask が "" になる', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(StageMaskControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.findAll('select')[0]!.setValue('oll')
    await wrapper.findAll('select')[0]!.setValue('')

    expect(store.mask).toBe('')
  })
})
