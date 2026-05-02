/**
 * UI レイヤー公開 API 契約
 * ファイル: src/stores/cube.ts として実装される
 *
 * このファイルはコントラクト定義のみ（実装なし）。
 * 実装は src/stores/ および src/composables/ に配置する。
 */

import type { CubeState } from '../../../src/logic/index.js'
import type { CubeSize } from '../../../src/logic/types.js'

// ---------------------------------------------------------------------------
// Move 型（ロジックレイヤーからの再エクスポート参照）
// ---------------------------------------------------------------------------

import type { Move, MoveSequence } from '../../../src/logic/index.js'

// ---------------------------------------------------------------------------
// CubeStore — Pinia setup ストア
// ---------------------------------------------------------------------------

/**
 * useCubeStore() の戻り値型（概念定義）。
 * 実装は defineStore('cube', () => { ... }) で行う。
 */
export interface CubeStore {
  /** 現在のキューブサイズ（N=2〜7） */
  readonly size: CubeSize

  /** 現在のキューブ状態（Pinia reactive ref） */
  cubeState: CubeState

  /**
   * 単一ムーブを適用する。
   * `applyMove(cubeState, move)` の結果を `cubeState` に反映する。
   */
  applyMove(move: Move): void

  /**
   * ムーブ列を適用する。
   * `applySequence(cubeState, moves)` の結果を `cubeState` に反映する。
   */
  applySequence(moves: MoveSequence): void

  /**
   * 現在のサイズで solved 状態にリセットする。
   */
  reset(): void

  /**
   * キューブサイズを変更し、solved 状態にリセットする。
   * @param n 新しいサイズ（2〜7）
   */
  setSize(n: CubeSize): void
}

// ---------------------------------------------------------------------------
// useCubePersist — LocalStorage 永続化コンポーザブル
// ---------------------------------------------------------------------------

/**
 * LocalStorage へのキューブ状態の自動保存と起動時復元を行うコンポーザブル。
 *
 * - `onMounted`: `vce3-cube-state` キーから JSON を読み込み `deserialize` で復元する。
 *   不正 JSON またはスキーマ不一致の場合は solved 状態を維持する（フォールバック）。
 * - `watch(() => store.cubeState)`: 変化のたびに `serialize(state)` を
 *   JSON 化して `vce3-cube-state` キーに保存する。
 *
 * LocalStorage キー: `vce3-cube-state`
 * シリアライズ形式: `SerializedCube`（`serialize` / `deserialize` から）
 *
 * 使用例:
 * ```typescript
 * // App.vue の <script setup> 内
 * useCubePersist()
 * ```
 */
export declare function useCubePersist(): void

// ---------------------------------------------------------------------------
// コンポーネント Props（参考）
// ---------------------------------------------------------------------------

/** CubeDisplay コンポーネント — Props なし（ストアを直接参照） */
export interface CubeDisplayProps {
  // なし — useCubeStore() で cubeState を取得
}

/** MoveInput コンポーネント — Props なし（ストアを直接参照） */
export interface MoveInputProps {
  // なし — useCubeStore() で applyMove / applySequence を呼び出す
}

/** SizeSelector コンポーネント — Props なし（ストアを直接参照） */
export interface SizeSelectorProps {
  // なし — useCubeStore() で size / setSize を参照
}

// ---------------------------------------------------------------------------
// テスト用 data-testid 一覧
// ---------------------------------------------------------------------------

/**
 * コンポーネントテストで使用する data-testid 属性の一覧。
 * セレクタ文字列として利用: `wrapper.find('[data-testid="notation-input"]')`
 */
export const TEST_IDS = {
  /** MoveInput のテキスト入力欄 */
  NOTATION_INPUT: 'notation-input',
  /** MoveInput のエラーメッセージ表示要素 */
  ERROR_MESSAGE: 'error-message',
} as const
