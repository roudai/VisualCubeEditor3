import { describe, it, expect } from 'vitest'
import { validateState } from '../../src/logic/validation.js'
import { createCube } from '../../src/logic/cube-state.js'
import { applyMove, applySequence } from '../../src/logic/rotation.js'
import { parseNotation } from '../../src/logic/notation.js'
import { Color, Face, Direction, type CubeState, type CubeSize } from '../../src/logic/types.js'

function solvedCube(n: CubeSize): CubeState {
  const r = createCube(n)
  if (!r.ok) throw new Error(r.error.message)
  return r.value
}

describe('validateState — 合法状態', () => {
  it.each([2, 3, 4, 5, 6, 7] as const)('完成状態（サイズ %i）は合法と判定される', (n) => {
    const result = validateState(solvedCube(n))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toBe(true)
  })

  it('任意の合法手順を適用したスクランブル済み状態は合法', () => {
    const cube = solvedCube(3)
    const notationResult = parseNotation("R U R' U'")
    if (!notationResult.ok) throw new Error(notationResult.error.message)
    const scrambled = applySequence(cube, notationResult.value)
    if (!scrambled.ok) throw new Error(scrambled.error.message)
    expect(validateState(scrambled.value).ok).toBe(true)
  })

  it('スライス手順を適用した状態は合法（サイズ4）', () => {
    const cube = solvedCube(4)
    const r = applyMove(cube, { face: Face.Right, sliceIndex: 1, direction: Direction.CW })
    if (!r.ok) throw new Error(r.error.message)
    expect(validateState(r.value).ok).toBe(true)
  })
})

describe('validateState — 不正次元', () => {
  it('faces が 6 未満の場合はエラー（INVALID_CUBE_STATE）', () => {
    const cube = solvedCube(3)
    const faces = cube.faces.slice(0, 5) as unknown as CubeState['faces']
    const result = validateState({ size: 3, faces })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_STATE')
  })

  it('ある面の行数が size と一致しない場合はエラー', () => {
    const cube = solvedCube(3)
    const faces = [
      cube.faces[Face.Up].slice(0, 2), // 2 行（本来 3 行）
      cube.faces[Face.Down],
      cube.faces[Face.Front],
      cube.faces[Face.Back],
      cube.faces[Face.Right],
      cube.faces[Face.Left],
    ] as unknown as CubeState['faces']
    const result = validateState({ size: 3, faces })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_STATE')
  })

  it('ある面のある行の列数が size と一致しない場合はエラー', () => {
    const cube = solvedCube(3)
    const modifiedUp = cube.faces[Face.Up].map((row, ri) =>
      ri === 0 ? row.slice(0, 2) : row, // 1 行だけ 2 列（本来 3 列）
    )
    const faces = [
      modifiedUp,
      cube.faces[Face.Down],
      cube.faces[Face.Front],
      cube.faces[Face.Back],
      cube.faces[Face.Right],
      cube.faces[Face.Left],
    ] as unknown as CubeState['faces']
    const result = validateState({ size: 3, faces })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_STATE')
  })
})

describe('validateState — ステッカー数異常', () => {
  it('ある色のステッカーが N² より多い場合はエラー（別の色が減る）', () => {
    const cube = solvedCube(3)
    // Up[0][0] を White→Orange に変更：White が 8 個、Orange が 10 個
    const modifiedUp = cube.faces[Face.Up].map((row, ri) =>
      row.map((color, ci) => (ri === 0 && ci === 0 ? Color.Orange : color)),
    )
    const faces = [
      modifiedUp,
      cube.faces[Face.Down],
      cube.faces[Face.Front],
      cube.faces[Face.Back],
      cube.faces[Face.Right],
      cube.faces[Face.Left],
    ] as unknown as CubeState['faces']
    const result = validateState({ size: 3, faces })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_STATE')
  })

  it('存在しない色コードが含まれる場合はエラー', () => {
    const cube = solvedCube(3)
    const modifiedUp = cube.faces[Face.Up].map((row, ri) =>
      row.map((color, ci) => (ri === 0 && ci === 0 ? (99 as Color) : color)),
    )
    const faces = [
      modifiedUp,
      cube.faces[Face.Down],
      cube.faces[Face.Front],
      cube.faces[Face.Back],
      cube.faces[Face.Right],
      cube.faces[Face.Left],
    ] as unknown as CubeState['faces']
    const result = validateState({ size: 3, faces })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_STATE')
  })

  it('サイズ2でもステッカー数チェックが機能する（各色 4 個）', () => {
    const cube = solvedCube(2)
    const modifiedUp = cube.faces[Face.Up].map((row, ri) =>
      row.map((color, ci) => (ri === 0 && ci === 0 ? Color.Yellow : color)),
    )
    const faces = [
      modifiedUp,
      cube.faces[Face.Down],
      cube.faces[Face.Front],
      cube.faces[Face.Back],
      cube.faces[Face.Right],
      cube.faces[Face.Left],
    ] as unknown as CubeState['faces']
    const result = validateState({ size: 2, faces })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_STATE')
  })
})

describe('validateState — パリティ違反（N=3 のみ）', () => {
  // コーナーピースの向きを 1 つだけ手動で変える（コーナー向き和 mod 3 ≠ 0）
  // URF コーナー（Up[2][2], Right[0][0], Front[0][2]）を時計回りに 1 ツイスト
  it('コーナー1個を 1 回転させた状態は非合法', () => {
    const cube = solvedCube(3)
    // Up[2][2]=White, Right[0][0]=Blue, Front[0][2]=Red を循環置換
    const modifiedUp = cube.faces[Face.Up].map((row, ri) =>
      row.map((color, ci) => (ri === 2 && ci === 2 ? Color.Red : color)),
    )
    const modifiedRight = cube.faces[Face.Right].map((row, ri) =>
      row.map((color, ci) => (ri === 0 && ci === 0 ? Color.White : color)),
    )
    const modifiedFront = cube.faces[Face.Front].map((row, ri) =>
      row.map((color, ci) => (ri === 0 && ci === 2 ? Color.Blue : color)),
    )
    const faces = [
      modifiedUp,
      cube.faces[Face.Down],
      modifiedFront,
      cube.faces[Face.Back],
      modifiedRight,
      cube.faces[Face.Left],
    ] as unknown as CubeState['faces']
    const result = validateState({ size: 3, faces })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_STATE')
  })

  // エッジピースの向きを 1 つだけ反転（エッジ向き和 mod 2 ≠ 0）
  // UF エッジ（Up[2][1]=White, Front[0][1]=Red）を反転
  it('エッジ1個を反転させた状態は非合法', () => {
    const cube = solvedCube(3)
    const modifiedUp = cube.faces[Face.Up].map((row, ri) =>
      row.map((color, ci) => (ri === 2 && ci === 1 ? Color.Red : color)),
    )
    const modifiedFront = cube.faces[Face.Front].map((row, ri) =>
      row.map((color, ci) => (ri === 0 && ci === 1 ? Color.White : color)),
    )
    const faces = [
      modifiedUp,
      cube.faces[Face.Down],
      modifiedFront,
      cube.faces[Face.Back],
      cube.faces[Face.Right],
      cube.faces[Face.Left],
    ] as unknown as CubeState['faces']
    const result = validateState({ size: 3, faces })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe('INVALID_CUBE_STATE')
  })

  it('N≠3 ではパリティチェックをスキップし、構造・ステッカー数チェックのみ行う', () => {
    // サイズ4の完成状態は合法（パリティチェック対象外）
    expect(validateState(solvedCube(4)).ok).toBe(true)
    expect(validateState(solvedCube(2)).ok).toBe(true)
  })
})
