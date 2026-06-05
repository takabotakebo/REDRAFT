# WEBゲーム技術仕様書：流出原稿（仮）

## 1. 目的

本仕様書は、1ページ完結型WEBゲーム「流出原稿（仮）」を制作するための技術的な仕様をまとめたものである。

本作は、Googleドキュメント風の執筆画面上で、作者がリアルタイムに小説を書き進める様子を表示し、プレイヤーが異変を見つけたタイミングで「指摘する」ボタンを押すゲームである。

実在のGoogleドキュメントと連携する必要はない。  
あくまで、Googleドキュメント風の見た目と共同編集感を再現する。

---

## 2. 基本要件

- WEBページ1枚で完結する
- PCブラウザでのプレイを主対象とする
- スマートフォン対応は必須ではない
- 実在のGoogleアカウント、Google Docs API、リアルタイム通信は不要
- すべての進行はフロントエンド上の状態管理で完結してよい
- 文章はリアルタイムにタイピングされているように表示する
- プレイヤー操作は基本的に「指摘する」ボタンのみ
- ゲーム進行は8段階程度の章・区間で管理する
- 各段階が正常に完了すると「確定稿」として保存される
- 指摘時は最後の正常地点まで巻き戻る
- 異変放置時は異変が段階的にエスカレートする
- 最終エスカレート時は「助けてください」と表示して執筆を停止する

---

## 3. 画面構成

### 3.1 全体レイアウト

画面は以下の領域で構成する。

1. ヘッダー
2. ツールバー
3. ドキュメント本文エリア
4. コメント欄
5. 操作ボタン
6. ステータス表示

### 3.2 ヘッダー

表示要素：

- ドキュメントタイトル
- 保存状態表示
- 共有中を示すアイコンまたはテキスト
- 閲覧者数風の表示

例：

- 新作小説_第一稿
- 保存しています…
- すべての変更を保存しました
- 共有リンクで閲覧中
- 閲覧者 2

異変時には、この領域も変化対象とする。

例：

- 新作小説_見ないで
- 保存できません
- 閲覧者 7
- まだ見ていますか

### 3.3 ツールバー

Googleドキュメント風の見た目を出すための装飾領域。  
実際に機能する必要はない。

表示例：

- フォント名
- 文字サイズ
- 太字アイコン
- 斜体アイコン
- 下線アイコン
- 文字色アイコン
- 左揃え／中央揃え／右揃えアイコン

異変時には、ツールバーの表示が勝手に変わってもよい。

### 3.4 ドキュメント本文エリア

ゲームのメイン領域。  
本文がタイピング演出で追加される。

必要機能：

- 文字の逐次表示
- 段落追加
- 改行追加
- 一部テキストの削除
- 書式付きテキスト表示
- 画像挿入
- 表示位置の自動スクロール
- カーソル点滅
- 異変ごとのレイアウト変更

### 3.5 コメント欄

画面右側に表示する。  
プレイヤーが指摘した時、作者の返信やシステム的なコメントを表示する。

必要機能：

- コメントカードの追加
- 作者返信の追加
- 異変時にコメント欄だけ異常化する演出
- コメント欄の一時非表示／強調表示

コメント例：

```text
編集コメント：
ここ、少し確認してください。

作者：
すみません。直します。
```

### 3.6 操作ボタン

基本ボタン：

- 指摘する

補助ボタン：

- はじめから
- 音量ON/OFF
- 既読スキップ、または演出速度調整

補助ボタンは必須ではない。

### 3.7 ステータス表示

画面内に大きく出しすぎず、控えめに表示する。

表示候補：

- 確定稿：第3章まで
- 現在執筆中：第4章
- 保存済み
- 入力中…

内部的には進行度が分かるようにするが、ゲーム感が出すぎないようにする。

---

## 4. ゲーム状態管理

### 4.1 主要ステート

ゲーム全体は以下の状態を持つ。

```ts
type GameState = {
  currentStageIndex: number;
  currentSegmentIndex: number;
  checkpointStageIndex: number;
  checkpointContent: DocumentBlock[];
  liveContent: DocumentBlock[];
  isAnomalyActive: boolean;
  activeAnomalyId: string | null;
  anomalyEscalationLevel: number;
  isWriting: boolean;
  isStopped: boolean;
  commentLog: CommentItem[];
  authorStressLevel: number;
  playTime: number;
};
```

### 4.2 ステージ

小説の進行単位。  
8段階程度を想定する。

```ts
type Stage = {
  id: string;
  title: string;
  normalSegments: Segment[];
  anomalyPool: Anomaly[];
  clearCondition: ClearCondition;
};
```

### 4.3 セグメント

作者が一度に書く文章単位。  
1ステージ内に複数セグメントを持つ。

```ts
type Segment = {
  id: string;
  blocks: DocumentBlock[];
  typingSpeed?: number;
  pauseAfter?: number;
};
```

### 4.4 ドキュメントブロック

本文エリアに表示する最小単位。  
テキスト、画像、表、空白、UI演出などを表現する。

```ts
type DocumentBlock =
  | TextBlock
  | ImageBlock
  | TableBlock
  | SpacerBlock
  | SystemBlock;
```

```ts
type TextBlock = {
  type: 'text';
  id: string;
  text: string;
  style?: TextStyle;
};

type TextStyle = {
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'line-through' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: string;
  lineHeight?: string;
  marginLeft?: string;
  opacity?: number;
};
```

```ts
type ImageBlock = {
  type: 'image';
  id: string;
  src: string;
  alt?: string;
  caption?: string;
  repeatCount?: number;
  style?: ImageStyle;
};
```

```ts
type TableBlock = {
  type: 'table';
  id: string;
  rows: string[][];
};
```

```ts
type SpacerBlock = {
  type: 'spacer';
  id: string;
  height: number;
};
```

```ts
type SystemBlock = {
  type: 'system';
  id: string;
  message: string;
  variant: 'saving' | 'error' | 'cursor' | 'viewer' | 'glitch';
};
```

---

## 5. 異変データ構造

### 5.1 異変定義

```ts
type Anomaly = {
  id: string;
  name: string;
  stageIds: string[];
  category: AnomalyCategory;
  severity: 'low' | 'middle' | 'high' | 'final';
  triggerTiming: TriggerTiming;
  blocks: DocumentBlock[];
  escalationBlocks?: DocumentBlock[][];
  headerEffects?: HeaderEffect[];
  toolbarEffects?: ToolbarEffect[];
  commentEffects?: CommentItem[];
  stopAtFinalEscalation?: boolean;
};
```

### 5.2 異変カテゴリ

```ts
type AnomalyCategory =
  | 'text_intrusion'
  | 'repetition'
  | 'dream_logic'
  | 'format_change'
  | 'layout_break'
  | 'image_spam'
  | 'ui_interference'
  | 'comment_interference'
  | 'character_interference'
  | 'author_anger'
  | 'help_signal';
```

### 5.3 トリガータイミング

```ts
type TriggerTiming = {
  minSegmentIndex?: number;
  maxSegmentIndex?: number;
  probability: number;
  requiredStressLevel?: number;
};
```

### 5.4 エスカレーション

異変発生後、プレイヤーが指摘しない場合、一定時間または一定ブロック数ごとに `anomalyEscalationLevel` を上げる。

```text
Level 0：軽い違和感
Level 1：明確な異常
Level 2：作者の精神状態が漏れる
Level 3：救難または怒り
Level 4：助けてくださいで停止
```

最終段階では、執筆を停止する。

```ts
isWriting = false;
isStopped = true;
```

---

## 6. 指摘処理

### 6.1 指摘ボタン押下時

処理手順：

1. 現在のタイピングを停止
2. コメント欄に編集コメントを追加
3. 短い間を置く
4. 作者返信を追加
5. `liveContent` を最後の正常地点まで戻す
6. 異変状態を解除
7. `anomalyEscalationLevel` を0に戻す
8. 同じステージの未確定セグメントから再開する

### 6.2 巻き戻り地点

基本は以下。

```ts
liveContent = checkpointContent;
currentStageIndex = checkpointStageIndex + 1;
currentSegmentIndex = 0;
```

ただし、ステージ内で「最後の正常セグメント」を保持したい場合は、ステージ内チェックポイントを持たせてもよい。

```ts
type LocalCheckpoint = {
  stageIndex: number;
  segmentIndex: number;
  content: DocumentBlock[];
};
```

### 6.3 異変がない時の指摘

異変がない場合でも、処理は同じ。  
未確定部分が消え、最後の正常地点まで戻る。

ただし、作者返信は異変時と変えてよい。

例：

- え？ ここも違いましたか。
- ちゃんと書けていたと思ったんですが。
- すみません。もう一度書きます。

---

## 7. ステージクリア処理

### 7.1 正常完了

ステージ内の正常セグメントを最後まで書き終えた場合、そのステージを確定稿にする。

```ts
checkpointStageIndex = currentStageIndex;
checkpointContent = liveContent;
currentStageIndex += 1;
currentSegmentIndex = 0;
```

### 7.2 確定時演出

候補：

- 保存状態が「すべての変更を保存しました」になる
- 右側に「第3章まで確定稿にしました」と出る
- 作者が「ここまでは大丈夫そうです」と返信する
- 画面が一瞬落ち着く

---

## 8. タイピング演出

### 8.1 基本

テキストは一文字ずつ表示する。  
句読点や改行で少し間を置く。

```ts
type TypingConfig = {
  charInterval: number;
  commaPause: number;
  periodPause: number;
  lineBreakPause: number;
  blockPause: number;
};
```

### 8.2 状態別速度

- 正常時：一定速度
- 疲労時：少し遅い、一時停止が多い
- 焦り時：急に速い
- 反復呪詛時：異常に速い
- 救難時：途切れ途切れ

### 8.3 削除演出

異変によっては、書いた文字をBackspaceで消すように見せる。

必要機能：

- 末尾から文字を消す
- 一部ブロックを消す
- 消した文章を取り消し線で残す
- 消した文章がコメント欄に移動する

---

## 9. 視覚演出仕様

### 9.1 フォント変化

実装する書式：

- fontFamily
- fontSize
- color
- backgroundColor
- fontWeight
- fontStyle
- textDecoration
- textAlign
- opacity
- lineHeight
- marginLeft

### 9.2 レイアウト変化

異変例：

- 左揃えになる
- 右揃えになる
- 中央揃えになる
- 行間が広がる
- 余白が増える
- 段落インデントが増える
- 一文字ずつ改行される
- 表が挿入される
- チェックリストになる

### 9.3 画像連投

画像ブロックを連続挿入できるようにする。

画像素材例：

```text
/assets/images/dark_room.jpg
/assets/images/desk.jpg
/assets/images/window.jpg
/assets/images/door.jpg
/assets/images/curtain_gap.jpg
/assets/images/black.jpg
/assets/images/memo.jpg
```

同じ画像を複数回挿入する異変も許可する。

### 9.4 コメント欄異変

本文が正常でもコメント欄だけ異常にできるようにする。

例：

- コメント前に作者返信が出る
- 「すみません」が連続する
- コメント欄だけ赤文字になる
- 返信が右揃えになる
- コメント欄が一瞬消える

---

## 10. 音響仕様

音は必須ではないが、あると緊張感が出る。

候補：

- タイピング音
- Backspace音
- コメント追加音
- 保存完了音
- 通知音
- 低い環境音
- 異変時の薄いノイズ
- 画像貼付時の小さな効果音

音量ON/OFFは用意する。  
初期状態はミュートでもよい。

---

## 11. セーブ仕様

### 11.1 プレイ中セーブ

必須ではないが、ブラウザ更新で最初からになると負担が大きい場合は、LocalStorageに保存する。

保存対象：

```ts
type SaveData = {
  checkpointStageIndex: number;
  checkpointContent: DocumentBlock[];
  currentStageIndex: number;
  authorStressLevel: number;
  clearedAnomalyIds: string[];
};
```

### 11.2 リセット

「はじめから」ボタンでLocalStorageを削除し、初期状態に戻す。

---

## 12. データ管理方針

文章、異変、ステージ情報はコード内に直書きせず、JSONまたはTypeScriptのデータファイルとして分離する。

推奨ファイル構成例：

```text
/src/data/stages.ts
/src/data/anomalies.ts
/src/data/comments.ts
/src/data/assets.ts
```

または、JSONで管理する場合：

```text
/public/data/stages.json
/public/data/anomalies.json
/public/data/comments.json
```

制作時の修正しやすさを考えると、初期段階ではTypeScriptデータファイルで管理してよい。

---

## 13. 異変選出ロジック

### 13.1 基本

各ステージに異変プールを持たせる。  
ステージごとに異変の質を変える。

```ts
const candidateAnomalies = anomalies.filter(a =>
  a.stageIds.includes(currentStage.id) &&
  authorStressLevel >= (a.triggerTiming.requiredStressLevel ?? 0)
);
```

### 13.2 ランダム性

完全ランダムにすると調整が難しい。  
以下の方針がよい。

- 初回プレイでは、ある程度決まった異変を出す
- 2回目以降ややランダムにする
- 同じ異変が連続しないようにする
- 後半ほど重い異変が出る

### 13.3 異変発生判定

セグメント開始時に判定する。

```ts
if (!isAnomalyActive && Math.random() < stageAnomalyProbability) {
  startAnomaly(selectedAnomaly);
}
```

ただし、演出設計上、重要な異変は固定発生にしてよい。

---

## 14. クリア条件

8ステージすべてが確定稿になったらクリア。

クリア時演出：

1. 最後の文章が書き終わる
2. 保存状態が「すべての変更を保存しました」になる
3. コメント欄に作者の最後の返信が出る
4. 画面が静かになる
5. エンド表示

最後の返信案：

```text
あなたは、編集者ではありませんよね？
でも、助かりました。
```

---

## 15. ゲームオーバー仕様

本作では、基本的に即ゲームオーバーを設けない。  
異変を見逃した場合はエスカレートし、最終的に執筆停止する。

停止状態：

- 本文末尾に「助けてください」と表示
- カーソルだけ点滅
- タイピング停止
- 指摘ボタンは押せる

指摘後、正常地点まで戻る。

---

## 16. 実装上の注意

### 16.1 本物のGoogleドキュメントに似せすぎない

Googleのロゴや実UIをそのまま使用しない。  
あくまで「共同編集ドキュメント風」の独自UIにする。

### 16.2 読解負荷の調整

すべてを文章異変にすると疲れる。  
以下を混ぜる。

- 見た目で分かる異変
- 文章を読むと分かる異変
- UIの異変
- 画像の異変
- コメント欄の異変

### 16.3 文章量

一度に表示する本文が多すぎると、異変発見がつらくなる。  
1セグメントは短めにする。

目安：

- 正常セグメント：80〜200文字程度
- 異変セグメント：短いものは一瞬で分かる
- 夢文系は長すぎない

### 16.4 巻き戻りの分かりやすさ

指摘後、何が消えたのか分かるようにする。

演出候補：

- 未確定部分が薄くなる
- 文章が選択状態になる
- 削除される
- 確定稿地点までスクロールが戻る
- 作者返信が出る

### 16.5 ホラー表現のトーン

作者の精神状態を扱うが、直接的な自傷描写や具体的な危害方法には寄せない。  
「限界状態」「救難」「怒り」「被注察感」を中心に表現する。

---

## 17. 最小実装版の範囲

まず作るべき最小構成：

- 1ページUI
- Googleドキュメント風本文エリア
- タイピング表示
- 指摘ボタン
- 3ステージ分の進行
- 各ステージ3個の異変
- 巻き戻り処理
- 確定稿処理
- 「助けてください」で停止する処理

最小実装で手触りを確認してから、8ステージ・80異変へ拡張する。

---

## 18. 推奨ファイル構成例

```text
/src
  /components
    DocumentHeader.tsx
    DocumentToolbar.tsx
    DocumentView.tsx
    DocumentBlockRenderer.tsx
    CommentPanel.tsx
    ControlPanel.tsx
  /data
    stages.ts
    anomalies.ts
    comments.ts
  /hooks
    useTypingEngine.ts
    useGameState.ts
  /lib
    anomalySelector.ts
    rewind.ts
    saveData.ts
    typingQueue.ts
  /types
    game.ts
    document.ts
    anomaly.ts
  /styles
    document.css
    effects.css
```

---

## 19. 主要コンポーネント責務

### DocumentHeader

- タイトル表示
- 保存状態表示
- 閲覧者数表示
- ヘッダー異変の反映

### DocumentToolbar

- 装飾用ツールバー
- 書式異変の視覚反映

### DocumentView

- 本文表示
- 自動スクロール
- カーソル表示
- ブロック描画

### DocumentBlockRenderer

- TextBlock / ImageBlock / TableBlock / SpacerBlock / SystemBlock の描画

### CommentPanel

- 編集コメント表示
- 作者返信表示
- コメント欄異変の表示

### ControlPanel

- 指摘ボタン
- はじめからボタン
- 音量切替

### useTypingEngine

- タイピング進行
- 一時停止
- 削除演出
- ブロック追加

### useGameState

- ステージ進行
- 異変状態
- 巻き戻し
- 確定稿処理

---

## 20. 実装優先順位

1. ドキュメント風UIを作る
2. テキストをタイピング表示する
3. ステージ進行を作る
4. 指摘ボタンで巻き戻る
5. 確定稿を作る
6. 異変を1種類実装する
7. 異変放置でエスカレートさせる
8. 「助けてください」で停止させる
9. 書式異変を追加する
10. 画像異変を追加する
11. コメント欄異変を追加する
12. 8ステージ分のデータを入れる

---

## 21. 受け入れ条件

最低限、以下を満たせばゲームとして成立する。

- ページを開くと作者が文章を書き始める
- 文章はタイピングされているように見える
- 一定確率または固定タイミングで異変が起こる
- 異変を放置すると文章が悪化する
- 最終的に「助けてください」で止まる
- 指摘ボタンを押すと最後の正常地点まで戻る
- ステージを正常に完了すると確定稿になる
- 確定稿より前には戻らない
- 最終ステージまで確定するとクリアになる
