# クイックスタート: コアロジックレイヤー

**フィーチャー**: `001-nxn-cube-core-logic`
**作成日**: 2026-04-26

このガイドはコアロジックレイヤーの動作確認手順を示す。
実装完了後にこの手順を実行して各機能が正しく動作することを確認すること。

---

## 前提条件

```bash
# pnpm がインストール済みであること
pnpm --version  # 9.x 以上

# 依存関係のインストール
pnpm install

# TypeScript コンパイルが通ること（エラーゼロ）
pnpm tsc --noEmit
```

---

## 1. キューブの作成と確認

```typescript
import { createCube, Face, Color } from './src/logic'

// 3×3 キューブを作成
const result = createCube(3)
if (!result.ok) throw new Error(result.error.message)

const cube = result.value
console.log(cube.size)                        // 3
console.log(cube.faces[Face.Up][0][0])        // 0 (Color.White)
console.log(cube.faces[Face.Front][1][1])     // 2 (Color.Red)
```

**期待される出力**:
```
3
0
2
```

---

## 2. 回転の適用（イミュータブル確認）

```typescript
import { createCube, applyMove, Face, Color, Direction } from './src/logic'

const cube = createCube(3).value!

// U 回転を適用
const move = { face: Face.Up, sliceIndex: 0, direction: Direction.CW }
const rotated = applyMove(cube, move).value!

// 元の状態が変わっていないことを確認
console.log(cube.faces[Face.Front][0][0])     // 2 (Red — 変化なし)
console.log(rotated.faces[Face.Front][0][0])  // 4 (Blue — Front上辺がRight面の色になる)

// U → U' で元に戻ることを確認
const inverse = { face: Face.Up, sliceIndex: 0, direction: Direction.CCW }
const restored = applyMove(rotated, inverse).value!
console.log(restored.faces[Face.Front][0][0]) // 2 (Red — 元に戻る)
```

---

## 3. 手順文字列のパースと適用

```typescript
import { createCube, parseNotation, applySequence, invertSequence } from './src/logic'

const cube = createCube(3).value!

// WCA 記法の手順をパース
const seqResult = parseNotation("R U R' U'")
if (!seqResult.ok) throw new Error(seqResult.error.message)

const seq = seqResult.value
console.log(seq.length) // 4

// 手順を適用
const scrambled = applySequence(cube, seq).value!

// インバースで元に戻す
const inv = invertSequence(seq)
const restored = applySequence(scrambled, inv).value!

// 完成状態と一致することを確認（faces の内容が cube と同じ）
console.log(JSON.stringify(restored.faces) === JSON.stringify(cube.faces)) // true
```

---

## 4. NxN スライス操作（4×4）

```typescript
import { createCube, parseNotation, applySequence } from './src/logic'

const cube = createCube(4).value!

// 4×4 のスライス手順
const seq = parseNotation("2R 2U' 2R'").value!
const result = applySequence(cube, seq).value!

// 外層（sliceIndex=0）は変わらないことを確認
console.log(result.faces[4][0][0]) // Face.Right の外層は不変
```

---

## 5. 合法性検証

```typescript
import { createCube, validateState } from './src/logic'

const cube = createCube(3).value!
const valid = validateState(cube)
console.log(valid.ok) // true

// 不正な状態を作成してテスト
const broken = {
  ...cube,
  faces: cube.faces.map((face, i) =>
    i === 0 ? face.map(row => row.map(() => 5)) : face  // Up面を全てGreenに
  ) as typeof cube.faces
}
const invalid = validateState(broken)
console.log(invalid.ok)           // false
console.log(invalid.error?.kind)  // 'INVALID_CUBE_STATE'
```

---

## 6. 直列化・復元

```typescript
import { createCube, serialize, deserialize, parseNotation, applySequence } from './src/logic'

// スクランブル済み状態を作成
const cube = createCube(3).value!
const seq = parseNotation("R U2 F' B D L R2").value!
const scrambled = applySequence(cube, seq).value!

// 直列化
const saved = serialize(scrambled)
console.log(saved.v)           // 1
console.log(saved.size)        // 3
console.log(saved.data.length) // 54 (6 * 3 * 3)

// 復元
const restored = deserialize(saved)
console.log(restored.ok)  // true
console.log(
  JSON.stringify(restored.value!.faces) === JSON.stringify(scrambled.faces)
) // true
```

---

## 7. テストスイートの実行

```bash
# 全テストを実行
pnpm test

# カバレッジ付きで実行（90% 以上であることを確認）
pnpm test:coverage

# 期待される出力:
# ✓ tests/logic/cube-state.test.ts (XX tests)
# ✓ tests/logic/rotation.test.ts  (XX tests)
# ✓ tests/logic/notation.test.ts  (XX tests)
# ✓ tests/logic/validation.test.ts (XX tests)
# ✓ tests/logic/serialization.test.ts (XX tests)
# Coverage: Lines 90%+ ✓
```
