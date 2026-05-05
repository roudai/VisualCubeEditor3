# クイックスタート: 004-full-ui-options 実装ガイド

## 前提確認

```bash
# 正しいブランチか確認
git branch --show-current  # → 004-full-ui-options

# 依存関係インストール済みか確認
pnpm install

# 既存テスト全件パス確認
pnpm test

# 型チェックパス確認
pnpm typecheck
```

## 開発サーバー起動

```bash
# package.json に dev スクリプト追加後
pnpm dev
# または
npx vite
```

## 実装順序

依存関係の方向に従い、**下位レイヤーから上位レイヤーへ**実装する。

### ステップ 1: 描画レイヤー型拡張（テストなし変更）

```
src/render/types.ts          ← RenderOptions に新規フィールド追加
src/render/sr-visualizer/adapter.ts  ← 新規フィールドを cubeSVG() に渡す
```

変更後 `pnpm typecheck` でエラーなし確認。

### ステップ 2: `useRenderOptionsStore` 作成

```
src/stores/renderOptions.ts  ← 新規ファイル
tests/stores/renderOptions.test.ts  ← 同時作成（TDD）
```

テスト項目例:
- デフォルト値が正しく設定されている
- `rotateX/Y/Z` が正しく面色を循環させる
- `resetColorScheme` が WCA 標準色に戻す
- `renderOptions` computed が正しい RenderOptions を返す
- localStorage への自動保存と復元が動作する

### ステップ 3: CubeDisplay 更新

```
src/components/CubeDisplay.vue  ← useRenderOptionsStore を使用
```

`renderSVG(cubeStore.cubeState, renderStore.renderOptions)` に変更。

### ステップ 4: 新規 UI コンポーネント

作成順（依存なし、並列作業可能）:

```
src/components/ImageSizeControl.vue
src/components/SpecialViewControl.vue
src/components/StageMaskControl.vue
src/components/ColorSchemeControl.vue
src/components/ViewportRotationControl.vue
src/components/AppearanceControl.vue
```

各コンポーネントには対応するテストを同時作成:

```
tests/components/ImageSizeControl.test.ts
tests/components/SpecialViewControl.test.ts
...
```

### ステップ 5: SizeSelector 更新

```
src/components/SizeSelector.vue  ← +/- ボタン追加（select 要素維持）
```

既存テスト (`tests/components/SizeSelector.test.ts`) が引き続きパスすること。

### ステップ 6: Bootstrap 5 + App.vue レイアウト

```
index.html     ← Bootstrap 5 CSS CDN リンク追加
src/App.vue    ← 二列レイアウト（Bootstrap grid）
```

### ステップ 7: package.json dev スクリプト追加

```json
"scripts": {
  "dev": "vite",
  ...
}
```

## 検証チェックリスト

```bash
pnpm test           # 全テストパス（新規テスト含む）
pnpm typecheck      # TypeScript エラーなし
pnpm lint           # ESLint エラーなし
pnpm dev            # ブラウザで動作確認
```

ブラウザ確認項目:
- [ ] Special View を "plan" に切り替えるとキューブが平面図に変わる
- [ ] OLL を選択すると非 LL 面がグレーアウトされる
- [ ] 各面のカラーピッカーを変更するとリアルタイムで色が変わる
- [ ] X/Y/Z 回転ボタンで色が循環する
- [ ] ビューポートスライダーを動かすとキューブの向きが変わる
- [ ] 背景色・不透明度・dist を変更すると反映される
- [ ] 画像サイズの +/- ボタンが機能する
- [ ] 右パネルをスクロールしても左のキューブが固定されている
- [ ] ページをリロードしても設定が復元される（localStorage 永続化）

## 型キャストの注意点（Constitution II 準拠）

`adapter.ts` で `Masking` 型にキャストする箇所には必ず安全性コメントを付与する:

```typescript
// sr-visualizer が Masking 列挙体を要求するが、useRenderOptionsStore が
// MASK_LIST 定数からのみ値をセットするため、実行時に無効な値は入らない
...(options?.mask && { mask: options.mask as Masking }),
```
