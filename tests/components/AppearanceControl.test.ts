// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppearanceControl from '../../src/components/AppearanceControl.vue'
import { useRenderOptionsStore } from '../../src/stores/renderOptions.js'

describe('AppearanceControl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('背景色・キューブ色・マスク色の3つのカラーピッカーが存在する', () => {
    const wrapper = mount(AppearanceControl, { global: { plugins: [createPinia()] } })
    expect(wrapper.findAll('input[type="color"]')).toHaveLength(3)
  })

  it('背景色ピッカーの変更で store.backgroundColor が更新される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(AppearanceControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.find('input[data-testid="background-color"]').setValue('#112233')

    expect(store.backgroundColor).toBe('#112233')
  })

  it('cubeOpacity スライダーの変更で store.cubeOpacity が更新される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(AppearanceControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.find('input[data-testid="cube-opacity"]').setValue('75')

    expect(store.cubeOpacity).toBe(75)
  })

  it('dist スライダーの変更で store.dist が更新される', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(AppearanceControl, { global: { plugins: [pinia] } })
    const store = useRenderOptionsStore()

    await wrapper.find('input[data-testid="dist"]').setValue('30')

    expect(store.dist).toBe(30)
  })
})
