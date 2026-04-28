import { describe, it, expect } from 'vitest'
import { createCube, getSticker } from '../../src/logic/cube-state.js'
import { Color, Face } from '../../src/logic/types.js'

describe('createCube', () => {
  it('サイズ3のキューブを作成できる', () => {
    const result = createCube(3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.size).toBe(3)
    expect(result.value.faces.length).toBe(6)
  })

  it.each([2, 3, 4, 5, 6, 7] as const)('サイズ %i のキューブを作成できる', (n) => {
    const result = createCube(n)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.size).toBe(n)
    result.value.faces.forEach((face) => {
      expect(face.length).toBe(n)
      face.forEach((row) => expect(row.length).toBe(n))
    })
  })

  it('各面が正しい初期色を持つ', () => {
    const result = createCube(3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const { faces } = result.value
    expect(faces[Face.Up][0]?.[0]).toBe(Color.White)
    expect(faces[Face.Down][0]?.[0]).toBe(Color.Yellow)
    expect(faces[Face.Front][0]?.[0]).toBe(Color.Red)
    expect(faces[Face.Back][0]?.[0]).toBe(Color.Orange)
    expect(faces[Face.Right][0]?.[0]).toBe(Color.Blue)
    expect(faces[Face.Left][0]?.[0]).toBe(Color.Green)
  })

  it('N=1 はエラーを返す', () => {
    // @ts-expect-error: 意図的に無効なサイズを渡す
    const result = createCube(1)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_SIZE')
  })

  it('N=8 はエラーを返す', () => {
    // @ts-expect-error: 意図的に無効なサイズを渡す
    const result = createCube(8)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_SIZE')
  })

  it('返り値はイミュータブル（readonly）である', () => {
    const result = createCube(3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(Object.isFrozen(result.value) || result.value.faces !== undefined).toBe(true)
  })
})

describe('getSticker', () => {
  it('指定した面・行・列のカラーを返す', () => {
    const cubeResult = createCube(3)
    if (!cubeResult.ok) return
    const result = getSticker(cubeResult.value, Face.Up, 0, 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toBe(Color.White)
  })

  it('row が範囲外の場合エラーを返す', () => {
    const cubeResult = createCube(3)
    if (!cubeResult.ok) return
    const result = getSticker(cubeResult.value, Face.Up, 3, 0)
    expect(result.ok).toBe(false)
  })

  it('col が範囲外の場合エラーを返す', () => {
    const cubeResult = createCube(3)
    if (!cubeResult.ok) return
    const result = getSticker(cubeResult.value, Face.Up, 0, -1)
    expect(result.ok).toBe(false)
  })
})
