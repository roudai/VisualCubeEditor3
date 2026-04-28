import { Face, Direction, type CubeSize, type Move, type MoveSequence, type LogicError } from './types.js'
import { ok, err, type Result } from './result.js'

const FACE_LETTER: Readonly<Record<string, number>> = {
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

// トークン正規表現: [数字プレフィックス?][面文字][w?][修飾子?]
const TOKEN_RE = /^(\d+)?([UDFBRL])(w?)([2']?)$/

function parseToken(token: string): Move | null {
  const m = TOKEN_RE.exec(token)
  if (!m) return null

  const numPrefix = m[1] !== undefined ? parseInt(m[1], 10) : null
  const faceLetter = m[2]
  const wide = m[3] === 'w'
  const modifier = m[4] ?? ''

  if (faceLetter === undefined) return null
  const face = FACE_LETTER[faceLetter] as Face | undefined
  if (face === undefined) return null

  // sliceIndex の決定
  // - 数字プレフィックスあり: sliceIndex = prefix - 1（例: 2R → sliceIndex=1）
  // - w（ワイドムーブ）: sliceIndex = 1
  // - それ以外（外層）: sliceIndex = 0
  let sliceIndex: number
  if (numPrefix !== null) {
    sliceIndex = numPrefix - 1
  } else if (wide) {
    sliceIndex = 1
  } else {
    sliceIndex = 0
  }

  const direction =
    modifier === "'" ? Direction.CCW : modifier === '2' ? Direction.Double : Direction.CW

  return { face, sliceIndex, direction }
}

/** WCA 記法の手順文字列を MoveSequence にパースする */
export function parseNotation(notation: string): Result<MoveSequence> {
  const tokens = notation.trim().split(/\s+/).filter((t) => t.length > 0)

  const moves: Move[] = []
  let tokenIndex = 0
  for (const token of tokens) {
    const move = parseToken(token)
    if (move === null) {
      return err<LogicError>({
        kind: 'INVALID_NOTATION',
        message: `不正なトークン: "${token}" (インデックス ${tokenIndex})`,
        tokenIndex,
      })
    }
    moves.push(move)
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
