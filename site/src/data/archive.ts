// アーカイブ（異変の振り返り）専用データ。
// 画像は後で用意するため、image はファイルパスのプレースホルダ。
// public/img/archive/ 配下に <id>.png を置く想定（例: img/archive/A1-03.png）。

export type ArchiveEntry = {
  id: string          // 異変ID（anomalies.ts の id と対応）
  displayName: string // アーカイブ上の表示名
  image: string       // サムネイル／拡大表示に使う画像パス（public 起点）
}

export type ArchiveChapter = {
  stageId: string     // stages.ts の id と対応（到達判定に使う）
  label: string       // 章見出し
  entries: ArchiveEntry[]
}

const img = (id: string) => `img/archive/${id}.png`

export const archiveChapters: ArchiveChapter[] = [
  {
    stageId: 'stage-1',
    label: '第一章',
    entries: [
      { id: 'A1-03', displayName: '赤入れ修正１', image: img('A1-03') },
      { id: 'A1-07', displayName: '赤入れ修正２', image: img('A1-07') },
      { id: 'A1-06', displayName: '赤入れ修正３', image: img('A1-06') },
      { id: 'A1-01', displayName: '赤入れ修正４', image: img('A1-01') },
      { id: 'A1-02', displayName: '赤入れ修正５', image: img('A1-02') },
      { id: 'A1-08', displayName: '赤入れ修正６', image: img('A1-08') },
      { id: 'A1-04', displayName: '赤入れ修正７', image: img('A1-04') },
      { id: 'A1-05', displayName: '赤入れ修正８', image: img('A1-05') },
    ],
  },
  {
    stageId: 'stage-2',
    label: '第二章',
    entries: [
      { id: 'A2-11', displayName: '赤入れ修正９', image: img('A2-11') },
      { id: 'A2-01', displayName: '赤入れ修正１０', image: img('A2-01') },
      { id: 'A2-12', displayName: '赤入れ修正１１', image: img('A2-12') },
      { id: 'A2-08', displayName: '赤入れ修正１２', image: img('A2-08') },
      { id: 'A2-03', displayName: '赤入れ修正１３', image: img('A2-03') },
      { id: 'A2-05', displayName: '赤入れ修正１４', image: img('A2-05') },
    ],
  },
  {
    stageId: 'stage-3',
    label: '第三章',
    entries: [
      { id: 'A3-01', displayName: '赤入れ修正１５', image: img('A3-01') },
      { id: 'A3-02', displayName: '赤入れ修正１６', image: img('A3-02') },
      { id: 'A3-11', displayName: '赤入れ修正１７', image: img('A3-11') },
      { id: 'A3-15', displayName: '赤入れ修正１８', image: img('A3-15') },
      { id: 'A3-21', displayName: '赤入れ修正１９', image: img('A3-21') },
      { id: 'A3-04', displayName: '赤入れ修正２０', image: img('A3-04') },
      { id: 'A3-12', displayName: '赤入れ修正２１', image: img('A3-12') },
    ],
  },
  {
    stageId: 'stage-4',
    label: '第四章',
    entries: [
      { id: 'A4-02', displayName: '赤入れ修正２２', image: img('A4-02') },
      { id: 'A4-08', displayName: '赤入れ修正２３', image: img('A4-08') },
      { id: 'A4-33', displayName: '赤入れ修正２４', image: img('A4-33') },
      { id: 'A4-04', displayName: '赤入れ修正２５', image: img('A4-04') },
      { id: 'A4-05', displayName: '赤入れ修正２６', image: img('A4-05') },
    ],
  },
  {
    stageId: 'stage-5',
    label: '第五章',
    entries: [
      { id: 'A5-03', displayName: '赤入れ修正２７', image: img('A5-03') },
      { id: 'A5-01', displayName: '赤入れ修正２８', image: img('A5-01') },
      { id: 'A5-02', displayName: '赤入れ修正２９', image: img('A5-02') },
    ],
  },
]
