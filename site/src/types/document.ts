export type TextStyle = {
  fontFamily?: string
  fontSize?: string
  color?: string
  backgroundColor?: string
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'line-through' | 'underline'
  textAlign?: 'left' | 'center' | 'right'
  letterSpacing?: string
  lineHeight?: string
  marginLeft?: string
  opacity?: number
  className?: string
}

export type TextBlock = {
  type: 'text'
  id: string
  text: string
  style?: TextStyle
  className?: string
  // 指定すると、この行を「タイプ→削除」をこの回数だけ繰り返してから
  // 最後にもう一度書いて残す（書いては消す演出）。typingQueue が解釈する
  rewriteCount?: number
  // 「書いては消す」の最後に残すテキスト。未指定なら text 全文を残す。
  // 途中で力尽きたように未完の文を残したいときに使う
  rewriteFinalText?: string
  // このブロックのタイピング速度倍率（1=標準, 2=2倍速…）。
  // 反復異変で「だんだん速くなる」演出に使う。typingQueue が解釈する。
  // speedMultiplierEnd を併用すると、ブロック内で speedMultiplier → speedMultiplierEnd へ
  // 文字ごとに線形加速する（文章の途中でも速くなる）
  speedMultiplier?: number
  speedMultiplierEnd?: number
  // このブロックを書き始める前に挟む追加の待機（ms）。「少し止まってから一気に書く」演出用
  leadingPause?: number
  // true のとき、このテキストを段落で改行せず前のブロックと同じ行に連続表示する（インライン）。
  // ブロック単位で速度や leadingPause を変えつつ 1 行に繋げたいときに使う
  inlineChain?: boolean
  _highlighted?: boolean  // 赤ラインマーカーアニメーション用（描画専用）
  _strikeAnim?: boolean  // 左→右に打ち消し線を引くアニメーション用（描画専用）
  _strikeFast?: boolean  // 打ち消し線をマーカー並みに速く引く（strikeThroughAll 用・描画専用）
  fontShuffle?: boolean  // フォントがランダムに切り替わり続ける異変。App が定期的に差し替える
  fontShuffleStart?: boolean  // この行を書き終えた瞬間に、fontShuffle 対象のシャッフルを開始する
  // 文字サイズがばらつき、たまに斜め・太字が混ざる「夢文」演出。
  // タイピング速度も4段階でランダムに変化する（typingQueue / レンダラーが解釈）
  dreamGlitch?: boolean
  // 血でにじむ演出の対象行。bloodBleedStart 行を書き終えると一斉ににじみ始める
  bloodBleed?: boolean
  // この行を書き終えた瞬間に、bloodBleed 対象を一斉ににじませ始める
  bloodBleedStart?: boolean
  // この行を書き終えた瞬間に、画面全体の文字化け侵食を開始する
  textGlitchStart?: boolean
  // この行を書き終えた瞬間に、紙面の背景が滲むように黒くなり文字が白へ反転していく
  darkenStart?: boolean
  // この行（短い語）に「血が下へ垂れる」演出を付ける
  bloodDrip?: boolean
  // この行を書き終えた後、次の行を書き始めるまで余分に待つ時間（ms）
  trailingPause?: number
  // 本来の文を書き終えた後、その行が連続した黒帯（黒塗り）に変化する演出
  redactAfterType?: boolean
  // 黒帯の横幅。'overflow'=紙を超えて少し, 'overflow-long'=紙を超えて長め, 'screen'=画面右端まで
  redactWidth?: 'overflow' | 'overflow-long' | 'screen'
  _blooding?: boolean  // 血のにじみアニメ中（描画専用。App が立てる）
  _redacted?: boolean  // 黒塗り（黒帯）化済み（描画専用）
  _whiteMark?: boolean  // 選択マーカーを白にする（描画専用）
  _selectedChars?: number  // 右から数えて選択済みの文字数（選択起点の行で使用）
  _fullSelected?: boolean  // 行まるごと選択（起点より上の行：行末余白まで反転）
  _anomalyInstanceId?: string  // 異変インスタンスID（削除時に使用）
}

export type ImageBlock = {
  type: 'image'
  id: string
  src: string
  alt?: string
  caption?: string
  captionTyping?: boolean  // true のときキャプションを1文字ずつタイピング表示する（既定は即時表示）
  repeatCount?: number
  _anomalyInstanceId?: string  // 異変インスタンスID（削除時に使用）
  _fullSelected?: boolean  // 指摘アニメで選択ハイライト（画像・キャプションを反転）
}

export type TableBlock = {
  type: 'table'
  id: string
  rows: string[][]
}

export type AudioBlock = {
  type: 'audio'
  id: string
  src: string
  label?: string  // プレーヤー上に表示するファイル名など
  _anomalyInstanceId?: string  // 異変インスタンスID（削除時に使用）
  _fullSelected?: boolean  // 指摘アニメで選択ハイライト
}

// 押せないリンク風ボタン。クリックするとグリッチ演出だけ起きる
export type LinkButtonBlock = {
  type: 'linkButton'
  id: string
  label: string
  _anomalyInstanceId?: string  // 異変インスタンスID（削除時に使用）
  _fullSelected?: boolean  // 指摘アニメで選択ハイライト
}

export type SpacerBlock = {
  type: 'spacer'
  id: string
  height: number
  _anomalyInstanceId?: string  // 異変インスタンスID（削除時に使用）
  _fullSelected?: boolean  // マーカー（赤背景）を引く
  _whiteMark?: boolean  // 選択マーカーを白にする
}

export type SystemBlock = {
  type: 'system'
  id: string
  message: string
  variant: 'saving' | 'error' | 'cursor' | 'viewer' | 'glitch'
}

export type DocumentBlock = TextBlock | ImageBlock | TableBlock | SpacerBlock | SystemBlock | AudioBlock | LinkButtonBlock

export type CommentItem = {
  id: string
  editorText: string
  authorReply?: string
  timestamp: string
  isHorror?: boolean  // true のとき authorReply も表示する
  isAccuse?: boolean  // true のとき異変を指摘したコメント（赤背景・白文字で表示）
  isBlocked?: boolean  // 指摘無効時の連投コメント（背景黒・文字赤黒く表示）
}
