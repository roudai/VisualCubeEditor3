# データモデル: Ver.2 相当フル UI オプション（004-full-ui-options）

**ブランチ**: `004-full-ui-options` | **日付**: 2026-05-03

---

## エンティティ一覧

### 1. `RenderOptions`（拡張）

既存の `RenderOptions` インターフェースに以下のフィールドを追加する。

```typescript
// src/render/types.ts — 既存フィールドはすべて維持
interface RenderOptions {
  // --- 既存フィールド（変更なし） ---
  readonly colorScheme?: Partial<ColorScheme>
  readonly backgroundColor?: string
  readonly width?: number
  readonly height?: number
  readonly viewportRotations?: ReadonlyArray<readonly [ViewAxis, number]>

  // --- 新規追加フィールド ---
  /** 表示モード。'plan' で上面投影図。省略時は通常の3D表示 */
  readonly view?: string
  /** ステージマスク（例: 'oll', 'f2l'）。省略時はマスクなし */
  readonly mask?: string
  /** マスク向き調整アルゴリズム（例: 'y', "x'"）。mask 指定時のみ有効 */
  readonly maskAlg?: string
  /** キューブ輪郭色。'#rrggbb' 形式 */
  readonly cubeColor?: string
  /** マスク適用ステッカーの色。'#rrggbb' 形式 */
  readonly maskColor?: string
  /** キューブ輪郭の不透明度（0〜100）。デフォルト: 100 */
  readonly cubeOpacity?: number
  /** ステッカーの不透明度（0〜100）。デフォルト: 100 */
  readonly stickerOpacity?: number
  /** 投影距離（1〜100）。デフォルト: 5 */
  readonly dist?: number
  /** アロー定義文字列（sr-visualizer のアロー書式） */
  readonly arrows?: string
}
```

**バリデーション**:
- `cubeOpacity` / `stickerOpacity`: 0〜100 の整数（ストア側でクランプ）
- `dist`: 1〜100 の整数（ストア側でクランプ）
- `cubeColor` / `maskColor`: `#rrggbb` 形式（カラーピッカーが保証）
- `mask`: `Masking` 列挙体のいずれかの文字列値、または空文字（ストアが保証）

---

### 2. `RenderOptionsState`（永続化スキーマ）

localStorage に保存されるスキーマ（バージョン付き）。

```typescript
// src/stores/renderOptions.ts（内部型）
interface RenderOptionsState {
  readonly version: 1
  readonly imageSize: number             // 1〜1000、デフォルト: 128
  readonly view: 'normal' | 'plan'       // デフォルト: 'normal'
  readonly mask: string                  // '' = なし
  readonly maskAlg: string              // '' = なし
  readonly colorScheme: Record<0 | 1 | 2 | 3 | 4 | 5, string>
  readonly backgroundColor: string       // '#ffffff'
  readonly cubeColor: string            // '#000000'
  readonly maskColor: string            // '#404040'
  readonly cubeOpacity: number          // 0〜100、デフォルト: 100
  readonly stickerOpacity: number       // 0〜100、デフォルト: 100
  readonly dist: number                 // 1〜100、デフォルト: 5
  readonly viewportRotations: [string, number][]  // ViewAxis × 角度
  readonly arrows: string               // '' = なし
}
```

**localStorage キー**: `vce3-render-options`
**スキーマバージョン**: `1`（将来のマイグレーション用）

---

### 3. `useRenderOptionsStore`（Pinia ストア）

`src/stores/renderOptions.ts` として実装される setup ストア。

**ステート（ref）**:

| プロパティ | 型 | デフォルト |
|-----------|-----|-----------|
| `imageSize` | `number` | `128` |
| `view` | `'normal' \| 'plan'` | `'normal'` |
| `mask` | `string` | `''` |
| `maskAlg` | `string` | `''` |
| `colorScheme` | `Record<0\|1\|2\|3\|4\|5, string>` | WCA 標準色 |
| `backgroundColor` | `string` | `'#ffffff'` |
| `cubeColor` | `string` | `'#000000'` |
| `maskColor` | `string` | `'#404040'` |
| `cubeOpacity` | `number` | `100` |
| `stickerOpacity` | `number` | `100` |
| `dist` | `number` | `5` |
| `viewportRotations` | `[ViewAxis, number][]` | `[['y',45],['x',-34],['z',0]]` |
| `arrows` | `string` | `''` |

**computed**:
- `renderOptions: RenderOptions` — 全ステートを `RenderOptions` オブジェクトに変換

**アクション**:

| メソッド | シグネチャ | 説明 |
|---------|-----------|------|
| `resetColorScheme()` | `() => void` | WCA 標準色に戻す |
| `rotateX()` | `() => void` | U/F/D/B を 1 ステップ循環（X 軸回転相当） |
| `rotateY()` | `() => void` | F/R/B/L を 1 ステップ循環（Y 軸回転相当） |
| `rotateZ()` | `() => void` | U/R/D/L を 1 ステップ循環（Z 軸回転相当） |

**色循環ロジック**（`cycleFaceColors` ヘルパー）:

各回転は `(a, b, c, d)` の 4 面を `a←b, b←c, c←d, d←a` の順で入れ替える。

| 回転 | 4 面サイクル（face index）| 意味 |
|------|--------------------------|------|
| rotateX | (0, 5, 3, 2) | U←B←D←F←U |
| rotateY | (2, 1, 5, 4) | F←R←B←L←F |
| rotateZ | (0, 4, 3, 1) | U←L←D←R←U |

---

### 4. Stage Mask 定数一覧

sr-visualizer `Masking` 列挙体の全値。`StageMaskControl.vue` で使用。

| 表示ラベル | 内部値 |
|-----------|--------|
| FL | `fl` |
| F2L | `f2l` |
| LL | `ll` |
| CLL | `cll` |
| ELL | `ell` |
| OLL | `oll` |
| OCLL | `ocll` |
| OCELL | `ocell` |
| WV | `wv` |
| VH | `vh` |
| ELS | `els` |
| CLS | `cls` |
| CMLL | `cmll` |
| CROSS | `cross` |
| F2L#1 | `f2l_1` |
| F2L#2 | `f2l_2` |
| F2L#3 | `f2l_3` |
| F2L SM | `f2l_sm` |
| F2B | `f2b` |
| LINE | `line` |

**Mask Alg 選択肢**: `x`, `x'`, `x2`, `y`, `y'`, `y2`, `z`, `z'`, `z2`

---

### 5. ColorScheme キー → 面マッピング

`RenderOptions.colorScheme` のキーとキューブ面の対応。
カラーピッカー UI のラベルに使用。

| キー | 面 | デフォルト色 |
|-----|----|-------------|
| `0` | U (Up) | `#FFFFFF`（白） |
| `1` | D (Down) | `#FFFF00`（黄） |
| `2` | F (Front) | `#FF0000`（赤） |
| `3` | B (Back) | `#FF8800`（橙） |
| `4` | R (Right) | `#0000FF`（青） |
| `5` | L (Left) | `#00FF00`（緑） |
