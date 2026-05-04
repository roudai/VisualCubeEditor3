# タスク: Ver.2 相当フル UI オプション

**入力**: `specs/004-full-ui-options/` の設計ドキュメント
**前提条件**: plan.md（必須）、spec.md（ユーザーストーリー用、必須）、research.md、data-model.md、contracts/

**テスト**: 原則IV（Vitest によるテストファースト）に従い、全ストア・コンポーネントのテストタスクは**必須**。
テストは実装より先に記述し、Red 状態（失敗）を確認してから実装を開始すること。

**構成**: タスクはユーザーストーリーごとにグループ化し、各ストーリーを独立して実装・テストできるようにする。

## 形式: `[ID] [P?] [Story] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US6）
- 説明には正確なファイルパスを含めること

---

## Phase 1: セットアップ

**目的**: 開発サーバーと UI スタイリングの基盤整備

- [x] T001 `package.json` の `scripts` に `"dev": "vite"` を追加する
- [x] T002 `index.html` の `<head>` に Bootstrap 5.3 CSS CDN リンク（`https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`）を追加する

---

## Phase 2: 基盤（全ユーザーストーリーのブロッキング前提条件）

**目的**: `RenderOptions` 型拡張・`SrVisualizerAdapter` 更新・`useRenderOptionsStore` 実装。
この基盤なしにはいずれの UI コンポーネントも実装できない。

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの作業を開始してはならない

### 基盤テスト（TDD: 実装前に作成し FAIL を確認すること）

- [x] T003 `tests/stores/renderOptions.test.ts` に以下のテストを作成する（実装前に全件 FAIL 確認）：デフォルト値の確認（imageSize=128, view='normal', mask='', cubeOpacity=100 等）、rotateX/Y/Z による4面色循環の正確性、resetColorScheme で WCA 標準色への復元、renderOptions computed の出力検証（view='plan'→view フィールド含む、mask=''→mask フィールドなし、mask='oll'→mask:'oll' 含む）、localStorage 保存・復元の動作（`vce3-render-options` キー）

### 基盤実装

- [x] T004 `src/render/types.ts` の `RenderOptions` インターフェースに以下9フィールドを追加する（全て `readonly` かつ省略可能）: `view?: string`, `mask?: string`, `maskAlg?: string`, `cubeColor?: string`, `maskColor?: string`, `cubeOpacity?: number`, `stickerOpacity?: number`, `dist?: number`, `arrows?: string`
- [x] T005 `src/render/sr-visualizer/adapter.ts` に `Masking` を sr-visualizer からインポートし、`cubeSVG()` 呼び出しに新規9フィールドを条件付きスプレッドで追加する（`options.mask as Masking` には Constitution II 準拠の安全性コメントを付与する）
- [x] T006 `src/stores/renderOptions.ts` を新規作成し `useRenderOptionsStore` を実装する：全13ステート（imageSize, view, mask, maskAlg, colorScheme, backgroundColor, cubeColor, maskColor, cubeOpacity, stickerOpacity, dist, viewportRotations, arrows）、`renderOptions` computed、`cycleFaceColors` ヘルパー、`rotateX/Y/Z/resetColorScheme` アクション、`watch` + `onMounted` による localStorage 自動保存・復元（Constitution VI 準拠）
- [x] T007 `src/components/CubeDisplay.vue` を `useRenderOptionsStore` をインポートして `renderSVG(cubeStore.cubeState, renderStore.renderOptions)` に更新する（既存テスト `tests/components/CubeDisplay.test.ts` が引き続きパスすること）

**チェックポイント**: `pnpm test` 全件パス、`pnpm typecheck` エラーなし — ユーザーストーリー実装を開始できる

---

## Phase 3: ユーザーストーリー 6 - レイアウト改善（優先度: P1）🎯 MVP の土台

**目標**: 左列キューブ固定表示・右列スクロール設定パネルの二列 Bootstrap レイアウトを実現する

**独立テスト**: アプリを起動し右パネルをスクロールしても左のキューブが固定されたままであることをブラウザで確認する

### US6 テスト

- [x] T008 [US6] `tests/App.test.ts` を読み込み、既存の3つのアサーション（`h1` テキスト、`select` 要素存在、`data-testid="notation-input"` 存在）が引き続きパスすることを確認する（変更不要だが確認としてテストを実行する）

### US6 実装

- [x] T009 [US6] `src/App.vue` を Bootstrap 5 二列レイアウトに全面更新する：`<nav class="navbar navbar-dark bg-dark">` ナビバー、左列 `col-auto`（`position: sticky; top: 0` のキューブパネル）に `CubeDisplay` を配置、右列 `col` にスクロール可能な設定パネル（`SizeSelector`・`MoveInput` を Bootstrap card に収容）、`<scoped style>` で `.cube-sticky { position: sticky; top: 1rem; }` を定義する

**チェックポイント**: `pnpm dev` でブラウザ確認 — 右パネルスクロール時に左のキューブが固定されている

---

## Phase 4: ユーザーストーリー 1 - ビジュアライズオプション設定（優先度: P1）

**目標**: Special View（normal/plan）と Stage Mask（20 種 + Mask Alg）を UI から操作できるようにする

**独立テスト**: ブラウザで Special View を "plan" に切り替えると平面図が表示され、OLL マスクを選ぶと非 LL 面がグレーアウトされることを確認する

### US1 テスト

- [x] T010 [P] [US1] `tests/components/SpecialViewControl.test.ts` を作成する：ラジオボタンが "normal"/"plan" の2択であること、"plan" を選択すると `store.view` が `'plan'` に更新されること
- [x] T011 [P] [US1] `tests/components/StageMaskControl.test.ts` を作成する：マスク未選択時は maskAlg ドロップダウンが disabled であること、"OLL" を選択すると `store.mask` が `'oll'` になること、Mask Alg で "y" を選ぶと `store.maskAlg` が `'y'` になること

### US1 実装

- [x] T012 [P] [US1] `src/components/SpecialViewControl.vue` を作成する：`useRenderOptionsStore` から `view` を読み取り、2つのラジオボタン（normal / plan）で `store.view` を更新する、Bootstrap の `form-check` クラスでスタイリング
- [x] T013 [P] [US1] `src/components/StageMaskControl.vue` を作成する：`MASK_LIST`（20 種）定数定義、マスク選択 `<select>`（`store.mask` バインド）、Mask Alg 選択 `<select>`（`store.maskAlg` バインド、mask='' 時は disabled）、Bootstrap の `form-select` クラスでスタイリング
- [x] T014 [US1] `src/App.vue` の右パネルに「ビジュアライズ設定」Bootstrap card を追加し `SpecialViewControl` と `StageMaskControl` をインポート・配置する

**チェックポイント**: `pnpm test` パス、ブラウザで Special View / Stage Mask が機能することを確認

---

## Phase 5: ユーザーストーリー 2 - カラースキーム編集（優先度: P1）

**目標**: U/R/F/D/L/B 各面の色をカラーピッカーで変更でき、x/y/z 軸回転・リセットができる

**独立テスト**: ブラウザで U 面の色を変更すると即座に上面ステッカーが変わり、x ボタンで U/F/D/B の色が循環することを確認する

### US2 テスト

- [x] T015 [US2] `tests/components/ColorSchemeControl.test.ts` を作成する：6つのカラーピッカーが存在すること、U 面ピッカーの値変更で `store.colorScheme[0]` が更新されること、"x" ボタンクリックで `store.rotateX()` が呼ばれること、"Reset" ボタンクリックで `store.resetColorScheme()` が呼ばれること

### US2 実装

- [x] T016 [US2] `src/components/ColorSchemeControl.vue` を作成する：`FACE_LABELS`（[U,D,F,B,R,L] × key 0〜5）定数定義、各面の `<input type="color">` を `store.colorScheme` にバインド（`@input` で `colorScheme[key]` を更新）、x/y/z 回転ボタン（`store.rotateX/Y/Z()` 呼び出し）、Reset ボタン（`store.resetColorScheme()` 呼び出し）、Bootstrap の `d-flex flex-wrap gap-2` でグリッドレイアウト
- [x] T017 [US2] `src/App.vue` の右パネルに「カラースキーム」Bootstrap card を追加し `ColorSchemeControl` を配置する

**チェックポイント**: `pnpm test` パス、ブラウザでカラーピッカー変更がリアルタイムに反映されることを確認

---

## Phase 6: ユーザーストーリー 3 - ビューポート回転調整（優先度: P1）

**目標**: 3軸それぞれでスライダー・数値入力・リセットボタンによりキューブの視点角度を調整できる

**独立テスト**: ブラウザで Y スライダーを 90° に動かすとキューブが Y 軸に 90° 回転した視点で表示されることを確認する

### US3 テスト

- [x] T018 [US3] `tests/components/ViewportRotationControl.test.ts` を作成する：3スロット分の軸セレクト・スライダー・数値入力が存在すること、スロット 0 のスライダー値変更で `store.viewportRotations[0]` の角度が更新されること、スロット 0 の Reset ボタンクリックでデフォルト値（y/45）に戻ること

### US3 実装

- [x] T019 [US3] `src/components/ViewportRotationControl.vue` を作成する：`store.viewportRotations`（3スロット）を `v-for` でレンダリング、各スロットに `<select>`（x/y/z、`store.viewportRotations[i][0]` バインド）・`<input type="range" min="-180" max="180">`・`<input type="number" min="-180" max="180">` を同期バインド、各スロットに Reset ボタン（デフォルト値復元）、Bootstrap の `row g-2` でグリッドレイアウト
- [x] T020 [US3] `src/App.vue` の右パネルに「ビューポート回転」Bootstrap card を追加し `ViewportRotationControl` を配置する

**チェックポイント**: `pnpm test` パス、ブラウザでスライダー操作がリアルタイムに視点を更新することを確認

---

## Phase 7: ユーザーストーリー 4 - 外観設定（優先度: P2）

**目標**: 背景色・キューブ色・マスク色・キューブ不透明度・ステッカー不透明度・投影距離を UI から調整できる

**独立テスト**: ブラウザで背景色を変更すると即座に SVG 背景色が変わり、不透明度スライダーで半透明表示になることを確認する

### US4 テスト

- [x] T021 [US4] `tests/components/AppearanceControl.test.ts` を作成する：背景色・キューブ色・マスク色の3つのカラーピッカーが存在すること、背景色ピッカーの変更で `store.backgroundColor` が更新されること、cubeOpacity スライダーの変更で `store.cubeOpacity` が更新されること、dist スライダーの変更で `store.dist` が更新されること

### US4 実装

- [x] T022 [US4] `src/components/AppearanceControl.vue` を作成する：背景色 `<input type="color">` を `store.backgroundColor` に `v-model` バインド、キューブ色 `<input type="color">` を `store.cubeColor` に `v-model` バインド、マスク色 `<input type="color">` を `store.maskColor` に `v-model` バインド、キューブ不透明度 `<input type="range" min="0" max="100">` を `store.cubeOpacity` に `v-model.number` バインド（数値表示付き）、ステッカー不透明度同様、投影距離 `<input type="range" min="1" max="100">` を `store.dist` に `v-model.number` バインド（数値表示付き）、Bootstrap `mb-3` でグループ間余白
- [x] T023 [US4] `src/App.vue` の右パネルに「外観」Bootstrap card を追加し `AppearanceControl` を配置する

**チェックポイント**: `pnpm test` パス、ブラウザで外観設定の変更がリアルタイムに反映されることを確認

---

## Phase 8: ユーザーストーリー 5 - 画像サイズ変更 & ユーザーストーリー 5'（SizeSelector 更新）（優先度: P2）

**目標**: −10/−1/+1/+10 ボタン・スライダー・Reset でキューブ画像サイズを変更でき、パズルサイズセレクタに +/− ボタンを追加する

**独立テスト**: ブラウザで +10 を3回押すとキューブが大きくなり、Reset で 128px に戻ることを確認する。パズルサイズの +/− ボタンでサイズが変わることを確認する。

### US5 テスト

- [x] T024 [P] [US5] `tests/components/ImageSizeControl.test.ts` を作成する：+1/−1/+10/−10 の4ボタンが存在すること、+10 ボタンクリックで `store.imageSize` が 10 増加すること、−10 ボタンで 1px 未満にならない（下限クランプ）こと、Reset ボタンで 128 に戻ること、スライダー変更で `store.imageSize` が更新されること
- [x] T025 [P] [US5] `tests/components/SizeSelector.test.ts` の既存テスト（select 動作・6オプション）が引き続きパスすることを確認し、新たに「+ ボタンクリックで store.size が 1 増加する」「− ボタンクリックで store.size が 1 減少する」「最小値(2)で − を押してもサイズが変わらない」「最大値(7)で + を押してもサイズが変わらない」テストを追加する

### US5 実装

- [x] T026 [P] [US5] `src/components/ImageSizeControl.vue` を新規作成する：`useRenderOptionsStore` の `imageSize` バインド、−10/−1/+1/+10 の4ボタン（それぞれ imageSize を ±1/±10、最小 1 でクランプ）、`<input type="range" min="1" max="1000">` と `imageSize` の双方向同期、Reset ボタン（imageSize=128 に復元）、現在のサイズを数値表示、Bootstrap の `d-flex align-items-center gap-1` でレイアウト
- [x] T027 [P] [US5] `src/components/SizeSelector.vue` を更新する：既存の `<select>` を維持しつつ、左側に `−` ボタン（`store.size > 2` なら `store.setSize(store.size - 1)`）、右側に `+` ボタン（`store.size < 7` なら `store.setSize(store.size + 1)`）を追加する（ボタンは `<CubeSize>` 型境界でクランプ）
- [x] T028 [US5] `src/App.vue` の左パネル（sticky 列）に `ImageSizeControl` を `CubeDisplay` の下に追加する

**チェックポイント**: `pnpm test` 全件パス（新旧テスト含む）、ブラウザで画像サイズ・パズルサイズ変更が動作することを確認

---

## Phase 9: 仕上げ & 横断的確認

**目的**: 全ストーリー統合後の品質保証と最終確認

- [x] T029 `pnpm test` で全テストパス・カバレッジ 90% 以上を確認する（`pnpm test:coverage`）
- [x] T030 `pnpm typecheck` で TypeScript エラーなしを確認する
- [x] T031 `pnpm lint` で ESLint エラーなしを確認する
- [ ] T032 [P] ブラウザ（`pnpm dev`）で `quickstart.md` の検証チェックリスト全項目を確認する：Special View plan 切り替え、OLL マスク適用、カラーピッカー変更、x/y/z 回転ボタン、ビューポートスライダー、外観設定反映、画像サイズ変更、sticky レイアウト確認、ページリロード後の設定復元
- [x] T033 [P] `specs/004-full-ui-options/tasks.md` の完了タスクのチェックボックスを確認する（全件 `[x]` になっているか）

---

## 依存関係と実行順序

### フェーズ依存関係

- **Phase 1（セットアップ）**: 依存なし — 即座に開始可能
- **Phase 2（基盤）**: Phase 1 完了後 — US1〜US6 の実装を全てブロック
- **Phase 3（US6 レイアウト）**: Phase 2 完了後 — App.vue の骨格を作り他の US のコンポーネント追加先を確保
- **Phase 4〜8（US1〜US5）**: Phase 2 完了後に並列実行可能（各 US は互いに独立）
- **Phase 9（仕上げ）**: Phase 3〜8 全件完了後

### ユーザーストーリー内の順序

1. テストを先に作成し FAIL を確認する（Constitution IV 必須）
2. コンポーネント実装（GREEN）
3. App.vue への組み込み
4. ブラウザで動作確認

### 並列実行の機会

- T010/T011（US1 テスト2件）は並列作成可能
- T012/T013（US1 コンポーネント2件）は並列実装可能
- T024/T025（US5 テスト2件）は並列作成可能
- T026/T027（US5 実装2件）は並列実装可能
- Phase 4〜8 はチーム開発時に担当者を分けて並列進行可能

---

## US1 の並列例

```bash
# US1 テストを並列作成:
Task: "tests/components/SpecialViewControl.test.ts を作成する"
Task: "tests/components/StageMaskControl.test.ts を作成する"

# US1 コンポーネントを並列実装:
Task: "src/components/SpecialViewControl.vue を実装する"
Task: "src/components/StageMaskControl.vue を実装する"
```

---

## 実装戦略

### MVP ファースト（US6 + US1 のみ）

1. Phase 1: セットアップ完了
2. Phase 2: 基盤完了（RenderOptions 拡張・ストア・CubeDisplay 更新）
3. Phase 3: US6 レイアウト完了
4. Phase 4: US1（Special View + Stage Mask）完了
5. **停止して確認**: 二列レイアウト + ビジュアライズオプションが機能することをブラウザ確認

### インクリメンタルデリバリー

各フェーズ完了のたびに `pnpm dev` でブラウザ確認しコミットする。
ストーリーは互いに独立しているため、どの順序で実装しても既存機能を壊さない。

### 注意事項

- `[P]` タスク = 異なるファイルかつ依存関係なし
- `[USn]` ラベルはトレーサビリティのためにタスクとユーザーストーリーを紐付ける
- `SizeSelector.vue` の `<select>` 要素は削除しないこと（`App.test.ts` が依存）
- Constitution II: `as Masking` キャストには必ず安全性コメントを付与すること
- Constitution VI: localStorage 永続化は `useRenderOptionsStore` 内で完結させること
