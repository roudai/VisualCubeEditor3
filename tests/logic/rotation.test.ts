import { describe, it, expect } from 'vitest'
import { createCube } from '../../src/logic/cube-state.js'
import { applyMove, applySequence, invertSequence } from '../../src/logic/rotation.js'
import { Color, Face, Direction, type CubeSize, type CubeState } from '../../src/logic/types.js'

function solvedCube(n: CubeSize): CubeState {
  const r = createCube(n)
  if (!r.ok) throw new Error(r.error.message)
  return r.value
}

describe('applyMove — イミュータブル性', () => {
  it('元の状態を変更しない', () => {
    const cube = solvedCube(3)
    const original = JSON.stringify(cube.faces)
    applyMove(cube, { face: Face.Up, sliceIndex: 0, direction: Direction.CW })
    expect(JSON.stringify(cube.faces)).toBe(original)
  })
})

describe('applyMove —往復検証（全6面・全3方向）', () => {
  const faces = [Face.Up, Face.Down, Face.Front, Face.Back, Face.Right, Face.Left]

  faces.forEach((face) => {
    it(`${face} 面: CW → CCW で元に戻る`, () => {
      const cube = solvedCube(3)
      const rotated = applyMove(cube, { face, sliceIndex: 0, direction: Direction.CW })
      expect(rotated.ok).toBe(true)
      if (!rotated.ok) return
      const restored = applyMove(rotated.value, { face, sliceIndex: 0, direction: Direction.CCW })
      expect(restored.ok).toBe(true)
      if (!restored.ok) return
      expect(JSON.stringify(restored.value.faces)).toBe(JSON.stringify(cube.faces))
    })

    it(`${face} 面: CW×4 で元に戻る`, () => {
      let state = solvedCube(3)
      for (let i = 0; i < 4; i++) {
        const result = applyMove(state, { face, sliceIndex: 0, direction: Direction.CW })
        expect(result.ok).toBe(true)
        if (!result.ok) return
        state = result.value
      }
      expect(JSON.stringify(state.faces)).toBe(JSON.stringify(solvedCube(3).faces))
    })

    it(`${face} 面: Double×2 で元に戻る`, () => {
      const cube = solvedCube(3)
      const once = applyMove(cube, { face, sliceIndex: 0, direction: Direction.Double })
      expect(once.ok).toBe(true)
      if (!once.ok) return
      const twice = applyMove(once.value, { face, sliceIndex: 0, direction: Direction.Double })
      expect(twice.ok).toBe(true)
      if (!twice.ok) return
      expect(JSON.stringify(twice.value.faces)).toBe(JSON.stringify(cube.faces))
    })
  })
})

describe('applyMove — U 面の具体的な色移動', () => {
  it('U CW で Front 上辺が Right 面の色（Blue）に変わる', () => {
    const cube = solvedCube(3)
    const result = applyMove(cube, { face: Face.Up, sliceIndex: 0, direction: Direction.CW })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.faces[Face.Front]?.[0]?.[0]).toBe(Color.Blue)
  })
})

describe('applyMove — NxN スライス', () => {
  it('4×4: sliceIndex=1 のスライス回転が成功する', () => {
    const cube = solvedCube(4)
    const result = applyMove(cube, { face: Face.Up, sliceIndex: 1, direction: Direction.CW })
    expect(result.ok).toBe(true)
  })

  it.each([2, 3, 4, 5, 6, 7] as CubeSize[])('サイズ %i: 外層回転が成功する', (n) => {
    const cube = solvedCube(n)
    const result = applyMove(cube, { face: Face.Up, sliceIndex: 0, direction: Direction.CW })
    expect(result.ok).toBe(true)
  })

  it('sliceIndex が範囲外の場合エラーを返す', () => {
    const cube = solvedCube(3)
    const result = applyMove(cube, { face: Face.Up, sliceIndex: 5, direction: Direction.CW })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_SLICE_INDEX')
  })
})

describe('applySequence', () => {
  it('空の手順は元の状態を返す', () => {
    const cube = solvedCube(3)
    const result = applySequence(cube, [])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(JSON.stringify(result.value.faces)).toBe(JSON.stringify(cube.faces))
  })

  it('手順を順に適用できる', () => {
    const cube = solvedCube(3)
    const seq = [
      { face: Face.Up, sliceIndex: 0, direction: Direction.CW },
      { face: Face.Right, sliceIndex: 0, direction: Direction.CW },
    ]
    const result = applySequence(cube, seq)
    expect(result.ok).toBe(true)
  })
})

describe('invertSequence', () => {
  it('手順 → インバース → 適用で元の状態に戻る', () => {
    const cube = solvedCube(3)
    const seq = [
      { face: Face.Up, sliceIndex: 0, direction: Direction.CW },
      { face: Face.Right, sliceIndex: 0, direction: Direction.CCW },
      { face: Face.Front, sliceIndex: 0, direction: Direction.Double },
    ]
    const scrambled = applySequence(cube, seq)
    if (!scrambled.ok) return
    const inv = invertSequence(seq)
    const restored = applySequence(scrambled.value, inv)
    if (!restored.ok) return
    expect(JSON.stringify(restored.value.faces)).toBe(JSON.stringify(cube.faces))
  })

  it('空の手順のインバースは空の手順', () => {
    expect(invertSequence([])).toEqual([])
  })

  it('CW のインバースは CCW', () => {
    const inv = invertSequence([{ face: Face.Up, sliceIndex: 0, direction: Direction.CW }])
    expect(inv[0]?.direction).toBe(Direction.CCW)
  })

  it('Double のインバースは Double', () => {
    const inv = invertSequence([{ face: Face.Up, sliceIndex: 0, direction: Direction.Double }])
    expect(inv[0]?.direction).toBe(Direction.Double)
  })
})
