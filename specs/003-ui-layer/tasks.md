# タスク: UI レイヤー（Vue 3 + Pinia）

**入力**: `/specs/003-ui-layer/` の設計ドキュメント
**前提条件**: plan.md、spec.md、contracts/store-api.ts

**テスト**: 原則IV（Vitest によるテストファースト）に従い、UI レイヤーのテストタスクは**必須**。
テストは実装より先に記述し、RED 状態（失敗）を確認してから実装を開始すること。

**構成**: タスクはフェーズごとにグループ化し、依存関係を明示する。

## 形式: `[ID] [P?] [Story?] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）
- 説明には正確なファイルパスを含めること

---

## Phase 1: セットアップ（共有インフラ）

**目的**: Vue 3 アプリケーション基盤と設定ファイルを整備する

- [x] T001 `vite.config.ts` を作成する（`@vitejs/plugin-vue` を適用）
- [x] T002 [P] `vitest.config.ts` を更新する（`@vitejs/plugin-vue` 追加、`coverage.include` に `src/components/**/*.vue` / `src/App.vue` / `src/stores/**/*.ts` / `src/composables/**/*.ts` を追加）
- [x] T003 [P] `tsconfig.json` を更新する（`"lib": ["ES2022", "DOM", "DOM.Iterable"]` を追加）
- [x] T004 [P] `index.html` を作成する（Vite 標準 HTML エントリ、`<div id="app">` と `/src/main.ts` スクリプト）
- [x] T005 [P] `package.json` の `typecheck` スクリプトを `vue-tsc --noEmit` に変更する（`.vue` ファイルの型チェック対応）

---

## Phase 2: Pinia ストア（US1〜US4 の基盤）

**目的**: `CubeState` を管理する Pinia ストアを実装する

**⚠️ 重要**: このフェーズが完了するまでコンポーネントの作業を開始してはならない

### テスト（先に作成・RED を確認すること）

- [x] T006 [US1-4] `tests/stores/cube.test.ts` を作成する（`setActivePinia(createPinia())` パターン、`applyMove`・`applySequence`・`reset`・`setSize` の動作確認テスト）

### 実装

- [x] T007 [US1-4] `src/stores/cube.ts` を実装する（`useCubeStore`：`size`・`cubeState` ref、4 つのアクション）

**チェックポイント**: ストア完了 — コンポーネントの実装を開始できる

---

## Phase 3: コンポーネント（US1〜US3）

**目的**: 3 つの Vue SFC コンポーネントを TDD で実装する

### CubeDisplay（US1）

- [x] T008 [US1] `tests/components/CubeDisplay.test.ts` を作成する（`vi.mock('../../src/render/index.js')` 必須、`renderSVG` モックの戻り値が `innerHTML` に反映されるか確認）
- [x] T009 [P][US1] `src/components/CubeDisplay.vue` を実装する（`computed` で `renderSVG(store.cubeState)` を呼び出し、`v-html` で表示）

### MoveInput（US2）

- [x] T010 [US2] `tests/components/MoveInput.test.ts` を作成する（テキスト入力 → `applySequence` 呼び出し確認、不正入力 → `data-testid="error-message"` 表示確認、ボタン → `applyMove` 呼び出し確認）
- [x] T011 [P][US2] `src/components/MoveInput.vue` を実装する（テキスト入力フォーム、U/D/F/B/R/L × CW/CCW ボタン、エラー表示）

### SizeSelector（US3）

- [x] T012 [US3] `tests/components/SizeSelector.test.ts` を作成する（`<select>` 変更 → `setSize(n)` 呼び出し確認、N=2〜7 の選択肢が存在することを確認）
- [x] T013 [P][US3] `src/components/SizeSelector.vue` を実装する（N=2〜7 の `<select>`、`onChange` で `setSize(Number(value))` 呼び出し）

---

## Phase 4: コンポーザブル（US4）

**目的**: LocalStorage 自動保存・復元を実装する

### テスト（先に作成・RED を確認すること）

- [x] T014 [US4] `tests/composables/useCubePersist.test.ts` を作成する（保存テスト・復元テスト・不正 JSON フォールバック・不正スキーマフォールバック・空 LocalStorage テスト）

### 実装

- [x] T015 [US4] `src/composables/useCubePersist.ts` を実装する（`onMounted` で復元、`watch(() => store.cubeState)` で自動保存）

---

## Phase 5: アプリルート

**目的**: `App.vue` と `main.ts` で全コンポーネントを結合する

- [x] T016 `src/App.vue` を実装する（`SizeSelector`・`CubeDisplay`・`MoveInput` を配置、`useCubePersist()` 呼び出し）
- [x] T017 [P] `src/main.ts` を実装する（`createApp(App).use(createPinia()).mount('#app')`）
- [x] T018 [P] `tests/App.test.ts` を作成する（`App` がマウントされ `h1`・`select`・`[data-testid="notation-input"]` が存在することを確認）

---

## Phase 6: 品質ゲート

**目的**: カバレッジ・型チェック・リント・統合確認を行う

- [x] T019 `pnpm test:coverage` を実行し lines/statements 90%+・branches 80%+ を確認する
- [x] T020 `pnpm typecheck`（`vue-tsc --noEmit`）を実行しエラーゼロを確認する
- [x] T021 [P] `pnpm lint` を実行し lint エラーゼロを確認する
- [x] T022 [P] `pnpm dev` でブラウザ起動し、表示・手順入力・サイズ変更の動作を確認する
