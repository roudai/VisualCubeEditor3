# 実装計画: NxN キューブ描画レイヤー（sr-visualizer 統合）

**ブランチ**: `002-cube-render-layer` | **日付**: 2026-05-02 | **仕様**: [spec.md](./spec.md)
**入力**: `/specs/002-cube-render-layer/spec.md` のフィーチャー仕様

## 概要

ロジックレイヤー（spec 001）が出力する `CubeState<N>` を入力として受け取り、
SVG 文字列または PNG バイナリ（`Uint8Array`）を返す純粋な描画アダプターを実装する。

描画ライブラリは V2 と同じ `sr-visualizer ^1.0.13` を採用。
Node.js ヘッドレス動作は `svgdom`（svg.js 公式）で DOM を仮想化し、
PNG 変換は `@resvg/resvg-js`（Wasm ベース、ネイティブ依存なし）で行う。

公開 API は抽象 `Renderer` インターフェースとして定義し（FR-008）、
sr-visualizer 実装はその一実装として `SrVisualizerAdapter` に分離する。
すべてのエラーは `Result<T, RenderError>` として返し、例外を投げない（FR-010）。

## 技術コンテキスト

**言語/バージョン**: TypeScript 5.x（strict: true）
**主要依存関係**:
- `sr-visualizer ^1.0.13`（ランタイム、描画ライブラリ本体）
- `svgdom`（ランタイム、Node.js 用 svg.js ヘッドレス DOM）
- `@resvg/resvg-js`（ランタイム、SVG → PNG Wasm 変換）
- `vitest ^4.x`、`@vitest/coverage-v8`（開発）

**ストレージ**: なし（純粋変換関数、副作用なし）
**テスト**: Vitest 4.x（Node.js 環境、DOM なし）、カバレッジ 90% ゲート
**対象プラットフォーム**: Node.js（ヘッドレス）およびモダンブラウザ（同一 API）
**プロジェクト種別**: ライブラリモジュール（`src/render/` として配置）
**パフォーマンス目標**: 単一キューブの SVG 生成 < 100ms（Node.js、N=3〜7）
**制約**: DOM/Canvas/Vue 依存禁止（FR-004）、`any` 禁止（Constitution II）
**規模/スコープ**: N=2〜7 の全サイズ対応。アニメーション・マスク・矢印はスコープ外

## Constitution Check

*ゲート: Phase 0 リサーチ開始前に確認。Phase 1 設計完了後に再確認。*

- [x] **I. 目的継承の原則** — V2 と同じ sr-visualizer を使用し、同等の PNG/SVG を出力する。
  標準色スキーム（白/黄/赤/橙/青/緑）を既定値として適用（SC-006）。
  V2 ユーザーは追加設定なしで同等の出力を得られる。
- [x] **II. TypeScript Strict Mode** — すべての新規コードが `strict: true`。
  `any` 禁止。公開関数に戻り値型注記あり。
- [x] **III. レイヤードアーキテクチャ** — `src/render/` はロジックレイヤーの型のみに依存。
  `document`・`window`・Canvas を直接インポートしない。svgdom は内部アダプターに閉じ込める。
  UI / Vue への依存なし。
- [x] **IV. Vitest によるテストファースト** — テストを実装より先に記述（TDD Red-Green）。
  `vitest.config.ts` の `coverage.include` に `src/render/**/*.ts` を追加し
  90% ゲートを維持する。
- [x] **V. NxN キューブ拡張性** — `state.size` を動的参照。N をハードコードしない。
  sr-visualizer の `cubeSize` オプションに `state.size` を渡す。
- [x] **VI. 作成状態の永続化** — 本フィーチャーのスコープ外。描画は副作用なしの純粋変換。

| 違反内容 | 必要な理由 | 解決期限 |
|----------|------------|----------|
| （なし） | — | — |

## プロジェクト構造

### ドキュメント（このフィーチャー）

```text
specs/002-cube-render-layer/
├── spec.md          # フィーチャー仕様
├── plan.md          # このファイル
├── research.md      # Phase 0 出力（sr-visualizer API・ヘッドレス戦略・PNG 戦略）
├── data-model.md    # Phase 1 出力（エンティティ・型定義・ファイルレイアウト）
├── quickstart.md    # Phase 1 出力（実装ガイド・TDD 手順）
├── contracts/
│   └── render-api.ts  # 公開 API 契約（型定義のみ）
└── tasks.md         # Phase 2 出力（/speckit-tasks コマンドで生成）
```

### ソースコード（リポジトリルート）

```text
src/
├── logic/           # ロジックレイヤー（spec 001 完成済み）
└── render/          # 描画レイヤー（このフィーチャー）
    ├── index.ts              # 公開 API: renderSVG, renderPNG, createRenderer, 型エクスポート
    ├── types.ts              # Renderer, RenderOptions, RenderError, ColorScheme, ViewAxis
    ├── defaults.ts           # DEFAULT_COLOR_SCHEME, DEFAULT_RENDER_OPTIONS
    └── sr-visualizer/
        ├── adapter.ts        # SrVisualizerAdapter（Renderer 実装）
        ├── color-map.ts      # CubeState → ICubeOptions 変換（Face 番号マッピング）
        └── dom-factory.ts    # svgdom 仮想コンテナ生成（Node.js ヘッドレス用）

tests/
├── logic/           # spec 001 完成済みテスト
└── render/          # このフィーチャーのテスト
    ├── adapter.test.ts       # SVG/PNG 生成統合テスト（N=2〜7、決定論性、PNG ヘッダー）
    ├── color-map.test.ts     # CubeState → sr-visualizer 変換の単体テスト
    └── render-options.test.ts # オプションバリデーション・デフォルト値テスト
```

**構造の決定**: 単一プロジェクト構成（オプション 1）。
`src/render/` をロジックレイヤー `src/logic/` と並置。
モノレポは本フィーチャーでは不要（Constitution III のレイヤー分離で十分）。

---

## Phase 0: リサーチ結果サマリー

詳細は [research.md](./research.md) を参照。

| 調査項目 | 決定内容 |
|----------|---------|
| sr-visualizer SVG API | `cubeSVG(container, opts)` → DOM 操作。コンテナ `innerHTML` から SVG 文字列を抽出 |
| Node.js ヘッドレス DOM | `svgdom`（svg.js 公式）で仮想 DOM を提供。jsdom より軽量 |
| PNG 生成 | `@resvg/resvg-js`（Wasm）: `new Resvg(svg).render().asPng()` → `Uint8Array` |
| 任意 CubeState の描画 | sr-visualizer の `StickerDefinition` / `facelets` API を利用（インストール後確定） |
| デフォルト色スキーム | WCA 標準配色を `DEFAULT_COLOR_SCHEME` 定数として定義 |
| Face 番号マッピング | `CubeState.Face.*` ↔ `sr-visualizer.Face.*` を `color-map.ts` で変換 |

---

## Phase 1: 設計・コントラクト

詳細は [data-model.md](./data-model.md) および [contracts/render-api.ts](./contracts/render-api.ts) を参照。

### 主要エンティティ

| エンティティ | ファイル | 役割 |
|-------------|---------|------|
| `Renderer` | `src/render/types.ts` | 抽象インターフェース（renderSVG / renderPNG） |
| `RenderOptions` | `src/render/types.ts` | 描画オプション（省略可能、デフォルト値あり） |
| `RenderError` | `src/render/types.ts` | 型付きエラー（5 種類の kind） |
| `ColorScheme` | `src/render/types.ts` | 6面カラーマッピング（Color → hex） |
| `SrVisualizerAdapter` | `src/render/sr-visualizer/adapter.ts` | Renderer の sr-visualizer 実装 |
| `DEFAULT_COLOR_SCHEME` | `src/render/defaults.ts` | WCA 標準配色定数 |

### 公開 API シグネチャ

```typescript
// src/render/index.ts

export function renderSVG(
  state: CubeState,
  options?: RenderOptions,
): Result<string, RenderError>

export function renderPNG(
  state: CubeState,
  options?: RenderOptions,
): Promise<Result<Uint8Array, RenderError>>

export function createRenderer(): Renderer

export type { Renderer, RenderOptions, RenderError, ColorScheme }
export { DEFAULT_COLOR_SCHEME }
```

### 内部フロー

```
renderSVG(state, opts):
  1. バリデーション（state.size ∈ {2..7}、opts の値範囲）
     → エラーなら err(RenderError) を即時返却
  2. color-map.ts で CubeState → ICubeOptions 変換
  3. dom-factory.ts で svgdom コンテナを生成
  4. sr-visualizer.cubeSVG(container, icubeOptions) を呼び出し
  5. container 内の SVG 文字列を抽出して ok(svgString) を返す

renderPNG(state, opts):
  1. renderSVG(state, opts) を呼ぶ
  2. ok でなければ err をそのまま返す
  3. @resvg/resvg-js: new Resvg(svg).render().asPng()
  4. ok(Uint8Array) を返す
```

---

## Constitution Check（Phase 1 完了後再確認）

- [x] **I.** DEFAULT_COLOR_SCHEME = V2 標準配色（白/黄/赤/橙/青/緑）。SC-006 で V2 比較テストを実施
- [x] **II.** types.ts・defaults.ts・adapter.ts すべて strict TS。StickerDefinition の any は型ガードで包む
- [x] **III.** `src/render/` の imports: `src/logic/types.ts`・`sr-visualizer`・`svgdom`・`@resvg/resvg-js` のみ
- [x] **IV.** テストファイルを先に作成。vitest.config.ts の coverage.include に `src/render/**/*.ts` を追加
- [x] **V.** color-map.ts / adapter.ts 内で N のハードコードなし。`state.size` を動的参照
- [x] **VI.** スコープ外（永続化なし）

---

## 複雑性トラッキング

> Constitution Check 違反なし。以下は注記のみ。

| 注記 | 内容 |
|------|------|
| svgdom の初期化タイミング | `registerWindow` は sr-visualizer の import より前。`dom-factory.ts` で管理 |
| StickerDefinition API 確認 | sr-visualizer インストール後に型定義を確認。未対応なら SVG テンプレートアダプターで代替 |
| @resvg/resvg-js の async 初期化 | `renderPNG` は async。Wasm ロードを初回呼び出し時に行う |
