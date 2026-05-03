# リサーチ: Ver.2 相当フル UI オプション（004-full-ui-options）

**ブランチ**: `004-full-ui-options` | **日付**: 2026-05-03

---

## 決定事項

### 1. Bootstrap 5 の導入方法

**決定**: CDN リンクを `index.html` の `<head>` に追加する（CSS のみ、JS 不要）

**根拠**:
- Ver.2 が同じ方法を採用している（プロジェクト一貫性）
- Vue の SFC スタイルと競合しない
- Bootstrap JS が提供する機能（Dropdown/Collapse JS）を今回は使わない。
  Vue の `v-show` / `:class` で代替可能
- `pnpm add bootstrap` による npm 追加は、Vite でのツリーシェイクが効かない限りバンドルサイズを増やす

**検討した代替案**:
- `pnpm add bootstrap` — ビルド制御は良いが setup overhead
- Tailwind CSS — 既存コードに Tailwind がないため導入コストが高い
- 素の CSS — 時間コストが高い

---

### 2. `Masking` 型キャスト戦略

**決定**: sr-visualizer の `Masking` enum をインポートし `options.mask as Masking` でキャストする。
Constitution II により安全性の説明コメントを付与する。

**根拠**:
- `useRenderOptionsStore` がマスク値を `MASK_LIST` 定数から選ばせるため、
  実行時に無効な文字列が入ることはない（ストアが唯一の更新経路）
- `as unknown as Masking` より `as Masking` の方が読みやすい
  （TypeScript が `string → enum` キャストを許容しない場合に限り `as unknown as` を使用）

**検討した代替案**:
- Runtime validation 関数 — 20 値を網羅する型ガードを書くコストが高い割に既に安全
- `any` — Constitution II により禁止

---

### 3. `useRenderOptionsStore` の永続化

**決定**: `watch(renderOptions, ...)` で localStorage `vce3-render-options` に自動保存する。
既存 `useCubePersist` と同じパターン。スキーマバージョン: `1`。

**根拠**:
- Constitution VI 「アプリは自動保存しなければならない（MUST）」に準拠
- `useCubePersist` と同一パターンで実装コストが低い
- spec の前提条件に「既存の `useCubePersist` は変更しない」とあるため分離

**検討した代替案**:
- 永続化なし — Constitution VI 違反になるため却下
- IndexedDB — 非同期になり実装複雑度が上がる。今回のデータ量で不要

---

### 4. `view` フィールドの型

**決定**: `RenderOptions.view?: string`（型は文字列。ストア内は `'normal' | 'plan'`）

**根拠**:
- sr-visualizer の `ICubeOptions.view?: string` に合わせる
- ストアで union 型を使うことで UI の型安全を確保しつつ、レンダー型を拡張しやすくする

---

### 5. 画像サイズの扱い（正方形統一）

**決定**: width / height は常に同値。ストアに `imageSize: number` を一本化する。
`RenderOptions` 生成時に `width: imageSize, height: imageSize` を展開する。

**根拠**:
- Ver.2 が正方形のみをサポートしている
- spec の前提条件に「幅・高さ共通の正方形サイズとして扱う」と明記
- UI がシンプルになる

---

### 6. コンポーネント分割方針

**決定**: 機能単位で 1 ファイル 1 コンポーネント。計 6 個の新規コンポーネントを作成。

| ファイル | 責務 |
|----------|------|
| `ImageSizeControl.vue` | 画像サイズ（ステップボタン + スライダー） |
| `SpecialViewControl.vue` | Special View ラジオボタン |
| `StageMaskControl.vue` | Stage Mask ドロップダウン + Mask Alg |
| `ColorSchemeControl.vue` | 6 面カラーピッカー + 回転 + リセット |
| `ViewportRotationControl.vue` | 3 軸スライダー + 数値入力 + リセット |
| `AppearanceControl.vue` | 背景色/キューブ色/マスク色/不透明度/dist |

**根拠**:
- Constitution III: 各コンポーネントが独立テスト可能
- Constitution IV: @vue/test-utils で個別テストが書きやすい

---

### 7. 既存テストへの影響

**決定**: `CubeDisplay.test.ts` はレンダー層をモックしているため、
`useRenderOptionsStore` を暗黙的に使用するよう `CubeDisplay.vue` を変更しても影響なし。
`App.test.ts` の `select` 要素チェックは `SizeSelector` の select を残すことで通過。

**根拠**:
- `renderSVG` はモック済み → 引数変化を検知しない
- `SizeSelector` の select 要素は残す（+/- ボタン追加のみ）
