# リサーチ結果: NxN キューブ描画レイヤー（002-cube-render-layer）

**ブランチ**: `002-cube-render-layer` | **日付**: 2026-05-02

---

## 1. sr-visualizer API サーフェス

### 決定

sr-visualizer 1.0.13 の主要公開 API:

| 関数 | シグネチャ | 挙動 |
|------|-----------|------|
| `cubeSVG` | `(container: HTMLElement \| string, opts?: ICubeOptions): void` | DOM コンテナに SVG を描画（返値なし） |
| `cubePNG` | `(container: HTMLElement, opts?: ICubeOptions): void` | DOM コンテナに Canvas ベースの PNG を描画（返値なし） |

`ICubeOptions` の主要フィールド:

| フィールド | 型 | 概要 |
|------------|-----|------|
| `cubeSize` | `number` | NxN のサイズ（デフォルト 3、1〜17 対応） |
| `colorScheme` | `Record<Face, string>` | 面全体の色（解法済み外観用） |
| `algorithm` | `string` | WCA 記法の手順（解法済み状態に適用） |
| `viewportRotations` | `[Axis, number][]` | 視点角度（例: `[[Axis.Y, 45], [Axis.X, -34]]`） |
| `backgroundColor` | `string` | 背景色（hex またはカラー名） |
| `width` / `height` | `number` | 出力サイズ（ピクセル、デフォルト 128） |
| `stickerColors` | `string[]` / `StickerDefinition[]` | 個別ステッカー色指定（要バージョン確認） |

エクスポートされる列挙体: `Face`（U/R/F/D/L/B）、`Axis`（X/Y/Z）、`Masking`

### 根拠

npm tarball のメタデータ + GitHub README + VisualCube 原型の PHP 実装から取得。

### 代替案

なし（spec 前提条件で sr-visualizer ^1.0.13 を指定済み）。

---

## 2. 任意 CubeState のステッカー色指定（T003 確定済み）

### 決定

`ICubeOptions.stickerColors: string[]` を使用する。
`node_modules/sr-visualizer/dist/lib/cube/options.d.ts` および `drawing.js` の実装から確認済み。

#### 確定した API シグネチャ

```typescript
// node_modules/sr-visualizer/dist/lib/cube/options.d.ts
interface ICubeOptions {
  stickerColors?: string[]           // 推奨: フラット hex 配列
  facelets?: string[] | FaceletDefinition[]  // 代替（FaceletDefinition 使用時は文字列ラベル形式）
  // ... 他フィールド
}

// node_modules/sr-visualizer/dist/lib/cube/models/sticker.d.ts
class StickerDefinition {
  face: Face  // sr-visualizer Face enum (U=0,R=1,F=2,D=3,L=4,B=5)
  n: number   // ステッカー連番（face 内で左上=0 から行優先で採番）
}
```

#### stickerColors 配列の構造

フラット配列で全 6 面 × N² 個のステッカー色を指定する。
**面の順序は sr-visualizer の `AllFaces` 順**（CubeState の Face 順と異なる）:

| 配列位置 | sr-visualizer Face | CubeState Face |
|---------|-------------------|----------------|
| `[0 .. N²-1]` | U (enum=0) | Face.Up (0) |
| `[N² .. 2N²-1]` | R (enum=1) | Face.Right (4) |
| `[2N² .. 3N²-1]` | F (enum=2) | Face.Front (2) |
| `[3N² .. 4N²-1]` | D (enum=3) | Face.Down (1) |
| `[4N² .. 5N²-1]` | L (enum=4) | Face.Left (5) |
| `[5N² .. 6N²-1]` | B (enum=5) | Face.Back (3) |

各面内のステッカーは**行優先（row-major）**、インデックス = `row * N + col`。
カラーインデックス = `faceIndex * N² + row * N + col`（drawing.js `getStickerColor` 実装から確認）。

#### CubeState → stickerColors 変換順序

`color-map.ts` では CubeState.faces を以下の順で読み出して配列を構築する:

```
stickerColors = [
  ...faces[0].flat(),  // Face.Up    → sr U
  ...faces[4].flat(),  // Face.Right → sr R
  ...faces[2].flat(),  // Face.Front → sr F
  ...faces[1].flat(),  // Face.Down  → sr D
  ...faces[5].flat(),  // Face.Left  → sr L
  ...faces[3].flat(),  // Face.Back  → sr B
]
```

各 Color 値（0-5）は `ColorScheme` で hex 文字列に変換してから配列に積む。

#### フォールバック戦略（不要と判断）

`stickerColors` が個別ステッカー全色指定に完全対応していることを `drawing.js` で確認した。
SVG テンプレートアダプターへのフォールバックは不要。

### 根拠

`node_modules/sr-visualizer/dist/lib/cube/drawing.js` の `getStickerColor` 関数を直接確認:
`colorIndex = faceIndex * (cubeSize * cubeSize) + row * cubeSize + col` で
`options.stickerColors[colorIndex]` を参照する実装であることを検証した。

### 代替案を却下した理由

`algorithm` のみでの表現: 任意の CubeState がすべて WCA 手順で表現できるわけではない
（特に無効状態・非到達状態）ため、却下。

---

## 3. Node.js ヘッドレス SVG 生成（DOM 依存の解消）

### 決定

`svgdom` パッケージを採用する。

`svgdom` は svg.js（sr-visualizer の直接依存）公式の Node.js 用ヘッドレス DOM 実装。
sr-visualizer 内部の `SVG(container)` 呼び出しが `svgdom` が提供する仮想 DOM 上で動作する。

実装パターン:
```typescript
// dom-factory.ts（Node.js 環境向けアダプター）
import { createSVGWindow } from 'svgdom'
import { SVG, registerWindow } from '@svgdotjs/svg.js'

const window = createSVGWindow()
const document = window.document
registerWindow(window, document)
```

その後、sr-visualizer の `cubeSVG(container, opts)` に `document.createElement('div')` を渡し、
`container.innerHTML` から SVG 文字列を抽出する。

### 根拠

- svgdom は svg.js の公式エコシステム内のパッケージ（@svgdotjs/svg.js に同梱）
- sr-visualizer は svg.js を直接依存としているため、svgdom の初期化で動作する
- jsdom より軽量でインストールサイズが小さい（jsdom は完全な DOM を模倣）

### 代替案を却下した理由

| 代替 | 却下理由 |
|------|----------|
| jsdom | 全 DOM API を模倣する大規模ライブラリ。SVG 生成に必要な範囲を超える |
| Puppeteer / Playwright | ヘッドレスブラウザは過剰、CI セットアップが複雑 |
| SVG 手書きテンプレート | sr-visualizer の 3D 等角投影レンダリング品質を失う |

---

## 4. Node.js での PNG 生成

### 決定

`@resvg/resvg-js` を採用する（Wasm ベース、ネイティブコンパイル不要）。

手順:
1. `renderSVG()` で SVG 文字列を取得
2. `@resvg/resvg-js` の `Resvg` クラスに SVG 文字列を渡す
3. `resvg.render()` → `resvg.asPng()` で `Uint8Array` を取得

```typescript
import { Resvg } from '@resvg/resvg-js'
const resvg = new Resvg(svgString)
const pngData = resvg.render().asPng() // Uint8Array
```

### 根拠

- 純 Wasm 実装: ネイティブ依存なし（node-canvas は Cairo のネイティブビルドが必要）
- ブラウザ Canvas API 不要: FR-004 に完全準拠
- Node.js とブラウザ双方で同じ API
- PNG マジックナンバー準拠の Uint8Array を直接返す（SC-005 を満たす）
- 決定論的出力（SC-002 を満たす）

### 代替案を却下した理由

| 代替 | 却下理由 |
|------|----------|
| node-canvas | ネイティブ依存（Cairo）、CI での platform-specific ビルドが煩雑 |
| svg2img | 内部で Canvas を使用、ブラウザ API に依存 |
| sharp | 汎用画像処理ライブラリで過剰、バンドルサイズ大 |

---

## 5. 標準色スキーム（WCA 準拠）

### 決定

デフォルト色スキームは以下の WCA 標準配色とする:

| 面 | CubeState.Face | Color 値 | sr-visualizer Face | 16進カラー |
|----|----------------|-----------|---------------------|-----------|
| Up | Face.Up (0) | Color.White (0) | Face.U | `#FFFFFF` |
| Down | Face.Down (1) | Color.Yellow (1) | Face.D | `#FFFF00` |
| Front | Face.Front (2) | Color.Red (2) | Face.F | `#FF0000` |
| Back | Face.Back (3) | Color.Orange (3) | Face.B | `#FF8800` |
| Right | Face.Right (4) | Color.Blue (4) | Face.R | `#0000FF` |
| Left | Face.Left (5) | Color.Green (5) | Face.L | `#00FF00` |

### 根拠

spec 前提条件（U=白, D=黄, F=赤, B=橙, R=青, L=緑）および Constitution 原則 I（V2 継続性）。
V2 が使用していた sr-visualizer のデフォルト配色と一致させる。

---

## 6. CubeState → sr-visualizer フォーマット変換

### 決定

変換ロジックを `color-map.ts` に分離し、以下のマッピングを実装する:

```
CubeState.faces[face][row][col] → Color (0-5)
Color → 16進カラー文字列 (DEFAULT_COLOR_SCHEME または RenderOptions.colorScheme)
```

sr-visualizer のステッカー指定 API（`stickerColors` / `facelets`）の確認は
インストール後に型定義から行う。sr-visualizer が個別ステッカー指定を
サポートしない場合は SVG テンプレートアダプターで代替する（FR-008 で保護）。

Face の並び順マッピング（CubeState ↔ sr-visualizer):

| CubeState Face | インデックス | sr-visualizer Face |
|----------------|-------------|---------------------|
| Face.Up | 0 | Face.U |
| Face.Down | 1 | Face.D |
| Face.Front | 2 | Face.F |
| Face.Back | 3 | Face.B |
| Face.Right | 4 | Face.R |
| Face.Left | 5 | Face.L |

---

## 7. 解決済み NEEDS CLARIFICATION 一覧

| 項目 | 解決内容 |
|------|---------|
| sr-visualizer の Node.js 対応 | svgdom を使った仮想 DOM で解消 |
| PNG 出力方法 | @resvg/resvg-js（Wasm）で SVG → Uint8Array |
| 任意 CubeState の描画 | StickerDefinition / facelets API で対応（インストール後確定） |
| 標準色スキーム | WCA 準拠の 6 色ハードコード定数として定義 |
| テスト環境での DOM | Vitest は Node.js 実行 → svgdom で統一 |
