import { Face, Direction, type CubeSize, type Move, type MoveSequence, type LogicError } from './types.js'
import { ok, err, type Result } from './result.js'

const FACE_LETTER: Readonly<Record<string, Face>> = {
  U: Face.Up,
  D: Face.Down,
  F: Face.Front,
  B: Face.Back,
  R: Face.Right,
  L: Face.Left,
}

const FACE_TO_LETTER: Readonly<Record<number, string>> = {
  [Face.Up]: 'U',
  [Face.Down]: 'D',
  [Face.Front]: 'F',
  [Face.Back]: 'B',
  [Face.Right]: 'R',
  [Face.Left]: 'L',
}

// 中層ムーブ: M / E / S + 修飾子
const MIDDLE_RE = /^([MES])([2']?)$/

const MIDDLE_LAYER_MAP: Readonly<Record<string, { face: Face; sliceIndex: number }>> = {
  M: { face: Face.Left,  sliceIndex: 1 },
  E: { face: Face.Down,  sliceIndex: 1 },
  S: { face: Face.Front, sliceIndex: 1 },
}

// ワイドムーブ: [UDFBRL]w + 修飾子, または小文字 [udfbrl] + 修飾子
const WIDE_RE = /^(?:([udfbrl])|([UDFBRL])w)([2']?)$/

const LOWERCASE_TO_FACE: Readonly<Record<string, Face>> = {
  u: Face.Up,
  d: Face.Down,
  f: Face.Front,
  b: Face.Back,
  r: Face.Right,
  l: Face.Left,
}

// キューブ回転: x / y / z + 修飾子（大文字は不可）
const ROTATION_RE = /^([xyz])([2']?)$/

type RotationAxis = 'x' | 'y' | 'z'

const ROTATION_MAP: Readonly<Record<RotationAxis, { primary: Face; opposite: Face }>> = {
  x: { primary: Face.Right, opposite: Face.Left },
  y: { primary: Face.Up,    opposite: Face.Down },
  z: { primary: Face.Front, opposite: Face.Back },
}

function expandRotation(axis: RotationAxis, direction: Direction, size: CubeSize): Move[] {
  const rightCount = Math.ceil(size / 2)
  const leftCount  = Math.floor(size / 2)
  const { primary, opposite } = ROTATION_MAP[axis]
  const oppositeDir =
    direction === Direction.CW  ? Direction.CCW :
    direction === Direction.CCW ? Direction.CW  :
    Direction.Double
  const moves: Move[] = []
  for (let i = 0; i < rightCount; i++) moves.push({ face: primary,  sliceIndex: i, direction })
  for (let i = 0; i < leftCount;  i++) moves.push({ face: opposite, sliceIndex: i, direction: oppositeDir })
  return moves
}

// 通常トークン: [数字プレフィックス?][面文字][修飾子?]
const TOKEN_RE = /^(\d+)?([UDFBRL])([2']?)$/

function parseToken(token: string, size: CubeSize): Move[] | null {
  // キューブ回転（x / y / z）→ size 分のムーブ列
  const rm = ROTATION_RE.exec(token)
  if (rm) {
    const axis = rm[1] as RotationAxis
    const modifier = rm[2] ?? ''
    const direction =
      modifier === "'" ? Direction.CCW : modifier === '2' ? Direction.Double : Direction.CW
    return expandRotation(axis, direction, size)
  }

  // 中層ムーブ（M / E / S）→ 1ムーブ
  const mm = MIDDLE_RE.exec(token)
  if (mm) {
    const letter = mm[1] ?? ''
    const modifier = mm[2] ?? ''
    const mapping = MIDDLE_LAYER_MAP[letter]
    if (!mapping) return null
    const direction =
      modifier === "'" ? Direction.CCW : modifier === '2' ? Direction.Double : Direction.CW
    return [{ face: mapping.face, sliceIndex: mapping.sliceIndex, direction }]
  }

  // ワイドムーブ（Uw / u 等）→ 外層(sliceIndex=0) + 内層(sliceIndex=1) の2ムーブ
  const wm = WIDE_RE.exec(token)
  if (wm) {
    const lower = wm[1]
    const upper = wm[2]
    const modifier = wm[3] ?? ''
    const face = lower !== undefined ? LOWERCASE_TO_FACE[lower] : FACE_LETTER[upper ?? '']
    if (face === undefined) return null
    const direction =
      modifier === "'" ? Direction.CCW : modifier === '2' ? Direction.Double : Direction.CW
    return [
      { face, sliceIndex: 0, direction },
      { face, sliceIndex: 1, direction },
    ]
  }

  // 通常トークン（外層 or 数字プレフィックス指定）→ 1ムーブ
  const m = TOKEN_RE.exec(token)
  if (!m) return null

  const numPrefix = m[1] !== undefined ? parseInt(m[1], 10) : null
  const faceLetter = m[2]
  const modifier = m[3] ?? ''

  if (faceLetter === undefined) return null
  const face = FACE_LETTER[faceLetter]
  if (face === undefined) return null

  const sliceIndex = numPrefix !== null ? numPrefix - 1 : 0
  const direction =
    modifier === "'" ? Direction.CCW : modifier === '2' ? Direction.Double : Direction.CW

  return [{ face, sliceIndex, direction }]
}

/** WCA 記法の手順文字列を MoveSequence にパースする */
export function parseNotation(notation: string, size: CubeSize = 3): Result<MoveSequence> {
  const tokens = notation.trim().split(/\s+/).filter((t) => t.length > 0)

  const moves: Move[] = []
  let tokenIndex = 0
  for (const token of tokens) {
    const batch = parseToken(token, size)
    if (batch === null) {
      return err<LogicError>({
        kind: 'INVALID_NOTATION',
        message: `不正なトークン: "${token}" (インデックス ${tokenIndex})`,
        tokenIndex,
      })
    }
    moves.push(...batch)
    tokenIndex++
  }

  return ok<MoveSequence>(moves)
}

/** Move オブジェクトを WCA 記法文字列に変換する */
export function moveToNotation(move: Move, size: CubeSize): string {
  const faceLetter = FACE_TO_LETTER[move.face] ?? '?'

  let prefix = ''
  let wide = ''

  if (move.sliceIndex > 0) {
    if (size === 3 && move.sliceIndex === 1) {
      // 3x3 の中層は w 記法（Uw, Rw等）として出力
      wide = 'w'
    } else {
      // それ以外は SiGN 記法のスライス指定（2R, 3U等）
      prefix = String(move.sliceIndex + 1)
    }
  }

  const suffix =
    move.direction === Direction.CCW ? "'" : move.direction === Direction.Double ? '2' : ''

  return `${prefix}${faceLetter}${wide}${suffix}`
}
