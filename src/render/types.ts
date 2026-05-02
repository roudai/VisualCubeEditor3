import type { CubeState } from '../logic/index.js'
import type { Result } from '../logic/result.js'

export const ViewAxis = {
  X: 'x',
  Y: 'y',
  Z: 'z',
} as const
export type ViewAxis = (typeof ViewAxis)[keyof typeof ViewAxis]

export type ColorScheme = Readonly<Record<0 | 1 | 2 | 3 | 4 | 5, string>>

export interface RenderOptions {
  readonly colorScheme?: Partial<ColorScheme>
  readonly backgroundColor?: string
  readonly width?: number
  readonly height?: number
  readonly viewportRotations?: ReadonlyArray<readonly [ViewAxis, number]>
}

export type RenderErrorKind =
  | 'INVALID_CUBE_SIZE'
  | 'INVALID_COLOR'
  | 'INVALID_OPTIONS'
  | 'RENDER_LIBRARY_ERROR'
  | 'PNG_ENCODE_ERROR'

export interface RenderError {
  readonly kind: RenderErrorKind
  readonly message: string
}

export interface Renderer {
  renderSVG(state: CubeState, options?: RenderOptions): Result<string, RenderError>
  renderPNG(state: CubeState, options?: RenderOptions): Promise<Result<Uint8Array, RenderError>>
}
