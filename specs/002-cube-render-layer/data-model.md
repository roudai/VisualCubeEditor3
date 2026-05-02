# データモデル: NxN キューブ描画レイヤー（002-cube-render-layer）

**ブランチ**: `002-cube-render-layer` | **日付**: 2026-05-02

---

## エンティティ一覧

### 1. `ColorScheme`

6面のカラーマッピング。キーはロジックレイヤーの `Color` 値（0〜5）、値は 16 進カラー文字列。

```typescript
// src/render/types.ts
type ColorScheme = Readonly<Record<Color, string>>
```

**バリデーション**:
- 全 6 色が存在すること（0〜5 のキーがすべて定義されていること）
- 各値が `#[0-9a-fA-F]{3,8}` 形式、または CSS カラー名であること

**デフォルト値** (`DEFAULT_COLOR_SCHEME`):

| Color | 面 | hex |
|-------|-----|-----|
| 0 (White) | Up | `#FFFFFF` |
| 1 (Yellow) | Down | `#FFFF00` |
| 2 (Red) | Front | `#FF0000` |
| 3 (Orange) | Back | `#FF8800` |
| 4 (Blue) | Right | `#0000FF` |
| 5 (Green) | Left | `#00FF00` |

---

### 2. `RenderOptions`

描画オプション。すべて省略可能。省略時はデフォルト値が適用される。

```typescript
// src/render/types.ts
interface RenderOptions {
  readonly colorScheme?: Partial<ColorScheme>   // 一部上書き可
  readonly backgroundColor?: string             // 背景色（'transparent' | '#rrggbb'）
  readonly width?: number                       // 出力幅 px（デフォルト: 128）
  readonly height?: number                      // 出力高 px（デフォルト: 128）
  readonly viewportRotations?: ReadonlyArray<readonly [ViewAxis, number]>
  //   例: [[ViewAxis.Y, 45], [ViewAxis.X, -34]]
}

const enum ViewAxis { X = 'x', Y = 'y', Z = 'z' }
```

**バリデーション**:
- `width` / `height`: 正の整数（0 以下はエラー）
- `backgroundColor`: 文字列として渡す（SR-Visualizer 側で解釈）

---

### 3. `RenderError`

描画失敗時の型付きエラー。`Result<T, RenderError>` の `E` 型として使用。

```typescript
// src/render/types.ts
type RenderErrorKind =
  | 'INVALID_CUBE_SIZE'    // CubeState のサイズが 2〜7 範囲外
  | 'INVALID_COLOR'        // ColorScheme に無効な色値
  | 'INVALID_OPTIONS'      // RenderOptions に不正な値
  | 'RENDER_LIBRARY_ERROR' // sr-visualizer 内部エラー
  | 'PNG_ENCODE_ERROR'     // SVG → PNG 変換エラー

interface RenderError {
  readonly kind: RenderErrorKind
  readonly message: string
}
```

---

### 4. `Renderer` インターフェース（抽象）

描画レイヤーの公開 API 契約。

```typescript
// src/render/types.ts
interface Renderer {
  renderSVG(
    state: CubeState,
    options?: RenderOptions,
  ): Result<string, RenderError>

  renderPNG(
    state: CubeState,
    options?: RenderOptions,
  ): Promise<Result<Uint8Array, RenderError>>
}
```

**設計上のノート**:
- `renderSVG` は同期（SVG 文字列の生成は CPU バウンド）
- `renderPNG` は非同期（Wasm の `@resvg/resvg-js` 初期化を考慮）
- `CubeState` は変更されない（イミュータブル）

---

### 5. `SrVisualizerAdapter`

`Renderer` インターフェースの sr-visualizer 実装。

```typescript
// src/render/sr-visualizer/adapter.ts
class SrVisualizerAdapter implements Renderer {
  renderSVG(state: CubeState, options?: RenderOptions): Result<string, RenderError>
  renderPNG(state: CubeState, options?: RenderOptions): Promise<Result<Uint8Array, RenderError>>
}
```

内部依存:
- `color-map.ts`: CubeState → sr-visualizer オプション変換
- `dom-factory.ts`: Node.js 用 svgdom 仮想コンテナ生成

---

## エンティティ関係図

```
CubeState<N>  ─────────────────┐
(ロジックレイヤー)               │ 入力
                                ▼
RenderOptions ──────────► SrVisualizerAdapter ──► Result<string, RenderError>   (SVG)
                         (implements Renderer)
                                │
                                ▼
                         @resvg/resvg-js ─────► Result<Uint8Array, RenderError> (PNG)
```

---

## ファイルレイアウト

```
src/render/
├── index.ts              # 公開 API exports（Renderer, RenderOptions, RenderError, ColorScheme, DEFAULT_COLOR_SCHEME）
├── types.ts              # 全インターフェース・型定義・列挙体
├── defaults.ts           # DEFAULT_COLOR_SCHEME、DEFAULT_RENDER_OPTIONS
└── sr-visualizer/
    ├── adapter.ts        # SrVisualizerAdapter（Renderer 実装）
    ├── color-map.ts      # CubeState → ICubeOptions 変換ロジック
    └── dom-factory.ts    # svgdom を使った仮想コンテナ生成

tests/render/
├── adapter.test.ts       # SrVisualizerAdapter 統合テスト
├── color-map.test.ts     # 変換ロジック単体テスト
└── render-options.test.ts # オプションバリデーションテスト
```

---

## 状態遷移

描画レイヤーはステートレス（状態を持たない純粋な変換）。

```
CubeState ──[renderSVG]──► ok(svgString) | err(RenderError)
CubeState ──[renderPNG]──► Promise<ok(Uint8Array) | err(RenderError)>
```

入力 `CubeState` は読み取り専用（`Readonly`）。描画後も元のオブジェクトは変更されない。
