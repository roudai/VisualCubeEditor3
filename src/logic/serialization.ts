import { type CubeSize, type CubeState, type Color, type LogicError } from './types.js'
import { ok, err, type Result } from './result.js'

const VALID_SIZES = new Set<number>([2, 3, 4, 5, 6, 7])
const SCHEMA_VERSION = 1

export interface SerializedCube {
  readonly v: 1
  readonly size: CubeSize
  /** faces[f][r][c] = data[f * N*N + r * N + c] */
  readonly data: ReadonlyArray<number>
}

/** CubeState を保存可能な SerializedCube に変換する */
export function serialize(state: CubeState): SerializedCube {
  const n = state.size
  const data: number[] = []
  for (const face of state.faces) {
    for (const row of face) {
      for (const color of row) {
        data.push(color)
      }
    }
  }
  return { v: 1, size: n, data }
}

/** SerializedCube を CubeState に復元する */
export function deserialize(data: unknown): Result<CubeState> {
  if (!isPlainObject(data)) {
    return err<LogicError>({ kind: 'INVALID_CUBE_STATE', message: '不正なデータ形式です' })
  }

  const { v, size, data: raw } = data as Record<string, unknown>

  if (v !== SCHEMA_VERSION) {
    return err<LogicError>({
      kind: 'INVALID_CUBE_STATE',
      message: `未知のスキーマバージョン: ${String(v)}`,
    })
  }

  if (typeof size !== 'number' || !VALID_SIZES.has(size)) {
    return err<LogicError>({
      kind: 'INVALID_CUBE_STATE',
      message: `不正なサイズ: ${String(size)}`,
    })
  }

  const n = size as CubeSize
  const expected = 6 * n * n

  if (!Array.isArray(raw) || raw.length !== expected) {
    return err<LogicError>({
      kind: 'INVALID_CUBE_STATE',
      message: `data の長さが不正です。期待: ${expected}, 実際: ${Array.isArray(raw) ? raw.length : 'N/A'}`,
    })
  }

  const faces = Array.from({ length: 6 }, (_, f) =>
    Array.from({ length: n }, (__, r) =>
      Object.freeze(
        Array.from({ length: n }, (___, c) => raw[f * n * n + r * n + c] as Color),
      ),
    ),
  ) as unknown as CubeState['faces']

  return ok<CubeState>({ size: n, faces })
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
