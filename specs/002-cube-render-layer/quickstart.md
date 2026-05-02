# クイックスタート: NxN キューブ描画レイヤー（002-cube-render-layer）

**対象者**: このフィーチャーを実装する開発者（AI・人間を問わず）

---

## 依存関係のインストール

```bash
# sr-visualizer（描画ライブラリ本体）
pnpm add sr-visualizer@^1.0.13

# svgdom（Node.js ヘッドレス SVG 環境）
pnpm add svgdom

# @resvg/resvg-js（SVG → PNG 変換、Wasm ベース）
pnpm add @resvg/resvg-js
```

インストール後、`node_modules/sr-visualizer/dist/` の型定義（`.d.ts`）を確認し、
`StickerDefinition` / `facelets` / `stickerColors` の API を確定すること。

---

## ファイル作成順序

実装は **テストファースト（TDD）** で進める。以下の順で作成する:

```
1. src/render/types.ts         ← 型・インターフェース定義
2. src/render/defaults.ts      ← DEFAULT_COLOR_SCHEME 定数
3. tests/render/color-map.test.ts    ← RED（失敗するテスト）
4. src/render/sr-visualizer/color-map.ts  ← GREEN
5. tests/render/adapter.test.ts      ← RED
6. src/render/sr-visualizer/dom-factory.ts
7. src/render/sr-visualizer/adapter.ts   ← GREEN
8. src/render/index.ts         ← 公開 API exports
9. vitest.config.ts の coverage に src/render/ を追加
```

---

## 基本的な使い方（実装完成後）

```typescript
import { createCube } from './src/logic/index.js'
import { renderSVG, renderPNG } from './src/render/index.js'

// 3×3 の完成状態キューブを生成
const cubeResult = createCube(3)
if (cubeResult.ok) {
  // SVG 文字列を取得
  const svgResult = renderSVG(cubeResult.value)
  if (svgResult.ok) {
    console.log(svgResult.value) // '<svg ...>...</svg>'
  }

  // PNG バイナリを取得
  const pngResult = await renderPNG(cubeResult.value)
  if (pngResult.ok) {
    // Uint8Array の先頭 8 バイト = PNG マジックナンバー
    console.log(pngResult.value.subarray(0, 8))
  }
}
```

---

## 重要な実装制約

| 制約 | 内容 |
|------|------|
| DOM 禁止 | `document`・`window`・Canvas を直接インポートしない。svgdom アダプター経由のみ |
| 型安全 | `any` 禁止。`unknown` + 型ガードを使用 |
| Result 型 | 例外を投げない。すべてのエラーは `Result<T, RenderError>` として返す |
| イミュータブル | `CubeState` を読み取るだけ。変更しない |
| 決定論性 | 同一入力 → 同一出力。乱数・タイムスタンプを出力に含めない |
| NxN 汎用 | N をハードコードしない。`state.size` を動的に参照する |

---

## テスト実行

```bash
# 全テスト（カバレッジ付き）
pnpm test:coverage

# 描画レイヤーのテストのみ
pnpm vitest run tests/render/

# 型チェック
pnpm typecheck
```

---

## Constitution Check（実装前確認）

実装を開始する前に以下を確認すること:

- [x] **I.** V2 と同じ sr-visualizer を使用し、同等の PNG/SVG を出力する
- [x] **II.** strict: true、any 禁止、公開 API に戻り値型あり
- [x] **III.** src/render/ はロジックレイヤーの型のみに依存。DOM/Vue は依存しない
- [x] **IV.** テストファーストで実装。カバレッジ 90% ゲートを vitest.config.ts に追加
- [x] **V.** `state.size` を動的参照。N をハードコードしない
- [ ] **VI.** 永続化は本フィーチャーのスコープ外（対象外）

---

## よくある落とし穴

1. **svgdom の初期化順序**: `registerWindow` は sr-visualizer の import より前に実行すること
2. **sr-visualizer の Face 番号と CubeState の Face 番号の対応**: research.md の変換テーブルを参照
3. **@resvg/resvg-js の初期化**: Wasm のロードが非同期のため `renderPNG` は `async` にする
4. **SVG 文字列の抽出**: `cubeSVG` は DOM を変更するだけで返値がない。`container.innerHTML` または `container.querySelector('svg')?.outerHTML` で取得する
