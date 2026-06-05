import type { DocumentBlock, CommentItem } from './document'

export type AnomalyCategory =
  | 'text_intrusion'
  | 'repetition'
  | 'dream_logic'
  | 'format_change'
  | 'layout_break'
  | 'image_spam'
  | 'ui_interference'
  | 'comment_interference'
  | 'author_anger'
  | 'help_signal'
  | 'viewpoint_break'
  | 'logic_break'
  | 'visual_text'
  | 'dialogue_break'
  | 'surreal_text'
  | 'text_escalation'
  | 'text_break'
  | 'image_caption_break'
  | 'audio_attachment'
  | 'reversed_text'
  | 'strikethrough_all'
  | 'timestamp_log'
  | 'indent_shift'
  | 'huge_dark_red_text'

export type HeaderEffect = {
  title?: string
  saveStatus?: string
  revertAfterMs?: number
}

export type ToolbarEffect = {
  activeTool?: 'center' | 'strikethrough' | 'none'
  fontName?: string
}

export type Anomaly = {
  id: string
  name: string
  stageIds: string[]
  category: AnomalyCategory
  severity: 'low' | 'middle' | 'high' | 'final'
  probability?: number
  // この行IDを書き終えた直後に発生する（CSVの「出るタイミング」に対応）
  triggerAfterLineId: string
  // true の場合、ステージ最初の行を書く前（開始直後）に発生する。
  // 先頭の正常行そのものを異変が置き換える場合に使う（triggerAfterLineId は無視される）
  triggerAtStageStart?: boolean
  // 発火時、この行ID（既に書かれた正常行）へ左→右の打ち消し線アニメを引く。
  // 「正常に書いた文に、あとから取り消し線が入る」演出に使う。配列で複数行を一度に消せる
  strikeThroughLineId?: string | string[]
  // true の場合、これまで書かれた全テキスト行（過去ステージ含む）へ打ち消し線を引く
  strikeThroughAll?: boolean
  // true の場合、未使用なら必ず（確率を無視して）1回発生する固定異変
  mustFire?: boolean
  blocks: DocumentBlock[]
  // 発火後、後続の正常行をこの数だけスキップする（異変が正常文の代わりを果たす場合に使う）。
  // 例：A1-07 は「母は春から〜今年の春だ」を反復するので、対応する正常行2行をスキップする
  skipNormalLines?: number
  // true の場合、この異変が最後まで書き終わるまで「指摘」を受け付けない
  // （押してもボタンにグリッチが入るだけで効かない）
  blockAccuseUntilDone?: boolean
  // true の場合、指摘ボタンが「段階を進める」特殊操作になる（A5-01 のマルチフェーズ演出）
  isMultiPhase?: boolean
  // true の場合、A5-02 のビデオ通話スクリプト演出（App が専用の進行を制御する）
  isVideoScript?: boolean
  escalationBlocks?: DocumentBlock[][]
  headerEffects?: HeaderEffect[]
  toolbarEffects?: ToolbarEffect[]
  commentEffects?: CommentItem[]
  stopAtFinalEscalation?: boolean
  hideCommentPanel?: boolean
  commentPanelDanger?: boolean
}
