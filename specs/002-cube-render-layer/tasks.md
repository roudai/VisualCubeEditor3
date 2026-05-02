# タスク: NxN キューブ描画レイヤー（sr-visualizer 統合）

**入力**: `/specs/002-cube-render-layer/` の設計ドキュメント
**前提条件**: plan.md、spec.md、research.md、data-model.md、contracts/render-api.ts、quickstart.md

**テスト**: 原則IV（Vitest によるテストファースト）に従い、描画レイヤーのテストタスクは**必須**。
テストは実装より先に記述し、RED 状態（失敗）を確認してから実装を開始すること。

**構成**: タスクはユーザーストーリーごとにグループ化し、各ストーリーを独立して実装・テストできるようにする。

## 形式: `[ID] [P?] [Story?] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）
- 説明には正確なファイルパスを含めること

---

## Phase 1: セットアップ（共有インフラ）

**目的**: 描画レイヤーに必要な依存関係と設定を追加する

- [x] T001 `pnpm add sr-visualizer@^1.0.13 svgdom @resvg/resvg-js` を実行して描画レイヤーの依存関係をインストールする
- [x] T002 [P] `vitest.config.ts` の `coverage.include` に `src/render/**/*.ts` を追加し、90% カバレッジゲートを描画レイヤーにも適用する

---

## Phase 2: 基盤（ブロッキング前提条件）

**目的**: 全ユーザーストーリーが依存するコアインフラを整備する

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの作業を開始してはならない

- [x] T003 `node_modules/sr-visualizer/dist/*.d.ts` を確認し、個別ステッカー色指定 API（`StickerDefinition` / `facelets` / `stickerColors`）の正確なシグネチャを `specs/002-cube-render-layer/research.md` の「2. 任意 CubeState のステッカー色指定」セクションに追記する
- [x] T004 `src/render/types.ts` に `Renderer`・`RenderOptions`・`RenderError`・`RenderErrorKind`・`ColorScheme`・`ViewAxis` を実装する（`contracts/render-api.ts` の型契約を満たすこと）
- [x] T005 [P] `src/render/defaults.ts` に WCA 標準配色 `DEFAULT_COLOR_SCHEME` と `DEFAULT_RENDER_OPTIONS` を実装する（白/黄/赤/橙/青/緑）
- [x] T006 [P] `src/render/sr-visualizer/dom-factory.ts` に svgdom の `createSVGWindow`・`registerWindow` を使ったヘッドレス DOM コンテナ生成関数を実装する（Node.js 環境で `document.createElement` が利用可能になること）

**チェックポイント**: 基盤完了 — ユーザーストーリーの実装を開始できる

---

## Phase 3: ユーザーストーリー 1 - キューブ状態の SVG 描画（優先度: P1）🎯 MVP

**目標**: `CubeState<N>` を受け取り、ステッカー配色を反映した SVG 文字列を返す

**独立テスト**: `renderSVG(createCube(3))` が SVG 文字列を返し、`<rect>` 要素数が 54 個（6面 × 9）であることを Vitest で検証する

### テスト（先に作成・RED を確認すること）

- [x] T007 [P] [US1] `tests/render/color-map.test.ts` に `CubeState → ICubeOptions` 変換の単体テストを作成する（全 6 面の Color → hex 変換、N=2〜7 のステッカー配列サイズ）
- [x] T008 [P] [US1] `tests/render/adapter.test.ts` に `renderSVG` の統合テストを作成する（N=2〜7 全サイズのステッカー数検証・スクランブル済み状態の色一致・イミュータブル性確認・SC-006 の V2 標準色比較）

### 実装

- [x] T009 [US1] `src/render/sr-visualizer/color-map.ts` に `CubeState → ICubeOptions` 変換ロジックを実装する（T003 で確定した API を使用して全ステッカー色を設定する）
- [x] T010 [US1] `src/render/sr-visualizer/adapter.ts` に `SrVisualizerAdapter` クラスと `renderSVG` メソッドを実装する（svgdom コンテナに `cubeSVG` を呼び出し `outerHTML` から SVG 文字列を抽出する）
- [x] T011 [US1] `src/render/index.ts` に `renderSVG`・`createRenderer`・全型エクスポート（`Renderer`・`RenderOptions`・`RenderError`・`ColorScheme`・`DEFAULT_COLOR_SCHEME`）を実装する

**チェックポイント**: `renderSVG(createCube(3))` が期待通りに動作し、US1 のテストが全 GREEN であること

---

## Phase 4: ユーザーストーリー 2 - キューブ状態の PNG 描画（優先度: P1）

**目標**: `CubeState<N>` を受け取り、PNG マジックナンバーで始まる `Uint8Array` を返す

**独立テスト**: `renderPNG(createCube(3))` の先頭 8 バイトが `89 50 4E 47 0D 0A 1A 0A` と一致することを Vitest で検証する

### テスト（先に作成・RED を確認すること）

- [ ] T012 [P] [US2] `tests/render/adapter.test.ts` に `renderPNG` テストを追加する（PNG マジックナンバー検証・同一入力での決定論的出力・イミュータブル性確認）

### 実装

- [ ] T013 [US2] `src/render/sr-visualizer/adapter.ts` に `SrVisualizerAdapter.renderPNG` を実装する（`renderSVG` の出力を `@resvg/resvg-js` の `Resvg` に渡して `Uint8Array` を取得する）
- [ ] T014 [US2] `src/render/index.ts` に `renderPNG` エクスポートを追加する

**チェックポイント**: US1・US2 の両テストが全 GREEN であること

---

## Phase 5: ユーザーストーリー 3 - 描画オプションの適用（優先度: P2）

**目標**: `RenderOptions` を渡すことで背景色・サイズ・視点角度をカスタマイズできる

**独立テスト**: `renderSVG(cube, { backgroundColor: 'transparent' })` が背景色なしの SVG を返し、`renderSVG(cube, { backgroundColor: '#ffffff' })` との差分が背景要素の有無のみであることを確認する

### テスト（先に作成・RED を確認すること）

- [ ] T015 [P] [US3] `tests/render/render-options.test.ts` に US3 の全シナリオのテストを作成する（背景色適用・viewport 角度適用・デフォルト値での標準出力・不正値に対する `RenderError` 返却）

### 実装

- [ ] T016 [US3] `src/render/sr-visualizer/adapter.ts` に `RenderOptions` の完全適用ロジックを追加する（`backgroundColor`・`width`・`height`・`viewportRotations` を `ICubeOptions` に変換する）
- [ ] T017 [US3] `src/render/sr-visualizer/adapter.ts` に `RenderOptions` バリデーションを追加する（`width`/`height` が 0 以下の場合・無効なカラー文字列の場合に `err(RenderError)` を返す）

**チェックポイント**: US1〜US3 の全テストが GREEN であること

---

## Phase 6: ユーザーストーリー 4 - 標準色スキームの既定値適用（優先度: P2）

**目標**: オプション省略時に WCA 標準配色（白/黄/赤/橙/青/緑）が自動適用される

**独立テスト**: `renderSVG(createCube(3))` の SVG を解析し、各面の中央ステッカー色が `DEFAULT_COLOR_SCHEME` と一致することを Vitest で検証する

### テスト（先に作成・RED を確認すること）

- [ ] T018 [P] [US4] `tests/render/render-options.test.ts` に US4 のテストを追加する（オプション省略時の標準色適用確認・`colorScheme` 部分上書き時の指定色優先確認）

### 実装

- [ ] T019 [US4] `src/render/sr-visualizer/adapter.ts` に `DEFAULT_COLOR_SCHEME` と `RenderOptions.colorScheme` のマージロジックを実装する（`Partial<ColorScheme>` で部分上書き、未指定面は DEFAULT 値を使用）
- [ ] T020 [US4] `src/render/sr-visualizer/color-map.ts` にマージ済み `ColorScheme` を使ったステッカー色解決ロジックを追加する

**チェックポイント**: US1〜US4 の全テストが GREEN であること

---

## Phase 7: 仕上げ & 横断的関心事

**目的**: 品質ゲートの確認とドキュメント整合性の検証

- [ ] T021 [P] `pnpm test:coverage` を実行し `src/render/` の全ファイルでラインカバレッジ 90% 以上を確認する（SC-003）
- [ ] T022 [P] `pnpm typecheck` を実行しコンパイルエラーがゼロであることを確認する（SC-007）
- [ ] T023 `src/render/index.ts` の公開 API が `specs/002-cube-render-layer/contracts/render-api.ts` の型契約と完全一致することを確認する
- [ ] T024 [P] `specs/002-cube-render-layer/quickstart.md` の実装手順（依存インストール → TDD → カバレッジ確認）を通しで実行し、手順の正確性を検証する

---

## 依存関係と実行順序

### フェーズ依存関係

```
Phase 1（セットアップ） → Phase 2（基盤） → Phase 3（US1）→ Phase 4（US2）
                                          → Phase 5（US3）→ Phase 6（US4）
                                                          → Phase 7（仕上げ）
```

- **Phase 1**: 依存なし — 即座に開始可能
- **Phase 2**: Phase 1 完了に依存（特に T003 は T009 を強くブロック）
- **Phase 3 (US1)**: Phase 2 の全タスク完了後に開始（T004・T005・T006 が前提）
- **Phase 4 (US2)**: Phase 3 完了後（`renderSVG` が動作していること）
- **Phase 5 (US3)**: Phase 3 完了後（US2 と並列可）
- **Phase 6 (US4)**: Phase 5 完了後（または Phase 3 完了直後でも可）
- **Phase 7**: US1〜US4 の全フェーズ完了後

### ユーザーストーリー内の順序（必須）

1. テストを先に作成し **RED（失敗）** を確認する
2. `color-map.ts` → `adapter.ts` → `index.ts` の順で実装する
3. 各タスク完了後にテストを再実行して GREEN を確認する

### 並列実行の機会

- T001 と T002 は同時実行可能
- T004・T005・T006 は同時実行可能（Phase 2 内）
- T007 と T008 は同時実行可能（Phase 3 テスト作成）
- T012 と Phase 5（T015〜）は Phase 3 完了後に並列開始可能
- T021 と T022 と T024 は同時実行可能（Phase 7 内）

---

## Phase 3 の並列例

```bash
# テスト作成を同時起動:
Task: "tests/render/color-map.test.ts に CubeState → ICubeOptions 変換テストを作成する"  # T007
Task: "tests/render/adapter.test.ts に renderSVG 統合テストを作成する"               # T008

# 実装を順次実行（依存あり）:
Task: "src/render/sr-visualizer/color-map.ts を実装する"   # T009 (T003 確定後)
Task: "src/render/sr-visualizer/adapter.ts を実装する"     # T010 (T009 完了後)
Task: "src/render/index.ts を実装する"                     # T011 (T010 完了後)
```

---

## 実装戦略

### MVP ファースト（US1 + US2 のみ）

1. Phase 1: セットアップを完了する（T001〜T002）
2. Phase 2: 基盤を完了する（T003〜T006）
3. Phase 3: US1 を完了する（SVG 描画 — T007〜T011）
4. **停止して検証**: `renderSVG(createCube(3))` が期待通りに動作することを確認
5. Phase 4: US2 を完了する（PNG 描画 — T012〜T014）
6. **停止して検証**: PNG マジックナンバーと決定論性を確認

### インクリメンタルデリバリー

1. Phase 1 + Phase 2 → インフラ完成
2. Phase 3（US1）追加 → SVG 描画が動作 → **MVP デモ可能**
3. Phase 4（US2）追加 → PNG 描画も動作
4. Phase 5（US3）追加 → オプション対応
5. Phase 6（US4）追加 → デフォルト色スキーム保証
6. Phase 7 → 品質ゲートクリア → マージ準備完了

---

## 注意事項

- [P] タスク = 異なるファイル、依存関係なし → 同時実行推奨
- T003（sr-visualizer 型定義確認）は T009 の実装品質に直結する — スキップ禁止
- `renderPNG` は Wasm 初期化を含むため `async` にすること（quickstart.md 参照）
- svgdom の `registerWindow` は sr-visualizer の `import` より前に実行すること
- `CubeState` は読み取り専用 — `renderSVG` / `renderPNG` 内で変更してはならない
- タスク完了ごとに `specs/002-cube-render-layer/tasks.md` の `[ ]` を `[x]` に更新すること
