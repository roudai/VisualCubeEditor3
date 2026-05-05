# 実装計画: Ver.2 相当フル UI オプション

**ブランチ**: `004-full-ui-options` | **日付**: 2026-05-03 | **仕様**: [spec.md](spec.md)
**入力**: `specs/004-full-ui-options/spec.md` のフィーチャー仕様

## 概要

現在の UI（Move ボタン + サイズ選択のみ）に Ver.2 相当のビジュアライズ設定を追加する。
`RenderOptions` 型を拡張し、`useRenderOptionsStore`（Pinia）で全設定を一元管理する。
sr-visualizer がすでに持つ機能（mask, view, cubeColor 等）を UI から操作可能にする。
レイアウトを Bootstrap 5 による二列構成（左: キューブ固定表示、右: 設定パネル）に刷新する。

## 技術コンテキスト

**言語/バージョン**: TypeScript 6.x（strict: true）
**主要依存関係**: Vue 3.5.x, sr-visualizer ^1.0.13, Pinia 3.x, Bootstrap 5.3（CDN）
**ストレージ**: localStorage（既存 `vce3-cube-state` + 新規 `vce3-render-options`）
**テスト**: Vitest 4.x, @vue/test-utils 2.x
**対象プラットフォーム**: モダンブラウザ（Chrome/Firefox/Safari 最新版）
**プロジェクト種別**: Web アプリ（Vue SPA）
**パフォーマンス目標**: 設定変更から 100ms 以内にキューブ表示更新
**制約**: ランタイム依存追加なし（Bootstrap は CSS のみ、CDN 経由）
**規模/スコープ**: UI レイヤー + 描画レイヤー型拡張。ロジックレイヤーは変更しない。

## Constitution Check

*ゲート: Phase 0 リサーチ開始前に確認必須。Phase 1 設計完了後に再確認。*

- [x] **I. 目的継承の原則** — Ver.2 のビジュアライズ機能を Ver.3 で再現する実装。
  V2 のユーザー価値（最小手順で高品質キューブ画像生成）を直接強化する。
- [x] **II. TypeScript Strict Mode** — 全新規コードは strict TypeScript で記述。
  `adapter.ts` での `as Masking` キャストは安全性コメント付きで許容（複雑性トラッキング参照）。
- [x] **III. レイヤードアーキテクチャ** — 変更範囲は描画レイヤー（型拡張・アダプタ）と
  UI レイヤー（ストア・コンポーネント）のみ。ロジックレイヤーは一切変更しない。
- [x] **IV. Vitest によるテストファースト** — `useRenderOptionsStore` と全新規コンポーネントに
  Vitest テストを同時作成する。既存テストは全件パスを維持。
- [x] **V. NxN キューブ拡張性** — 新規コードにキューブサイズのハードコードなし。
  ビジュアライズオプションはサイズ非依存。
- [x] **VI. 作成状態の永続化** — `useRenderOptionsStore` が localStorage への自動保存と
  復元を実装する（`vce3-render-options` キー、スキーマバージョン 1）。

| 違反内容 | 必要な理由 | 解決期限 |
|----------|------------|----------|
| `adapter.ts` での `options.mask as Masking` 型アサーション | sr-visualizer の `mask` フィールドが `Masking` 列挙体を要求するが、TypeScript はstring → enum の直接割り当てを許容しない。ストアが MASK_LIST 定数から値をセットするため実行時安全 | 次の sr-visualizer アップデート時に型ガードへ移行を検討 |

## プロジェクト構造

### ドキュメント（このフィーチャー）

```text
specs/004-full-ui-options/
├── plan.md          # このファイル
├── spec.md          # フィーチャー仕様
├── research.md      # Phase 0 出力（決定事項まとめ）
├── data-model.md    # Phase 1 出力（エンティティ定義）
├── quickstart.md    # Phase 1 出力（実装手順）
├── contracts/
│   ├── render-options-api.ts      # RenderOptions 拡張コントラクト
│   └── render-options-store-api.ts # useRenderOptionsStore コントラクト
└── tasks.md         # Phase 2 出力（/speckit-tasks コマンドで生成）
```

### ソースコード（変更・追加ファイル）

```text
src/
├── render/
│   ├── types.ts                      # [変更] RenderOptions に新規フィールド追加
│   └── sr-visualizer/
│       └── adapter.ts                # [変更] 新規オプションを cubeSVG() に渡す
├── stores/
│   └── renderOptions.ts              # [新規] useRenderOptionsStore
├── components/
│   ├── CubeDisplay.vue               # [変更] useRenderOptionsStore を使用
│   ├── SizeSelector.vue              # [変更] +/- ボタン追加
│   ├── ImageSizeControl.vue          # [新規]
│   ├── SpecialViewControl.vue        # [新規]
│   ├── StageMaskControl.vue          # [新規]
│   ├── ColorSchemeControl.vue        # [新規]
│   ├── ViewportRotationControl.vue   # [新規]
│   └── AppearanceControl.vue         # [新規]
└── App.vue                           # [変更] Bootstrap 二列レイアウト

index.html                            # [変更] Bootstrap 5 CDN リンク追加
package.json                          # [変更] "dev": "vite" スクリプト追加

tests/
├── stores/
│   └── renderOptions.test.ts         # [新規]
└── components/
    ├── ImageSizeControl.test.ts      # [新規]
    ├── SpecialViewControl.test.ts    # [新規]
    ├── StageMaskControl.test.ts      # [新規]
    ├── ColorSchemeControl.test.ts    # [新規]
    ├── ViewportRotationControl.test.ts # [新規]
    └── AppearanceControl.test.ts     # [新規]
```

**構造の決定**: 単一プロジェクト構成を維持。既存 `src/` 以下に追記する形で実装。

## 実装設計

### 描画レイヤー拡張

#### `src/render/types.ts`
`RenderOptions` インターフェースに 9 フィールドを追加（全て省略可能）:

```typescript
readonly view?: string           // 'plan' で上面投影図
readonly mask?: string           // ステージマスク値
readonly maskAlg?: string        // マスク向き調整
readonly cubeColor?: string      // キューブ輪郭色
readonly maskColor?: string      // マスク色
readonly cubeOpacity?: number    // 0〜100
readonly stickerOpacity?: number // 0〜100
readonly dist?: number           // 1〜100
readonly arrows?: string         // アロー定義文字列
```

#### `src/render/sr-visualizer/adapter.ts`
`cubeSVG()` 呼び出しに新規フィールドを条件付きスプレッドで追加:

```typescript
import { cubeSVG, Axis, Masking } from 'sr-visualizer'

// ... 既存処理 ...

cubeSVG(container as unknown as HTMLElement, {
  cubeSize: state.size,
  stickerColors,
  width,
  height,
  ...(backgroundColor !== undefined && { backgroundColor }),
  ...(viewportRotations !== undefined && { viewportRotations }),
  ...(options?.view && { view: options.view }),
  // sr-visualizer が Masking 列挙体を要求するが、ストアが MASK_LIST から
  // 値をセットするため実行時安全。Constitution II 準拠コメント。
  ...(options?.mask && { mask: options.mask as Masking }),
  ...(options?.maskAlg && { maskAlg: options.maskAlg }),
  ...(options?.cubeColor !== undefined && { cubeColor: options.cubeColor }),
  ...(options?.maskColor !== undefined && { maskColor: options.maskColor }),
  ...(options?.cubeOpacity !== undefined && { cubeOpacity: options.cubeOpacity }),
  ...(options?.stickerOpacity !== undefined && { stickerOpacity: options.stickerOpacity }),
  ...(options?.dist !== undefined && { dist: options.dist }),
  ...(options?.arrows && { arrows: options.arrows }),
})
```

### `useRenderOptionsStore` 設計

```typescript
// src/stores/renderOptions.ts
export const useRenderOptionsStore = defineStore('renderOptions', () => {
  const imageSize = ref(128)
  const view = ref<'normal' | 'plan'>('normal')
  const mask = ref('')
  const maskAlg = ref('')
  const colorScheme = ref<Record<0|1|2|3|4|5, string>>({ ...DEFAULT_COLOR_SCHEME })
  const backgroundColor = ref('#ffffff')
  const cubeColor = ref('#000000')
  const maskColor = ref('#404040')
  const cubeOpacity = ref(100)
  const stickerOpacity = ref(100)
  const dist = ref(5)
  const viewportRotations = ref<[ViewAxis, number][]>([
    ['y', 45], ['x', -34], ['z', 0],
  ])
  const arrows = ref('')

  const renderOptions = computed((): RenderOptions => ({
    width: imageSize.value,
    height: imageSize.value,
    colorScheme: colorScheme.value,
    backgroundColor: backgroundColor.value,
    cubeColor: cubeColor.value,
    maskColor: maskColor.value,
    cubeOpacity: cubeOpacity.value,
    stickerOpacity: stickerOpacity.value,
    dist: dist.value,
    viewportRotations: viewportRotations.value,
    ...(view.value === 'plan' && { view: 'plan' }),
    ...(mask.value && { mask: mask.value }),
    ...(mask.value && maskAlg.value && { maskAlg: maskAlg.value }),
    ...(arrows.value && { arrows: arrows.value }),
  }))

  function cycleFaceColors(
    a: 0|1|2|3|4|5, b: 0|1|2|3|4|5,
    c: 0|1|2|3|4|5, d: 0|1|2|3|4|5,
  ): void {
    const s = { ...colorScheme.value }
    const [ca, cb, cc, cd] = [s[a], s[b], s[c], s[d]]
    s[a] = cb; s[b] = cc; s[c] = cd; s[d] = ca
    colorScheme.value = s
  }

  function resetColorScheme(): void { colorScheme.value = { ...DEFAULT_COLOR_SCHEME } }
  function rotateX(): void { cycleFaceColors(0, 5, 3, 2) }
  function rotateY(): void { cycleFaceColors(2, 1, 5, 4) }
  function rotateZ(): void { cycleFaceColors(0, 4, 3, 1) }

  // localStorage 永続化（Constitution VI 準拠）
  // ... watch + onMounted で restore/save

  return {
    imageSize, view, mask, maskAlg, colorScheme,
    backgroundColor, cubeColor, maskColor, cubeOpacity,
    stickerOpacity, dist, viewportRotations, arrows,
    renderOptions,
    resetColorScheme, rotateX, rotateY, rotateZ,
  }
})
```

### App.vue レイアウト

Bootstrap 5 の grid を使用した二列レイアウト:

```
┌─ navbar ─────────────────────────────────────────┐
│ Visual Cube Editor 3                             │
├──────────────────────┬───────────────────────────┤
│  [sticky]            │  [scrollable]             │
│                      │  ┌─ パズル設定 ────────┐  │
│  CubeDisplay         │  │ SizeSelector        │  │
│  (SVG)               │  └─────────────────────┘  │
│                      │  ┌─ アルゴリズム ──────┐  │
│  ImageSizeControl    │  │ MoveInput           │  │
│                      │  └─────────────────────┘  │
│                      │  ┌─ ビジュアライズ ────┐  │
│                      │  │ SpecialViewControl  │  │
│                      │  │ StageMaskControl    │  │
│                      │  └─────────────────────┘  │
│                      │  ┌─ カラースキーム ────┐  │
│                      │  │ ColorSchemeControl  │  │
│                      │  └─────────────────────┘  │
│                      │  ┌─ ビューポート回転 ──┐  │
│                      │  │ ViewportRotation    │  │
│                      │  └─────────────────────┘  │
│                      │  ┌─ 外観 ──────────────┐  │
│                      │  │ AppearanceControl   │  │
│                      │  └─────────────────────┘  │
└──────────────────────┴───────────────────────────┘
```

## テスト戦略

### 既存テスト（変更なし・全件パス維持）

| テストファイル | 影響 | 対応 |
|--------------|------|------|
| `tests/App.test.ts` | `select` 要素チェックあり | `SizeSelector` の select を維持 |
| `tests/components/CubeDisplay.test.ts` | `renderSVG` モック済み | 追加引数は検知されない |
| `tests/components/SizeSelector.test.ts` | select 操作テスト | ボタン追加のみ、select 動作不変 |
| `tests/render/render-options.test.ts` | RenderOptions 型変更 | 後方互換（既存フィールド変更なし） |

### 新規テスト

#### `tests/stores/renderOptions.test.ts`
```
- デフォルト値の確認（imageSize=128, view='normal', etc.）
- rotateX/Y/Z の色循環ロジック検証
- resetColorScheme で WCA 標準色に戻る
- renderOptions computed の出力検証
  - view='plan' のとき { view: 'plan' } が含まれる
  - view='normal' のとき view フィールドが含まれない
  - mask='' のとき mask フィールドが含まれない
  - mask='oll' のとき { mask: 'oll' } が含まれる
- localStorage 保存・復元の動作
```

#### 新規コンポーネントテスト（各コンポーネント）
```
- ストアの値が UI に正しく反映されている
- UI 操作でストアが更新される
- リセットボタンで初期値に戻る
```

## 複雑性トラッキング

| 違反内容 | 必要な理由 | より単純な代替案を却下した理由 |
|----------|------------|-------------------------------|
| `adapter.ts` での `options.mask as Masking` 型アサーション | TypeScript が `string → Masking enum` の直接代入を禁止するため | 型ガード（20値の列挙）は実装コストが高く、ストアの MASK_LIST による制約で実行時安全が既に保証されている |
