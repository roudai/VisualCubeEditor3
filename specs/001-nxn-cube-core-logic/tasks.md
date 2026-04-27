# タスク: NxN キューブ コアロジックレイヤー

**入力**: `specs/001-nxn-cube-core-logic/` の設計ドキュメント
**前提条件**: plan.md ✅、spec.md ✅、research.md ✅、data-model.md ✅、contracts/public-api.md ✅

**テスト**: 原則IV（Vitest によるテストファースト）に従い、ロジックレイヤーのテストタスクは**必須**。
テストは実装より先に記述し、Red 状態（失敗）を確認してから実装を開始すること。

**構成**: タスクはユーザーストーリーごとにグループ化し、各ストーリーを独立して実装・テストできるようにする。

## 形式: `[ID] [P?] [Story?] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）
- 説明には正確なファイルパスを含めること

---

## Phase 1: セットアップ（共有インフラ）

**目的**: プロジェクトの初期化と基本構造の構築

- [x] T001 `src/logic/`・`tests/logic/` ディレクトリ構造を plan.md に従い作成する
- [x] T002 TypeScript 5.x + Vite 6.x + pnpm 9.x でプロジェクトを初期化し依存関係（devOnly: typescript, vite, vitest, @vitest/coverage-v8）を設定する
- [x] T003 [P] `tsconfig.json` に `"strict": true` を設定し `src/logic/` を対象に含める
- [x] T004 [P] `vitest.config.ts` に v8 カバレッジと 90% ラインゲート（`thresholds: { lines: 90 }`）を設定する
- [x] T005 [P] ESLint + Prettier を設定し `.eslintrc.json`・`.prettierrc` を作成する

**チェックポイント**: `pnpm tsc --noEmit` と `pnpm test` が空で通ること

---

## Phase 2: 基盤（全ユーザーストーリーの前提）

**目的**: 全ストーリーが依存するコア型定義とユーティリティの確立

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの作業を開始してはならない

- [x] T006 `src/logic/types.ts` に `Color`・`Face`・`CubeSize`・`Direction` の const オブジェクトと型を定義する（data-model.md 参照）
- [x] T007 [P] `src/logic/types.ts` に `CubeState<N>`・`Move`・`MoveSequence` インターフェースを追加する（data-model.md 参照）
- [x] T008 [P] `src/logic/types.ts` に `LogicErrorKind`・`LogicError` 型を追加する（data-model.md 参照）
- [x] T009 `src/logic/result.ts` に `Result<T,E>`・`ok()`・`err()` を実装する（data-model.md 参照）
- [x] T010 `src/logic/index.ts` の骨格を作成し、types と result を再エクスポートする
- [x] T011 `.github/workflows/ci.yml` に GitHub Actions CI（`pnpm tsc --noEmit`・`pnpm test:coverage`）を設定する

**チェックポイント**: 基盤完了 — 全ユーザーストーリーの実装を開始できる

---

## Phase 3: ユーザーストーリー 1 - キューブ状態の初期化と参照（優先度: P1）🎯 MVP

**目標**: サイズ N を指定してキューブを作成し、全ステッカーカラーを参照できる。
さらに `CubeState` の直列化・復元（原則VI）もこのフェーズで実装する。

**独立テスト**: `createCube(3)` が全面単色の状態を返し、`serialize` → `deserialize` で
同一内容が復元できることを Vitest で確認できる。

### ユーザーストーリー 1 のテスト ⚠️ ロジックレイヤーは必須

> **注意: これらのテストを先に記述し、実装前に FAIL することを確認すること**

- [x] T012 [P] [US1] `tests/logic/cube-state.test.ts` に `createCube`（正常系・異常系・全サイズ）と `getSticker` のテストを作成する
- [x] T013 [P] [US1] `tests/logic/serialization.test.ts` に `serialize` / `deserialize`（正常系・スキーマバージョン・不正データ）のテストを作成する

### ユーザーストーリー 1 の実装

- [x] T014 [US1] `src/logic/cube-state.ts` に `createCube<N>` を実装する（N=2〜7 の範囲バリデーション・6面分の初期色生成を含む）
- [x] T015 [US1] `src/logic/cube-state.ts` に `getSticker` を実装する（row/col 範囲バリデーションを含む）
- [x] T016 [US1] `src/logic/serialization.ts` に `SerializedCube`（v=1）型と `serialize` / `deserialize` を実装する（マイグレーション機構の骨格も含む）
- [x] T017 [US1] `src/logic/index.ts` に `cube-state` と `serialization` の公開 API を追加する

**チェックポイント**: `createCube(N)` で N=2〜7 が全て動作し、`serialize → deserialize` で元の状態に戻ること

---

## Phase 4: ユーザーストーリー 2 - 面回転の適用（優先度: P1）

**目標**: 任意の面回転（外層・スライス、全方向）をイミュータブルに適用し、
手順の逆順（インバース）を計算できる。

**独立テスト**: `applyMove(cube, U)` で Front 上辺が Right 面の色になること、
`applyMove(applyMove(cube, U), U_CCW)` で元の状態に戻ることを Vitest で確認できる。

### ユーザーストーリー 2 のテスト ⚠️ ロジックレイヤーは必須

- [x] T018 [US2] `tests/logic/rotation.test.ts` に `applyMove`（全6面・全3方向・N=2〜7・スライス）・`applySequence`・`invertSequence` のテストを作成する

### ユーザーストーリー 2 の実装

- [x] T019 [US2] `src/logic/rotation.ts` に面グリッドのサイクル置換（時計/反時計/2回転）アルゴリズム（`rotateFaceGrid`）を実装する
- [x] T020 [US2] `src/logic/rotation.ts` に隣接辺ステッカーのサイクル置換アルゴリズム（`cycleEdge`）を実装する（外層・スライス共通）
- [x] T021 [US2] `src/logic/rotation.ts` に `applyMove`（`rotateFaceGrid` + `cycleEdge` を組み合わせ）を実装する
- [x] T022 [US2] `src/logic/rotation.ts` に `applySequence` と `invertSequence` を実装する
- [x] T023 [US2] `src/logic/index.ts` に `rotation` の公開 API を追加する

**チェックポイント**: N=2〜7 の全サイズで任意手順 → インバースで元の状態に戻ること（SC-002）

---

## Phase 5: ユーザーストーリー 3 - 手順文字列の解析と適用（優先度: P2）

**目標**: WCA 標準記法の文字列を `MoveSequence` に変換し、
`Move` を WCA 文字列に戻す相互変換ができる。

**独立テスト**: `parseNotation("R U R' U'")` が長さ4の `MoveSequence` を返し、
`parseNotation(moveToNotation(m, 3))` が元の `m` に等しい Move を返すことを確認できる。

### ユーザーストーリー 3 のテスト ⚠️ ロジックレイヤーは必須

- [x] T024 [P] [US3] `tests/logic/notation.test.ts` に `parseNotation`（全修飾子・NxNスライス・空文字列・不正トークン）と `moveToNotation` の往復変換テストを作成する

### ユーザーストーリー 3 の実装

- [x] T025 [US3] `src/logic/notation.ts` に WCA 正規表現トークナイザー（`/^(\d+)?([UDFBRL])(w?)([2']?)$/`）と Face/Direction マッピングテーブルを実装する
- [x] T026 [US3] `src/logic/notation.ts` に `parseNotation` を実装する（不正トークン時の `tokenIndex` 付きエラーを含む）
- [x] T027 [US3] `src/logic/notation.ts` に `moveToNotation` を実装する
- [x] T028 [US3] `src/logic/index.ts` に `notation` の公開 API を追加する

**チェックポイント**: `parseNotation → applySequence → invertSequence → applySequence` で元の状態に戻ること

---

## Phase 6: ユーザーストーリー 4 - キューブ状態の合法性検証（優先度: P3）

**目標**: `CubeState` が実際に到達可能な合法状態かどうかを検証できる。

**独立テスト**: 完成状態・スクランブル済み状態は合法と判定され、
コーナー1個を手動で捻った不正状態は非合法と判定されることを Vitest で確認できる。

### ユーザーストーリー 4 のテスト ⚠️ ロジックレイヤーは必須

- [x] T029 [P] [US4] `tests/logic/validation.test.ts` に `validateState`（合法状態・ステッカー数異常・パリティ違反・不正次元）のテストを作成する

### ユーザーストーリー 4 の実装

- [x] T030 [US4] `src/logic/validation.ts` に構造チェック（次元・サイズ整合性）とステッカー数チェック（各色 N² 個）を実装する
- [x] T031a [US4] `src/logic/validation.ts` に `checkCornerOrientation3x3`（コーナー向き和 mod 3）を実装する（URF/URB/ULF/ULB/DRF/DRB/DLF/DLB の 8 コーナーを特定し、U/D 色が現れる面から向き 0/1/2 を求め、合計が 3 の倍数でなければエラーを返す）
- [x] T031b [US4] `src/logic/validation.ts` に `checkEdgeOrientation3x3`（エッジ向き和 mod 2）を実装する（12 エッジを特定し、U/D/F/B 色が U/D/F/B 面以外に現れるエッジを misoriented とカウントし、合計が偶数でなければエラーを返す）
- [x] T031c [US4] `src/logic/validation.ts` に `checkPermutationParity3x3`（置換パリティ統合）を実装し、`validateState` 内で N=3 のときのみ T031a/b/c の 3 チェックを呼び出すよう組み込む
- [x] T032 [US4] `src/logic/index.ts` に `validation` の公開 API を追加する

**チェックポイント**: 全ユーザーストーリーが独立して動作し、テストが全て PASS すること

---

## Phase N: 仕上げ & 横断的関心事

**目的**: 品質確認とドキュメント整備

- [ ] T033 [P] `src/logic/` の全公開関数に JSDoc コメント（パラメータ・返り値・例外なし説明）を追加する
- [ ] T034 CI でカバレッジレポートを確認し、ラインカバレッジ 90% 以上であることを検証する（SC-001）
- [ ] T035 `specs/001-nxn-cube-core-logic/quickstart.md` の全手順を実行して期待通りの出力が得られることを確認する
- [ ] T036 [P] `pnpm tsc --noEmit` でコンパイルエラーがゼロであることを確認する（SC-004）

---

## 依存関係と実行順序

### フェーズ依存関係

- **セットアップ（Phase 1）**: 依存なし — 即座に開始可能
- **基盤（Phase 2）**: セットアップ完了に依存 — 全ユーザーストーリーをブロック
- **US1（Phase 3）**: 基盤完了後に開始可能
- **US2（Phase 4）**: 基盤完了後に開始可能（US1 に依存しない）
- **US3（Phase 5）**: US2 完了後に開始（`applySequence` が前提）
- **US4（Phase 6）**: US1 完了後に開始（`CubeState` が前提）
- **仕上げ（Phase N）**: 全ユーザーストーリー完了後

### ユーザーストーリー内の順序

- テストを先に作成し FAIL を確認する（**必須**）
- アルゴリズム実装 → 公開 API 関数 → index.ts 再エクスポートの順で進める
- チェックポイント確認後に次のフェーズへ移行する

### 並列実行の機会

- **Phase 1**: T003・T004・T005 は互いに並列実行可能
- **Phase 2**: T007・T008 は T006 完了後に並列実行可能
- **Phase 3〜6**: US1 と US2 は Phase 2 完了後に並列開始可能
- **US3**: T024 のテスト作成は実装着手前に並列実行可能
- **US4**: T029 のテスト作成は実装着手前に並列実行可能

---

## 並列例: Phase 2 完了直後

```bash
# US1 と US2 を並列着手（基盤完了後）
Task（US1）: "tests/logic/cube-state.test.ts にテストを作成する"       # T012
Task（US1）: "tests/logic/serialization.test.ts にテストを作成する"   # T013
Task（US2）: "tests/logic/rotation.test.ts にテストを作成する"        # T018
```

---

## 実装戦略

### MVP ファースト（US1 + US2 のみ）

1. Phase 1: セットアップを完了する
2. Phase 2: 基盤を完了する
3. Phase 3: US1（キューブ状態 + 直列化）を完了する
4. Phase 4: US2（回転操作）を完了する
5. **停止して検証**: `createCube → applySequence → invertSequence` で元の状態に戻ること
6. 次のフィーチャー（描画レイヤー）の着手が可能になる

### フル実装（全 US）

US1 → US2（並列可）→ US3（US2 後）→ US4（US1 後）→ 仕上げ

---

## 注意事項

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルはトレーサビリティのためにタスクとユーザーストーリーを紐付ける
- テストは実装前に FAIL することを確認する（原則IV）
- `src/logic/` 内のどのファイルも `dom`・`canvas`・ブラウザ API を import してはならない（FR-008）
- `any` 型・`@ts-ignore` の使用は禁止（原則II）
