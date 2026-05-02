// dom-factory MUST be imported first: sets globalThis.window/document for svg.js v2
import { createDOMContainer } from './dom-factory.js'
import { cubeSVG } from 'sr-visualizer'
import { buildStickerColors } from './color-map.js'
import { ok, err } from '../../logic/result.js'
import type { CubeState } from '../../logic/index.js'
import type { Result } from '../../logic/result.js'
import type { Renderer, RenderOptions, RenderError, ColorScheme } from '../types.js'
import { DEFAULT_COLOR_SCHEME } from '../defaults.js'

const VALID_SIZES = new Set<number>([2, 3, 4, 5, 6, 7])

export class SrVisualizerAdapter implements Renderer {
  renderSVG(state: CubeState, options?: RenderOptions): Result<string, RenderError> {
    if (!VALID_SIZES.has(state.size)) {
      return err<RenderError>({
        kind: 'INVALID_CUBE_SIZE',
        message: `キューブサイズは 2〜7 でなければなりません。受け取った値: ${state.size}`,
      })
    }

    const effectiveScheme: ColorScheme = {
      ...DEFAULT_COLOR_SCHEME,
      ...options?.colorScheme,
    }

    const stickerColors = buildStickerColors(state, effectiveScheme)

    const container = createDOMContainer()
    try {
      cubeSVG(container as unknown as HTMLElement, {
        cubeSize: state.size,
        stickerColors,
      })
    } catch (e) {
      return err<RenderError>({
        kind: 'RENDER_LIBRARY_ERROR',
        message: String(e),
      })
    }

    const svgString = container.innerHTML
    if (!svgString.includes('<svg')) {
      return err<RenderError>({
        kind: 'RENDER_LIBRARY_ERROR',
        message: 'sr-visualizer が有効な SVG を生成しませんでした',
      })
    }

    return ok(svgString)
  }

  async renderPNG(
    _state: CubeState,
    _options?: RenderOptions,
  ): Promise<Result<Uint8Array, RenderError>> {
    // T013 で実装
    return Promise.resolve(
      err<RenderError>({ kind: 'PNG_ENCODE_ERROR', message: 'renderPNG は未実装です' }),
    )
  }
}
