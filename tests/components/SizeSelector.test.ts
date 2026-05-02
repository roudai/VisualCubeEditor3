// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SizeSelector from '../../src/components/SizeSelector.vue'
import { useCubeStore } from '../../src/stores/cube.js'

describe('SizeSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('サイズ選択肢 2〜7（計 6 個）が表示される', () => {
    const wrapper = mount(SizeSelector, { global: { plugins: [createPinia()] } })
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(6)
  })

  it('最小値 2×2・最大値 7×7 のラベルが存在する', () => {
    const wrapper = mount(SizeSelector, { global: { plugins: [createPinia()] } })
    const options = wrapper.findAll('option')
    expect(options[0]!.text()).toContain('2')
    expect(options[5]!.text()).toContain('7')
  })

  it('デフォルト選択値は 3', () => {
    const wrapper = mount(SizeSelector, { global: { plugins: [createPinia()] } })
    const select = wrapper.find('select')
    expect((select.element as HTMLSelectElement).value).toBe('3')
  })

  it('select 変更で store.size が更新される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(SizeSelector, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    await wrapper.find('select').setValue('5')

    expect(store.size).toBe(5)
  })

  it('select 変更で cubeState のサイズが変わる', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(SizeSelector, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    await wrapper.find('select').setValue('2')

    expect(store.cubeState.size).toBe(2)
  })
})
