// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useCubeStore } from '../../src/stores/cube.js'
import { useCubePersist } from '../../src/composables/useCubePersist.js'
import { Face, Direction, serialize } from '../../src/logic/index.js'

const STORAGE_KEY = 'vce3-cube-state'

const TestComponent = defineComponent({
  setup() {
    useCubePersist()
    return {}
  },
  template: '<div></div>',
})

function mountPersist(pinia = createPinia()): { wrapper: ReturnType<typeof mount>; pinia: ReturnType<typeof createPinia> } {
  setActivePinia(pinia)
  return { wrapper: mount(TestComponent, { global: { plugins: [pinia] } }), pinia }
}

describe('useCubePersist', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  // ---------------------------------------------------------------------------
  // 保存
  // ---------------------------------------------------------------------------

  it('キューブ状態変更時に localStorage へ保存される', async () => {
    const { wrapper } = mountPersist()
    const store = useCubeStore()

    store.applyMove({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    await wrapper.vm.$nextTick()

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('保存データは有効な JSON で SerializedCube 形式', async () => {
    const { wrapper } = mountPersist()
    const store = useCubeStore()

    store.applyMove({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    await wrapper.vm.$nextTick()

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw ?? '') as unknown
    expect(typeof parsed).toBe('object')
    expect((parsed as Record<string, unknown>)['v']).toBe(1)
  })

  // ---------------------------------------------------------------------------
  // 復元
  // ---------------------------------------------------------------------------

  it('マウント時に localStorage から状態が復元される', async () => {
    // R ムーブ済み状態を保存
    const store0 = useCubeStore()
    store0.applyMove({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    const movedFaces = JSON.stringify(store0.cubeState.faces)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(store0.cubeState)))

    // 新しい Pinia でマウント → 復元されるはず
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useCubeStore()
    const { wrapper } = mountPersist(pinia)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(JSON.stringify(store.cubeState.faces)).toBe(movedFaces)
  })

  it('復元後に store.size が正しく設定される', async () => {
    const store0 = useCubeStore()
    store0.setSize(5)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(store0.cubeState)))

    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useCubeStore()
    const { wrapper } = mountPersist(pinia)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(store.size).toBe(5)
  })

  // ---------------------------------------------------------------------------
  // フォールバック（不正データ）
  // ---------------------------------------------------------------------------

  it('不正 JSON の場合は solved 状態のまま', async () => {
    localStorage.setItem(STORAGE_KEY, 'NOT{JSON}}')

    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useCubeStore()
    const solvedFaces = JSON.stringify(store.cubeState.faces)

    const { wrapper } = mountPersist(pinia)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(JSON.stringify(store.cubeState.faces)).toBe(solvedFaces)
  })

  it('不正スキーマの場合は solved 状態のまま', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 99, size: 3, data: [] }))

    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useCubeStore()
    const solvedFaces = JSON.stringify(store.cubeState.faces)

    const { wrapper } = mountPersist(pinia)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(JSON.stringify(store.cubeState.faces)).toBe(solvedFaces)
  })

  it('localStorage が空の場合は solved 状態のまま', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useCubeStore()

    mountPersist(pinia)
    await flushPromises()

    const isSolved = store.cubeState.faces.every((f) =>
      f.every((r) => {
        const first = r[0]
        return r.every((c) => c === first)
      }),
    )
    expect(isSolved).toBe(true)
  })
})
