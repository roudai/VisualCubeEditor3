---
name: VisualCubeEditor3 技術選択
description: V3 の確定した技術スタックとスコープ（UI フレームワーク・描画ライブラリ・対象パズル）
type: project
---

以下の技術選択が確定済み（constitution v1.1.0 に反映）。

- **UI フレームワーク**: Vue 3.x（最新安定版）。React は使用しない。
- **描画ライブラリ**: srVisualizer（V2 と同じライブラリを継続使用）。Three.js/R3F は使用しない。
- **状態管理**: Pinia（Vue 公式）。Zustand は使用しない。
- **UI テスト**: @vue/test-utils + Vitest。React Testing Library は使用しない。
- **対象パズル**: NxN キューブ（2×2〜最低 7×7）のみ。メガミンクス・ピラミンクス等のカスタムパズルはスコープ外。

**Why:** ユーザーが明示的に指定。V2 との技術継続性（srVisualizer・Vue）と
NxN キューブへの集中がプロジェクト方針。

**How to apply:** spec・plan・tasks 生成時にこれらの技術スタックを前提とする。
カスタムパズル対応のタスクや設計を追加しないこと。
