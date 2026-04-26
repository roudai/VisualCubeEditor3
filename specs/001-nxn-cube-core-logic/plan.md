# 実装計画: NxN キューブ コアロジックレイヤー

**ブランチ**: `001-nxn-cube-core-logic` | **日付**: 2026-04-26 | **仕様**: [spec.md](spec.md)
**入力**: `specs/001-nxn-cube-core-logic/spec.md` のフィーチャー仕様

## 概要

NxN キューブ（N=2〜7）の状態管理・回転計算・手順解析・合法性検証・直列化を提供する
純粋 TypeScript のロジックレイヤーを実装する。DOM・Canvas・ブラウザ API に一切依存せず、
Node.js 単体で動作するヘッドレスモジュールとして設計する。

技術的アプローチ:
- `CubeState<N>` を `readonly` 2D 配列×6面で表現し、spread コピーによりイミュータブル性を保証
- 回転はサイクル置換アルゴリズムで実装し、外層〜内側スライスを `sliceIndex` パラメータで統一処理
- WCA 記法は正規表現トークナイザー + マッピングテーブルでパース
- エラーは例外でなく `Result<T, LogicError>` 型で返す（FR-009）

## 技術コンテキスト

**言語/バージョン**: TypeScript 5.x（strict: true）
**主要依存関係**: なし（ロジックレイヤーは外部依存ゼロ）
**ストレージ**: なし（直列化形式の定義のみ。ストレージ書き込みは UI レイヤーのアダプターが担当）
**テスト**: Vitest 3.x（カバレッジ: v8）
**対象プラットフォーム**: Node.js 20.x + モダンブラウザ（ES2022 ターゲット）
**プロジェクト種別**: 内部ライブラリ（ロジックレイヤー）
**パフォーマンス目標**: 1万手の N=7 回転処理を 1 秒以内（SC-003）
**制約**: DOM・Canvas・ブラウザ API インポート禁止（FR-008）
**規模/スコープ**: N=2〜7 の全サイズ対応。NxN スライス操作（2R、3U' 等）を含む

## Constitution Check

*ゲート: Phase 0 リサーチ開始前に確認。Phase 1 設計完了後に再確認。*

- [x] **I. 目的継承の原則** — このフィーチャーは描画や UI を変更しない。将来の V2→V3 移行において、このロジックレイヤーが画像生成機能（V2 の価値）を支える基盤となる
- [x] **II. TypeScript Strict Mode** — 全コードを `.ts` で記述。`any` 禁止。`Result` 型で型安全なエラー処理を実現
- [x] **III. レイヤードアーキテクチャ** — このフィーチャー自体がロジックレイヤー。DOM/Canvas インポートは一切持たない
- [x] **IV. Vitest によるテストファースト** — 全関数をテスト先行で実装。カバレッジゲート 90% を CI で強制
- [x] **V. NxN キューブ拡張性** — `CubeSize = 2 | 3 | 4 | 5 | 6 | 7` 型で全関数をパラメータ化。特定 N のハードコードなし
- [x] **VI. 作成状態の永続化** — `serialize`/`deserialize` をロジックレイヤーの純粋関数として実装。ストレージバックエンドはここに含まない（アダプターは UI レイヤーの責務）

| 違反内容 | 必要な理由 | 解決期限 |
|----------|------------|----------|
| （なし） | — | — |

## プロジェクト構造

### ドキュメント（このフィーチャー）

```text
specs/001-nxn-cube-core-logic/
├── spec.md          # フィーチャー仕様
├── plan.md          # このファイル
├── research.md      # 技術的決定の根拠
├── data-model.md    # 型定義・エンティティ設計
├── quickstart.md    # 動作確認手順
├── contracts/
│   └── public-api.md  # 公開 API コントラクト
└── checklists/
    └── requirements.md
```

### ソースコード（リポジトリルート）

```text
src/
├── logic/
│   ├── index.ts          # 公開 API の再エクスポート
│   ├── types.ts          # Color / Face / CubeSize / CubeState / Move 等の型定義
│   ├── result.ts         # Result<T,E> 型とヘルパー（ok / err）
│   ├── cube-state.ts     # createCube / getSticker
│   ├── rotation.ts       # applyMove / applySequence / invertSequence
│   ├── notation.ts       # parseNotation / moveToNotation
│   ├── validation.ts     # validateState
│   └── serialization.ts  # serialize / deserialize / SerializedCube

tests/
└── logic/
    ├── cube-state.test.ts
    ├── rotation.test.ts
    ├── notation.test.ts
    ├── validation.test.ts
    └── serialization.test.ts
```

**構造の決定**: 単一プロジェクト構造を採用。`src/logic/` 以下にロジックレイヤーを集約。
他レイヤー（`src/render/`、`src/ui/`）は別フィーチャーで追加する。

## 複雑性トラッキング

> Constitution Check に違反なし。このセクションは参考のみ。

| 違反内容 | 必要な理由 | より単純な代替案を却下した理由 |
|----------|------------|-------------------------------|
| （なし） | — | — |
