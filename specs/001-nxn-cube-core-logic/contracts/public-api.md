# 公開 API コントラクト: コアロジックレイヤー

**フィーチャー**: `001-nxn-cube-core-logic`
**作成日**: 2026-04-26
**モジュールパス**: `src/logic/index.ts`

このドキュメントはロジックレイヤーが外部（描画レイヤー・UI レイヤー・テスト）に
公開する関数の契約を定義する。実装詳細（アルゴリズム・内部データ構造）は含まない。

---

## キューブ状態管理

### `createCube`

```typescript
function createCube<N extends CubeSize>(size: N): Result<CubeState<N>>
```

| 項目 | 内容 |
|------|------|
| 説明 | サイズ N の完成状態（ソルブ済み）キューブを生成する |
| 引数 | `size`: 2〜7 の整数 |
| 成功 | `Result.ok = true`, `value`: 全面単色の `CubeState<N>` |
| 失敗 | `Result.ok = false`, `error.kind = 'INVALID_CUBE_SIZE'` |
| 副作用 | なし |
| 不変条件 | 返り値の状態は変更不可能（TypeScript `readonly` で保証） |

**例**:
```typescript
const result = createCube(3)
if (result.ok) {
  result.value.size          // 3
  result.value.faces[Face.Up][0][0]  // Color.White
}
```

---

### `getSticker`

```typescript
function getSticker(
  state: CubeState,
  face: Face,
  row: number,
  col: number,
): Result<Color>
```

| 項目 | 内容 |
|------|------|
| 説明 | 指定した面・行・列のステッカーカラーを取得する |
| 失敗条件 | row または col が 0〜N-1 の範囲外 |
| 副作用 | なし |

---

## 回転操作

### `applyMove`

```typescript
function applyMove(state: CubeState, move: Move): Result<CubeState>
```

| 項目 | 内容 |
|------|------|
| 説明 | キューブ状態に1手の回転を適用し、新しい状態を返す |
| 引数 | `state`: 現在の状態、`move`: 適用する手 |
| 成功 | `Result.ok = true`, `value`: 回転後の新しい `CubeState` |
| 失敗 | `Result.ok = false`, `error.kind = 'INVALID_SLICE_INDEX'` など |
| 副作用 | なし（`state` は変更されない） |
| 不変条件 | `state` オブジェクトは呼び出し前後で同一の内容を保つ |

---

### `applySequence`

```typescript
function applySequence(state: CubeState, sequence: MoveSequence): Result<CubeState>
```

| 項目 | 内容 |
|------|------|
| 説明 | 手順リストを順に適用した最終状態を返す |
| 引数 | `sequence` が空の場合、`state` をそのまま返す |
| 失敗 | いずれかの手が無効な場合、その手の時点でエラーを返す |
| 副作用 | なし |

---

### `invertSequence`

```typescript
function invertSequence(sequence: MoveSequence): MoveSequence
```

| 項目 | 内容 |
|------|------|
| 説明 | 手順のインバース（逆順・逆方向）を返す |
| 引数 | `sequence`: 元の手順（空も許容） |
| 返り値 | インバース後の `MoveSequence`（常に成功。エラーなし） |
| 不変条件 | `applySequence(applySequence(s, seq).value, invertSequence(seq)).value` が `s` と等しい |
| 副作用 | なし |

---

## 手順解析

### `parseNotation`

```typescript
function parseNotation(notation: string): Result<MoveSequence>
```

| 項目 | 内容 |
|------|------|
| 説明 | WCA 記法の手順文字列をパースして `MoveSequence` に変換する |
| 引数 | `notation`: スペース区切りの WCA 記法文字列（例: `"R U R' U'"`, `"2R 3U'"`, `""`）|
| 成功 | `Result.ok = true`, `value`: パース済みの `MoveSequence` |
| 失敗 | `Result.ok = false`, `error.kind = 'INVALID_NOTATION'`, `error.tokenIndex`: 問題箇所 |
| 空文字列 | `value = []`（空の MoveSequence）を返す |
| 対応記法 | U/D/F/B/R/L、`'`、`2`、NxN スライス（`2R`、`3U'` 等） |
| 非対応 | `x`/`y`/`z` ローテーション（`INVALID_NOTATION` エラーを返す） |

---

### `moveToNotation`

```typescript
function moveToNotation(move: Move, size: CubeSize): string
```

| 項目 | 内容 |
|------|------|
| 説明 | `Move` オブジェクトを WCA 記法文字列に変換する |
| 引数 | `size`: 出力するスライス記法の正規化に必要 |
| 返り値 | WCA 記法文字列（例: `"U"`, `"2R'"`, `"F2"`） |
| 副作用 | なし |
| 逆変換 | `parseNotation(moveToNotation(m, n))` は元の `m` に等しい Move を返す |

---

## 合法性検証

### `validateState`

```typescript
function validateState(state: CubeState): Result<true, LogicError>
```

| 項目 | 内容 |
|------|------|
| 説明 | キューブ状態の合法性を検証する |
| 検証内容 | 1. 構造チェック（次元・サイズ整合性）、2. ステッカー数チェック（各色 N² 個）、3. パリティチェック（N=3 のみ） |
| 成功 | `Result.ok = true`, `value = true` |
| 失敗 | `Result.ok = false`, `error.kind = 'INVALID_CUBE_STATE'`, `error.message` に詳細 |
| 副作用 | なし |

---

## 直列化・復元（原則VI対応）

### `serialize`

```typescript
function serialize(state: CubeState): SerializedCube
```

| 項目 | 内容 |
|------|------|
| 説明 | `CubeState` を保存可能な `SerializedCube` オブジェクトに変換する |
| 返り値 | バージョン `v=1` の `SerializedCube`（常に成功） |
| 副作用 | なし |
| 保証 | `deserialize(serialize(state)).value` は `state` と同一の内容を持つ |

---

### `deserialize`

```typescript
function deserialize(data: unknown): Result<CubeState>
```

| 項目 | 内容 |
|------|------|
| 説明 | 未知の値を `CubeState` に復元する。スキーマバージョンを自動検出する |
| 引数 | `data`: JSON.parse の結果など任意の値（`unknown` で受け取りガード） |
| 成功 | `Result.ok = true`, `value`: 復元された `CubeState` |
| 失敗 | `Result.ok = false`, `error.kind = 'INVALID_CUBE_STATE'` |
| マイグレーション | 旧バージョン（`v < 1`）のデータは内部で最新形式に変換してから返す |
| 副作用 | なし |
