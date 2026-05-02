# 実装計画: UI レイヤー（Vue 3 + Pinia）

**ブランチ**: `003-ui-layer` | **日付**: 2026-05-02 | **仕様**: [spec.md](./spec.md)
**入力**: `/specs/003-ui-layer/spec.md` のフィーチャー仕様

## 概要

spec 001（ロジック）・spec 002（描画）の公開 API を Vue 3 + Pinia で繋ぎ、
ユーザーがブラウザ上でキューブを操作・表示・保存できる最小完結なアプリケーションを実装する。

状態管理は Pinia ストアに集約し、ロジックレイヤーの純粋関数を橋渡しするだけに留める。
LocalStorage による永続化は `useCubePersist` コンポーザブルとして分離する。
コンポーネントテストでは `vi.mock` で描画レイヤーを差し替え、svgdom との競合を回避する。

## 技術コンテキスト

**言語/バージョン**: TypeScript 5.x（strict: true）、Vue 3.5、Pinia 3.x
**主要依存関係**:
- `vue ^3.5`（ランタイム・SFC）
- `pinia ^3.x`（状態管理）
- `vite ^8.x`（ビルド・開発サーバー）
- `@vitejs/plugin-vue`（Vite の Vue SFC サポート）
- `@vue/test-utils ^2`（コンポーネントテスト）
- `happy-dom ^20`（コンポーネントテスト DOM 環境）
- `vue-tsc ^3`（`.vue` ファイルの型チェック）

**ストレージ**: `localStorage`（`vce3-cube-state` キー）
**テスト**: Vitest 4.x + happy-dom（`// @vitest-environment happy-dom` アノテーション）
**型チェック**: `vue-tsc --noEmit`（`tsc --noEmit` では `.vue` import が解決できないため）
**カバレッジ対象**: `src/stores/**/*.ts`, `src/composables/**/*.ts`, `src/components/**/*.vue`, `src/App.vue`
**制約**: 描画レイヤーのモック必須（svgdom が globalThis.window を上書きするため）

## Constitution Check

*Phase 0 リサーチ開始前に確認。Phase 1 設計完了後に再確認。*

- [x] **I. 目的継承の原則** — spec 001/002 の成果を UI で統合し、V2 と同等のユーザー体験を提供する。
  標準色スキームは spec 002 の `DEFAULT_COLOR_SCHEME` をそのまま使用。
- [x] **II. TypeScript Strict Mode** — すべての新規コード（`.vue` の `<script setup>` 含む）が `strict: true`。
  `any` 禁止。`vue-tsc` でコンパイルエラーゼロ。
- [x] **III. レイヤードアーキテクチャ** — ストアはロジックレイヤー API のみを import。
  コンポーネントは描画レイヤー公開 API のみを import。UI が svgdom を直接触らない。
- [x] **IV. Vitest によるテストファースト** — テストを実装より先に記述（TDD Red-Green）。
  `vitest.config.ts` の `coverage.include` に Vue SFC パスを追加し 90% ゲートを維持。
- [x] **V. NxN キューブ拡張性** — `setSize(n)` で N=2〜7 すべてに対応。ハードコードなし。
- [x] **VI. 作成状態の永続化** — `useCubePersist` で LocalStorage 自動保存・起動時復元を実装。

| 違反内容 | 必要な理由 | 解決期限 |
|----------|------------|----------|
| （なし） | — | — |

## プロジェクト構造

### ドキュメント（このフィーチャー）

```text
specs/003-ui-layer/
├── spec.md          # フィーチャー仕様
├── plan.md          # このファイル
├── tasks.md         # タスク一覧
├── checklists/
│   └── requirements.md  # 仕様品質チェックリスト
└── contracts/
    └── store-api.ts     # Pinia ストア公開 API 契約
```

### ソースコード（リポジトリルート）

```text
index.html                          # Vite HTML エントリ
src/
├── main.ts                         # createApp + Pinia + mount
├── App.vue                         # ルートコンポーネント
├── stores/
│   └── cube.ts                     # Pinia ストア（CubeState ラッパー）
├── components/
│   ├── CubeDisplay.vue             # renderSVG → SVG 表示
│   ├── MoveInput.vue               # テキスト入力 + 個別ムーブボタン
│   └── SizeSelector.vue            # N=2〜7 サイズ選択
└── composables/
    └── useCubePersist.ts           # LocalStorage 自動保存・復元

tests/
├── App.test.ts                     # ルートコンポーネントのスモークテスト
├── stores/
│   └── cube.test.ts                # Pinia ストアの単体テスト
├── components/
│   ├── CubeDisplay.test.ts         # SVG 表示テスト（renderSVG モック）
│   ├── MoveInput.test.ts           # 入力・ボタン操作テスト
│   └── SizeSelector.test.ts        # サイズ変更テスト
└── composables/
    └── useCubePersist.test.ts      # LocalStorage 保存・復元テスト
```

---

## 技術上の決定

### svgdom / happy-dom 競合の回避策

`src/render/sr-visualizer/dom-factory.ts` は module load 時に
`globalThis.window` と `globalThis.document` を svgdom に置き換える。
コンポーネントテストが happy-dom 環境で実行されるため、describe の前に
描画レイヤーが import されると DOM が破壊される。

**解決策**: コンポーネントテストで `vi.mock('../../src/render/index.js', ...)` を使用し、
実際の描画モジュール（svgdom 依存）が import されないようにする。

### Vue SFC の v8 カバレッジ

v8 カバレッジは Vue SFC のコンパイル済みテンプレートを正確にマッピングできない場合がある。
`<template>` 部分が 0% と報告されても、ロジック部分（`<script setup>`）が高カバレッジであれば
全体の閾値は満たされる。`App.vue` はスモークテストを追加して対処。

### `// @vitest-environment happy-dom` アノテーション

`vitest.config.ts` の `environmentMatchGlobs` が glob パターンを正しく解釈しない問題があり、
各コンポーネント・コンポーザブルテストファイルの先頭に
`// @vitest-environment happy-dom` コメントを追加することで対処した。

### `useCubePersist` での直接 store 代入

`store.cubeState = result.value` のように Pinia store の ref を直接代入することで
`$patch` より簡潔に状態を復元する。Pinia 3.x では `setup` ストアの `ref` は
`storeToRefs` なしでも store 経由で代入可能。

---

## Phase 1: 設計・コントラクト

詳細は [contracts/store-api.ts](./contracts/store-api.ts) を参照。

### 主要エンティティ

| エンティティ | ファイル | 役割 |
|-------------|---------|------|
| `useCubeStore` | `src/stores/cube.ts` | 状態管理（cubeState, size, actions） |
| `CubeDisplay` | `src/components/CubeDisplay.vue` | SVG 表示コンポーネント |
| `MoveInput` | `src/components/MoveInput.vue` | 手順入力コンポーネント |
| `SizeSelector` | `src/components/SizeSelector.vue` | サイズ選択コンポーネント |
| `useCubePersist` | `src/composables/useCubePersist.ts` | LocalStorage 永続化 |

### ストア公開 API

```typescript
// src/stores/cube.ts

const size = ref<CubeSize>(3)
const cubeState = ref<CubeState>(createCube(3))

function applyMove(move: Move): void
function applySequence(moves: MoveSequence): void
function reset(): void
function setSize(n: CubeSize): void
```

### 内部フロー

```
CubeDisplay:
  computed: svgContent = renderSVG(store.cubeState).ok ? value : ''
  template: <div v-html="svgContent" />

MoveInput:
  onSubmit: moves = parseNotation(input); if ok → store.applySequence(moves)
            else → errorMessage = result.error.message
  onButton: store.applyMove({ face, sliceIndex: 0, direction })

SizeSelector:
  onChange: store.setSize(Number(event.target.value) as CubeSize)

useCubePersist:
  onMounted: raw = localStorage.getItem('vce3-cube-state')
             parsed = JSON.parse(raw)
             result = deserialize(parsed)
             if ok → store.cubeState = result.value; store.size = result.value.size
  watch(() => store.cubeState):
             localStorage.setItem('vce3-cube-state', JSON.stringify(serialize(state)))
```

---

## 複雑性トラッキング

> Constitution Check 違反なし。以下は注記のみ。

| 注記 | 内容 |
|------|------|
| svgdom 競合 | コンポーネントテストで vi.mock を使用。テストファイルごとに適用が必要 |
| vue-tsc 必須 | `tsc --noEmit` は `.vue` の import を解決できない。`vue-tsc --noEmit` を使用 |
| v8 SFC カバレッジ | `<template>` の v8 マッピングは不完全。閾値は全体で判定 |
