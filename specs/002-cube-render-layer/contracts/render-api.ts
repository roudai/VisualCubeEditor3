/**
 * 描画レイヤー公開 API 契約
 * ファイル: src/render/index.ts として実装される
 *
 * このファイルはコントラクト定義のみ（実装なし）。
 * 実装は src/render/ に配置する。
 */

import type { CubeState } from '../../src/logic/index.js'
import type { Result } from '../../src/logic/result.js'

// ---------------------------------------------------------------------------
// Color / Axis 列挙体
// ---------------------------------------------------------------------------

/** 描画オプションの viewport 回転軸 */
export declare const ViewAxis: {
  readonly X: 'x'
  readonly Y: 'y'
  readonly Z: 'z'
}
export type ViewAxis = (typeof ViewAxis)[keyof typeof ViewAxis]

// ---------------------------------------------------------------------------
// ColorScheme
// ---------------------------------------------------------------------------

/**
 * 6面のカラーマッピング。キー = Color 値（0〜5）、値 = CSS カラー文字列。
 * デフォルト: WCA 標準配色（白/黄/赤/橙/青/緑）
 */
export type ColorScheme = Readonly<Record<0 | 1 | 2 | 3 | 4 | 5, string>>

/** WCA 標準色スキーム定数 */
export declare const DEFAULT_COLOR_SCHEME: ColorScheme

// ---------------------------------------------------------------------------
// RenderOptions
// ---------------------------------------------------------------------------

/** 描画オプション（すべて省略可能） */
export interface RenderOptions {
  /** 面ごとの色スキーム（部分上書き可） */
  readonly colorScheme?: Partial<ColorScheme>
  /** 背景色。'transparent' または '#rrggbb' 形式 */
  readonly backgroundColor?: string
  /** 出力幅（ピクセル）。デフォルト: 128 */
  readonly width?: number
  /** 出力高（ピクセル）。デフォルト: 128 */
  readonly height?: number
  /** viewport 回転。例: [[ViewAxis.Y, 45], [ViewAxis.X, -34]] */
  readonly viewportRotations?: ReadonlyArray<readonly [ViewAxis, number]>
}

// ---------------------------------------------------------------------------
// RenderError
// ---------------------------------------------------------------------------

export type RenderErrorKind =
  | 'INVALID_CUBE_SIZE'     // CubeState サイズが 2〜7 範囲外
  | 'INVALID_COLOR'         // ColorScheme に無効な色値
  | 'INVALID_OPTIONS'       // RenderOptions に不正な値
  | 'RENDER_LIBRARY_ERROR'  // sr-visualizer 内部エラー
  | 'PNG_ENCODE_ERROR'      // SVG → PNG 変換エラー

export interface RenderError {
  readonly kind: RenderErrorKind
  readonly message: string
}

// ---------------------------------------------------------------------------
// Renderer インターフェース（抽象）
// ---------------------------------------------------------------------------

/**
 * 描画レイヤーの抽象インターフェース。
 * sr-visualizer 実装は SrVisualizerAdapter として提供される。
 * 将来の別実装への差し替えはこのインターフェースで保護される。
 */
export interface Renderer {
  /**
   * CubeState を SVG 文字列に変換する（同期）。
   * CubeState は変更されない。
   */
  renderSVG(state: CubeState, options?: RenderOptions): Result<string, RenderError>

  /**
   * CubeState を PNG バイナリ（Uint8Array）に変換する（非同期）。
   * CubeState は変更されない。
   * 先頭 8 バイトは PNG マジックナンバー（89 50 4E 47 0D 0A 1A 0A）。
   */
  renderPNG(state: CubeState, options?: RenderOptions): Promise<Result<Uint8Array, RenderError>>
}

// ---------------------------------------------------------------------------
// デフォルトレンダラーファクトリ
// ---------------------------------------------------------------------------

/**
 * sr-visualizer ベースのデフォルトレンダラーを返す。
 * Node.js / ブラウザ双方で動作する。
 */
export declare function createRenderer(): Renderer

// ---------------------------------------------------------------------------
// 便利関数（デフォルトレンダラーを内部的に使用）
// ---------------------------------------------------------------------------

/** デフォルトレンダラーで SVG 文字列を返す */
export declare function renderSVG(
  state: CubeState,
  options?: RenderOptions,
): Result<string, RenderError>

/** デフォルトレンダラーで PNG Uint8Array を返す */
export declare function renderPNG(
  state: CubeState,
  options?: RenderOptions,
): Promise<Result<Uint8Array, RenderError>>
