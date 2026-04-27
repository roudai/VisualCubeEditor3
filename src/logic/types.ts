export const Color = {
  White: 0,
  Yellow: 1,
  Red: 2,
  Orange: 3,
  Blue: 4,
  Green: 5,
} as const
export type Color = (typeof Color)[keyof typeof Color]

export const Face = {
  Up: 0,
  Down: 1,
  Front: 2,
  Back: 3,
  Right: 4,
  Left: 5,
} as const
export type Face = (typeof Face)[keyof typeof Face]

export type CubeSize = 2 | 3 | 4 | 5 | 6 | 7

export const Direction = {
  CW: 'CW',
  CCW: 'CCW',
  Double: 'Double',
} as const
export type Direction = (typeof Direction)[keyof typeof Direction]

export interface CubeState<N extends CubeSize = CubeSize> {
  readonly size: N
  readonly faces: Readonly<
    [
      ReadonlyArray<ReadonlyArray<Color>>,
      ReadonlyArray<ReadonlyArray<Color>>,
      ReadonlyArray<ReadonlyArray<Color>>,
      ReadonlyArray<ReadonlyArray<Color>>,
      ReadonlyArray<ReadonlyArray<Color>>,
      ReadonlyArray<ReadonlyArray<Color>>,
    ]
  >
}

export interface Move {
  readonly face: Face
  readonly sliceIndex: number
  readonly direction: Direction
}

export type MoveSequence = ReadonlyArray<Move>

export type LogicErrorKind =
  | 'INVALID_CUBE_SIZE'
  | 'INVALID_MOVE'
  | 'INVALID_NOTATION'
  | 'INVALID_CUBE_STATE'
  | 'INVALID_SLICE_INDEX'

export interface LogicError {
  readonly kind: LogicErrorKind
  readonly message: string
  readonly tokenIndex?: number
}
