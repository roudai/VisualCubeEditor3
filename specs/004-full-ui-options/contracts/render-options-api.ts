/**
 * 拡張 RenderOptions 公開 API 契約
 * ファイル: src/render/types.ts の拡張として実装される
 *
 * このファイルはコントラクト定義のみ（実装なし）。
 */

// ---------------------------------------------------------------------------
// 既存定義（変更なし）
// ---------------------------------------------------------------------------

export declare const ViewAxis: {
  readonly X: 'x'
  readonly Y: 'y'
  readonly Z: 'z'
}
export type ViewAxis = (typeof ViewAxis)[keyof typeof ViewAxis]

export type ColorScheme = Readonly<Record<0 | 1 | 2 | 3 | 4 | 5, string>>

// ---------------------------------------------------------------------------
// 拡張 RenderOptions
// ---------------------------------------------------------------------------

/**
 * 描画オプション（全フィールド省略可能）
 * 004-full-ui-options で新規フィールドを追加
 */
export interface RenderOptions {
  // ---- 既存フィールド ----
  readonly colorScheme?: Partial<ColorScheme>
  readonly backgroundColor?: string
  readonly width?: number
  readonly height?: number
  readonly viewportRotations?: ReadonlyArray<readonly [ViewAxis, number]>

  // ---- 新規フィールド（004） ----
  /**
   * 表示モード。'plan' で上面投影図を表示する。
   * 省略または他の値の場合は通常の3D表示。
   */
  readonly view?: string

  /**
   * ステージマスク（sr-visualizer Masking 列挙体の文字列値）。
   * 例: 'oll', 'f2l', 'll'
   * 省略または空文字の場合はマスクなし。
   */
  readonly mask?: string

  /**
   * マスク向き調整アルゴリズム（例: 'y', "x'", 'z2'）。
   * mask が指定されている場合のみ有効。
   */
  readonly maskAlg?: string

  /**
   * キューブ輪郭色。'#rrggbb' 形式。
   * デフォルト: '#000000'（黒）
   */
  readonly cubeColor?: string

  /**
   * マスク適用ステッカーの色。'#rrggbb' 形式。
   * デフォルト: '#404040'
   */
  readonly maskColor?: string

  /**
   * キューブ輪郭の不透明度（0〜100）。
   * sr-visualizer は 0〜100 の整数を受け取る。
   * デフォルト: 100（完全不透明）
   */
  readonly cubeOpacity?: number

  /**
   * ステッカーの不透明度（0〜100）。
   * デフォルト: 100（完全不透明）
   */
  readonly stickerOpacity?: number

  /**
   * 投影距離（1〜100）。大きいほど正射影に近くなる。
   * デフォルト: 5
   */
  readonly dist?: number

  /**
   * アロー定義文字列（sr-visualizer のアロー書式）。
   * 例: "UFR-UFR,UFL-UBL" （複数はカンマ区切り）
   * 省略または空文字の場合はアロー非表示。
   */
  readonly arrows?: string
}
