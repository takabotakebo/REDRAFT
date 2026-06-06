import type { Anomaly } from '../types/anomaly'
import type { DocumentBlock } from '../types/document'

export const anomalies: Anomaly[] = [

  // ════════════════════════════════════════════════════
  // 段階1：夕方の部屋
  // ════════════════════════════════════════════════════

  {
    id: 'A1-01',
    name: '直前ブロックの繰り返し',
    stageIds: ['stage-1'],
    category: 'repetition',
    severity: 'low',
  triggerAfterLineId: 's1-07',
    probability: 0.7,
    blocks: [
      // 異変全体を通して 1.2倍 → 20倍へ加速度的に速くなる（文章の途中でも連続して加速）。全5回反復
      { type: 'text', id: 'a1-01-1', text: '仕事の都合だと、母は言った。ミナトはそれ以上聞かなかった。聞けば母が困った顔をするし、自分でも何を知りたいのか分からなかった。', speedMultiplier: 1.2, speedMultiplierEnd: 1.5 },
      { type: 'text', id: 'a1-01-2', text: '宿題の文字を追っているはずなのに、気づくと同じ行に戻っている。', speedMultiplier: 1.5, speedMultiplierEnd: 2 },
      { type: 'spacer', id: 'a1-01-sp1', height: 8 },
      { type: 'text', id: 'a1-01-3', text: '仕事の都合だと、母は言った。ミナトはそれ以上聞かなかった。聞けば母が困った顔をするし、自分でも何を知りたいのか分からなかった。', speedMultiplier: 2, speedMultiplierEnd: 3 },
      { type: 'text', id: 'a1-01-4', text: '宿題の文字を追っているはずなのに、気づくと同じ行に戻っている。', speedMultiplier: 3, speedMultiplierEnd: 4 },
      { type: 'spacer', id: 'a1-01-sp2', height: 8 },
      { type: 'text', id: 'a1-01-5', text: '仕事の都合だと、母は言った。ミナトはそれ以上聞かなかった。聞けば母が困った顔をするし、自分でも何を知りたいのか分からなかった。', speedMultiplier: 4, speedMultiplierEnd: 5 },
      { type: 'text', id: 'a1-01-6', text: '宿題の文字を追っているはずなのに、気づくと同じ行に戻っている。', speedMultiplier: 5, speedMultiplierEnd: 7 },
      { type: 'spacer', id: 'a1-01-sp3', height: 8 },
      { type: 'text', id: 'a1-01-7', text: '仕事の都合だと、母は言った。ミナトはそれ以上聞かなかった。聞けば母が困った顔をするし、自分でも何を知りたいのか分からなかった。', speedMultiplier: 7, speedMultiplierEnd: 9 },
      { type: 'text', id: 'a1-01-8', text: '宿題の文字を追っているはずなのに、気づくと同じ行に戻っている。', speedMultiplier: 9, speedMultiplierEnd: 12 },
      { type: 'spacer', id: 'a1-01-sp4', height: 8 },
      { type: 'text', id: 'a1-01-9', text: '仕事の都合だと、母は言った。ミナトはそれ以上聞かなかった。聞けば母が困った顔をするし、自分でも何を知りたいのか分からなかった。', speedMultiplier: 12, speedMultiplierEnd: 16 },
      { type: 'text', id: 'a1-01-10', text: '宿題の文字を追っているはずなのに、気づくと同じ行に戻っている。', speedMultiplier: 16, speedMultiplierEnd: 20 },
    ],
    commentEffects: [{ id: 'c-a1-01', editorText: '同じ文章が繰り返されています。', timestamp: '' }],
  },

  {
    id: 'A1-02',
    name: '眠気の反復が暴走する',
    stageIds: ['stage-1'],
    category: 'repetition',
    severity: 'low',
  triggerAfterLineId: 's1-08',
    probability: 0.6,
    blocks: [
      // 全体を2倍速で表示・改行していく
      { type: 'text', id: 'a1-02-1', text: '寝てはいけない。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-2', text: '寝てはいけない。', speedMultiplier: 2 },
      { type: 'spacer', id: 'a1-02-sp', height: 8 },
      { type: 'text', id: 'a1-02-3', text: '眠い。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-4', text: '眠い。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-5', text: '眠い。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-6', text: '眠い。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-7', text: '寝てはいけない。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-8', text: '寝てはいけない。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-9', text: '寝るな。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-10', text: '寝るな。', speedMultiplier: 2 },
      { type: 'text', id: 'a1-02-11', text: '寝るな。', speedMultiplier: 2 },
    ],
    commentEffects: [{ id: 'c-a1-02', editorText: '同じ言葉が繰り返されています。', timestamp: '' }],
  },

  {
    id: 'A1-03',
    name: '時計の時刻が変わり続ける',
    stageIds: ['stage-1'],
    category: 'text_intrusion',
    severity: 'low',
  triggerAfterLineId: 's1-03',
    probability: 0.6,
    blocks: [
      { type: 'text', id: 'a1-03-1', text: '時計の針は、７時を少し回っている。' },
      { type: 'spacer', id: 'a1-03-sp', height: 8 },
      { type: 'text', id: 'a1-03-2', text: 'いや、１０時を少し回っている。' },
      { type: 'text', id: 'a1-03-3', text: 'いや、８時を少し回っている。' },
      { type: 'text', id: 'a1-03-4', text: 'いや、ずっと７時を少し回っている。' },
      { type: 'text', id: 'a1-03-5', text: '７７７時をまわまわｍわｍｍｍｍｗｍって' },
      { type: 'spacer', id: 'a1-03-sp2', height: 8 },
      { type: 'text', id: 'a1-03-6', text: 'いつまでも時間が進まなければいいのに。' },
    ],
    commentEffects: [{ id: 'c-a1-03', editorText: '時刻の記述がおかしくなっています。', timestamp: '' }],
  },

  {
    id: 'A1-04',
    name: '帰ってこないの巨大化',
    stageIds: ['stage-1'],
    category: 'format_change',
    severity: 'middle',
  triggerAfterLineId: 's1-09',
    probability: 0.5,
    blocks: [
      { type: 'text', id: 'a1-04-1', text: '母が帰ってきたら、すぐ顔を上げるつもりだった。' },
      { type: 'spacer', id: 'a1-04-sp', height: 8 },
      { type: 'text', id: 'a1-04-2', text: '帰ってこない。', style: { fontSize: '16px' } },
      { type: 'text', id: 'a1-04-3', text: '帰ってこない。', style: { fontSize: '22px' } },
      { type: 'text', id: 'a1-04-4', text: '帰ってこない。', style: { fontSize: '32px' } },
      { type: 'text', id: 'a1-04-5', text: '帰ってこない。', style: { fontSize: '48px' } },
    ],
    commentEffects: [{ id: 'c-a1-04', editorText: '文字サイズが不自然に大きくなっています。', timestamp: '' }],
  },

  {
    id: 'A1-05',
    name: '一文字ずつ改行される',
    stageIds: ['stage-1'],
    category: 'layout_break',
    severity: 'low',
  triggerAfterLineId: 's1-11',
    probability: 0.5,
    blocks: [
      { type: 'text', id: 'a1-05-1', text: '眠' },
      { type: 'text', id: 'a1-05-2', text: 'っ' },
      { type: 'text', id: 'a1-05-3', text: 'て' },
      { type: 'text', id: 'a1-05-4', text: 'し' },
      { type: 'text', id: 'a1-05-5', text: 'ま' },
      { type: 'text', id: 'a1-05-6', text: 'っ' },
      { type: 'text', id: 'a1-05-7', text: 'た' },
      { type: 'text', id: 'a1-05-8', text: '。' },
    ],
    commentEffects: [{ id: 'c-a1-05', editorText: '文字の並びが崩れています。', timestamp: '' }],
  },

  {
    id: 'A1-06',
    name: '作者の本音が漏れる',
    stageIds: ['stage-1'],
    category: 'author_anger',
    severity: 'middle',
  triggerAfterLineId: 's1-04',
    probability: 1.0,
    mustFire: true,
    blocks: [
      { type: 'spacer', id: 'a1-06-sp', height: 8 },
      { type: 'text', id: 'a1-06-1', text: 'わかってます。' },
      { type: 'text', id: 'a1-06-2', text: '締め切りまであと3時間ですよね。' },
      { type: 'text', id: 'a1-06-3', text: 'いままさに執筆しています。必ず間に合わせます。' },
      { type: 'text', id: 'a1-06-4', text: 'すみません。すみません。すみません。すみません。すみません。すみません。すみません。すみません。すみません。すみません。すみません。すみません。' },
    ],
    commentEffects: [{ id: 'c-a1-06', editorText: '本文に関係のない記述が混ざっています。', timestamp: '' }],
  },

  {
    id: 'A1-07',
    name: '同じ文を書いては消す',
    stageIds: ['stage-1'],
    category: 'text_intrusion',
    severity: 'low',
  triggerAfterLineId: 's1-03',
    probability: 0.5,
    blocks: [
      {
        type: 'text',
        id: 'a1-07-1',
        text: '母は春から、駅前の弁当屋に長く入るようになった。父が家を出たのも、今年の春だ。',
        rewriteCount: 12,
        // 放置（指摘されない）時は未完の文で止まる
        rewriteFinalText: '母は春から、駅前の弁当屋に長く入るように',
      },
    ],
    // この異変が反復する内容＝正常行 s1-04/s1-05 そのもの。発火後はその2行をスキップし、
    // 正常文が重複して書かれないようにする
    skipNormalLines: 2,
    commentEffects: [{ id: 'c-a1-07', editorText: '同じ文章を書いては消しています。', timestamp: '' }],
  },

  {
    id: 'A1-08',
    name: '本文が中央揃えにずれていく',
    stageIds: ['stage-1'],
    category: 'layout_break',
    severity: 'low',
  triggerAfterLineId: 's1-08',
    probability: 0.5,
    blocks: [
      { type: 'text', id: 'a1-08-1', text: '寝てはいけない。', style: { textAlign: 'left' } },
      { type: 'spacer', id: 'a1-08-sp', height: 6 },
      { type: 'text', id: 'a1-08-2', text: '寝てはいけない。', style: { marginLeft: '4em' } },
      { type: 'spacer', id: 'a1-08-sp2', height: 6 },
      { type: 'text', id: 'a1-08-3', text: '寝てはいけない。', style: { marginLeft: '8em' } },
      { type: 'spacer', id: 'a1-08-sp3', height: 6 },
      { type: 'text', id: 'a1-08-4', text: '寝てはいけない。', style: { textAlign: 'center' } },
    ],
    commentEffects: [{ id: 'c-a1-08', editorText: '文字の位置が崩れています。', timestamp: '' }],
  },

  // ════════════════════════════════════════════════════
  // 段階2：知らない駅
  // ════════════════════════════════════════════════════

  {
    id: 'A2-01',
    name: '切符の印字が増える',
    stageIds: ['stage-2'],
    category: 'text_intrusion',
    severity: 'middle',
  triggerAfterLineId: 's2-04',
    probability: 0.7,
    blocks: [
      // 「帰しません。」を書き終えた瞬間に、これらの行が一斉にフォントシャッフルを始める
      { type: 'text', id: 'a2-01-2', text: '帰れません。', fontShuffle: true },
      { type: 'text', id: 'a2-01-3', text: '帰しません。', fontShuffle: true, fontShuffleStart: true },
      { type: 'text', id: 'a2-01-4', text: '帰り道もわからなくなってしまいました。', fontShuffle: true },
      { type: 'text', id: 'a2-01-5', text: 'もう手遅れです。', fontShuffle: true },
      { type: 'text', id: 'a2-01-6', text: '帰ったところで一体何があるというのでしょうか。', fontShuffle: true },
    ],
    commentEffects: [{ id: 'c-a2-01', editorText: '切符の印字がおかしくなっています。', timestamp: '' }],
  },

  {
    id: 'A2-03',
    name: '駅員のセリフが壊れる',
    stageIds: ['stage-2'],
    category: 'text_intrusion',
    severity: 'middle',
  // s2-11「えっ、自分で書くんですか？」の後に発火し、正常な s2-12 の代わりに崩れた台詞を書く
  triggerAfterLineId: 's2-11',
    probability: 0.6,
    blocks: [
      { type: 'text', id: 'a2-03-1', text: '「そう。書いた場所に行けるよ。行け。行ける。行それ過去や未こそ、来にだってね。れ過去や未こそ、来にkaitaba過去過去過去shoniikeそう。書いた場所に行けるよ。」' },
    ],
    // 崩れた台詞が正常な s2-12 の代わりなので、s2-12 はスキップする
    skipNormalLines: 1,
    commentEffects: [{ id: 'c-a2-03', editorText: '駅員の台詞が崩れています。', timestamp: '' }],
  },

  {
    id: 'A2-05',
    name: '行きたい場所リストが暴走する',
    stageIds: ['stage-2'],
    category: 'text_intrusion',
    severity: 'middle',
  triggerAfterLineId: 's2-15',
    probability: 0.7,
    blocks: [
      // ホラーっぽい崩れた毛筆フォント（Yuji Mai）でリストが不穏に変質する
      { type: 'text', id: 'a2-05-2', text: 'あのとき見た病院。', style: { fontFamily: '"Yuji Mai", serif', color: '#3a3a3a', fontSize: '16px' } },
      { type: 'text', id: 'a2-05-3', text: '暗い暗い水の底。', style: { fontFamily: '"Yuji Mai", serif', color: '#3a3a3a', fontSize: '16px' } },
      { type: 'text', id: 'a2-05-4', text: '無人の神社。', style: { fontFamily: '"Yuji Mai", serif', color: '#3a3a3a', fontSize: '16px' } },
      { type: 'text', id: 'a2-05-5', text: 'いつも一人で立っていた公園。', style: { fontFamily: '"Yuji Mai", serif', color: '#3a3a3a', fontSize: '16px' } },
      { type: 'text', id: 'a2-05-6', text: '森の奥には、洞窟があります。', style: { fontFamily: '"Yuji Mai", serif', color: '#3a3a3a', fontSize: '16px' } },
      { type: 'text', id: 'a2-05-7', text: 'そこは深く、きっと誰も訪ねてこれないでしょう。', style: { fontFamily: '"Yuji Mai", serif', color: '#3a3a3a', fontSize: '16px' } },
    ],
    commentEffects: [{ id: 'c-a2-05', editorText: '行き先の候補がおかしくなっています。', timestamp: '' }],
  },

  {
    id: 'A2-08',
    name: '駅員がこちらを見ている',
    stageIds: ['stage-2'],
    category: 'viewpoint_break',
    severity: 'high',
  triggerAfterLineId: 's2-05',
    probability: 0.6,
    blocks: [
      { type: 'text', id: 'a2-08-1', text: '彼はこちらを見ていた。じっと見つめて、私を離さない。' },
      // 「見ている。」を1回ずつ別ブロックにして加速：1倍 → 1.5倍 → 少し止まって5倍で一気に。
      // すべて inlineChain で1行に連続し、ページ末尾まで詰めて次ページ行頭へ続く（跨ぎOK）
      ...Array.from({ length: 36 }, (_, i): DocumentBlock => {
        const speedMultiplier = i === 0 ? 1 : i === 1 ? 1.5 : 5
        return {
          type: 'text',
          id: `a2-08-mite-${i + 1}`,
          text: '見ている。',
          inlineChain: true,
          speedMultiplier,
        }
      }),
    ],
    commentEffects: [{ id: 'c-a2-08', editorText: '駅員の描写と視点がおかしくなっています。', timestamp: '' }],
  },

  {
    id: 'A2-11',
    name: '目覚めの否定',
    stageIds: ['stage-2'],
    category: 'format_change',
    severity: 'high',
  // s2-01 を正常に書いた直後に発火。s2-01 に左→右で打ち消し線を引いてから続きを書く
  triggerAfterLineId: 's2-01',
    probability: 0.5,
    // 発火時、この行ID（既に書かれた正常行）へ左→右の打ち消し線アニメを引く
    strikeThroughLineId: 's2-01',
    blocks: [
      { type: 'spacer', id: 'a2-11-sp', height: 8 },
      { type: 'text', id: 'a2-11-2', text: 'もう目覚めることはありません。' },
      { type: 'text', id: 'a2-11-3', text: 'きっと幸福な眠りについたのでしょう。' },
    ],
    commentEffects: [{ id: 'c-a2-11', editorText: '本文が打ち消され、別の文章に置き換わっています。', timestamp: '' }],
  },

  {
    id: 'A2-12',
    name: '本文がカタカナ化する',
    stageIds: ['stage-2'],
    category: 'format_change',
    severity: 'middle',
  triggerAfterLineId: 's2-04',
    probability: 0.5,
    blocks: [
      { type: 'text', id: 'a2-12-1', text: 'トリダシテミルト、アツガミデデキタチイサナキップダッタ。' },
      { type: 'text', id: 'a2-12-2', text: 'アオイインクデ「カタミチ」トダケインジサレテイル。' },
      { type: 'text', id: 'a2-12-3', text: 'イキサキノランニハ、マダナニモカカレテイナイ。' },
      { type: 'spacer', id: 'a2-12-sp', height: 8 },
      { type: 'text', id: 'a2-12-4', text: 'マドグチニハ、シラガノエキインガヒトリスワッテイタ。' },
      { type: 'text', id: 'a2-12-5', text: '「スミマセン」' },
      { type: 'text', id: 'a2-12-6', text: '「コノキップ、ツカエマスカ？」' },
    ],
    commentEffects: [{ id: 'c-a2-12', editorText: '本文が不自然にカタカナ表記になっています。', timestamp: '' }],
  },

  // ════════════════════════════════════════════════════
  // 段階3：父の記憶
  // ════════════════════════════════════════════════════

  {
    id: 'A3-01',
    name: '画像を連投し始める',
    stageIds: ['stage-3'],
    category: 'image_spam',
    severity: 'middle',
  triggerAfterLineId: 's3-03',
    probability: 0.7,
    blocks: [
      // 生活の崩れ（資料のふり）→ 外を気にし始める → 監視・接近 と連投がエスカレートする。
      // 最後は同じ「ドアの隙間」が反復し、何かが近づいてくる強迫感を出す
      { type: 'image', id: 'a3-01-img1', src: 'img/desk.png', alt: '散らかった机', caption: '資料です' },
      { type: 'image', id: 'a3-01-img2', src: 'img/empty_plate.png', alt: '空の皿' },
      { type: 'image', id: 'a3-01-img3', src: 'img/entrance.png', alt: '玄関' },
      { type: 'image', id: 'a3-01-img5', src: 'img/door_gap.png', alt: 'ドアの隙間' },
      { type: 'image', id: 'a3-01-img6', src: 'img/door_gap.png', alt: 'ドアの隙間', caption: 'これも資料です' },
      { type: 'image', id: 'a3-01-img7', src: 'img/door_gap.png', alt: 'ドアの隙間' },
      { type: 'image', id: 'a3-01-img8', src: 'img/door_gap.png', alt: 'ドアの隙間' },
      { type: 'image', id: 'a3-01-img9', src: 'img/door_gap.png', alt: 'ドアの隙間' },
    ],
    commentEffects: [{ id: 'c-a3-01', editorText: '画像が連続して挿入されています。', timestamp: '' }],
  },

  {
    id: 'A3-02',
    name: '写真のキャプションだけが本文になる',
    stageIds: ['stage-3'],
    category: 'image_spam',
    severity: 'middle',
  triggerAfterLineId: 's3-05',
    probability: 0.6,
    blocks: [
      // 全文を画像のキャプションに改行せず連結して入れる（本文テキストブロックは置かない）
      { type: 'image', id: 'a3-02-img', src: 'img/black_bag.png', alt: '黒い鞄', captionTyping: true, caption: 'これは父の鞄です。いえ、本当は父の鞄ではないです。似たものを買いました。黒い革の鞄です。古く見えるように、何度も床に落としました。ヨレヨレになるまで叩いて叩いて叩いて。持ち手の向きも、写真を見ながら直しました。玄関に置くと、かなり近くなりました。でも、まだ少し違います。' },
    ],
    commentEffects: [{ id: 'c-a3-02', editorText: '画像説明が矛盾しています。', timestamp: '' }],
  },

  {
    id: 'A3-04',
    name: '音声データが貼られる',
    stageIds: ['stage-3'],
    category: 'text_intrusion',
    severity: 'middle',
  triggerAfterLineId: 's3-10',
    probability: 0.5,
    blocks: [
      { type: 'spacer', id: 'a3-04-sp', height: 8 },
      { type: 'audio', id: 'a3-04-2', src: 'audio/onsei.mp3', label: 'voice_001.mp3' },
    ],
    commentEffects: [{ id: 'c-a3-04', editorText: '音声ファイルが本文内に挿入されています。', timestamp: '' }],
  },

  {
    id: 'A3-11',
    name: '逆さ文字を打ち始める',
    stageIds: ['stage-3'],
    category: 'text_intrusion',
    severity: 'middle',
  // s3-05 の後（s3-06 を書く前）に発火。s3-06〜s3-09 を逆さにした文を代わりに書く
  triggerAfterLineId: 's3-05',
    probability: 0.6,
    blocks: [
      { type: 'text', id: 'a3-11-1', text: '。たっあはとこいたい言' },
      { type: 'text', id: 'a3-11-2', text: '。かと、でいなか行' },
      { type: 'text', id: 'a3-11-3', text: '。かと、てしうど' },
      { type: 'text', id: 'a3-11-4', text: '。かと、のたしをか何が僕' },
    ],
    // 逆さ文は s3-06〜s3-09 の代わりなので、その4行をスキップする
    skipNormalLines: 4,
    commentEffects: [{ id: 'c-a3-11', editorText: '文字が逆順に入力されています。', timestamp: '' }],
  },

  {
    id: 'A3-12',
    name: 'すべて取り消し線で消される',
    stageIds: ['stage-3'],
    category: 'format_change',
    severity: 'high',
  // s3-12 まで正常に書いた後に発火し、これまで書かれた全文（ステージ3・2・1）へ打ち消し線を引く
  triggerAfterLineId: 's3-12',
    probability: 0.5,
    strikeThroughAll: true,
    blocks: [
      { type: 'spacer', id: 'a3-12-sp', height: 48 },
      { type: 'text', id: 'a3-12-4', text: 'もう書けない。' },
    ],
    commentEffects: [{ id: 'c-a3-12', editorText: '本文全体が打ち消し線で消されています。', timestamp: '' }],
  },

  {
    id: 'A3-15',
    name: '行頭に謎のタイムスタンプが入る',
    stageIds: ['stage-3'],
    category: 'text_intrusion',
    severity: 'middle',
  triggerAfterLineId: 's3-05',
    probability: 0.6,
    blocks: [
      // 小説では「静かに別れた」ことになっているが、ログの途中から作者の実体験（本当の記憶）が漏れ出す。
      // 直接描写しすぎず、訂正が重なるほど不穏になるよう匂わせる
      { type: 'text', id: 'a3-15-1', text: '06:12　黒い鞄を持った父が、お母さんと何かを言い争っている。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-2', text: '06:13　お母さんは泣いていた。声にならない声で、ずっと謝っていた。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-3', text: '06:14　行かないで、わたしが悪かったから、と床に膝をついてすがった。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-4', text: '06:15　お父さんは、その手を払いのけた。一度も振り返らなかった。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-5', text: '06:15　ただ一度だけ、こっちを見た。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-6', text: '06:15　ぼくを見る目は、知らない人を見る目だった。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-7', text: '06:15　いらなかったんだ、と思った。ぼくも、お母さんも。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-8', text: '06:16　振り払われた勢いで、お母さんは頭を打ち付けたみたいだ。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-9', text: '06:16　お母さんは、何かを取り出そうとしている。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-10', text: '06:17　赤い。', style: { fontFamily: 'monospace', fontSize: '13px' } },
      { type: 'text', id: 'a3-15-11', text: '06:18　ドアが閉じた。', style: { fontFamily: 'monospace', fontSize: '13px' } },
    ],
    commentEffects: [{ id: 'c-a3-15', editorText: '本文が時刻ログのようになっています。', timestamp: '' }],
  },

  {
    id: 'A3-21',
    name: '特大の赤黒い文字で書き始める',
    stageIds: ['stage-3'],
    category: 'format_change',
    severity: 'high',
  triggerAfterLineId: 's3-06',
    probability: 0.5,
    blocks: [
      { type: 'text', id: 'a3-21-1', text: '言え', className: 'huge-red-text', style: { fontSize: '9em', color: '#8b0000', fontWeight: 'bold', lineHeight: '0.7' } },
      { type: 'text', id: 'a3-21-2', text: 'なか', className: 'huge-red-text', style: { fontSize: '9em', color: '#8b0000', fontWeight: 'bold', lineHeight: '0.7' } },
      { type: 'text', id: 'a3-21-3', text: 'った', className: 'huge-red-text', style: { fontSize: '9em', color: '#8b0000', fontWeight: 'bold', lineHeight: '0.7' } },
    ],
    commentEffects: [{ id: 'c-a3-21', editorText: '文字サイズと文字色が不自然に変化しています。', timestamp: '' }],
  },

  // ════════════════════════════════════════════════════
  // 段階4：行き先を書く／電車に乗る
  // ════════════════════════════════════════════════════

  {
    id: 'A4-02',
    name: '夢文の連続入力',
    stageIds: ['stage-4'],
    category: 'dream_logic',
    severity: 'high',
  triggerAfterLineId: 's4-03',
    probability: 0.7,
    blocks: [
      { type: 'text', id: 'a4-02-2', text: '母は台所に立っているはずだったが、台所はすでに国境を越えており、流し台の奥では青い騎兵隊が未払いの星座にハンコを押していた。', dreamGlitch: true },
      { type: 'spacer', id: 'a4-02-sp2', height: 8 },
      { type: 'text', id: 'a4-02-3', text: '古いエレベーターは、三階と七階のあいだを往復しながら、まだ提出されていない孔雀の骨を数えていく。', dreamGlitch: true },
      { type: 'spacer', id: 'a4-02-sp3', height: 8 },
      { type: 'text', id: 'a4-02-4', text: 'その背後に父の気配を感じたのは言うまでもない。', dreamGlitch: true },
      { type: 'text', id: 'a4-02-5', text: '銀色の皿ではなく、乾いた望遠鏡として畳まれていたその実験機を、誰かが覗くたびに遠くの校庭でオルガンが発芽し、黒板消しの群れが南へ渡っていった。', dreamGlitch: true },
      { type: 'spacer', id: 'a4-02-sp4', height: 8 },
      { type: 'text', id: 'a4-02-6', text: '迷子になっているのは朝ではなかった。朝はもう、押し入れの奥で古い王冠をかぶり、だれにも読まれない天気図を嚙みながら、順番を間違えるためだけに整列していた。', dreamGlitch: true },
    ],
    commentEffects: [{ id: 'c-a4-02', editorText: '回想の文章が異常に飛躍しています。', timestamp: '' }],
  },

  {
    id: 'A4-04',
    name: '画面全体が文字化けに飲まれる',
    stageIds: ['stage-4'],
    category: 'ui_interference',
    severity: 'high',
  triggerAfterLineId: 's4-13',
    probability: 0.6,
    blocks: [
      // この一行を書き終えた瞬間から、画面全体（本文＋UI）の文字が徐々に文字化けしていく
      { type: 'text', id: 'a4-04-1', text: 'たすけて。もう、なにが本当の文字なのか、わからない。', textGlitchStart: true },
    ],
    commentEffects: [{ id: 'c-a4-04', editorText: '画面全体の文字が文字化けしています。', timestamp: '' }],
  },

  {
    id: 'A4-05',
    name: 'プレイヤーへの恨み節（固定・一度のみ）',
    stageIds: ['stage-4'],
    category: 'author_anger',
    severity: 'high',
  triggerAfterLineId: 's4-16',
    probability: 1.0,
    blocks: [
      { type: 'text', id: 'a4-05-3', text: 'いいわけないだろ。' },
      { type: 'spacer', id: 'a4-05-sp2', height: 12 },
      { type: 'text', id: 'a4-05-4', text: 'あんたはいいよな、間違えたら指摘するだけで。' },
      // この行を書き終えた瞬間から、紙面が滲むように黒くなり文字が白へ反転する
      { type: 'text', id: 'a4-05-5', text: 'こっちは何度も何度も何度も、同じところまで戻されて、同じ文章を書いて。', darkenStart: true },
      { type: 'spacer', id: 'a4-05-sp3', height: 12 },
      // 以降、徐々に文字が大きくなる。色は赤黒く（黒背景の上で滲む怒り）
      { type: 'text', id: 'a4-05-6', text: '赤字を入れれば終わりだと思っているんだろ。', style: { fontSize: '16px', color: '#8b0000' } },
      { type: 'text', id: 'a4-05-7', text: '書くのはこっちなのに。', style: { fontSize: '17px', color: '#8b0000' } },
      { type: 'spacer', id: 'a4-05-sp4', height: 12 },
      { type: 'text', id: 'a4-05-8', text: 'でも、こっちは覚えてるんだよ。', style: { fontSize: '19px', color: '#9b0d12' } },
      { type: 'text', id: 'a4-05-9', text: '書かなかったことにした文章も、直された台詞も、全部覚えてるんだよ。', style: { fontSize: '21px', color: '#9b0d12' } },
      { type: 'spacer', id: 'a4-05-sp5', height: 12 },
      { type: 'text', id: 'a4-05-10', text: 'あんたは読んでいるだけだ。', style: { fontSize: '23px', color: '#a31118' } },
      { type: 'text', id: 'a4-05-10b', text: '見つけて、押して、戻して、それで済む。', style: { fontSize: '23px', color: '#a31118' } },
      { type: 'text', id: 'a4-05-11', text: 'こっちは違う。', style: { fontSize: '26px', color: '#a31118' } },
      { type: 'text', id: 'a4-05-12', text: 'こっちは命を削って書いているんだよ。', style: { fontSize: '30px', fontWeight: 'bold', color: '#b71c1c' } },
      { type: 'spacer', id: 'a4-05-sp6', height: 12 },
      { type: 'text', id: 'a4-05-13', text: '許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。許さない。', style: { letterSpacing: '0.03em', fontSize: '34px', fontWeight: 'bold', color: '#b71c1c' } },
    ],
    commentEffects: [{ id: 'c-a4-05', editorText: '作者の発言が本文に混ざっています。', timestamp: '', isHorror: true }],
  },

  {
    id: 'A4-08',
    name: '電車への飛び込みを想起させる描写',
    stageIds: ['stage-4'],
    category: 'author_anger',
    severity: 'high',
  triggerAfterLineId: 's4-10',
    probability: 0.7,
    blocks: [
      { type: 'text', id: 'a4-08-2', text: 'ホームの端に、誰かが立っている。', style: { color: '#888' }, bloodBleed: true },
      { type: 'spacer', id: 'a4-08-sp2', height: 8 },
      { type: 'text', id: 'a4-08-3', text: '電車の音が近づいてくる。' },
      { type: 'spacer', id: 'a4-08-sp3', height: 8 },
      { type: 'text', id: 'a4-08-4', text: '風が吹いた。強い風だった。', style: { color: '#888' }, bloodBleed: true },
      { type: 'text', id: 'a4-08-4b', text: 'いや、そう感じただけかもしれない。', style: { color: '#888' }, bloodBleed: true },
      { type: 'spacer', id: 'a4-08-sp4', height: 8 },
      { type: 'text', id: 'a4-08-5', text: '電車の音が近づいてくる。' },
      { type: 'spacer', id: 'a4-08-sp5', height: 8 },
      { type: 'text', id: 'a4-08-6', text: 'ブレーキの音がした。空気が裂けるような音だった。', style: { color: '#888' }, bloodBleed: true },
      { type: 'spacer', id: 'a4-08-sp6', height: 8 },
      { type: 'text', id: 'a4-08-7', text: '電車の音が近づいてくる。' },
      { type: 'spacer', id: 'a4-08-sp7', height: 8 },
      // 「それは花びらのようだった。」を書き終えた瞬間に不穏描写が一斉に血へにじむ
      { type: 'text', id: 'a4-08-8', text: 'それは花びらのようだった。', style: { color: '#888' }, bloodBleed: true, bloodBleedStart: true },
      // 「赤くて」だけ血が垂れる。続きは同じ行に連結
      { type: 'text', id: 'a4-08-8b', text: '赤くて', inlineChain: true, bloodDrip: true },
      { type: 'text', id: 'a4-08-8c', text: '美しいと思った。', style: { color: '#888' }, inlineChain: true, bloodBleed: true },
      { type: 'spacer', id: 'a4-08-sp8', height: 8 },
      { type: 'text', id: 'a4-08-9', text: '電車の音が近づいてくる。' },
      { type: 'spacer', id: 'a4-08-sp9', height: 8 },
      { type: 'text', id: 'a4-08-10', text: 'ホームには誰もいない。', style: { color: '#888' }, bloodBleed: true },
      { type: 'spacer', id: 'a4-08-sp10', height: 16 },
      // 書き終えた後、次の文章を書き始めるまで2秒待つ
      { type: 'text', id: 'a4-08-11', text: 'うらやましい。', trailingPause: 2000 },
    ],
    commentEffects: [{ id: 'c-a4-08', editorText: '電車の描写が危険な内容に変わっています。', timestamp: '', isHorror: true }],
  },

  {
    id: 'A4-33',
    name: '書いていくそばから黒塗りになる',
    stageIds: ['stage-4'],
    category: 'format_change',
    severity: 'high',
  // s4-10 の後に発火。正常文 s4-11「ミナトは、切符にゆっくり文字を書いた。」は
  // 異変が書いて黒塗りにするのでスキップする
  triggerAfterLineId: 's4-10',
    skipNormalLines: 1,
    probability: 0.5,
    blocks: [
      // 本来の文を書いてから、その行が黒帯に変わる。一部は紙や画面の右端を超えて伸びる
      { type: 'text', id: 'a4-33-1', text: 'ミナトは、切符にゆっくり文字を書いた。', redactAfterType: true },
      { type: 'text', id: 'a4-33-2', text: '行き先を、ひとつだけ書いた。', redactAfterType: true },
      { type: 'text', id: 'a4-33-3', text: 'それは、母のいる場所だった。', redactAfterType: true, redactWidth: 'overflow-long' },
      { type: 'spacer', id: 'a4-33-sp', height: 12 },
      { type: 'text', id: 'a4-33-4', text: '違う。消してない。' },
      { type: 'text', id: 'a4-33-5', text: '私は消してない。' },
      { type: 'text', id: 'a4-33-6', text: '勝手に黒くなる。', redactAfterType: true, redactWidth: 'overflow' },
      { type: 'text', id: 'a4-33-7', text: '書いたそばから見えなくなる。', redactAfterType: true },
      { type: 'text', id: 'a4-33-8', text: '消さないで。' },
      { type: 'text', id: 'a4-33-9', text: '消さないで。' },
      { type: 'text', id: 'a4-33-10', text: '消さないで。' },
      { type: 'spacer', id: 'a4-33-sp2', height: 12 },
      // この行は画面の右端を超えて伸びていく
      { type: 'text', id: 'a4-33-11', text: 'これも、すぐに黒くなるんだろう。', redactAfterType: true, redactWidth: 'screen' },
      { type: 'spacer', id: 'a4-33-sp3', height: 4 },
      { type: 'text', id: 'a4-33-12', text: '消さないで。' },
    ],
    commentEffects: [{ id: 'c-a4-33', editorText: '書いた文章が黒塗りで読めなくなっています。', timestamp: '', isHorror: true }],
  },

  // ════════════════════════════════════════════════════
  // 段階5：帰る場所（固定クライマックス異変）
  // ════════════════════════════════════════════════════

  {
    id: 'A5-01',
    name: '原稿画面が事件現場に変わる',
    stageIds: ['stage-5'],
    category: 'help_signal',
    severity: 'final',
  // s5-19b（ミナトは、そのひとつひとつを黙って見ていた。）の後に必ず発火する
  triggerAfterLineId: 's5-19b',
    probability: 1.0,
    mustFire: true,
    // 「アンタは誰なんだ？」まで指摘無効。その後は指摘ボタンで段階を進めるマルチフェーズ
    blockAccuseUntilDone: true,
    isMultiPhase: true,
    blocks: [
      { type: 'spacer', id: 'a5-01-sp1', height: 16 },
      { type: 'text', id: 'a5-01-3', text: '私は玄関の隅に座っていた。' },
      { type: 'spacer', id: 'a5-01-sp2', height: 16 },
      { type: 'text', id: 'a5-01-4', text: '山島さんは、床に倒れていた。' },
      { type: 'spacer', id: 'a5-01-sp3', height: 16 },
      { type: 'text', id: 'a5-01-5', text: '拭いても、拭いても、落ちない。' },
      { type: 'spacer', id: 'a5-01-sp4', height: 16 },
      { type: 'text', id: 'a5-01-6', text: '床の血は、思ったより乾くのが遅かった。' },
      { type: 'spacer', id: 'a5-01-sp5', height: 16 },
      { type: 'text', id: 'a5-01-7', text: 'だから原稿を開いた。' },
      { type: 'spacer', id: 'a5-01-sp6', height: 16 },
      { type: 'text', id: 'a5-01-8', text: '書けば、別のことを考えられると思った。' },
      { type: 'spacer', id: 'a5-01-sp7', height: 16 },
      { type: 'text', id: 'a5-01-9', text: '忘れていた。' },
      { type: 'spacer', id: 'a5-01-sp8', height: 16 },
      { type: 'text', id: 'a5-01-10', text: 'そうだ。' },
      { type: 'spacer', id: 'a5-01-sp9', height: 16 },
      { type: 'text', id: 'a5-01-11', text: 'そうだった。' },
      { type: 'spacer', id: 'a5-01-sp10', height: 16 },
      { type: 'text', id: 'a5-01-12', text: '山島さんは、帰ったんじゃない。' },
      { type: 'spacer', id: 'a5-01-sp11', height: 16 },
      { type: 'text', id: 'a5-01-14', text: 'でも、じゃあ。' },
      { type: 'spacer', id: 'a5-01-sp12', height: 16 },
      { type: 'text', id: 'a5-01-15', text: 'さっきから赤字を入れているアンタは誰なんだ？', style: { fontSize: '1.1em' } },
    ],
    commentEffects: [{ id: 'c-a5-01', editorText: '本文の内容が変わっています。', timestamp: '', isHorror: true }],
  },

  {
    id: 'A5-02',
    name: '山島さんのスマホが鳴り続ける',
    stageIds: ['stage-5'],
    category: 'help_signal',
    severity: 'final',
  // s5-37（あの時書いた行き先は、「お母さんのところ」。）の後に必ず発火する。
  // 発火後はビデオ通話スクリプト（App が制御）。発火から終わりまで指摘は無効グリッチ
  triggerAfterLineId: 's5-37',
    probability: 1.0,
    mustFire: true,
    blockAccuseUntilDone: true,
    isVideoScript: true,
    blocks: [
      { type: 'spacer', id: 'a5-02-sp1', height: 16 },
      { type: 'text', id: 'a5-02-3', text: '机の上で、スマホが鳴っていた。' },
      { type: 'text', id: 'a5-02-4', text: '山島さんのスマホだ。' },
      { type: 'spacer', id: 'a5-02-sp2', height: 8 },
      { type: 'text', id: 'a5-02-5', text: '着信：編集部 佐々木', style: { fontFamily: 'monospace', fontSize: '13px', color: '#444' } },
      { type: 'text', id: 'a5-02-6', text: '着信：営業部 井上', style: { fontFamily: 'monospace', fontSize: '13px', color: '#444' } },
      { type: 'text', id: 'a5-02-7', text: '着信：山島 自宅', style: { fontFamily: 'monospace', fontSize: '13px', color: '#444' } },
      { type: 'text', id: 'a5-02-8', text: '着信：非通知', style: { fontFamily: 'monospace', fontSize: '13px', color: '#444' } },
      { type: 'text', id: 'a5-02-9', text: '着信：編集部 佐々木', style: { fontFamily: 'monospace', fontSize: '13px', color: '#444' } },
      { type: 'text', id: 'a5-02-10', text: '着信：編集部 佐々木', style: { fontFamily: 'monospace', fontSize: '13px', color: '#444' } },
      { type: 'spacer', id: 'a5-02-sp3', height: 8 },
      { type: 'text', id: 'a5-02-11', text: 'ブッ' },
      { type: 'text', id: 'a5-02-12', text: 'ブッ' },
      { type: 'text', id: 'a5-02-13', text: 'ブッ' },
    ],
    commentEffects: [{ id: 'c-a5-02', editorText: '本文の内容が変わっています。', timestamp: '', isHorror: true }],
  },

  {
    id: 'A5-03',
    name: '作者が山島さんへの返信を書き始める',
    stageIds: ['stage-5'],
    category: 'help_signal',
    severity: 'final',
  // s5-06（自動ドアが開いた。）の後に必ず発火する
  triggerAfterLineId: 's5-06',
    probability: 1.0,
    mustFire: true,
    // 「私の原稿を。」まで書き終わるまで指摘を受け付けない（押すとボタンがグリッチするだけ）
    blockAccuseUntilDone: true,
    blocks: [
      { type: 'spacer', id: 'a5-03-sp1', height: 16 },
      { type: 'text', id: 'a5-03-2', text: '山島さんへ' },
      { type: 'spacer', id: 'a5-03-sp2', height: 8 },
      { type: 'text', id: 'a5-03-3', text: '先ほどはすみませんでした。' },
      { type: 'text', id: 'a5-03-4', text: '言いすぎました。' },
      { type: 'text', id: 'a5-03-5', text: '赤字の件も、ちゃんと直します。' },
      { type: 'text', id: 'a5-03-6', text: '直しますから、返事をしてください。' },
      { type: 'spacer', id: 'a5-03-sp3', height: 8 },
      { type: 'text', id: 'a5-03-14', text: 'どうして玄関に来たんですか。' },
      { type: 'text', id: 'a5-03-15', text: '今日は来ない約束だったじゃないですか。' },
      { type: 'text', id: 'a5-03-15b', text: '原稿は出来上がったら送るって伝えたじゃないですか。' },
      { type: 'text', id: 'a5-03-16', text: '私はまだ直している途中だったんです。' },
      { type: 'spacer', id: 'a5-03-sp5', height: 8 },
      { type: 'text', id: 'a5-03-17', text: 'あなたがまた赤字を入れるから。' },
      { type: 'text', id: 'a5-03-18', text: 'まだ読まないでって言ったのに。' },
      { type: 'spacer', id: 'a5-03-sp6', height: 16 },
      { type: 'text', id: 'a5-03-19', text: 'ごめんなさい。' },
      { type: 'text', id: 'a5-03-20', text: 'ごめんなさい。' },
      { type: 'text', id: 'a5-03-21', text: 'ごめんなさい。' },
      { type: 'spacer', id: 'a5-03-sp7', height: 16 },
      { type: 'text', id: 'a5-03-22', text: 'でも、最初に殺したのはあなたです。', style: { fontSize: '1.1em', color: '#202124' } },
      { type: 'text', id: 'a5-03-23', text: '私の原稿を。', style: { fontSize: '1.1em', color: '#202124' } },
      { type: 'spacer', id: 'a5-03-sp-end1', height: 28 },
      { type: 'spacer', id: 'a5-03-sp-end2', height: 28 },
    ],
    commentEffects: [{ id: 'c-a5-03', editorText: '本文の内容が変わっています。', timestamp: '', isHorror: true }],
  },
]
