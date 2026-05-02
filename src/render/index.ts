import { SrVisualizerAdapter } from './sr-visualizer/adapter.js'
import type { CubeState } from '../logic/index.js'
import type { Result } from '../logic/result.js'
import type { RenderOptions, RenderError, Renderer } from './types.js'

export type { Renderer, RenderOptions, RenderError, RenderErrorKind, ColorScheme } from './types.js'
export { ViewAxis } from './types.js'
export { DEFAULT_COLOR_SCHEME } from './defaults.js'

const defaultAdapter = new SrVisualizerAdapter()

export function renderSVG(
  state: CubeState,
  options?: RenderOptions,
): Result<string, RenderError> {
  return defaultAdapter.renderSVG(state, options)
}

export function renderPNG(
  state: CubeState,
  options?: RenderOptions,
): Promise<Result<Uint8Array, RenderError>> {
  return defaultAdapter.renderPNG(state, options)
}

export function createRenderer(): Renderer {
  return new SrVisualizerAdapter()
}
