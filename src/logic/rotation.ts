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
    Object.freeze(Array.from({ length: n }, (__, c) => face[n - 1 - c]?.[r] ?? 0) as Color[]),
  )
}

/** face グリッドを反時計回りに90度回転した新グリッドを返す */
function rotateFaceGridCCW(face: FaceGrid): FaceGrid {
  const n = face.length
  return Array.from({ length: n }, (_, r) =>
    Object.freeze(Array.from({ length: n }, (__, c) => face[c]?.[n - 1 - r] ?? 0) as Color[]),
  )
}

/** face グリッドを180度回転した新グリッドを返す */
function rotateFaceGrid180(face: FaceGrid): FaceGrid {
  const n = face.length
  return Array.from({ length: n }, (_, r) =>
    Object.freeze(Array.from({ length: n }, (__, c) => face[n - 1 - r]?.[n - 1 - c] ?? 0) as Color[]),
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
  if (count === 0) return

  const lastAdj = adjacent[count - 1]
  if (!lastAdj) return

  const [fLast, getRowLast, getColLast] = lastAdj
  const saved = Array.from({ length: sliceLen }, (_, i) => {
    return grids[fLast]?.[getRowLast(i)]?.[getColLast(i)] ?? 0
  })

  if (direction === Direction.CW) {
    for (let step = count - 1; step > 0; step--) {
      const adjTo = adjacent[step]
      const adjFrom = adjacent[step - 1]
      if (!adjTo || !adjFrom) continue
      const [fTo, getRowTo, getColTo] = adjTo
      const [fFrom, getRowFrom, getColFrom] = adjFrom
      for (let i = 0; i < sliceLen; i++) {
        const rowTo = grids[fTo]?.[getRowTo(i)]
        const fromColor = grids[fFrom]?.[getRowFrom(i)]?.[getColFrom(i)] ?? 0
        if (rowTo) rowTo[getColTo(i)] = fromColor
      }
    }
    const adj0 = adjacent[0]
    if (adj0) {
      const [f0, getRow0, getCol0] = adj0
      for (let i = 0; i < sliceLen; i++) {
        const row0 = grids[f0]?.[getRow0(i)]
        const color = saved[i] ?? 0
        if (row0) row0[getCol0(i)] = color
      }
    }
  } else if (direction === Direction.CCW) {
    // CCW は CW の逆: adjacent[0] を保存し、前方シフト後、末尾を補充
    const adj0 = adjacent[0]
    if (!adj0) return
    const [f0_CCW, getRow0_CCW, getCol0_CCW] = adj0
    const savedCCW = Array.from({ length: sliceLen }, (_, i) => {
      return grids[f0_CCW]?.[getRow0_CCW(i)]?.[getCol0_CCW(i)] ?? 0
    })

    for (let step = 0; step < count - 1; step++) {
      const adjTo = adjacent[step]
      const adjFrom = adjacent[step + 1]
      if (!adjTo || !adjFrom) continue
      const [fTo, getRowTo, getColTo] = adjTo
      const [fFrom, getRowFrom, getColFrom] = adjFrom
      for (let i = 0; i < sliceLen; i++) {
        const rowTo = grids[fTo]?.[getRowTo(i)]
        const fromColor = grids[fFrom]?.[getRowFrom(i)]?.[getColFrom(i)] ?? 0
        if (rowTo) rowTo[getColTo(i)] = fromColor
      }
    }
    const lastAdj_CCW = adjacent[count - 1]
    if (lastAdj_CCW) {
      const [fLast_CCW, getRowLast_CCW, getColLast_CCW] = lastAdj_CCW
      for (let i = 0; i < sliceLen; i++) {
        const rowLast = grids[fLast_CCW]?.[getRowLast_CCW(i)]
        const color = savedCCW[i] ?? 0
        if (rowLast) rowLast[getColLast_CCW(i)] = color
      }
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
    [Face.Front, (): number => row, (i: number): number => i],
    [Face.Left,  (): number => row, (i: number): number => i],
    [Face.Back,  (): number => row, (i: number): number => i],
    [Face.Right, (): number => row, (i: number): number => i],
  ]
}

/** Down 面の sliceIndex 行目に対する隣接スライス（CW 順）*/
function getDownAdjacentSlices(n: number, sliceIndex: number): Adj {
  const row = n - 1 - sliceIndex
  return [
    [Face.Front, (): number => row, (i: number): number => i],
    [Face.Left,  (): number => row, (i: number): number => i],
    [Face.Back,  (): number => row, (i: number): number => i],
    [Face.Right, (): number => row, (i: number): number => i],
  ]
}

/** Front 面の sliceIndex 行目に対する隣接スライス（CW 順）*/
function getFrontAdjacentSlices(n: number, sliceIndex: number): Adj {
  const row = n - 1 - sliceIndex
  return [
    [Face.Up,    (): number => row,            (i: number): number => i],
    [Face.Right, (i: number): number => i,             (): number => sliceIndex],
    [Face.Down,  (): number => sliceIndex,    (i: number): number => n - 1 - i],
    [Face.Left,  (i: number): number => n - 1 - i,    (): number => n - 1 - sliceIndex],
  ]
}

/** Back 面の sliceIndex 行目に対する隣接スライス（CW 順）*/
function getBackAdjacentSlices(n: number, sliceIndex: number): Adj {
  const row = n - 1 - sliceIndex
  return [
    [Face.Up,    (): number => sliceIndex,    (i: number): number => n - 1 - i],
    [Face.Left,  (i: number): number => i,            (): number => sliceIndex],
    [Face.Down,  (): number => row,          (i: number): number => i],
    [Face.Right, (i: number): number => n - 1 - i,   (): number => n - 1 - sliceIndex],
  ]
}

/** Right 面の sliceIndex 列目に対する隣接スライス（CW 順）*/
function getRightAdjacentSlices(n: number, sliceIndex: number): Adj {
  const col = n - 1 - sliceIndex
  return [
    [Face.Up,    (i: number): number => i,            (): number => col],
    [Face.Back,  (i: number): number => n - 1 - i,   (): number => sliceIndex],
    [Face.Down,  (i: number): number => i,           (): number => col],
    [Face.Front, (i: number): number => i,           (): number => col],
  ]
}

/** Left 面の sliceIndex 列目に対する隣接スライス（CW 順）*/
function getLeftAdjacentSlices(n: number, sliceIndex: number): Adj {
  const col = sliceIndex
  return [
    [Face.Up,    (i: number): number => i,            (): number => col],
    [Face.Front, (i: number): number => i,           (): number => col],
    [Face.Down,  (i: number): number => i,           (): number => col],
    [Face.Back,  (i: number): number => n - 1 - i,  (): number => n - 1 - sliceIndex],
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
    const faceGrid = grids[move.face]
    if (faceGrid) {
      const faceCopy = faceGrid.map((r) => [...r] as Color[])
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
