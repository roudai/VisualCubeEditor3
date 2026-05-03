/**
 * useRenderOptionsStore 公開 API 契約
 * ファイル: src/stores/renderOptions.ts として実装される
 *
 * このファイルはコントラクト定義のみ（実装なし）。
 */

import type { RenderOptions, ViewAxis, ColorScheme } from './render-options-api.js'

// ---------------------------------------------------------------------------
// useRenderOptionsStore — Pinia setup ストア
// ---------------------------------------------------------------------------

/**
 * useRenderOptionsStore() の戻り値型（概念定義）。
 * 実装は defineStore('renderOptions', () => { ... }) で行う。
 */
export interface RenderOptionsStore {
  // ---- ステート ----

  /** 画像サイズ（幅・高さ共通）。1〜1000。デフォルト: 128 */
  imageSize: number

  /** 表示モード。デフォルト: 'normal' */
  view: 'normal' | 'plan'

  /** ステージマスク値（'' = なし）。デフォルト: '' */
  mask: string

  /** マスク向き調整（'' = なし）。デフォルト: '' */
  maskAlg: string

  /** 6面カラースキーム。デフォルト: WCA 標準色 */
  colorScheme: Record<0 | 1 | 2 | 3 | 4 | 5, string>

  /** 背景色。デフォルト: '#ffffff' */
  backgroundColor: string

  /** キューブ輪郭色。デフォルト: '#000000' */
  cubeColor: string

  /** マスク色。デフォルト: '#404040' */
  maskColor: string

  /** キューブ不透明度（0〜100）。デフォルト: 100 */
  cubeOpacity: number

  /** ステッカー不透明度（0〜100）。デフォルト: 100 */
  stickerOpacity: number

  /** 投影距離（1〜100）。デフォルト: 5 */
  dist: number

  /** ビューポート回転リスト（3スロット）。デフォルト: y/45, x/-34, z/0 */
  viewportRotations: [ViewAxis, number][]

  /** アロー定義文字列（'' = なし）。デフォルト: '' */
  arrows: string

  // ---- computed ----

  /**
   * 全ステートを RenderOptions に変換した computed プロパティ。
   * CubeDisplay が renderSVG() に渡す際に使用する。
   */
  readonly renderOptions: RenderOptions

  // ---- アクション ----

  /**
   * カラースキームを WCA 標準色にリセットする。
   * U=白, D=黄, F=赤, B=橙, R=青, L=緑
   */
  resetColorScheme(): void

  /**
   * X 軸回転相当で面の色を1ステップ循環する。
   * U←B, B←D, D←F, F←U
   */
  rotateX(): void

  /**
   * Y 軸回転相当で面の色を1ステップ循環する。
   * F←R, R←B, B←L, L←F
   */
  rotateY(): void

  /**
   * Z 軸回転相当で面の色を1ステップ循環する。
   * U←L, L←D, D←R, R←U
   */
  rotateZ(): void
}
