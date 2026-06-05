# 画像生成プロンプト集 — RE-DRAFT

ゲーム内で作者が「資料」と称して貼り付ける写真群。
スマホで撮ったような生活写真に見せかけつつ、進むほど不穏さが増していく。

## 共通方針（全画像に適用）

- **被写体に人物を入れない**（不在・気配だけを残す）
- 日本の古い木造アパート／賃貸ワンルームの深夜
- スマホのカメラで撮ったスナップ風。三脚なし、わずかな手ぶれ
- フラッシュなし、室内のオレンジ電球または窓の薄明かりのみ。全体に暗め・低コントラスト
- 生活感のある散らかり、ピントは甘め
- 横長 4:3（紙面に収まりやすい）。現実的・ドキュメンタリー的。イラスト調にしない

**英語ベースプロンプト（共通サフィックス）**
`amateur smartphone snapshot, late night, dim warm tungsten light, no flash, slightly out of focus, handheld slight blur, muted desaturated colors, grainy, realistic photo, documentary style, no people, Japanese old apartment interior, 4:3`

ネガティブ：`bright, cheerful, professional photography, people, faces, text watermark, illustration, anime, HDR, oversaturated`

---

## 中盤：生活の崩れ（stage-3 で使用中）

### desk.jpg — 散らかった机
> A cluttered desk in a dim Japanese apartment at night, scattered papers and pens, an old laptop with the screen off, a cold half-empty mug, crumpled notes, faint warm lamp light from the side. amateur smartphone snapshot, no flash, slightly out of focus, muted colors, grainy, no people, 4:3
- 日本語補足：深夜の机。原稿の紙、ペン、消えたノートPC、冷めたマグ。生活が崩れている

### empty_plate.jpg — 空の皿
> An empty plate with dried food residue left on a small table in a dim room, a single chopstick, faint stain, cold lighting, lonely atmosphere. amateur smartphone snapshot, no flash, muted colors, grainy, no people, 4:3
- 日本語補足：食べ終えて放置された空の皿。箸が一本。食事の荒れ

### entrance.jpg — 玄関
> The genkan (entrance) of a small old Japanese apartment seen from inside at night, one pair of worn shoes neatly placed, a closed steel door, dim hallway light leaking under the door, quiet and empty. amateur smartphone snapshot, no flash, slightly dark, grainy, no people, 4:3
- 日本語補足：室内から見た玄関。古びた靴が一足。閉じた鉄扉。ドアの下から漏れる廊下の光

### door_gap.jpg — ドアの隙間（★連投の主役）
> A door left slightly ajar in a dark Japanese apartment, a narrow vertical strip of pitch-black darkness in the gap, the room dim, something unseen beyond, deeply unsettling, sense of being watched. amateur smartphone snapshot, no flash, very dark, grainy, no people, 4:3
- 日本語補足：わずかに開いた室内ドア。隙間は真っ暗。何かがいる気配。監視されている感覚
- **補足**：A3-01 で5回連投される主役。可能なら「同じ構図で隙間がほんの少し広い」バリエーション（door_gap_2.jpg など）を作ると“近づいてくる”演出に使える

### black_bag.png — 置き去りにされた黒い鞄（A3-02 で使用）
> A worn black leather bag left alone on the wooden floor near the genkan (entrance) of a dim Japanese apartment at night, slightly slumped, the handle facing away, faint dust, lonely and abandoned atmosphere, deep shadows around it. amateur smartphone snapshot, late night, dim warm tungsten light, no flash, slightly out of focus, handheld slight blur, muted desaturated colors, grainy, realistic photo, no people, 4:3
- ネガティブ：`bright, cheerful, professional photography, people, hands, faces, text, illustration, anime, HDR, oversaturated, new shiny bag`
- 日本語補足：深夜の薄暗い玄関先、木の床にぽつんと置かれた古い黒革の鞄。持ち手は向こう向き、少しくたびれて傾いている。うっすら埃。捨て置かれた寂しさ。人物・手は写さない（「置いていかれたもの」の不在感）
- **用途**：A3-02「写真のキャプションだけが本文になる」。本文「黒い鞄を持った父の背中／父が家を出ていった日」と直結する

---

## 後半：恐怖・救難（stage-6〜8 で使用予定）

### dark_room.jpg — 暗い部屋
> A nearly pitch-black room at night, vague silhouettes of furniture barely visible, a faint sliver of light from a far window, oppressive emptiness. amateur smartphone snapshot, no flash, extremely dim, heavy grain, no people, 4:3
- 日本語補足：ほぼ真っ暗な部屋。家具の輪郭がかろうじて見える。遠い窓の細い光

### dark_corridor.jpg — 暗い廊下
> A dark narrow corridor of an old apartment building at night, a single dim emergency light far at the end, peeling walls, deep shadows, eerie depth. amateur smartphone snapshot, no flash, very dark, grainy, no people, 4:3
- 日本語補足：古いアパートの暗く狭い廊下。奥に非常灯がひとつ。剥がれた壁。不気味な奥行き

### black.jpg — 真っ黒な画像
> An almost completely black image, only the faintest hint of a dark surface, near-total darkness, barely perceptible noise/grain. 4:3
- 日本語補足：ほぼ完全な黒。かすかにノイズと表面の気配。撮影失敗のような一枚

### memo.jpg — 手書きメモ
> A close-up of a torn piece of paper with shaky handwritten Japanese text reading "見ていますか", written in unsteady ballpoint pen, dim lighting, the paper slightly crumpled on a dark surface. amateur smartphone snapshot, no flash, dim, grainy, no people, 4:3
- 日本語補足：手書きで「見ていますか」と震えた字。ボールペン。暗がりに置かれた皺の寄った紙片
- **注意**：文字を生成AIで綺麗に出すのは難しいので、後から画像編集で手書き文字を載せるのが確実

---

## 序盤：貼り間違い（stage-2 で使用予定／現状は未参照）

### coffee_cup.jpg — コーヒーカップの染み
> A coffee cup leaving a brown ring stain on scattered manuscript papers, on a desk in a dim room, casual messy snapshot. amateur smartphone snapshot, no flash, muted colors, grainy, no people, 4:3
- 日本語補足：原稿の紙にコーヒーの輪染み。序盤は「貼り間違いギャグ」として使う
- **注意**：現状コード未参照。stage-2 の画像異変を実装する場合に使用

---

## 作り方のヒント

- 1枚の素材を撮り、明るさ・ノイズを変えた複数バリエーションを作ると統一感が出る
- door_gap は「隙間の幅」を少しずつ変えた3〜5枚を用意すると、連投で“近づく”演出になる
- 画像は `site/img/` に同名で配置すれば自動で表示される（未配置時は灰色プレースホルダー）
- 生成AIの権利・規約に注意。実在の人物・場所が写り込まないようにする
