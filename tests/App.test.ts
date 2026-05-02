// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

vi.mock('./src/render/index.js', () => ({
  renderSVG: vi.fn(() => ({ ok: true, value: '<svg><rect/></svg>' })),
}))
vi.mock('../src/render/index.js', () => ({
  renderSVG: vi.fn(() => ({ ok: true, value: '<svg><rect/></svg>' })),
}))

import App from '../src/App.vue'

describe('App', () => {
  it('マウントされ主要コンポーネントを含む', () => {
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })
    expect(wrapper.find('h1').text()).toContain('Visual Cube Editor 3')
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('[data-testid="notation-input"]').exists()).toBe(true)
  })
})
