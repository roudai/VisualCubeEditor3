import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCubeStore } from '../../src/stores/cube.js'
import { Face, Direction, parseNotation } from '../../src/logic/index.js'

function isSolved(state: ReturnType<typeof useCubeStore>['cubeState']): boolean {
  return state.faces.every((face) => face.every((row) => row.every((c) => c === face[0]![0])))
}

describe('useCubeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ---------------------------------------------------------------------------
  // 初期状態
  // ---------------------------------------------------------------------------

  it('初期サイズは 3', () => {
    const store = useCubeStore()
    expect(store.size).toBe(3)
  })

  it('初期 cubeState は 3×3 の完成状態', () => {
    const store = useCubeStore()
    expect(store.cubeState.size).toBe(3)
    expect(isSolved(store.cubeState)).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // setSize
  // ---------------------------------------------------------------------------

  it.each([2, 4, 5, 6, 7] as const)('setSize(%i) でサイズが変わり完成状態になる', (n) => {
    const store = useCubeStore()
    store.setSize(n)
    expect(store.size).toBe(n)
    expect(store.cubeState.size).toBe(n)
    expect(isSolved(store.cubeState)).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // applyMove
  // ---------------------------------------------------------------------------

  it('applyMove でキューブ状態が変化する', () => {
    const store = useCubeStore()
    const before = JSON.stringify(store.cubeState.faces)
    store.applyMove({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(JSON.stringify(store.cubeState.faces)).not.toBe(before)
  })

  it('applyMove 4 回（CW×4）で元の状態に戻る', () => {
    const store = useCubeStore()
    const before = JSON.stringify(store.cubeState.faces)
    for (let i = 0; i < 4; i++) {
      store.applyMove({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    }
    expect(JSON.stringify(store.cubeState.faces)).toBe(before)
  })

  // ---------------------------------------------------------------------------
  // applySequence
  // ---------------------------------------------------------------------------

  it('applySequence でキューブ状態が変化する', () => {
    const store = useCubeStore()
    const before = JSON.stringify(store.cubeState.faces)
    const result = parseNotation("R U R' U'")
    expect(result.ok).toBe(true)
    if (!result.ok) return
    store.applySequence(result.value)
    expect(JSON.stringify(store.cubeState.faces)).not.toBe(before)
  })

  it('空の sequence は状態を変えない', () => {
    const store = useCubeStore()
    const before = JSON.stringify(store.cubeState.faces)
    store.applySequence([])
    expect(JSON.stringify(store.cubeState.faces)).toBe(before)
  })

  // ---------------------------------------------------------------------------
  // reset
  // ---------------------------------------------------------------------------

  it('reset でキューブが完成状態に戻る', () => {
    const store = useCubeStore()
    store.applyMove({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(isSolved(store.cubeState)).toBe(false)
    store.reset()
    expect(isSolved(store.cubeState)).toBe(true)
  })

  it('setSize(5) 後の reset は 5×5 完成状態になる', () => {
    const store = useCubeStore()
    store.setSize(5)
    store.applyMove({ face: Face.Up, sliceIndex: 0, direction: Direction.CCW })
    store.reset()
    expect(store.cubeState.size).toBe(5)
    expect(isSolved(store.cubeState)).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // イミュータブル性
  // ---------------------------------------------------------------------------

  it('applyMove 後も元の cubeState オブジェクトは変更されない', () => {
    const store = useCubeStore()
    const snapshot = store.cubeState
    const before = JSON.stringify(snapshot.faces)
    store.applyMove({ face: Face.Right, sliceIndex: 0, direction: Direction.CW })
    expect(JSON.stringify(snapshot.faces)).toBe(before)
  })
})
