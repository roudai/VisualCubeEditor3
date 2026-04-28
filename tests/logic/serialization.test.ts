import { describe, it, expect } from 'vitest'
import { createCube } from '../../src/logic/cube-state.js'
import { serialize, deserialize } from '../../src/logic/serialization.js'
import type { CubeSize, CubeState } from '../../src/logic/types.js'

function solvedCube<N extends CubeSize>(n: N): CubeState<N> {
  const r = createCube(n)
  if (!r.ok) throw new Error(r.error.message)
  return r.value
}

describe('serialize', () => {
  it('CubeState を SerializedCube に変換できる', () => {
    const cube = solvedCube(3)
    const saved = serialize(cube)
    expect(saved.v).toBe(1)
    expect(saved.size).toBe(3)
    expect(saved.data.length).toBe(6 * 3 * 3)
  })

  it.each([2, 3, 4, 5, 6, 7] as const)('サイズ %i のキューブを直列化できる', (n) => {
    const cube = solvedCube(n)
    const saved = serialize(cube)
    expect(saved.data.length).toBe(6 * n * n)
  })
})

describe('deserialize', () => {
  it('serialize した値を復元できる', () => {
    const cube = solvedCube(3)
    const saved = serialize(cube)
    const result = deserialize(saved)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.size).toBe(3)
    expect(JSON.stringify(result.value.faces)).toBe(JSON.stringify(cube.faces))
  })

  it.each([2, 3, 4, 5, 6, 7] as const)('サイズ %i のラウンドトリップが成立する', (n) => {
    const cube = solvedCube(n)
    const result = deserialize(serialize(cube))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(JSON.stringify(result.value.faces)).toBe(JSON.stringify(cube.faces))
  })

  it('不正なデータはエラーを返す', () => {
    expect(deserialize(null).ok).toBe(false)
    expect(deserialize({ v: 1, size: 3, data: [] }).ok).toBe(false)
    expect(deserialize({ v: 99, size: 3, data: new Array(54).fill(0) }).ok).toBe(false)
  })

  it('data 配列の長さが不正な場合エラーを返す', () => {
    const result = deserialize({ v: 1, size: 3, data: new Array(10).fill(0) })
    expect(result.ok).toBe(false)
  })
})
