# 実装仕様書 — RE-DRAFT

---

## 1. 基本情報

| 項目 | 内容 |
|---|---|
| サイトタイトル（仮） | 流出原稿 |
| 作品フォルダ名 | `RE-DRAFT` |
| 表向きのWeb形式 | Googleドキュメント模倣UI・1ページ完結WEBゲーム |
| ページ数 | 2ページ（`intro.html` + `index.html`） |
| 公開形式 | 静的HTML（GitHub Pages等） |
| 対象端末 | PCブラウザ主対象。スマホ対応は必須ではないが崩れないようにする |
| フレームワーク | React + TypeScript（Vite推奨） |
| データ管理 | TypeScriptデータファイル（`src/data/`）で全テキスト・異変を管理 |
| セーブ | LocalStorage（任意実装。最小版では不要） |

---

## 2. ディレクトリ構成

```
projects/RE-DRAFT/site/
├── intro.html                  ← ARG入口（ブログ記事風・静的HTML）
├── index.html                  ← Reactアプリのエントリーポイント
├── css/
│   └── intro.css               ← intro.html 専用スタイル
├── js/                         ← Reactビルド成果物（dist）を配置
│   └── (bundle.js 等)
├── img/
│   ├── coffee_cup.jpg
│   ├── desk.jpg
│   ├── entrance.jpg
│   ├── curtain_gap.jpg
│   ├── dark_room.jpg
│   ├── dark_corridor.jpg
│   ├── door_gap.jpg
│   ├── black.jpg
│   └── memo.jpg
└── src/                        ← Reactソース（開発用）
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   ├── DocumentHeader.tsx
    │   ├── DocumentToolbar.tsx
    │   ├── DocumentView.tsx
    │   ├── DocumentBlockRenderer.tsx
    │   ├── CommentPanel.tsx
    │   └── ControlPanel.tsx
    ├── data/
    │   ├── stages.ts
    │   ├── anomalies.ts
    │   └── comments.ts
    ├── hooks/
    │   ├── useTypingEngine.ts
    │   └── useGameState.ts
    ├── lib/
    │   ├── anomalySelector.ts
    │   ├── rewind.ts
    │   ├── saveData.ts
    │   └── typingQueue.ts
    ├── types/
    │   ├── game.ts
    │   ├── document.ts
    │   └── anomaly.ts
    └── styles/
        ├── document.css
        └── effects.css
```

**`intro.html` はReactアプリではなく、単純な静的HTMLで実装する。**  
`index.html` はReactアプリのマウント先となる。

---

## 3. 共通UI仕様

### intro.html と index.html に共通するもの

- フォント：`Noto Sans JP`（Google Fonts）を読み込む
- 文字コード：`UTF-8`
- `<meta name="viewport" content="width=device-width, initial-scale=1">`

### intro.html 固有の共通UI

- スティッキーヘッダー（note風の白地・下線あり）
- 著者アイコン・著者名・投稿日表示
- 本文エリア：最大幅 `700px`・中央揃え

### index.html（ゲーム本体）の共通UI

**Googleドキュメントを模倣した独自UI。Googleの実ロゴ・実UIは使用しない。**

#### レイアウト全体

```
┌─────────────────────────────────────────────────┐
│ ヘッダー（タイトル・保存状態・共有・閲覧者数）     │
├─────────────────────────────────────────────────┤
│ ツールバー（装飾のみ・機能しない）                │
├──────────────────────────────────┬──────────────┤
│                                  │              │
│  ドキュメント本文エリア            │ コメント欄   │
│  （白い紙面・タイピング表示）       │ （右サイド）  │
│                                  │              │
├──────────────────────────────────┴──────────────┤
│ コントロールパネル（指摘ボタン・はじめから・音量）  │
└─────────────────────────────────────────────────┘
```

#### カラーパレット

| 用途 | 値 |
|---|---|
| ページ背景 | `#f0f4f9`（Googleドキュメントのグレー背景） |
| ヘッダー背景 | `#ffffff` |
| ツールバー背景 | `#f8f9fa` |
| 紙面（本文エリア） | `#ffffff` |
| 本文テキスト | `#202124` |
| Googleブルー（アクセント） | `#1a73e8` |
| コメント欄背景 | `#ffffff` |
| コメントカード枠 | `#e8eaed` |
| 保存状態テキスト | `#5f6368` |

#### ヘッダー仕様

```
[ドキュメントアイコン]  [タイトル]          [保存状態]  [共有リンクで閲覧中]  [閲覧者 1]
```

- **ドキュメントアイコン**：青系の正方形アイコン（独自デザイン。Googleアイコン不使用）
- **タイトル**：`id="doc-title"` で管理。JS から変更可能。
- **保存状態**：`id="save-status"` で管理。
- **共有リンクで閲覧中**：常時固定テキスト
- **閲覧者数**：常時「閲覧者 1」固定。変化しない。

#### ツールバー仕様（装飾のみ）

表示するアイコン・テキスト（左から順に）：

```
Noto Serif JP  ▾  |  11  ▾  |  B  I  U  ─  |  A▾  |  ≡  ≡  ≡  |  ☰  |  ⌂
```

- すべてクリックしても何も起きない（`pointer-events: none` または `cursor: default`）
- 異変時は一部の表示が変わる（後述）

#### 本文エリア仕様

- 白い紙面：幅 `816px`（A4横幅相当）・上下パディング `96px`・左右パディング `96px`
- フォント：`Noto Serif JP`・サイズ `11pt`（約 `14.67px`）・行間 `1.75`
- 本文は `id="document-body"` の `<div>` に `DocumentBlock` 単位でレンダリング
- 自動スクロール：新しいテキストが追加されたら下端が見えるようにスクロール
- カーソル：点滅するブロックカーソル（`|`）を末尾に表示

#### コメント欄仕様

- 右サイドに固定幅 `280px`
- 各コメントはカード形式
- カード構造：
  ```
  ┌──────────────────────┐
  │ 編集コメント          │
  │ [本文]               │
  │ [時刻 HH:mm]         │
  │ ─────────────────── │
  │ 作者：[返信テキスト]  │
  │ [時刻 HH:mm]         │
  └──────────────────────┘
  ```
- 時刻は `new Date()` で取得した現在時刻（`HH:mm` 24時間表記）
- 新しいコメントは下に追加し、スクロールして表示

#### コントロールパネル仕様

- 画面下部固定（`position: fixed; bottom: 0`）
- 背景：`#ffffff`・上辺ボーダー：`1px solid #e8eaed`
- ボタン配置：`[はじめから]` 左寄せ、`[指摘する]` 中央、`[🔇 音量OFF]` 右寄せ
- **指摘するボタン**：
  - 通常色：Googleブルー `#1a73e8`
  - テキスト色：白
  - ホバー：`#1557b0`
  - エンディング後：フェードアウトして非表示

---

## 4. ページ別仕様

---

### EXT-01：intro.html

| 項目 | 内容 |
|---|---|
| ファイル名 | `intro.html` |
| 役割 | ARGの入口。ブログ記事風。ゲーム本体へのリンクを含む。 |
| 到達方法 | SNS・口コミ・拡散。またはURL直接アクセス。 |

**掲載コンテンツ（本文）**：

```
著者：春名 柊（はるな しゅう）
投稿日：2026年5月某日

---

ちょっと変なものを見つけてしまった。

昨日、ネットを見ていたら、誰かがドキュメントのURLを貼っていた。
「これ何？」みたいな感じで。なんとなく開いてみたら——

誰かがリアルタイムで小説を書いていた。

最初は普通に読んでいたんだけど、途中から変な文章が混ざり始めた。
本文に急に「眠い」と書いてあったり、コーヒーカップの写真が貼り付けられていたり。

画面の右側に「指摘する」というボタンがあって、押してみたら文章が少し戻った。
それ以外に操作できるものはない。

自分にはよく分からなかったんだけど、気になる方がいたらどうぞ。

→ [共有ドキュメントのリンク]（index.htmlへのリンク）

---

追記：この記事を書いた後、少し眠れました。
```

**実装上の注意**：
- 「→ [共有ドキュメントのリンク]」は `<a href="index.html">` でリンクする
- 著者名はテキストのみ（ユーザーページへのリンクなし）
- 本物のnote・はてなブログのロゴは使用しない。雰囲気を模倣した独自CSSで実装する
- 最大幅 `700px`・背景 `#ffffff`・文字色 `#333`

---

### GAME-01：index.html

| 項目 | 内容 |
|---|---|
| ファイル名 | `index.html` |
| 役割 | ゲーム本体。Googleドキュメント模倣UI。 |
| 到達方法 | `intro.html` のリンク、またはURL直接アクセス。 |

**HTMLコメント仕込み（HIDDEN-02）**：

`<body>` タグの直後（Reactマウント要素より前）に以下を静的に埋め込む：

```html
<!--
  このドキュメントを開いたあなたへ。
  共有リンクはもう切ってあるはずでした。
  でも、あなたがいますね。

  指摘してください。お願いします。

  2026.05.??
-->
```

**OGP設定**：

```html
<meta property="og:title" content="新作小説_第一稿">
<meta property="og:description" content="共有リンクで閲覧中">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

---

## 5. キーワード仕様

本作は検索フォームを使用しない。キーワードは「ゲーム内で意味を持つテーマ語」として機能する。

| キーワード | 登場箇所 | 役割 |
|---|---|---|
| 切符 | ゲーム内小説全体 | テーマ語 |
| お母さんのところ | 段階8エンディング手前の本文 | 小説と作者の重なり |
| たぶん | 段階8ラスト・エンディング | 確信のない一歩 |
| 見ていますか | 段階3コメント欄異変 | 作者がプレイヤーを認識している最初のサイン |
| 助けてください | 段階8最終停止テキスト | 最も直接的な救難信号 |

**検索フォームは設置しない。**

---

## 6. 演出仕様

### 演出一覧

| 演出ID | 演出名 | 発火条件 | 実装 |
|---|---|---|---|
| VFX-01 | タイピング演出 | 常時（ゲーム開始〜停止まで） | `useTypingEngine` |
| VFX-02 | ヘッダータイトル変化 | 異変発生時・エンディング時 | `useGameState` → `doc-title` 書き換え |
| VFX-03 | 保存状態変化 | 異変発生時・段階確定時 | `save-status` 書き換え |
| VFX-04 | 閲覧者数（固定） | 常時 | 静的テキスト `閲覧者 1` |
| VFX-05 | コメント時刻（現在時刻） | コメント追加時 | `new Date()` → `HH:mm` |
| VFX-06 | 白文字テキスト | 段階4・異変A4-2 | CSS `.hidden-text` |
| VFX-07 | タイピング速度変化 | 段階・状態に応じて | `TypingConfig.charInterval` 変更 |
| VFX-08 | カーソル点滅停止 | 段階8最終停止時 | CSS animation 停止 |
| VFX-09 | エンディングシーケンス | 段階8正常完了後 | `endingSequence()` async関数 |
| VFX-10 | ボタン消失 | エンディング T=13 | フェードアウト → `display:none` |
| VFX-11 | 閲覧専用表示 | エンディング T=14 | ヘッダーに「閲覧専用」テキスト追加 |
| VFX-12 | HTMLコメント静的仕込み | ページロード時から常に | `<body>` 直後に静的記述 |
| VFX-14 | コメント欄一時消失 | 段階3・異変A3-3 | `display:none` → 3秒後 `display:block` |
| VFX-15 | コメント欄赤文字化 | 段階6の異変時 | `.comment-panel.danger` CSSクラス付与 |

### VFX-01：タイピング演出

**基本速度設定**（`TypingConfig`）：

```ts
const typingConfig: Record<StagePhase, TypingConfig> = {
  normal:   { charInterval: 60,  commaPause: 200, periodPause: 400, lineBreakPause: 300, blockPause: 500 },
  tired:    { charInterval: 90,  commaPause: 350, periodPause: 600, lineBreakPause: 500, blockPause: 800 },
  anxious:  { charInterval: 35,  commaPause: 80,  periodPause: 150, lineBreakPause: 100, blockPause: 200 },
  loop:     { charInterval: 20,  commaPause: 20,  periodPause: 20,  lineBreakPause: 20,  blockPause: 20  },
  distress: { charInterval: 120, commaPause: 500, periodPause: 800, lineBreakPause: 700, blockPause: 1000 },
};
```

| フェーズ | 段階 | 速度 |
|---|---|---|
| `normal` | 1〜2 | 標準 |
| `tired` | 3〜4 | 遅い・間が多い |
| `anxious` | 5〜6 | 速い |
| `loop` | 反復呪詛系異変 | 異常に速い |
| `distress` | 7〜8・救難時 | 途切れ途切れ |

### VFX-02：ヘッダータイトル変化

**正常時タイトル**：`新作小説_第一稿`

**異変時タイトル例**（`anomalies.ts` に定義）：

| タイミング | タイトル |
|---|---|
| 段階2・異変A2-4 | `新作小説_寝てない` |
| 段階3・異変A3-1 | `新作小説_見ないで`（1秒後に元に戻る） |
| エンディング T=7 | `完成稿` |
| エンディング T=10 | `次の原稿` |

### VFX-03：保存状態変化

| 状態 | テキスト |
|---|---|
| 通常タイピング中 | `入力中…` |
| 段落間の短い間 | `保存しています…` |
| 段階確定後 | `すべての変更を保存しました` |
| 異変中 | `保存できません` |
| 最終停止時 | `保存できません` |
| エンディング T=2 | `すべての変更を保存しました` |

### VFX-06：白文字テキスト

段階4・異変A4-2の `DocumentBlock` として以下を追加：

```ts
{
  type: 'text',
  id: 'hidden-stage4',
  text: '静かなのは嘘だ',
  style: { color: 'transparent' },
  className: 'hidden-text',
}
```

CSS：

```css
.hidden-text {
  color: transparent;
  user-select: text;
  cursor: text;
}
/* aria-hidden は付けない（選択で読めることがギミックのため） */
```

### VFX-07：ツールバーの異変

異変時にツールバーの一部表示を変化させる（機能はしない）：

| 異変 | ツールバー変化 |
|---|---|
| 段階4・中央揃え異変 | 中央揃えアイコンが選択状態に見える（`active` クラス） |
| 段階4・取り消し線異変 | 取り消し線アイコンが選択状態に見える |
| 段階5〜6 | フォント名が `Noto Serif JP` → 空白（不明）に変わる |

### VFX-08：カーソル点滅・停止

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: #202124;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
  margin-left: 1px;
}

.cursor.stopped {
  animation: none;
  opacity: 1; /* 点滅せず常時表示 */
}
```

`isStopped === true` のとき `.cursor` に `.stopped` クラスを付与する。

### VFX-09：エンディングシーケンス

```ts
async function endingSequence() {
  await wait(2000);  // T=2: 保存状態「すべての変更を保存しました」
  setSaveStatus('すべての変更を保存しました');

  await wait(2000);  // T=4: コメント欄に最後の返信フェードイン
  addFinalComment();

  await wait(3000);  // T=7: タイトル「完成稿」
  setDocTitle('完成稿');

  await wait(3000);  // T=10: タイトル「次の原稿」
  setDocTitle('次の原稿');

  await wait(2000);  // T=12: タイピング音消える
  stopAudio();

  await wait(1000);  // T=13: ボタン群フェードアウト
  fadeOutControls();

  await wait(1000);  // T=14: 閲覧専用表示
  setReadOnly();

  await wait(1000);  // T=15: Xシェアボタンフェードイン
  showShareButton();
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**最後の作者コメント（`addFinalComment` で追加）**：

```
あなたは、編集者ではありませんよね。
でも、助かりました。
```

### Xシェアボタン仕様

- エンディング T=15 でフェードイン（`opacity: 0` → `opacity: 1`、0.5秒）
- テキスト：`指摘し続けました。原稿は完成しましたか？ #REDRAFT`
- リンク：`https://twitter.com/intent/tweet?text=...&url=intro.htmlのフルURL`
- スタイル：Googleブルー `#1a73e8`・白テキスト・角丸 `4px`

---

## 7. 画像・素材仕様

| ファイル名 | 配置パス | 使用段階 | 使用異変 | alt テキスト | 必須/任意 |
|---|---|---|---|---|---|
| `coffee_cup.jpg` | `img/coffee_cup.jpg` | 段階2 | A2-2 | `コーヒーカップの染み` | 必須 |
| `desk.jpg` | `img/desk.jpg` | 段階2〜4 | 中盤画像異変 | `机の上` | 必須 |
| `entrance.jpg` | `img/entrance.jpg` | 段階3〜4 | 中盤画像異変 | `玄関` | 必須 |
| `curtain_gap.jpg` | `img/curtain_gap.jpg` | 段階3〜5 | 中盤画像異変 | `カーテンの隙間` | 必須 |
| `dark_room.jpg` | `img/dark_room.jpg` | 段階6〜8 | A6-3・A6-4 | `暗い部屋` | 必須 |
| `dark_corridor.jpg` | `img/dark_corridor.jpg` | 段階7〜8 | 後半画像異変 | `暗い廊下` | 任意 |
| `door_gap.jpg` | `img/door_gap.jpg` | 段階7〜8 | 後半画像異変 | `ドアの隙間` | 任意 |
| `black.jpg` | `img/black.jpg` | 段階7〜8 | 後半画像異変 | `（空白）` | 必須 |
| `memo.jpg` | `img/memo.jpg` | 段階8 | A8系画像異変 | `手書きのメモ` | 必須 |

**画像がない場合の代替表示**：

`ImageBlock` の描画時、`src` が 404 または未設定の場合は灰色のプレースホルダーを表示する。

```css
.image-placeholder {
  width: 100%;
  max-width: 480px;
  height: 200px;
  background: #e8eaed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa0a6;
  font-size: 13px;
}
```

---

## 8. 実装上の注意

### Google UIの模倣について

- Googleのロゴ・ブランドカラー（厳密な配色）・実際のアイコン素材は使用しない
- 「それらしく見える独自UI」として実装する
- ツールバーのアイコンはテキスト記号（`B` `I` `U` `≡` 等）またはSVGアイコンで代替する

### フレームワーク・ビルドについて

- React + TypeScript（Vite）を使用する
- ビルド成果物（`dist/`）を `site/js/` 相当のパスに配置して `index.html` から参照する
- 開発時は `npm run dev`、公開時は `npm run build`

### パスの指定

- `intro.html` からゲーム本体へのリンク：`<a href="index.html">`（同ディレクトリ）
- 画像パス（HTMLから）：`img/ファイル名.jpg`
- 画像パス（CSSから参照する場合）：`../img/ファイル名.jpg`

### データファイルの管理

- `src/data/stages.ts`：8ステージの正常セグメント定義
- `src/data/anomalies.ts`：全異変定義（`scenario.md` の異変テキスト群を実装）
- `src/data/comments.ts`：編集コメント文・作者返信文の定義

`scenario.md` の「5. ページ別本文」が全データの設計図。このファイルを参照して各 `.ts` に変換する。

### LocalStorage（セーブ）

最小実装版では不要。8ステージすべてを一気にプレイする想定。  
実装する場合は `src/lib/saveData.ts` に以下の型でまとめる：

```ts
type SaveData = {
  checkpointStageIndex: number;
  checkpointContent: DocumentBlock[];
  currentStageIndex: number;
  authorStressLevel: number;
  clearedAnomalyIds: string[];
};
```

### HTMLコメント（HIDDEN-02）

`public/index.html`（Viteの静的ファイル）の `<body>` 直後に手動で埋め込む。  
Reactのレンダリング対象外の位置に置くことでビルド後も保持される。

### スマホ表示

PCブラウザ主対象だが、最低限以下を守る：

- `meta viewport` を設定する
- 本文エリアの幅は `min(816px, 100%)` で指定し、スマホでは横スクロールが出ないようにする
- コントロールパネルはスマホでもタップできるサイズ（`min-height: 60px`）を確保する

### セキュリティ・表現上の注意

- 本物のGoogleサービス・実在の会社・個人をARG素材として使用しない
- 直接的な自傷描写・具体的な危害方法の記述は行わない
- 病名・診断の明示はしない（作者の状態は原稿の崩れで表現する）

---

## 9. 実装担当への作業指示

### 優先順位（最小実装版から順番に進める）

```
Step 1: Googleドキュメント風UIの静的レイアウト作成
  → DocumentHeader / DocumentToolbar / DocumentView / CommentPanel / ControlPanel

Step 2: タイピングエンジンの実装
  → useTypingEngine：文字逐次表示・速度制御・削除演出

Step 3: ステージ進行の実装（3ステージ分のデータから始める）
  → useGameState：ステージ管理・セグメント進行・確定稿処理

Step 4: 指摘ボタンで巻き戻る処理
  → rewind.ts：checkpointContent への戻り処理

Step 5: 異変を1種類実装する（A1-3：本文が箇条書きになる）
  → DocumentBlockRenderer で TextBlock の書式を反映

Step 6: 異変放置でエスカレートする処理
  → anomalySelector.ts：escalationLevel 管理

Step 7: 「助けてください」で停止する処理
  → isStopped フラグ・カーソル停止演出

Step 8: 8ステージ分のデータを scenario.md から入力する

Step 9: 残りの異変を追加する（書式系・画像系・コメント欄異変）

Step 10: エンディングシーケンス（VFX-09）を実装する

Step 11: intro.html を実装する

Step 12: HTMLコメント（HIDDEN-02）を埋め込む

Step 13: 白文字テキスト（VFX-06）を実装する

Step 14: Xシェアボタンを実装する
```

### 最小実装版の受け入れ条件

以下をすべて満たせば最小実装版として成立する：

- [ ] ページを開くと作者が文章を書き始める
- [ ] 文章はタイピングされているように見える
- [ ] 一定タイミングで異変が起こる（最低1種類）
- [ ] 異変を放置すると文章が悪化する
- [ ] 最終的に「助けてください」で止まる
- [ ] 指摘ボタンを押すと最後の正常地点まで戻る
- [ ] ステージを正常に完了すると確定稿になる
- [ ] 確定稿より前には戻らない
- [ ] 最終ステージまで確定するとエンディングになる
- [ ] UIがGoogleドキュメント風に見える

### scenario.md との対応

`scenario.md` の「5. ページ別本文」が全データの設計図。

- 正常セグメント群 → `src/data/stages.ts` の `normalSegments`
- 異変テキスト群 → `src/data/anomalies.ts` の `Anomaly.blocks`
- 編集コメント文 → `src/data/comments.ts`
- 作者返信文 → `src/data/comments.ts`（`authorReply` フィールド）

---

## 次に実行するコマンド

```
/implement
```
