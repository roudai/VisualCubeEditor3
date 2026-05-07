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
  // テキスト入力（リアルタイム反映）
  // ---------------------------------------------------------------------------

  it('入力でキューブ状態がリアルタイムに変化する', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    await wrapper.find('[data-testid="notation-input"]').setValue('R')

    expect(isSolved(store)).toBe(false)
  })

  it('不正な記法でエラーメッセージが表示される', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })

    await wrapper.find('[data-testid="notation-input"]').setValue('INVALID!!!')

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)
  })

  it('不正な記法の場合はキューブ状態が変化しない', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    await wrapper.find('[data-testid="notation-input"]').setValue('INVALID!!!')

    expect(isSolved(store)).toBe(true)
  })

  it('空欄入力ではキューブ状態が変化しない', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()

    await wrapper.find('[data-testid="notation-input"]').setValue('')

    expect(isSolved(store)).toBe(true)
  })

  it('正しい入力後はエラーメッセージが消える', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })

    await wrapper.find('[data-testid="notation-input"]').setValue('INVALID!!!')
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)

    await wrapper.find('[data-testid="notation-input"]').setValue('R')
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(false)
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

  it('U ボタンクリックでテキストボックスに "U" が追記される', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })

    const btn = wrapper.findAll('.face-buttons button').find((b) => b.text() === 'U')
    if (btn) await btn.trigger('click')

    const input = wrapper.find('[data-testid="notation-input"]').element as HTMLInputElement
    expect(input.value).toBe('U')
  })

  it('面ボタンを複数クリックするとスペース区切りで追記される', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })

    const uBtn = wrapper.findAll('.face-buttons button').find((b) => b.text() === 'U')
    const rBtn = wrapper.findAll('.face-buttons button').find((b) => b.text() === 'R')
    if (uBtn) await uBtn.trigger('click')
    if (rBtn) await rBtn.trigger('click')

    const input = wrapper.find('[data-testid="notation-input"]').element as HTMLInputElement
    expect(input.value).toBe('U R')
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

  // ---------------------------------------------------------------------------
  // 中層ムーブボタン
  // ---------------------------------------------------------------------------

  it('.inner-move-buttons グループに M / M\' / E / E\' / S / S\' ボタンが存在する', () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })
    const labels = wrapper.findAll('.inner-move-buttons button').map((b) => b.text())
    for (const btn of ['M', "M'", 'E', "E'", 'S', "S'"]) {
      expect(labels).toContain(btn)
    }
  })

  it('M ボタンクリックでテキストボックスに "M" が追記される', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })
    const btn = wrapper.findAll('.inner-move-buttons button').find((b) => b.text() === 'M')
    if (btn) await btn.trigger('click')
    const input = wrapper.find('[data-testid="notation-input"]').element as HTMLInputElement
    expect(input.value).toBe('M')
  })

  // ---------------------------------------------------------------------------
  // キューブ回転ボタン
  // ---------------------------------------------------------------------------

  it('.rotation-buttons グループに x / x\' / y / y\' / z / z\' ボタンが存在する', () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })
    const labels = wrapper.findAll('.rotation-buttons button').map((b) => b.text())
    for (const btn of ['x', "x'", 'y', "y'", 'z', "z'"]) {
      expect(labels).toContain(btn)
    }
  })

  it('x ボタンクリックでキューブ状態が変化する（3×3）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()
    const before = JSON.stringify(store.cubeState.faces)

    const btn = wrapper.findAll('.rotation-buttons button').find((b) => b.text() === 'x')
    if (btn) await btn.trigger('click')

    expect(JSON.stringify(store.cubeState.faces)).not.toBe(before)
  })

  // ---------------------------------------------------------------------------
  // algMode（アルゴリズム表示モード）
  // ---------------------------------------------------------------------------

  it('alg-mode-select が存在する', () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })
    expect(wrapper.find('[data-testid="alg-mode-select"]').exists()).toBe(true)
  })

  it('alg-mode-select の初期値が "apply" である', () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })
    const select = wrapper.find('[data-testid="alg-mode-select"]').element as HTMLSelectElement
    expect(select.value).toBe('apply')
  })

  it('algMode が "apply" のとき R を入力するとキューブが変化する', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MoveInput, { global: { plugins: [pinia] } })
    const store = useCubeStore()
    const before = JSON.stringify(store.cubeState.faces)

    await wrapper.find('[data-testid="notation-input"]').setValue('R')

    expect(JSON.stringify(store.cubeState.faces)).not.toBe(before)
  })

  it('algMode が "case" のとき R を入力すると apply モードとは異なる状態になる', async () => {
    const pinia1 = createPinia()
    setActivePinia(pinia1)
    const w1 = mount(MoveInput, { global: { plugins: [pinia1] } })
    const s1 = useCubeStore()
    await w1.find('[data-testid="notation-input"]').setValue('R')
    const applyState = JSON.stringify(s1.cubeState.faces)

    const pinia2 = createPinia()
    setActivePinia(pinia2)
    const w2 = mount(MoveInput, { global: { plugins: [pinia2] } })
    const s2 = useCubeStore()
    await w2.find('[data-testid="alg-mode-select"]').setValue('case')
    await w2.find('[data-testid="notation-input"]').setValue('R')
    const caseState = JSON.stringify(s2.cubeState.faces)

    expect(caseState).not.toBe(applyState)
  })

  it('algMode を切り替えてもテキストボックスの内容は変化しない', async () => {
    const wrapper = mount(MoveInput, { global: { plugins: [createPinia()] } })
    await wrapper.find('[data-testid="notation-input"]').setValue('R U')

    await wrapper.find('[data-testid="alg-mode-select"]').setValue('case')

    const input = wrapper.find('[data-testid="notation-input"]').element as HTMLInputElement
    expect(input.value).toBe('R U')
  })
})
