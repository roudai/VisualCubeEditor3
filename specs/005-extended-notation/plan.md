# 実装計画: 拡張記法対応（M / E / S / u / r / f / d / l / b / x / y / z）

**ブランチ**: `005-extended-notation` | **日付**: 2026-05-06 | **仕様**: [spec.md](spec.md)

## 概要

手順パーサー（`notation.ts`）を拡張し、中層ムーブ（M/E/S）・ワイドムーブ（u/r/Uw/Rw 等）・
キューブ回転（x/y/z）を WCA 標準に準拠した形で解析・展開する。
あわせて 3×3 で中層スライスが動作しない `applyMove` のバグ（`maxSlice` 計算誤り）を修正する。

変更範囲: **ロジックレイヤー**（`notation.ts` / `rotation.ts`）と
**UI レイヤー**（`MoveInput.vue`）のみ。描画レイヤーは変更しない。

## 技術コンテキスト

**言語/バージョン**: TypeScript (strict: true)
**対象ファイル（変更）**:
- `src/logic/rotation.ts` — `applyMove` の `maxSlice` 修正
- `src/logic/notation.ts` — パーサー拡張（新トークン・展開ロジック・size パラメータ）
- `src/components/MoveInput.vue` — `store.size` 渡し・新規面ボタン追加

**対象ファイル（テスト変更・追加）**:
- `tests/logic/rotation.test.ts` — 3×3 中層スライステスト追加
- `tests/logic/notation.test.ts` — 新トークンテスト追加・既存 `Uw` テスト更新
- `tests/components/MoveInput.test.ts` — 新ボタン存在確認テスト追加

## Constitution Check

- [x] **I. 目的継承の原則** — Ver.2 でサポートされていた記法の再現。コア機能の強化。
- [x] **II. TypeScript Strict Mode** — `any` 不使用。`size` パラメータは型付き `CubeSize`。
- [x] **III. レイヤードアーキテクチャ** — ロジックレイヤー（notation/rotation）と
  UI レイヤー（MoveInput）のみ変更。描画レイヤーは一切変更しない。
- [x] **IV. Vitest によるテストファースト** — 各タスクで Red → Green の順に進める。
- [x] **V. NxN キューブ拡張性** — `parseNotation(notation, size)` で x/y/z をサイズ依存展開。
  2×2〜7×7 全サイズで正しく動作する。
- [x] **VI. 作成状態の永続化** — 変更なし（ストアには手を加えない）。

| 違反内容 | 必要な理由 | 解決期限 |
|----------|------------|----------|
| なし | — | — |

---

## 設計詳細

### A. `applyMove` の `maxSlice` 修正（`rotation.ts`）

**現状の問題**:
```ts
const maxSlice = Math.floor(n / 2)
// n=3 → maxSlice=1 → sliceIndex=1 が >= maxSlice でエラー
// → 3×3 の Uw, M ムーブがすべて失敗する
```

**修正後**:
```ts
const maxSlice = Math.ceil(n / 2)
// n=3 → maxSlice=2 → sliceIndex=0,1 が有効
// n=4 → maxSlice=2 → 変更なし（floor と同じ）
// n=5 → maxSlice=3 → sliceIndex=0,1,2 が有効（中層含む）
```

**影響範囲**: `rotation.ts` 1 行のみ変更。既存テストは全て通過する（奇数 N でのみ範囲が広がる）。

---

### B. `parseNotation` の拡張（`notation.ts`）

#### シグネチャ変更

```ts
// 変更前
export function parseNotation(notation: string): Result<MoveSequence>

// 変更後（後方互換: size のデフォルト値 3）
export function parseNotation(notation: string, size: CubeSize = 3): Result<MoveSequence>
```

#### 新トークン一覧と展開ルール

| 記法 | 展開後の MoveSequence | 備考 |
|------|----------------------|------|
| `M` | `[{face:Left, sliceIndex:1, dir}]` | 中層のみ（L 面は回転しない） |
| `E` | `[{face:Down, sliceIndex:1, dir}]` | 中層のみ（D 面は回転しない） |
| `S` | `[{face:Front, sliceIndex:1, dir}]` | 中層のみ（F 面は回転しない） |
| `u` / `Uw` | `[{face:Up, 0, dir}, {face:Up, 1, dir}]` | 外層 + 内層（2 ムーブ） |
| `d` / `Dw` | `[{face:Down, 0, dir}, {face:Down, 1, dir}]` | 同上 |
| `r` / `Rw` | `[{face:Right, 0, dir}, {face:Right, 1, dir}]` | 同上 |
| `l` / `Lw` | `[{face:Left, 0, dir}, {face:Left, 1, dir}]` | 同上 |
| `f` / `Fw` | `[{face:Front, 0, dir}, {face:Front, 1, dir}]` | 同上 |
| `b` / `Bw` | `[{face:Back, 0, dir}, {face:Back, 1, dir}]` | 同上 |
| `x` | `expandRotation(Right, Left, size, dir)` | 全層（size 依存） |
| `y` | `expandRotation(Up, Down, size, dir)` | 全層（size 依存） |
| `z` | `expandRotation(Front, Back, size, dir)` | 全層（size 依存） |

#### キューブ回転の展開アルゴリズム

`expandRotation(dominantFace, oppositeFace, n, direction)` は以下の Move 列を返す:

```
// dominant 側: sliceIndex=0 から ceil(n/2)-1 まで（外層+内層、奇数Nでは中層含む）
for i in 0 .. ceil(n/2)-1:
  { face: dominantFace, sliceIndex: i, direction }

// opposite 側: sliceIndex=0 から floor(n/2)-1 まで（外層のみ+内層の対称分）
// oppositeFace は逆方向なので direction を反転
for i in 0 .. floor(n/2)-1:
  { face: oppositeFace, sliceIndex: i, direction: invert(direction) }
```

3×3 の `x` 展開例（n=3）:
```
ceil(3/2)-1 = 1 → Right: i=0,1
floor(3/2)-1 = 0 → Left: i=0（反転）
結果: [{R,0,CW}, {R,1,CW}, {L,0,CCW}]
 = R 面回転 + M'（中層を R 方向）+ L 面逆回転
```

4×4 の `y` 展開例（n=4）:
```
ceil(4/2)-1 = 1 → Up: i=0,1
floor(4/2)-1 = 1 → Down: i=0,1（反転）
結果: [{U,0,CW}, {U,1,CW}, {D,0,CCW}, {D,1,CCW}]
```

#### `direction` の反転定義
```ts
function invertDirection(d: Direction): Direction {
  if (d === Direction.CW) return Direction.CCW
  if (d === Direction.CCW) return Direction.CW
  return Direction.Double // Double は自己逆
}
```

#### 既存 `Uw` テストへの影響

現在のテスト（変更必要）:
```ts
// 変更前: Uw は 1 ムーブ
it('Uw（ワイドムーブ）を解析できる（sliceIndex=1）', () => {
  expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 1, ... })
})

// 変更後: Uw は 2 ムーブ
it('Uw（ワイドムーブ）を解析できる（2 ムーブに展開される）', () => {
  expect(result.value).toHaveLength(2)
  expect(result.value[0]).toMatchObject({ face: Face.Up, sliceIndex: 0, ... })
  expect(result.value[1]).toMatchObject({ face: Face.Up, sliceIndex: 1, ... })
})
```

また `moveToNotation ↔ parseNotation` の往復テストも `sliceIndex=1` のケースを削除または修正する。

#### 不正記法の確認

- `m`（小文字 M）→ エラー（不正トークン）
- `M` 入力を 2×2 で使用 → `applyMove` 内でエラー（sliceIndex=1 が 2×2 では無効）
  - 2×2 の `maxSlice = ceil(2/2) = 1`、valid range は `[0,0]` のみ。sliceIndex=1 はエラー。
  - パーサーはエラーにしない（サイズ非依存）。`applySequence` の apply 時にエラーを返す。
  - MoveInput は `parseNotation` 成功 + `applySequence` 失敗の場合もエラー表示する。

---

### C. `MoveInput.vue` の更新

#### `parseNotation` 呼び出しにサイズを渡す

```ts
// 変更前
const result = parseNotation(raw)

// 変更後
const result = parseNotation(raw, store.size)
```

#### 面ボタン追加

既存 12 ボタン（U/U'/D/D'/R/R'/L/L'/F/F'/B/B'）に加え、
以下を 3 グループで追加する:

**中層ムーブ（6 ボタン）**:
M, M', E, E', S, S'

**キューブ回転（6 ボタン）**:
x, x', y, y', z, z'

**ワイドムーブ（12 ボタン）**:
u, u', d, d', r, r', l, l', f, f', b, b'

計 36 ボタン。Bootstrap の `row-cols-4 row-cols-sm-6` グリッドで横並びにする。
グループ間に `<hr>` または小見出しを入れて視認性を確保する。

## テスト戦略

### Phase 1 テスト（rotation.ts 修正）
```
tests/logic/rotation.test.ts に追加:
- 3×3 で sliceIndex=1 の M ムーブが成功する（エラーにならない）
- 3×3 で M 適用後キューブが完成状態でなくなる
- 5×5 で sliceIndex=2 が有効（中層アクセス可能）
```

### Phase 2 テスト（M / E / S）
```
tests/logic/notation.test.ts に追加:
- M → [{face:Left, sliceIndex:1, CW}]
- M' → [{face:Left, sliceIndex:1, CCW}]
- M2 → [{face:Left, sliceIndex:1, Double}]
- E → [{face:Down, sliceIndex:1, CW}]
- S → [{face:Front, sliceIndex:1, CW}]
- m（小文字）→ INVALID_NOTATION エラー
```

### Phase 3 テスト（ワイドムーブ展開）
```
tests/logic/notation.test.ts に追加・変更:
- Uw → 2 ムーブ [{Up,0,CW}, {Up,1,CW}]（既存テスト変更）
- u  → 2 ムーブ [{Up,0,CW}, {Up,1,CW}]（= Uw）
- Rw → 2 ムーブ [{Right,0,CW}, {Right,1,CW}]
- Rw2 → 2 ムーブ [{Right,0,Double}, {Right,1,Double}]（既存テスト変更）
- moveToNotation ↔ parseNotation 往復テストから sliceIndex=1 ケースを削除
```

### Phase 4 テスト（x / y / z）
```
tests/logic/notation.test.ts に追加:
- x（3×3）→ 3 ムーブ [{R,0,CW},{R,1,CW},{L,0,CCW}]
- y（3×3）→ 3 ムーブ [{U,0,CW},{U,1,CW},{D,0,CCW}]
- z（3×3）→ 3 ムーブ [{F,0,CW},{F,1,CW},{B,0,CCW}]
- x'（3×3）→ direction 反転
- x2（3×3）→ Double
- x（4×4, size=4）→ 4 ムーブ [{R,0},{R,1},{L,0,inv},{L,1,inv}]
- x（5×5, size=5）→ 5 ムーブ [{R,0},{R,1},{R,2},{L,0,inv},{L,1,inv}]
```

### Phase 5 テスト（MoveInput.vue）
```
tests/components/MoveInput.test.ts に追加:
- M ボタンが存在する
- x ボタンが存在する
- M ボタンクリックでテキストボックスに "M" が追記される
- x ボタンクリックでキューブ状態が変化する（3×3）
```

## 実装順序

```
Phase 1: rotation.ts 修正（maxSlice）
  → TDD: テスト先行（3×3 sliceIndex=1 を valid とするテスト）
  → 実装: Math.floor → Math.ceil

Phase 2: M / E / S パーサー対応
  → TDD: notation.test.ts に M/E/S テスト追加
  → 実装: notation.ts に中層トークン解析追加

Phase 3: ワイドムーブ展開修正
  → TDD: Uw を 2 ムーブに変更するよう既存テスト更新（一時 Red に）
  → 実装: notation.ts の wide ムーブ展開ロジック修正
  → 既存テスト再度 Green 確認

Phase 4: x / y / z パーサー対応
  → TDD: x/y/z テスト追加（size=3,4,5 各ケース）
  → 実装: expandRotation 関数追加・x/y/z トークン解析

Phase 5: MoveInput.vue 更新
  → TDD: 新ボタン存在テスト・クリックテスト追加
  → 実装: store.size 渡し・ボタン追加
  → 全テスト Green 確認・typecheck・lint

Phase 6: 完了確認・コミット
```
