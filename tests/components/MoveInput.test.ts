// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MoveInput from '../../src/components/MoveInput.vue'
import { useCubeStore } from '../../src/stores/cube.js'

function isSolved(store: ReturnType<typeof useCubeStore>): boolean {
  return store.cubeState.faces.every((face) => {
    const first = face[0]?.[0]
    return face.every((row) => row.every((c) => c === first))
  })
}

describe('MoveInput', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ---------------------------------------------------------------------------
  // テキスト入力フォーム
  // ---------------------------------------------------------------------------

  it('フォーム送信でキューブ状態が変化する', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    await wrapper.find('[data-testid="notation-input"]').setValue('R')
    await wrapper.find('form').trigger('submit')

    expect(isSolved(store)).toBe(false)
  })

  it('送信後に入力欄がクリアされる', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })

    await wrapper.find('[data-testid="notation-input"]').setValue('U')
    await wrapper.find('form').trigger('submit')

    expect(
      (wrapper.find('[data-testid="notation-input"]').element as HTMLInputElement).value,
    ).toBe('')
  })

  it('不正な記法でエラーメッセージが表示される', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })

    await wrapper.find('[data-testid="notation-input"]').setValue('INVALID!!!')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)
  })

  it('不正な記法の場合はキューブ状態が変化しない', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    await wrapper.find('[data-testid="notation-input"]').setValue('INVALID!!!')
    await wrapper.find('form').trigger('submit')

    expect(isSolved(store)).toBe(true)
  })

  it('正しい入力後はエラーメッセージが消える', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })

    await wrapper.find('[data-testid="notation-input"]').setValue('INVALID!!!')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)

    await wrapper.find('[data-testid="notation-input"]').setValue('R')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(false)
  })

  it('空欄送信ではキューブ状態が変化しない', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    await wrapper.find('[data-testid="notation-input"]').setValue('')
    await wrapper.find('form').trigger('submit')

    expect(isSolved(store)).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // 面ムーブボタン
  // ---------------------------------------------------------------------------

  it('各面ボタン（U / D / R / L / F / B）が存在する', () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })
    const labels = wrapper.findAll('.face-buttons button').map((b) => b.text())
    for (const face of ['U', 'D', 'R', 'L', 'F', 'B']) {
      expect(labels).toContain(face)
    }
  })

  it('U ボタンクリックでキューブ状態が変化する', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    const btn = wrapper.findAll('.face-buttons button').find((b) => b.text() === 'U')
    if (btn) await btn.trigger('click')

    expect(isSolved(store)).toBe(false)
  })

  it("R' ボタンクリックでキューブ状態が変化する", async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    const btn = wrapper.findAll('.face-buttons button').find((b) => b.text() === "R'")
    if (btn) await btn.trigger('click')

    expect(isSolved(store)).toBe(false)
  })
})
