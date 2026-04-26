# データモデル: NxN キューブ コアロジックレイヤー

**フィーチャー**: `001-nxn-cube-core-logic`
**作成日**: 2026-04-26

---

## 型定義

### Color（色）

```typescript
/** ステッカーの色を表す数値列挙型。直列化・比較を高速化するため数値を使用。 */
export const Color = {
  White:  0,
  Yellow: 1,
  Red:    2,
  Orange: 3,
  Blue:   4,
  Green:  5,
} as const
export type Color = typeof Color[keyof typeof Color]
```

- 取りうる値: 0〜5（6色固定）
- 初期状態での各面の色: Up=White, Down=Yellow, Front=Red, Back=Orange, Right=Blue, Left=Green

---

### Face（面）

```typescript
/** 6面を表す数値列挙型。faces 配列のインデックスとして使用。 */
export const Face = {
  Up:    0,
  Down:  1,
  Front: 2,
  Back:  3,
  Right: 4,
  Left:  5,
} as const
export type Face = typeof Face[keyof typeof Face]
```

---

### CubeSize（サイズ）

```typescript
/** サポートするキューブサイズ。N=2〜7。 */
export type CubeSize = 2 | 3 | 4 | 5 | 6 | 7
```

- バリデーション: `createCube()` 呼び出し時に CubeSize の範囲を検証する
- N=1 および N≥8 は受け付けない（FR-001）

---

### CubeState（キューブ状態）

```typescript
/**
 * NxN キューブの全ステッカー状態。イミュータブル。
 * faces[face][row][col] で色にアクセスする。
 * row=0 が各面の上端、col=0 が各面の左端。
 */
export interface CubeState<N extends CubeSize = CubeSize> {
  readonly size: N
  readonly faces: Readonly<[
    ReadonlyArray<ReadonlyArray<Color>>, // Face.Up    (0)
    ReadonlyArray<ReadonlyArray<Color>>, // Face.Down  (1)
    ReadonlyArray<ReadonlyArray<Color>>, // Face.Front (2)
    ReadonlyArray<ReadonlyArray<Color>>, // Face.Back  (3)
    ReadonlyArray<ReadonlyArray<Color>>, // Face.Right (4)
    ReadonlyArray<ReadonlyArray<Color>>, // Face.Left  (5)
  ]>
}
```

**不変条件**:
- `faces.length === 6`
- `faces[f].length === N` （全面）
- `faces[f][r].length === N` （全行）
- 各色の出現数 = N²（合法状態の場合）

---

### Direction（回転方向）

```typescript
export const Direction = {
  CW:     'CW',     // 時計回り（Clockwise）
  CCW:    'CCW',    // 反時計回り（Counter-Clockwise）
  Double: 'Double', // 2回転（180°）
} as const
export type Direction = typeof Direction[keyof typeof Direction]
```

---

### Move（手順の1手）

```typescript
/**
 * 単一の回転操作。
 * sliceIndex=0 が対象面の外層、sliceIndex=N-1 が対面の外層（内側最深スライス）。
 * 3×3 の標準手（U/D/F/B/R/L）は sliceIndex=0 で表現する。
 */
export interface Move {
  readonly face: Face
  readonly sliceIndex: number // 0 〜 floor(N/2)-1
  readonly direction: Direction
}
```

**WCA 記法との対応例（N=4）**:
| WCA 記法 | face | sliceIndex | direction |
|----------|------|------------|-----------|
| `U`      | Up   | 0          | CW        |
| `U'`     | Up   | 0          | CCW       |
| `U2`     | Up   | 0          | Double    |
| `2U`     | Up   | 1          | CW        |
| `2U'`    | Up   | 1          | CCW       |

---

### MoveSequence（手順）

```typescript
/** Move の順序付きリスト。手順全体を表す。 */
export type MoveSequence = ReadonlyArray<Move>
```

---

### LogicError（エラー型）

```typescript
export type LogicErrorKind =
  | 'INVALID_CUBE_SIZE'       // N が CubeSize の範囲外
  | 'INVALID_MOVE'            // 無効な回転記号
  | 'INVALID_NOTATION'        // パース不能な手順文字列
  | 'INVALID_CUBE_STATE'      // 合法性検証に失敗
  | 'INVALID_SLICE_INDEX'     // sliceIndex が範囲外

export interface LogicError {
  readonly kind: LogicErrorKind
  readonly message: string
  /** パースエラーの場合に、問題のあるトークンの位置（0始まり）を格納 */
  readonly tokenIndex?: number
}
```

---

### Result（結果型）

```typescript
/** 例外を投げない関数の返り値。ok=true で value、ok=false で error にアクセス。 */
export type Result<T, E = LogicError> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E }

/** ヘルパー関数 */
export const ok  = <T>(value: T): Result<T>           => ({ ok: true,  value })
export const err = <E>(error: E): Result<never, E>    => ({ ok: false, error })
```

---

## 状態遷移

```
createCube(N)
    │
    ▼
CubeState<N> ──── applyMove(state, move) ──────► CubeState<N>
    │                                                  │
    │              applySequence(state, seq) ──────────┘
    │
    ├── validateState(state) ──► Result<true, LogicError>
    │
    └── serialize(state) ──► SerializedCube
            │
            ▼
     deserialize(data) ──► Result<CubeState, LogicError>
```

---

## 直列化スキーマ（原則VI対応）

```typescript
/** 保存用の直列化形式。バージョン管理による将来のマイグレーションに対応。 */
export interface SerializedCube {
  readonly v: 1                       // スキーマバージョン（MUST）
  readonly size: CubeSize
  /** faces をフラット化した数値配列: faces[f][r][c] = data[f * N*N + r * N + c] */
  readonly data: ReadonlyArray<number>
}
```

**バージョンポリシー**:
- `v` フィールドの変更は MAJOR バンプとする
- 旧バージョンのデータは `migrate(v1: SerializedCubeV1) => SerializedCube` 関数で変換する
