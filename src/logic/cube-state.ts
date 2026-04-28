import { Color, Face, type CubeSize, type CubeState, type LogicError } from './types.js'
import { ok, err, type Result } from './result.js'

const FACE_COLORS: Readonly<Record<Face, Color>> = {
  [Face.Up]: Color.White,
  [Face.Down]: Color.Yellow,
  [Face.Front]: Color.Red,
  [Face.Back]: Color.Orange,
  [Face.Right]: Color.Blue,
  [Face.Left]: Color.Green,
}

const VALID_SIZES = new Set([2, 3, 4, 5, 6, 7])

/** サイズ N の完成状態キューブを生成する */
export function createCube<N extends CubeSize>(size: N): Result<CubeState<N>> {
  if (!VALID_SIZES.has(size)) {
    return err<LogicError>({
      kind: 'INVALID_CUBE_SIZE',
      message: `キューブサイズは 2〜7 の整数でなければなりません。受け取った値: ${size}`,
    })
  }

  const faces = [Face.Up, Face.Down, Face.Front, Face.Back, Face.Right, Face.Left].map(
    (face: Face): ReadonlyArray<ReadonlyArray<Color>> => {
      const color = FACE_COLORS[face]
      return Array.from({ length: size }, (): ReadonlyArray<Color> =>
        Object.freeze(Array.from({ length: size }, (): Color => color)),
      )
    },
  ) as unknown as CubeState<N>['faces']

  return ok<CubeState<N>>({ size, faces })
}

/** 指定した面・行・列のカラーを返す */
export function getSticker(
  state: CubeState,
  face: Face,
  row: number,
  col: number,
): Result<Color> {
  const n = state.size
  if (row < 0 || row >= n || col < 0 || col >= n) {
    return err<LogicError>({
      kind: 'INVALID_CUBE_STATE',
      message: `row/col が範囲外です。size=${n}, row=${row}, col=${col}`,
    })
  }
  const color = state.faces[face]?.[row]?.[col]
  if (color === undefined) {
    return err<LogicError>({ kind: 'INVALID_CUBE_STATE', message: '指定した面が存在しません' })
  }
  return ok(color)
}
