import type { DocumentBlock, CommentItem } from './document'
import type { Anomaly } from './anomaly'

export type StagePhase = 'normal' | 'tired' | 'anxious' | 'loop' | 'distress'

export type TypingConfig = {
  charInterval: number
  commaPause: number
  periodPause: number
  lineBreakPause: number
  blockPause: number
}

export type Line = {
  id: string
  block: DocumentBlock
}

export type Stage = {
  id: string
  title: string
  heading: string
  phase: StagePhase
  lines: Line[]
  anomalyPool: Anomaly[]
}

export type AnomalyInstance = {
  instanceId: string
  anomalyId: string
  isRemoved: boolean
  isLatest: boolean
  // 異変発火時点の liveContent 長さ（=異変の最初のブロックの位置）。
  // 指摘時はここ以降（異変ブロック＋それ以降に書かれた正常文）をすべて削除する
  blockStartIndex: number
  // 異変発火時点の行インデックス（再開はこの行から）
  resumeLineIndex: number
}

export type GameState = {
  currentStageIndex: number
  nextLineIndex: number
  // 異変が始まった直前の行インデックス（指摘アニメーションで残す正常テキストの末尾）
  anomalyStartLineIndex: number
  // 異変が始まった直前の行ID
  anomalyStartLineId: string
  // 現在アクティブな異変のインスタンスID（削除時に使用）
  activeAnomalyInstanceId: string | null
  // このステージで発火した異変の履歴
  anomalyInstances: AnomalyInstance[]
  // 一度でも発生した異変のID（二度と発生しない。「はじめから」でリセット）
  usedAnomalyIds: string[]
  liveContent: DocumentBlock[]
  // 確定済み（前ステージまで）のブロック。指摘アニメーションで削除されない
  confirmedContent: DocumentBlock[]
  isAnomalyActive: boolean
  activeAnomalyId: string | null
  isWriting: boolean
  isStopped: boolean
  isEnding: boolean
  phase: 'idle' | 'writing' | 'stage_written' | 'ending'
  anomalyMissed: boolean   // 異変を指摘できずにステージを終えた
  confirmedStages: number[]
  accuseCount: number
  commentLog: CommentItem[]
  docTitle: string
  saveStatus: string
  toolbarFontName: string
  toolbarActiveTool: string
  commentPanelHidden: boolean
  commentPanelDanger: boolean
  fontShuffleActive: boolean  // フォントシャッフルが開始されているか（fontShuffleStart 行を書き終えると true）
  bloodBleedActive: boolean   // 血のにじみが開始されているか（以降に書かれる bloodBleed 行も即にじむ）
  textGlitchActive: boolean   // 画面全体の文字化け侵食が進行中か
  darkenActive: boolean       // 紙面が滲むように黒くなる演出が進行中か
  accuseBlocked: boolean      // この間は指摘を受け付けない（押してもグリッチするだけ）
  // A5-01 のマルチフェーズ演出：指摘ボタンで段階を進める特殊状態
  multiPhaseActive: boolean   // マルチフェーズ進行中（指摘で巻き戻さず次段階へ）
  multiPhaseStep: number      // 現在の段階（0=まだ未進行）
  // A5-02 ビデオ通話演出
  videoCallState: 'none' | 'loading' | 'on' | 'ending'
  accuseDisabled: boolean     // 指摘ボタンがグレーアウト（押せない）
  videoFinale: boolean        // 「見せろ」連投中（指摘で終わる。UI赤黒・ボタン震え）
  // ビデオ映像の表示: 'gif'=通常gif, 0〜4=連続画像, 'noise'=黒画面＋ノイズ
  videoFrame: 'gif' | 0 | 1 | 2 | 3 | 4 | 'noise'
}
