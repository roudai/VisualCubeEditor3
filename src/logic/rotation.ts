import {
  Face,
  Direction,
  type CubeState,
  type Move,
  type MoveSequence,
  type LogicError,
  type Color,
} from './types.js'
import { ok, err, type Result } from './result.js'

type FaceGrid = ReadonlyArray<ReadonlyArray<Color>>
type MutableGrid = Color[][]

/** face グリッドを時計回りに90度回転した新グリッドを返す */
function rotateFaceGridCW(face: FaceGrid): FaceGrid {
  const n = face.length
  return Array.from({ length: n }, (_, r) =>
    Object.freeze(Array.from({ length: n }, (__, c) => face[n - 1 - c]![r]!) as Color[]),
  )
}

/** face グリッドを反時計回りに90度回転した新グリッドを返す */
function rotateFaceGridCCW(face: FaceGrid): FaceGrid {
  const n = face.length
  return Array.from({ length: n }, (_, r) =>
    Object.freeze(Array.from({ length: n }, (__, c) => face[c]![n - 1 - r]!) as Color[]),
  )
}

/** face グリッドを180度回転した新グリッドを返す */
function rotateFaceGrid180(face: FaceGrid): FaceGrid {
  const n = face.length
  return Array.from({ length: n }, (_, r) =>
    Object.freeze(Array.from({ length: n }, (__, c) => face[n - 1 - r]![n - 1 - c]!) as Color[]),
  )
}

/**
 * 辺のサイクル置換を適用する。
 * adjacentSlices は [面インデックス, row取得関数, col取得関数] の配列で、
 * 時計回りの巡回順に並んでいる。
 */
function cycleEdge(
  grids: MutableGrid[],
  sliceLen: number,
  adjacent: ReadonlyArray<[faceIdx: number, getRow: (i: number) => number, getCol: (i: number) => number]>,
  direction: Direction,
): void {
  const count = adjacent.length // 通常4
  const saved = Array.from({ length: sliceLen }, (_, i) => {
    const [f, getRow, getCol] = adjacent[count - 1]!
    return grids[f]![getRow(i)]![getCol(i)]!
  })

  if (direction === Direction.CW) {
    for (let step = count - 1; step > 0; step--) {
      const [fTo, getRowTo, getColTo] = adjacent[step]!
      const [fFrom, getRowFrom, getColFrom] = adjacent[step - 1]!
      for (let i = 0; i < sliceLen; i++) {
        grids[fTo]![getRowTo(i)]![getColTo(i)] = grids[fFrom]![getRowFrom(i)]![getColFrom(i)]!
      }
    }
    const [f0, getRow0, getCol0] = adjacent[0]!
    for (let i = 0; i < sliceLen; i++) {
      grids[f0]![getRow0(i)]![getCol0(i)] = saved[i]!
    }
  } else if (direction === Direction.CCW) {
    // CCW は CW の逆: adjacent[0] を保存し、前方シフト後、末尾を補充
    const savedCCW = Array.from({ length: sliceLen }, (_, i) => {
      const [f, getRow, getCol] = adjacent[0]!
      return grids[f]![getRow(i)]![getCol(i)]!
    })
    for (let step = 0; step < count - 1; step++) {
      const [fTo, getRowTo, getColTo] = adjacent[step]!
      const [fFrom, getRowFrom, getColFrom] = adjacent[step + 1]!
      for (let i = 0; i < sliceLen; i++) {
        grids[fTo]![getRowTo(i)]![getColTo(i)] = grids[fFrom]![getRowFrom(i)]![getColFrom(i)]!
      }
    }
    const [fLast, getRowLast, getColLast] = adjacent[count - 1]!
    for (let i = 0; i < sliceLen; i++) {
      grids[fLast]![getRowLast(i)]![getColLast(i)] = savedCCW[i]!
    }
  } else {
    // Double: 2回CWと同等
    cycleEdge(grids, sliceLen, adjacent, Direction.CW)
    cycleEdge(grids, sliceLen, adjacent, Direction.CW)
  }
}

type Adj = ReadonlyArray<[number, (i: number) => number, (i: number) => number]>

/** Up 面の sliceIndex 行目に対する隣接スライス（CW 順）*/
function getUpAdjacentSlices(n: number, sliceIndex: number): Adj {
  const row = sliceIndex
  return [
    [Face.Front, (i) => row, (i) => i],
    [Face.Left,  (i) => row, (i) => i],
    [Face.Back,  (i) => row, (i) => i],
    [Face.Right, (i) => row, (i) => i],
  ]
}

/** Down 面の sliceIndex 行目に対する隣接スライス（CW 順）*/
function getDownAdjacentSlices(n: number, sliceIndex: number): Adj {
  const row = n - 1 - sliceIndex
  return [
    [Face.Front, (i) => row, (i) => i],
    [Face.Left,  (i) => row, (i) => i],
    [Face.Back,  (i) => row, (i) => i],
    [Face.Right, (i) => row, (i) => i],
  ]
}

/** Front 面の sliceIndex 行目に対する隣接スライス（CW 順）*/
function getFrontAdjacentSlices(n: number, sliceIndex: number): Adj {
  const row = n - 1 - sliceIndex
  return [
    [Face.Up,    (i) => row,            (i) => i],
    [Face.Right, (i) => i,             (i) => sliceIndex],
    [Face.Down,  (i) => sliceIndex,    (i) => n - 1 - i],
    [Face.Left,  (i) => n - 1 - i,    (i) => n - 1 - sliceIndex],
  ]
}

/** Back 面の sliceIndex 行目に対する隣接スライス（CW 順）*/
function getBackAdjacentSlices(n: number, sliceIndex: number): Adj {
  const row = n - 1 - sliceIndex
  return [
    [Face.Up,    (i) => sliceIndex,    (i) => n - 1 - i],
    [Face.Left,  (i) => i,            (i) => sliceIndex],
    [Face.Down,  (i) => row,          (i) => i],
    [Face.Right, (i) => n - 1 - i,   (i) => n - 1 - sliceIndex],
  ]
}

/** Right 面の sliceIndex 列目に対する隣接スライス（CW 順）*/
function getRightAdjacentSlices(n: number, sliceIndex: number): Adj {
  const col = n - 1 - sliceIndex
  return [
    [Face.Up,    (i) => i,            (i) => col],
    [Face.Back,  (i) => n - 1 - i,   (i) => sliceIndex],
    [Face.Down,  (i) => i,           (i) => col],
    [Face.Front, (i) => i,           (i) => col],
  ]
}

/** Left 面の sliceIndex 列目に対する隣接スライス（CW 順）*/
function getLeftAdjacentSlices(n: number, sliceIndex: number): Adj {
  const col = sliceIndex
  return [
    [Face.Up,    (i) => i,            (i) => col],
    [Face.Front, (i) => i,           (i) => col],
    [Face.Down,  (i) => i,           (i) => col],
    [Face.Back,  (i) => n - 1 - i,  (i) => n - 1 - sliceIndex],
  ]
}

function getAdjacentSlices(face: Face, n: number, sliceIndex: number): Adj {
  switch (face) {
    case Face.Up:    return getUpAdjacentSlices(n, sliceIndex)
    case Face.Down:  return getDownAdjacentSlices(n, sliceIndex)
    case Face.Front: return getFrontAdjacentSlices(n, sliceIndex)
    case Face.Back:  return getBackAdjacentSlices(n, sliceIndex)
    case Face.Right: return getRightAdjacentSlices(n, sliceIndex)
    case Face.Left:  return getLeftAdjacentSlices(n, sliceIndex)
  }
}

/** キューブ状態に1手の回転を適用し、新しい状態を返す（イミュータブル） */
export function applyMove(state: CubeState, move: Move): Result<CubeState> {
  const n = state.size
  const maxSlice = Math.floor(n / 2)

  if (move.sliceIndex < 0 || move.sliceIndex >= maxSlice) {
    return err<LogicError>({
      kind: 'INVALID_SLICE_INDEX',
      message: `sliceIndex は 0〜${maxSlice - 1} の範囲でなければなりません。受け取った値: ${move.sliceIndex}`,
    })
  }

  // 全グリッドをミュータブルなコピーとして作成
  const grids: MutableGrid[] = state.faces.map((face) =>
    face.map((row) => [...row] as Color[]),
  ) as unknown as MutableGrid[]

  // 外層の場合のみ face グリッド自体を回転
  if (move.sliceIndex === 0) {
    const faceCopy = grids[move.face]!.map((r) => [...r] as Color[])
    let rotated: FaceGrid
    if (move.direction === Direction.CW) {
      rotated = rotateFaceGridCW(faceCopy)
    } else if (move.direction === Direction.CCW) {
      rotated = rotateFaceGridCCW(faceCopy)
    } else {
      rotated = rotateFaceGrid180(faceCopy)
    }
    grids[move.face] = rotated.map((r) => [...r] as Color[])
  }

  // 辺のサイクル置換
  const adj = getAdjacentSlices(move.face, n, move.sliceIndex)
  cycleEdge(grids, n, adj, move.direction)

  const faces = grids.map((face) =>
    face.map((row) => Object.freeze([...row] as Color[])),
  ) as unknown as CubeState['faces']

  return ok<CubeState>({ size: state.size, faces })
}

/** 手順リストを順に適用した最終状態を返す */
export function applySequence(state: CubeState, sequence: MoveSequence): Result<CubeState> {
  let current = state
  for (const move of sequence) {
    const result = applyMove(current, move)
    if (!result.ok) return result
    current = result.value
  }
  return ok(current)
}

const invertDirection = (d: Direction): Direction => {
  if (d === Direction.CW) return Direction.CCW
  if (d === Direction.CCW) return Direction.CW
  return Direction.Double
}

/** 手順のインバース（逆順・逆方向）を返す */
export function invertSequence(sequence: MoveSequence): MoveSequence {
  return [...sequence].reverse().map((move) => ({
    ...move,
    direction: invertDirection(move.direction),
  }))
}
