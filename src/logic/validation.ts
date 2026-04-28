import { Face, type CubeState, type LogicError, type Color } from './types.js'
import { ok, err, type Result } from './result.js'

const VALID_COLORS = new Set([0, 1, 2, 3, 4, 5])

function invalidState(message: string): Result<never, LogicError> {
  return err<LogicError>({ kind: 'INVALID_CUBE_STATE', message })
}

function checkStructure(state: CubeState): Result<true, LogicError> {
  const n = state.size
  if (state.faces.length !== 6) {
    return invalidState(`faces は 6 面でなければなりません。受け取った面数: ${state.faces.length}`)
  }
  for (let f = 0; f < 6; f++) {
    const face = state.faces[f]
    if (face === undefined || face.length !== n) {
      return invalidState(`面 ${f} の行数が不正です。期待値: ${n}, 実際: ${face?.length ?? 0}`)
    }
    for (let r = 0; r < n; r++) {
      const row = face[r]
      if (row === undefined || row.length !== n) {
        return invalidState(`面 ${f} 行 ${r} の列数が不正です。期待値: ${n}, 実際: ${row?.length ?? 0}`)
      }
    }
  }
  return ok(true)
}

function checkStickerCounts(state: CubeState): Result<true, LogicError> {
  const n = state.size
  const expected = n * n
  const counts = new Map<number, number>()

  for (let f = 0; f < 6; f++) {
    const face = state.faces[f]
    if (face === undefined) continue
    for (let r = 0; r < n; r++) {
      const row = face[r]
      if (row === undefined) continue
      for (let c = 0; c < n; c++) {
        const color = row[c]
        if (color === undefined || !VALID_COLORS.has(color)) {
          return invalidState(`不正な色コード ${color ?? 'undefined'} が面 ${f} [${r}][${c}] に存在します`)
        }
        counts.set(color, (counts.get(color) ?? 0) + 1)
      }
    }
  }

  for (const [color, count] of counts) {
    if (count !== expected) {
      return invalidState(`色 ${color} のステッカー数が不正です。期待値: ${expected}, 実際: ${count}`)
    }
  }
  // 色が 1 つも出現しない場合も異常（6 色すべて必要）
  if (counts.size !== 6) {
    return invalidState(`色の種類数が不正です。期待値: 6, 実際: ${counts.size}`)
  }
  return ok(true)
}

/** ヘルパー: 指定された座標のステッカーカラーを安全に取得する */
function getStickerSafe(faces: CubeState['faces'], f: number, r: number, c: number): Color {
  const color = faces[f]?.[r]?.[c]
  if (color === undefined) {
    throw new Error(`致命的エラー: 指定された座標 [${f}, ${r}, ${c}] にステッカーが存在しません`)
  }
  return color
}

/** U/D 色を持つステッカーがどの面に現れるかで向き 0/1/2 を決定し、8 コーナーの合計が 3 の倍数か検証する */
export function checkCornerOrientation3x3(state: CubeState): Result<true, LogicError> {
  const { faces } = state
  const m = state.size - 1

  const uColor = getStickerSafe(faces, Face.Up, 1, 1)
  const dColor = getStickerSafe(faces, Face.Down, 1, 1)

  // 各コーナー: [f0,r0,c0, f1,r1,c1, f2,r2,c2]
  // f0 = UD 軸面（向き 0）、f1 = 向き 1 基準面、f2 = 向き 2 基準面
  const corners: ReadonlyArray<readonly [number, number, number, number, number, number, number, number, number]> = [
    [Face.Up,   m, m,  Face.Right, 0, 0,  Face.Front, 0, m],  // URF
    [Face.Up,   m, 0,  Face.Front, 0, 0,  Face.Left,  0, m],  // UFL
    [Face.Up,   0, 0,  Face.Left,  0, 0,  Face.Back,  0, m],  // ULB
    [Face.Up,   0, m,  Face.Back,  0, 0,  Face.Right, 0, m],  // UBR
    [Face.Down, 0, m,  Face.Front, m, m,  Face.Right, m, 0],  // DFR
    [Face.Down, 0, 0,  Face.Left,  m, m,  Face.Front, m, 0],  // DLF
    [Face.Down, m, 0,  Face.Back,  m, m,  Face.Left,  m, 0],  // DBL
    [Face.Down, m, m,  Face.Right, m, m,  Face.Back,  m, 0],  // DRB
  ]

  let sum = 0
  for (const c of corners) {
    const s0 = getStickerSafe(faces, c[0], c[1], c[2])
    const s1 = getStickerSafe(faces, c[3], c[4], c[5])
    const s2 = getStickerSafe(faces, c[6], c[7], c[8])
    if (s0 === uColor || s0 === dColor) {
      // orientation 0 — sum unchanged
    } else if (s1 === uColor || s1 === dColor) {
      sum += 1
    } else if (s2 === uColor || s2 === dColor) {
      sum += 2
    } else {
      return invalidState('コーナーに U/D 色が存在しません')
    }
  }

  if (sum % 3 !== 0) {
    return invalidState(`コーナー向き和が不正です（合計: ${sum}）`)
  }

  return ok(true)
}

/** U/D 色を持つステッカーがどの面に現れるかで向き 0/1 を決定し、12 エッジの合計が 2 の倍数か検証する */
export function checkEdgeOrientation3x3(state: CubeState): Result<true, LogicError> {
  const { faces } = state
  const m = state.size - 1

  const uColor = getStickerSafe(faces, Face.Up, 1, 1)
  const dColor = getStickerSafe(faces, Face.Down, 1, 1)
  const fColor = getStickerSafe(faces, Face.Front, 1, 1)
  const bColor = getStickerSafe(faces, Face.Back, 1, 1)

  // U/D 層エッジ: U/D 面にある U or D 色ステッカーを確認（向き 0）、なければ向き 1
  const udEdges: ReadonlyArray<readonly [number, number, number]> = [
    [Face.Up,   m, 1],  // UF
    [Face.Up,   0, 1],  // UB
    [Face.Up,   1, m],  // UR
    [Face.Up,   1, 0],  // UL
    [Face.Down, 0, 1],  // DF
    [Face.Down, m, 1],  // DB
    [Face.Down, 1, m],  // DR
    [Face.Down, 1, 0],  // DL
  ]

  // E 層エッジ: F/B 面にある F or B 色ステッカーを確認（向き 0）、なければ向き 1
  const eEdges: ReadonlyArray<readonly [number, number, number]> = [
    [Face.Front, 1, m],  // FR
    [Face.Front, 1, 0],  // FL
    [Face.Back,  1, 0],  // BR (Back col 0 = 右側)
    [Face.Back,  1, m],  // BL (Back col m = 左側)
  ]

  let sum = 0

  for (const [f, r, c] of udEdges) {
    const color = getStickerSafe(faces, f, r, c)
    if (color !== uColor && color !== dColor) sum += 1
  }

  for (const [f, r, c] of eEdges) {
    const color = getStickerSafe(faces, f, r, c)
    if (color !== fColor && color !== bColor) sum += 1
  }

  if (sum % 2 !== 0) {
    return invalidState(`エッジ向き和が不正です（合計: ${sum}）`)
  }

  return ok(true)
}

/** コーナー8個・エッジ12個の置換パリティを計算し、両者が一致しなければ INVALID_CUBE_STATE を返す */
export function checkPermutationParity3x3(state: CubeState): Result<true, LogicError> {
  const { faces } = state
  const m = state.size - 1

  const uC = getStickerSafe(faces, Face.Up, 1, 1)
  const dC = getStickerSafe(faces, Face.Down, 1, 1)
  const fC = getStickerSafe(faces, Face.Front, 1, 1)
  const bC = getStickerSafe(faces, Face.Back, 1, 1)
  const rC = getStickerSafe(faces, Face.Right, 1, 1)
  const lC = getStickerSafe(faces, Face.Left, 1, 1)

  const canonicalCorners: ReadonlyArray<ReadonlySet<number>> = [
    new Set([uC, rC, fC]),  // i=0 URF
    new Set([uC, fC, lC]),  // i=1 UFL
    new Set([uC, lC, bC]),  // i=2 ULB
    new Set([uC, bC, rC]),  // i=3 UBR
    new Set([dC, fC, rC]),  // i=4 DFR
    new Set([dC, lC, fC]),  // i=5 DLF
    new Set([dC, bC, lC]),  // i=6 DBL
    new Set([dC, rC, bC]),  // i=7 DRB
  ]

  const canonicalEdges: ReadonlyArray<ReadonlySet<number>> = [
    new Set([uC, fC]),  // i=0  UF
    new Set([uC, bC]),  // i=1  UB
    new Set([uC, rC]),  // i=2  UR
    new Set([uC, lC]),  // i=3  UL
    new Set([dC, fC]),  // i=4  DF
    new Set([dC, bC]),  // i=5  DB
    new Set([dC, rC]),  // i=6  DR
    new Set([dC, lC]),  // i=7  DL
    new Set([fC, rC]),  // i=8  FR
    new Set([fC, lC]),  // i=9  FL
    new Set([bC, rC]),  // i=10 BR
    new Set([bC, lC]),  // i=11 BL
  ]

  const cornerPos: ReadonlyArray<readonly [number, number, number, number, number, number, number, number, number]> = [
    [Face.Up,   m, m,  Face.Right, 0, 0,  Face.Front, 0, m],
    [Face.Up,   m, 0,  Face.Front, 0, 0,  Face.Left,  0, m],
    [Face.Up,   0, 0,  Face.Left,  0, 0,  Face.Back,  0, m],
    [Face.Up,   0, m,  Face.Back,  0, 0,  Face.Right, 0, m],
    [Face.Down, 0, m,  Face.Front, m, m,  Face.Right, m, 0],
    [Face.Down, 0, 0,  Face.Left,  m, m,  Face.Front, m, 0],
    [Face.Down, m, 0,  Face.Back,  m, m,  Face.Left,  m, 0],
    [Face.Down, m, m,  Face.Right, m, m,  Face.Back,  m, 0],
  ]

  const edgePos: ReadonlyArray<readonly [number, number, number, number, number, number]> = [
    [Face.Up,    m, 1,  Face.Front,  0, 1],
    [Face.Up,    0, 1,  Face.Back,   0, 1],
    [Face.Up,    1, m,  Face.Right,  0, 1],
    [Face.Up,    1, 0,  Face.Left,   0, 1],
    [Face.Down,  0, 1,  Face.Front,  m, 1],
    [Face.Down,  m, 1,  Face.Back,   m, 1],
    [Face.Down,  1, m,  Face.Right,  m, 1],
    [Face.Down,  1, 0,  Face.Left,   m, 1],
    [Face.Front, 1, m,  Face.Right,  1, 0],
    [Face.Front, 1, 0,  Face.Left,   1, m],
    [Face.Back,  1, 0,  Face.Right,  1, m],
    [Face.Back,  1, m,  Face.Left,   1, 0],
  ]

  function setsEqual(canon: ReadonlySet<number>, actual: Set<number>): boolean {
    if (canon.size !== actual.size) return false
    for (const v of actual) if (!canon.has(v)) return false
    return true
  }

  function permIsEven(perm: number[]): boolean {
    const visited = new Array<boolean>(perm.length).fill(false)
    let evenLengthCycles = 0
    for (let i = 0; i < perm.length; i++) {
      if (visited[i]) continue
      let len = 0
      let j = i
      while (!visited[j]) {
        visited[j] = true
        const next = perm[j]
        if (next === undefined) break
        j = next
        len++
      }
      if (len % 2 === 0) evenLengthCycles++
    }
    return evenLengthCycles % 2 === 0
  }

  const cornerPerm: number[] = []
  for (const pos of cornerPos) {
    const colors = new Set([
      getStickerSafe(faces, pos[0], pos[1], pos[2]),
      getStickerSafe(faces, pos[3], pos[4], pos[5]),
      getStickerSafe(faces, pos[6], pos[7], pos[8]),
    ])
    const j = canonicalCorners.findIndex(cs => setsEqual(cs, colors))
    if (j === -1) return invalidState('コーナーピースの識別に失敗しました')
    cornerPerm.push(j)
  }

  const edgePerm: number[] = []
  for (const pos of edgePos) {
    const colors = new Set([
      getStickerSafe(faces, pos[0], pos[1], pos[2]),
      getStickerSafe(faces, pos[3], pos[4], pos[5]),
    ])
    const j = canonicalEdges.findIndex(cs => setsEqual(cs, colors))
    if (j === -1) return invalidState('エッジピースの識別に失敗しました')
    edgePerm.push(j)
  }

  if (permIsEven(cornerPerm) !== permIsEven(edgePerm)) {
    return invalidState('置換パリティが不正です（コーナーとエッジのパリティが一致しません）')
  }

  return ok(true)
}

/** 構造・ステッカー数・3x3 パリティを検証し、合法な状態であれば ok(true) を返す */
export function validateState(state: CubeState): Result<true, LogicError> {
  const structureResult = checkStructure(state)
  if (!structureResult.ok) return structureResult

  const stickerResult = checkStickerCounts(state)
  if (!stickerResult.ok) return stickerResult

  if (state.size === 3) {
    const cornerResult = checkCornerOrientation3x3(state)
    if (!cornerResult.ok) return cornerResult

    const edgeResult = checkEdgeOrientation3x3(state)
    if (!edgeResult.ok) return edgeResult

    const parityResult = checkPermutationParity3x3(state)
    if (!parityResult.ok) return parityResult
  }

  return ok(true)
}
