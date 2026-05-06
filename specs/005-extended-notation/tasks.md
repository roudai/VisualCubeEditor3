# タスク: 拡張記法対応（M / E / S / u / r / f / d / l / b / x / y / z）

**入力**: `specs/005-extended-notation/` の設計ドキュメント
**前提条件**: plan.md（必須）、spec.md（ユーザーストーリー用、必須）

**テスト**: 原則IV（Vitest によるテストファースト）に従い、全タスクでテストを先に記述し
Red 状態（失敗）を確認してから実装を開始すること。

## 形式: `[ID] [P?] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- 説明には正確なファイルパスを含めること

---

## Phase 1: `applyMove` の `maxSlice` 修正

**目的**: 3×3 で sliceIndex=1（中層）が動作するようにする。
現状は `Math.floor(n/2)` のため 3×3 で中層アクセスが常にエラーになる。

- [ ] T001 `tests/logic/rotation.test.ts` に「3×3 で sliceIndex=1 の U ムーブが成功する」テストを追加する（Red 確認）
- [ ] T002 `src/logic/rotation.ts` の `maxSlice = Math.floor(n / 2)` を `Math.ceil(n / 2)` に修正して T001 を Green にする

---

## Phase 2: 中層ムーブ（M / E / S）

**目的**: M（中央列を L 方向）・E（赤道層を D 方向）・S（垂直中央層を F 方向）を
パーサーで解析できるようにする。各々修飾子 `'` / `2` も対応。

- [ ] T003 `tests/logic/notation.test.ts` に以下のテストを追加する（Red 確認）
  - `M` → `[{face:Left, sliceIndex:1, direction:CW}]`（1 ムーブ）
  - `M'` → `[{face:Left, sliceIndex:1, direction:CCW}]`
  - `M2` → `[{face:Left, sliceIndex:1, direction:Double}]`
  - `E` → `[{face:Down, sliceIndex:1, direction:CW}]`
  - `S` → `[{face:Front, sliceIndex:1, direction:CW}]`
  - `m`（小文字）→ `INVALID_NOTATION` エラー
- [ ] T004 `src/logic/notation.ts` に M / E / S トークンの解析を追加して T003 を Green にする

---

## Phase 3: ワイドムーブ展開修正（u / r / f / d / l / b / Uw / Rw 等）

**目的**: `Uw`（と同義の `u`）が「外層 + 内層の 2 ムーブ」に展開されるよう修正する。
現状は 1 ムーブ（sliceIndex=1 のみ）に展開されており、外層（U 面の回転）が欠けている。

- [ ] T005 `tests/logic/notation.test.ts` の既存 `Uw` テスト（1 ムーブ期待）を
  **2 ムーブ期待**に変更し Red を確認する
  - `Uw` → `[{face:Up, sliceIndex:0, CW}, {face:Up, sliceIndex:1, CW}]`
  - `Rw2` → `[{face:Right, sliceIndex:0, Double}, {face:Right, sliceIndex:1, Double}]`
  - `u` → `Uw` と同じ 2 ムーブ
  - `r` → `[{face:Right, sliceIndex:0, CW}, {face:Right, sliceIndex:1, CW}]`
  - `d` / `f` / `l` / `b` → 対応する 2 ムーブ
- [ ] T006 `tests/logic/notation.test.ts` の `moveToNotation ↔ parseNotation` 往復テストから
  `sliceIndex=1` ケース（Uw が 2 ムーブになるため往復不成立）を削除または別ケースに変更する
- [ ] T007 `src/logic/notation.ts` のワイドムーブ展開ロジックを修正して T005 を Green にする
  - `w` サフィックスおよび小文字記法を「外層（sliceIndex=0）+ 内層（sliceIndex=1）の 2 ムーブ」に展開する

---

## Phase 4: キューブ回転（x / y / z）

**目的**: x / y / z をキューブサイズ全層に対応した Move 列に展開する。
`parseNotation` に `size: CubeSize = 3` パラメータを追加する。

- [ ] T008 `tests/logic/notation.test.ts` に以下のテストを追加する（Red 確認）
  - `x`（size=3）→ 3 ムーブ `[{R,0,CW},{R,1,CW},{L,0,CCW}]`
  - `y`（size=3）→ 3 ムーブ `[{U,0,CW},{U,1,CW},{D,0,CCW}]`
  - `z`（size=3）→ 3 ムーブ `[{F,0,CW},{F,1,CW},{B,0,CCW}]`
  - `x'`（size=3）→ 方向反転
  - `x2`（size=3）→ Double
  - `x`（size=4）→ 4 ムーブ `[{R,0,CW},{R,1,CW},{L,0,CCW},{L,1,CCW}]`
  - `x`（size=5）→ 5 ムーブ `[{R,0,CW},{R,1,CW},{R,2,CW},{L,0,CCW},{L,1,CCW}]`
  - `X`（大文字）→ `INVALID_NOTATION` エラー
- [ ] T009 `src/logic/notation.ts` に `size` パラメータと `expandRotation` 関数を追加し、
  x / y / z トークンの解析を実装して T008 を Green にする

---

## Phase 5: MoveInput.vue 更新

**目的**: 新記法をテキスト入力時にキューブサイズを考慮したパーサーに渡す。
また M / E / S / x / y / z のクリックボタンを追加する。

- [ ] T010 `tests/components/MoveInput.test.ts` に以下のテストを追加する（Red 確認）
  - `.inner-move-buttons` グループに M / M' / E / E' / S / S' ボタンが存在する
  - `.rotation-buttons` グループに x / x' / y / y' / z / z' ボタンが存在する
  - M ボタンクリックでテキストボックスに `"M"` が追記される
  - x ボタンクリックで（3×3）キューブ状態が変化する
- [ ] T011 `src/components/MoveInput.vue` を更新して T010 を Green にする
  - `parseNotation(raw, store.size)` に変更する
  - 中層ムーブボタン（M / M' / E / E' / S / S'）を `.inner-move-buttons` クラスの div に追加
  - キューブ回転ボタン（x / x' / y / y' / z / z'）を `.rotation-buttons` クラスの div に追加
  - 必要に応じてワイドムーブボタン（u / u' / r / r' 等）も追加する

---

## Phase 6: 完了確認

- [ ] T012 `npx vitest run` で全テストが通過することを確認する
- [ ] T013 `npx vue-tsc --noEmit` で型エラーがないことを確認する
- [ ] T014 `npx eslint src tests` でリントエラーがないことを確認する
- [ ] T015 ブラウザで動作確認する（M / x / u / Uw がキューブに反映されること）
- [ ] T016 コミット・プッシュし PR を作成する
