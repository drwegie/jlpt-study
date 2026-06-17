# JLPT Study — プロジェクト前提

## ゴール（最優先・ぶらさない）
- **最終ゴールはユーザーのJLPT N2合格。** ゲーム化・報酬要素はそのための手段であり、目的ではない。
- すべての施策は実際のN2習得に寄与すること（例: Meteor Modeの正誤は既存SM-2に反映）。
- 滞在時間稼ぎだけの見せかけ要素は入れない。コンテンツの厳密さとSRSの整合を保つ。

## デプロイ
- **GitHub Pages で公開している静的サイト**（リポジトリ: `drwegie/jlpt-study`、ブランチ: `main`）。
- サーバーサイドは無い。バックエンド・DB・APIサーバーは使えない。
- すべての状態は **クライアントサイド（localStorage）** に保存する前提で実装する。
- 外部依存は避け、原則 `index.html` 単一ファイルで完結させる（ビルド工程なし）。

## アーキテクチャ
- `index.html` 1ファイルに HTML + CSS + Vanilla JS を内包。フレームワーク・ビルドツールなし。
- 学習データは `DATA` オブジェクト（N5〜N2 × vocab/grammar/hiragana/kanji）。
- 間隔反復は SM-2 アルゴリズム。進捗は localStorage キー `jlpt-sr-v1` に保存。
- **UIは全画面の Meteor Mode 単一**（Infinite Japanese風の落下ゲーム）。旧 Language/Reading/Listening は撤去済み。
  - **複数隕石の同時落下（ウェーブ制）**: 上部プロンプトに正解の意味(英語)を表示し、2〜4個の日本語(jp+kana)隕石がレーン/速度をずらして同時落下。意味が一致する隕石をタップ。
  - 正解タップ=爆発+パーティクル+加点(SM-2 q2/3)、誤タップ/正解隕石が着地=正解を緑表示しコンボ0+画面フラッシュ&シェイク(SM-2 q0)。ダミー隕石の着地は無害。
  - 1ウェーブ=1ターゲット語、1ラウンド=最大 `ROUND`(=10) ウェーブ。正誤は `update(id,q)` で SM-2 に直結。
  - 主要関数: `nextWave`/`mLoop`(全隕石を1ループで落下)/`meteorTap`/`resolveWave`/`missTarget`/`burst`(粒子)/`comboPop`。隕石は `#m-sky` に動的生成、`clearWave` で除去。
  - レベル(N5-N2)・カテゴリは開始画面で選択。プレイ中は `body.playing` でヘッダー等を隠し全画面化。
  - ゲーム状態(ベストスコア・★・サウンド設定)は localStorage キー `jlpt-game-v1`（`jlpt-sr-v1` とは分離）。
  - 音声は Web Speech API（ターゲット語の読み上げ＝ヒント、🔊で再生）+ WebAudioの軽いblip。サウンドはトグルで永続化。

## 開発上の注意
- 機能追加時も「単一HTMLで完結・外部依存なし・localStorage永続化」を崩さない。
- localStorage のスキーマを変えるときはキーをバージョニングするか移行処理を入れる。
