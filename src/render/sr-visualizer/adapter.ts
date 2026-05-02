// dom-factory MUST be imported first: sets globalThis.window/document for svg.js v2
import { createDOMContainer } from './dom-factory.js'
import { cubeSVG, Axis } from 'sr-visualizer'
import { buildStickerColors } from './color-map.js'
import { ok, err } from '../../logic/result.js'
import type { CubeState } from '../../logic/index.js'
import type { Result } from '../../logic/result.js'
import type { Renderer, RenderOptions, RenderError, ColorScheme } from '../types.js'
import { DEFAULT_COLOR_SCHEME, DEFAULT_RENDER_OPTIONS } from '../defaults.js'

const VALID_SIZES = new Set<number>([2, 3, 4, 5, 6, 7])

// 有効な色: 'transparent' または '#rrggbb' 形式のみ
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/
function isValidColor(color: string): boolean {
  return color === 'transparent' || COLOR_REGEX.test(color)
}

const AXIS_MAP: Record<string, Axis> = {
  x: Axis.X,
  y: Axis.Y,
  z: Axis.Z,
}

export class SrVisualizerAdapter implements Renderer {
  renderSVG(state: CubeState, options?: RenderOptions): Result<string, RenderError> {
    if (!VALID_SIZES.has(state.size)) {
      return err<RenderError>({
        kind: 'INVALID_CUBE_SIZE',
        message: `キューブサイズは 2〜7 でなければなりません。受け取った値: ${state.size}`,
      })
    }

    const width = options?.width ?? DEFAULT_RENDER_OPTIONS.width
    const height = options?.height ?? DEFAULT_RENDER_OPTIONS.height

    if (width <= 0) {
      return err<RenderError>({
        kind: 'INVALID_OPTIONS',
        message: `width は 1 以上でなければなりません。受け取った値: ${width}`,
      })
    }
    if (height <= 0) {
      return err<RenderError>({
        kind: 'INVALID_OPTIONS',
        message: `height は 1 以上でなければなりません。受け取った値: ${height}`,
      })
    }

    const backgroundColor = options?.backgroundColor
    if (backgroundColor !== undefined && !isValidColor(backgroundColor)) {
      return err<RenderError>({
        kind: 'INVALID_COLOR',
        message: `無効な背景色: "${backgroundColor}"。'transparent' または '#rrggbb' 形式を使用してください。`,
      })
    }

    const effectiveScheme: ColorScheme = {
      ...DEFAULT_COLOR_SCHEME,
      ...options?.colorScheme,
    }

    const stickerColors = buildStickerColors(state, effectiveScheme)

    const viewportRotations = options?.viewportRotations?.map(
      ([axis, degrees]) => [AXIS_MAP[axis], degrees] as [Axis, number],
    )

    const container = createDOMContainer()
    try {
      cubeSVG(container as unknown as HTMLElement, {
        cubeSize: state.size,
        stickerColors,
        width,
        height,
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(viewportRotations !== undefined && { viewportRotations }),
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
    state: CubeState,
    options?: RenderOptions,
  ): Promise<Result<Uint8Array, RenderError>> {
    const svgResult = this.renderSVG(state, options)
    if (!svgResult.ok) return svgResult

    try {
      const { Resvg } = await import('@resvg/resvg-js')
      const pngBuffer = new Resvg(svgResult.value).render().asPng()
      return ok(new Uint8Array(pngBuffer))
    } catch (e) {
      return err<RenderError>({ kind: 'PNG_ENCODE_ERROR', message: String(e) })
    }
  }
}
