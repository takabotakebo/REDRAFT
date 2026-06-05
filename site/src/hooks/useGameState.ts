import { useCallback, useRef, useState } from 'react'
import type { DocumentBlock, CommentItem } from '../types/document'
import type { GameState } from '../types/game'
import { stages } from '../data/stages'
import { anomalies } from '../data/anomalies'
import { editorComments } from '../data/comments'
import { selectAnomaly, resetUsedAnomalies } from '../lib/anomalySelector'

// ステージ開始直後に出る異変（triggerAtStageStart）を選ぶときの特殊 lineId
export const STAGE_START_LINE_ID = '__stage_start__'

// フォントシャッフル異変で使う候補（見た目の差が出るよう明朝・ゴシック・等幅・装飾を混ぜる）
const SHUFFLE_FONTS = [
  '"Noto Serif JP", serif',
  '"Noto Sans JP", sans-serif',
  '"MS Mincho", "ＭＳ 明朝", serif',
  '"MS Gothic", "ＭＳ ゴシック", monospace',
  '"Yu Gothic", "游ゴシック", sans-serif',
  '"Yu Mincho", "游明朝", serif',
  '"Meiryo", "メイリオ", sans-serif',
  'monospace',
  'cursive',
  'fantasy',
]

function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const DRAFT_NUMS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十']

function draftTitle(count: number): string {
  const label = DRAFT_NUMS[count] ?? String(count + 1)
  return `新作小説_第${label}稿`
}

const INITIAL_STATE: GameState = {
  currentStageIndex: 0,
  nextLineIndex: 0,
  anomalyStartLineIndex: -1,
  anomalyStartLineId: '',
  activeAnomalyInstanceId: null,
  anomalyInstances: [],
  usedAnomalyIds: [],
  liveContent: [],
  confirmedContent: [],
  isAnomalyActive: false,
  activeAnomalyId: null,
  isWriting: false,
  isStopped: false,
  isEnding: false,
  phase: 'idle',
  anomalyMissed: false,
  confirmedStages: [],
  accuseCount: 0,
  commentLog: [],
  docTitle: '新作小説_第一稿',
  saveStatus: '',
  toolbarFontName: 'Noto Serif JP',
  toolbarActiveTool: 'none',
  commentPanelHidden: false,
  commentPanelDanger: false,
  fontShuffleActive: false,
  bloodBleedActive: false,
  textGlitchActive: false,
  darkenActive: false,
  accuseBlocked: false,
  multiPhaseActive: false,
  multiPhaseStep: 0,
  videoCallState: 'none',
  accuseDisabled: false,
  videoFinale: false,
  videoFrame: 'gif',
}

export function useGameState() {
  const [state, setState] = useState<GameState>({ ...INITIAL_STATE })
  const stateRef = useRef(state)
  stateRef.current = state
  const pendingAnomalyRef = useRef<ReturnType<typeof selectAnomaly>>(null)

  // ─── タイピングエンジンからの通知 ────────────────────────────────────────

  const addBlock = useCallback((block: DocumentBlock) => {
    // 異変ブロックには startAnomaly/getFixedAnomaly 時点で _anomalyInstanceId が
    // 焼き込まれているので、そのまま追加する
    setState((s) => {
      const dupIdx = s.liveContent.findIndex((b) => b.id === block.id)
      if (dupIdx >= 0) {
        // 同じIDが既にある = 同じ行を書き直そうとしている（停止→再開で書きかけ行が残った等）。
        // 既存ブロックをその位置で新しい空ブロックに置き換え、二重表示を防ぐ。
        console.log('%c[STATE] addBlock 同ID置換 id=%s（書き直し）', 'color:#ff9800', block.id)
        const next = s.liveContent.slice()
        next[dupIdx] = block
        return { ...s, liveContent: next, saveStatus: '入力中…' }
      }
      console.log('%c[STATE] addBlock id=%s type=%s anomalyInst=%s', 'color:#9c27b0', block.id, block.type, (block as any)._anomalyInstanceId ?? '-')
      // 既ににじみ開始済みなら、後から書かれる bloodBleed 行も最初からにじませる
      const added = s.bloodBleedActive && block.type === 'text' && block.bloodBleed
        ? { ...block, _blooding: true }
        : block
      return { ...s, liveContent: [...s.liveContent, added], saveStatus: '入力中…' }
    })
  }, [])

  const updateBlock = useCallback((id: string, char: string) => {
    setState((s) => ({
      ...s,
      liveContent: s.liveContent.map((b) =>
        b.id === id && b.type === 'text' ? { ...b, text: b.text + char } : b
      ),
    }))
  }, [])

  /** 迷い演出：ブロック末尾の1文字を消す */
  const updateCaption = useCallback((id: string, char: string) => {
    setState((s) => ({
      ...s,
      liveContent: s.liveContent.map((b) =>
        b.id === id && b.type === 'image' ? { ...b, caption: (b.caption ?? '') + char } : b
      ),
    }))
  }, [])

  const redactBlock = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      liveContent: s.liveContent.map((b) =>
        b.id === id && b.type === 'text' ? { ...b, _redacted: true } : b
      ),
    }))
  }, [])

  const backspaceBlock = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      liveContent: s.liveContent.map((b) =>
        b.id === id && b.type === 'text' ? { ...b, text: b.text.slice(0, -1) } : b
      ),
    }))
  }, [])

  /** 行を1行書き終えた：nextLineIndex を更新 */
  const onLineWritten = useCallback((stageIdx: number, lineIdx: number) => {
    setState((s) => ({
      ...s,
      currentStageIndex: stageIdx,
      nextLineIndex: lineIdx + 1,
    }))
  }, [])

  /** ステージ完了（全行書き終わり） */
  const onStageComplete = useCallback((stageIdx: number) => {
    setState((s) => {
      // 一つでも指摘できていない異変があるか
      // = liveContent に異変ブロック（_anomalyInstanceId 付き）が残っているか
      const remainingAnomalyBlocks = s.liveContent.filter(
        (b) => (b as { _anomalyInstanceId?: string })._anomalyInstanceId
      )
      const missed = remainingAnomalyBlocks.length > 0
      console.group('%c[STATE] onStageComplete(stage=%d)', 'color:#3f51b5;font-weight:bold', stageIdx)
      console.log('isAnomalyActive:', s.isAnomalyActive)
      console.log('missed(=画面に異変ブロックが残存):', missed)
      console.groupEnd()
      return {
        ...s,
        phase: 'stage_written',
        currentStageIndex: stageIdx,
        anomalyMissed: missed,
        saveStatus: missed ? '指摘できませんでした' : 'すべての変更を保存しました',
      }
    })
  }, [])

  /** 最終ステージ（段階5）の本文を最後まで書き終えた → 確定ボタン待ち */
  const onFinalStageWritten = useCallback((stageIdx: number) => {
    setState((s) => ({
      ...s,
      phase: 'stage_written',
      currentStageIndex: stageIdx,
      anomalyMissed: false,
      saveStatus: 'すべての変更を保存しました',
    }))
  }, [])

  // ─── ゲーム開始 ──────────────────────────────────────────────────────────

  const beginGame = useCallback(() => {
    setState((s) => ({ ...s, phase: 'writing', saveStatus: '入力中…' }))
  }, [])

  // ─── ミス時：ステージ先頭に戻す ──────────────────────────────────────────
  const retryStage = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 'writing',
      // 前ステージまでの確定済みテキストは残し、現ステージ分だけ消す
      liveContent: [...s.confirmedContent],
      isAnomalyActive: false,
      activeAnomalyId: null,
      activeAnomalyInstanceId: null,
      anomalyInstances: [],
      nextLineIndex: 0,
      anomalyStartLineIndex: -1,
      anomalyStartLineId: '',
      anomalyMissed: false,
      isStopped: false,
      saveStatus: '入力中…',
      toolbarActiveTool: 'none',
      toolbarFontName: 'Noto Serif JP',
      commentPanelDanger: false,
      fontShuffleActive: false,
      bloodBleedActive: false,
      textGlitchActive: false,
      darkenActive: false,
      accuseBlocked: false,
      multiPhaseActive: false,
      multiPhaseStep: 0,
      videoCallState: 'none',
      accuseDisabled: false,
      videoFinale: false,
      videoFrame: 'gif',
      commentLog: [],
    }))
  }, [])

  // ─── 確定して次へ ────────────────────────────────────────────────────────

  const confirmAndAdvance = useCallback((onEnding: () => void) => {
    setState((s) => {
      const nextIdx = s.currentStageIndex + 1
      const isDone = nextIdx >= stages.length
      if (isDone) {
        setTimeout(onEnding, 0)
        return {
          ...s,
          confirmedStages: [...s.confirmedStages, s.currentStageIndex],
          commentLog: [],
          commentPanelDanger: false,
        }
      }
      // ステージ境目に空行を2つ挿入
      const stageBreak = [
        { type: 'spacer' as const, id: `break-${s.currentStageIndex}-1`, height: 24 },
        { type: 'spacer' as const, id: `break-${s.currentStageIndex}-2`, height: 24 },
      ]
      const newLiveContent = [...s.liveContent, ...stageBreak]
      return {
        ...s,
        phase: 'writing',
        liveContent: newLiveContent,
        // この時点の全コンテンツを「確定済み」として保存
        confirmedContent: newLiveContent,
        confirmedStages: [...s.confirmedStages, s.currentStageIndex],
        currentStageIndex: nextIdx,
        nextLineIndex: 0,
        anomalyStartLineIndex: -1,
        anomalyStartLineId: '',
        activeAnomalyInstanceId: null,
        anomalyInstances: [],
        saveStatus: '入力中…',
        commentLog: [],
        commentPanelDanger: false,
      }
    })
  }, [])

  // ─── この行に未使用の mustFire 異変があるか（確率抽選を無視させる） ──────
  const hasMustFireAnomaly = useCallback((stageId: string, lineId: string) => {
    const used = new Set(stateRef.current.usedAnomalyIds)
    return anomalies.some(
      (a) =>
        a.mustFire === true &&
        a.stageIds.includes(stageId) &&
        a.triggerAfterLineId === lineId &&
        !used.has(a.id)
    )
  }, [])

  // ─── 異変開始 ────────────────────────────────────────────────────────────

  const startAnomaly = useCallback((stageId: string, lineId: string) => {
    // lineId が特殊値 '__stage_start__' のときは、ステージ開始直後に出る異変が候補。
    // それ以外は lineId が triggerAfterLineId と一致する異変だけが候補
    const pool = lineId === STAGE_START_LINE_ID
      ? anomalies.filter((a) => a.stageIds.includes(stageId) && a.triggerAtStageStart === true)
      : anomalies.filter((a) => a.stageIds.includes(stageId) && a.triggerAfterLineId === lineId)
    // 使用済み異変は除外（二度と発生しない）
    const anomaly = selectAnomaly(pool, stageId, stateRef.current.usedAnomalyIds)
    if (!anomaly) {
      console.log('%c[STATE] startAnomaly: 候補なし lineId=%s（発火せず）', 'color:#607d8b', lineId)
      return null
    }

    pendingAnomalyRef.current = anomaly
    const anomalyInstanceId = `${anomaly.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log('%c[STATE] startAnomaly 発火! id=%s lineId=%s instanceId=%s', 'color:#ff5722;font-weight:bold', anomaly.id, lineId, anomalyInstanceId)

    const headerEff = anomaly.headerEffects?.[0]
    if (headerEff?.title) {
      setState((s) => ({ ...s, docTitle: headerEff.title!, saveStatus: '保存できません' }))
      document.title = headerEff.title!
      if (headerEff.revertAfterMs && headerEff.revertAfterMs > 0) {
        setTimeout(() => {
          setState((s) => ({ ...s, docTitle: '新作小説_第一稿' }))
          document.title = '新作小説_第一稿'
        }, headerEff.revertAfterMs)
      }
    }

    setState((s) => {
      // 既存行へ打ち消し線を引く異変（A2-11/A3-12等）は、指摘時にその行も含めて削除し、
      // その行から正常文を書き直す。削除開始位置と再開行を、消した行数分だけ手前にずらす
      let blockStartIndex = s.liveContent.length
      let resumeLineIndex = s.nextLineIndex
      if (anomaly.strikeThroughLineId) {
        const strikeIds = Array.isArray(anomaly.strikeThroughLineId)
          ? anomaly.strikeThroughLineId
          : [anomaly.strikeThroughLineId]
        // 打ち消し対象のうち最初に書かれている行を削除開始位置にする
        const indices = strikeIds
          .map((id) => s.liveContent.findIndex((b) => b.id === id))
          .filter((i) => i >= 0)
        if (indices.length > 0) blockStartIndex = Math.min(...indices)
        // 打ち消した行はすべて書き直すので、その行数分だけ手前から再開する
        resumeLineIndex = Math.max(0, s.nextLineIndex - strikeIds.length)
      }
      return {
      ...s,
      isAnomalyActive: true,
      activeAnomalyId: anomaly.id,
      anomalyStartLineIndex: s.nextLineIndex,
      anomalyStartLineId: lineId,
      activeAnomalyInstanceId: anomalyInstanceId,
      anomalyInstances: [
        ...s.anomalyInstances.map(inst => ({ ...inst, isLatest: false })),
        {
          instanceId: anomalyInstanceId,
          anomalyId: anomaly.id,
          isRemoved: false,
          isLatest: true,
          blockStartIndex,
          resumeLineIndex,
        }
      ],
      usedAnomalyIds: s.usedAnomalyIds.includes(anomaly.id)
        ? s.usedAnomalyIds
        : [...s.usedAnomalyIds, anomaly.id],
      saveStatus: anomaly.stopAtFinalEscalation ? '保存できません' : s.saveStatus,
      toolbarActiveTool: anomaly.toolbarEffects?.[0]?.activeTool ?? 'none',
      toolbarFontName: anomaly.toolbarEffects?.[0]?.fontName ?? s.toolbarFontName,
      commentPanelDanger: anomaly.commentPanelDanger ?? false,
      isStopped: anomaly.stopAtFinalEscalation === true ? true : s.isStopped,
      // この異変が書き終わるまで指摘を受け付けない
      accuseBlocked: anomaly.blockAccuseUntilDone === true ? true : s.accuseBlocked,
      // マルチフェーズ演出（指摘で段階を進める）
      multiPhaseActive: anomaly.isMultiPhase === true ? true : s.multiPhaseActive,
      multiPhaseStep: anomaly.isMultiPhase === true ? 0 : s.multiPhaseStep,
      }
    })

    // ブロックに instanceId を直接焼き込んで返す（state の反映タイミングに依存しない）
    return {
      ...anomaly,
      blocks: anomaly.blocks.map((b) => ({ ...b, _anomalyInstanceId: anomalyInstanceId })),
    }
  }, [])

  // ─── 固定異変（段階5専用） ────────────────────────────────────────────────

  // 副作用なしで予約異変のトリガー行IDを返す（発火可否判定のみに使う）
  // getFixedAnomaly は呼ぶだけで usedAnomalyIds に登録してしまうため、
  // トリガー行に到達したかの判定にはこちらを使う
  const getAnomalyTriggerLineId = useCallback((anomalyId: string): string | null => {
    const anomaly = anomalies.find((a) => a.id === anomalyId)
    return anomaly?.triggerAfterLineId ?? null
  }, [])

  const getFixedAnomaly = useCallback((anomalyId: string) => {
    const anomaly = anomalies.find((a) => a.id === anomalyId) ?? null
    if (!anomaly) return null

    // 既に使用済み（指摘済み）の固定異変は二度と発火させない
    if (stateRef.current.usedAnomalyIds.includes(anomalyId)) {
      return null
    }

    pendingAnomalyRef.current = anomaly
    const anomalyInstanceId = `${anomaly.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    setState((s) => ({
      ...s,
      isAnomalyActive: true,
      activeAnomalyId: anomaly.id,
      anomalyStartLineIndex: s.nextLineIndex,
      activeAnomalyInstanceId: anomalyInstanceId,
      anomalyInstances: [
        ...s.anomalyInstances.map(inst => ({ ...inst, isLatest: false })),
        {
          instanceId: anomalyInstanceId,
          anomalyId: anomaly.id,
          isRemoved: false,
          isLatest: true,
          blockStartIndex: s.liveContent.length,
          resumeLineIndex: s.nextLineIndex,
        }
      ],
      usedAnomalyIds: s.usedAnomalyIds.includes(anomaly.id)
        ? s.usedAnomalyIds
        : [...s.usedAnomalyIds, anomaly.id],
      commentPanelDanger: anomaly.commentPanelDanger ?? false,
      isStopped: anomaly.stopAtFinalEscalation === true ? true : s.isStopped,
      accuseBlocked: anomaly.blockAccuseUntilDone === true ? true : s.accuseBlocked,
    }))

    // ブロックに instanceId を直接焼き込んで返す（state の反映タイミングに依存しない）
    return {
      ...anomaly,
      blocks: anomaly.blocks.map((b) => ({ ...b, _anomalyInstanceId: anomalyInstanceId })),
    }
  }, [])

  // ─── 指摘アニメーション用ヘルパー ────────────────────────────────────────

  const buildAccuseComment = useCallback((): CommentItem => {
    const s = stateRef.current
    const stageId = stages[s.currentStageIndex]?.id ?? 'stage-1'
    const isAnomaly = s.isAnomalyActive
    const anomaly = pendingAnomalyRef.current

    const horrorCategories = ['author_anger', 'help_signal', 'comment_interference']
    const isHorror = isAnomaly && anomaly != null && (
      anomaly.severity === 'high' ||
      anomaly.severity === 'final' ||
      horrorCategories.includes(anomaly.category)
    )

    const editorText = isAnomaly && anomaly?.commentEffects?.[0]
      ? anomaly.commentEffects[0].editorText
      : pickRandom(editorComments[stageId] ?? editorComments['stage-1'])

    const authorReply = isAnomaly && anomaly?.commentEffects?.[0]
      ? anomaly.commentEffects[0].authorReply
      : undefined

    return {
      id: `comment-${Date.now()}`,
      editorText: editorText ?? '',
      authorReply,
      timestamp: '',
      isHorror: isHorror ?? false,
      isAccuse: isAnomaly,  // 異変を指摘したコメントなら赤背景・白文字で表示
    }
  }, [])

  const setLiveContent = useCallback((blocks: DocumentBlock[]) => {
    setState((s) => ({ ...s, liveContent: blocks }))
  }, [])

  // マルチフェーズ：liveContent に追加ブロックを足し、step を更新する
  const appendBlocks = useCallback((blocks: DocumentBlock[]) => {
    setState((s) => ({ ...s, liveContent: [...s.liveContent, ...blocks] }))
  }, [])
  const setMultiPhaseStep = useCallback((step: number) => {
    setState((s) => ({ ...s, multiPhaseStep: step }))
  }, [])
  // マルチフェーズ終了：状態をクリアする（演出ブロックの削除は別途 setLiveContent で）
  const endMultiPhase = useCallback(() => {
    setState((s) => ({ ...s, multiPhaseActive: false, multiPhaseStep: 0 }))
  }, [])

  // フォントシャッフルの開始／停止（fontShuffleStart 行を書き終えたら開始）
  const startFontShuffle = useCallback(() => {
    setState((s) => (s.fontShuffleActive ? s : { ...s, fontShuffleActive: true }))
  }, [])
  const stopFontShuffle = useCallback(() => {
    setState((s) => (s.fontShuffleActive ? { ...s, fontShuffleActive: false } : s))
  }, [])

  // 画面全体の文字化け侵食の開始（textGlitchStart 行を書き終えたら）
  const startTextGlitch = useCallback(() => {
    setState((s) => (s.textGlitchActive ? s : { ...s, textGlitchActive: true }))
  }, [])

  // 紙面が滲むように黒くなる演出の開始（darkenStart 行を書き終えたら）
  const startDarken = useCallback(() => {
    setState((s) => (s.darkenActive ? s : { ...s, darkenActive: true }))
  }, [])

  // A5-02 ビデオ通話演出の状態
  const setVideoCallState = useCallback((v: GameState['videoCallState']) => {
    setState((s) => ({ ...s, videoCallState: v }))
  }, [])
  const setAccuseDisabled = useCallback((v: boolean) => {
    setState((s) => ({ ...s, accuseDisabled: v }))
  }, [])
  // 「見せろ」連投フェーズ：指摘無効を解除しつつ videoFinale を立てる（UI赤黒・震え）
  const setVideoFinale = useCallback((v: boolean) => {
    setState((s) => ({ ...s, videoFinale: v, accuseBlocked: v ? false : s.accuseBlocked }))
  }, [])
  const setVideoFrame = useCallback((f: GameState['videoFrame']) => {
    setState((s) => ({ ...s, videoFrame: f }))
  }, [])

  // 異変ブロックを書き終えた → 指摘ブロックを解除する
  const unblockAccuse = useCallback(() => {
    // A5-02（ビデオスクリプト）は演出が終わるまで指摘無効を維持する
    setState((s) => (s.accuseBlocked && s.activeAnomalyId !== 'A5-02' ? { ...s, accuseBlocked: false } : s))
  }, [])

  // fontShuffle 付きの行すべてに、ランダムなフォントを割り当てる（呼ぶたびに切り替わる）
  const shuffleFonts = useCallback(() => {
    setState((s) => {
      if (!s.liveContent.some((b) => b.type === 'text' && b.fontShuffle)) return s
      return {
        ...s,
        liveContent: s.liveContent.map((b) =>
          b.type === 'text' && b.fontShuffle
            ? { ...b, style: { ...b.style, fontFamily: pickRandom(SHUFFLE_FONTS) } }
            : b
        ),
      }
    })
  }, [])

  // 指定IDの既に書かれたテキスト行へ、左→右の打ち消し線アニメを適用する
  const applyStrikeThrough = useCallback((lineId: string) => {
    setState((s) => ({
      ...s,
      liveContent: s.liveContent.map((b) =>
        b.id === lineId && b.type === 'text' ? { ...b, _strikeAnim: true } : b
      ),
    }))
  }, [])

  // bloodBleed 対象の行を一斉に「血のにじみ」アニメ中にする。
  // 以降に書かれる bloodBleed 行も即にじむよう bloodBleedActive を立てる
  const applyBloodBleed = useCallback(() => {
    setState((s) => ({
      ...s,
      bloodBleedActive: true,
      liveContent: s.liveContent.map((b) =>
        b.type === 'text' && b.bloodBleed ? { ...b, _blooding: true } : b
      ),
    }))
  }, [])

  // これまで書かれた全テキスト行（過去ステージ含む）へ打ち消し線を、
  // 下から上に向かって1行ずつ順に塗りつぶしていく（この異変限定・マーカー風の速い線）
  const applyStrikeThroughAll = useCallback(() => {
    // 対象テキスト行のIDを下（末尾）から順に並べる
    const targetIds = stateRef.current.liveContent
      .filter((b) => b.type === 'text')
      .map((b) => b.id)
      .reverse()
    let i = 0
    const STEP_MS = 70  // 1行ごとの間隔
    const timer = setInterval(() => {
      const id = targetIds[i++]
      if (id !== undefined) {
        setState((s) => ({
          ...s,
          liveContent: s.liveContent.map((b) =>
            b.id === id && b.type === 'text' ? { ...b, _strikeAnim: true, _strikeFast: true } : b
          ),
        }))
      }
      if (i >= targetIds.length) clearInterval(timer)
    }, STEP_MS)
  }, [])

  const addComment = useCallback((comment: CommentItem) => {
    setState((s) => ({ ...s, commentLog: [...s.commentLog, comment] }))
  }, [])

  /** 削除アニメーション完了後：タイトル更新・フラグリセット（liveContent はそのまま） */
  const finalizeRewind = useCallback(() => {
    setState((s) => {
      const newCount = s.accuseCount + 1
      const newTitle = draftTitle(newCount)
      document.title = newTitle

      // 最新の異変インスタンスを配列から取り除く（指摘＝削除済み）
      const latestIdx = s.anomalyInstances.findIndex(inst => inst.isLatest)
      let updatedInstances = s.anomalyInstances
      if (latestIdx >= 0) {
        updatedInstances = s.anomalyInstances.filter((_, idx) => idx !== latestIdx)
        // 残った中で最後（最も新しい）異変を新たな「最新」にする
        if (updatedInstances.length > 0) {
          const lastIdx = updatedInstances.length - 1
          updatedInstances = updatedInstances.map((inst, idx) =>
            idx === lastIdx ? { ...inst, isLatest: true } : { ...inst, isLatest: false }
          )
        }
      }

      return {
        ...s,
        isAnomalyActive: false,
        activeAnomalyId: null,
        activeAnomalyInstanceId: null,
        anomalyInstances: updatedInstances,
        // 指摘で正常に戻る → 残った行の打ち消し線アニメは解除する
        liveContent: s.liveContent.map((b) =>
          b.type === 'text' && b._strikeAnim ? { ...b, _strikeAnim: false } : b
        ),
        isStopped: false,
        // 指摘で削除した後、まだ画面に fontShuffle 行が残っていれば
        // （別の異変を指摘しただけで、見逃し中の A2-01 等が残っている場合）
        // シャッフルは継続する。残っていなければ停止
        fontShuffleActive: s.liveContent.some((b) => b.type === 'text' && b.fontShuffle),
        bloodBleedActive: s.liveContent.some((b) => b.type === 'text' && b.bloodBleed),
        textGlitchActive: false,
        darkenActive: false,
        accuseBlocked: false,
        multiPhaseActive: false,
        multiPhaseStep: 0,
        videoCallState: 'none',
        videoFinale: false,
        videoFrame: 'gif',
        docTitle: newTitle,
        accuseCount: newCount,
        saveStatus: '入力中…',
        toolbarActiveTool: 'none',
        toolbarFontName: 'Noto Serif JP',
        commentPanelDanger: false,
      }
    })
    pendingAnomalyRef.current = null
  }, [])

  // ─── エンディング ────────────────────────────────────────────────────────

  const runEnding = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 'ending',
      isEnding: true,
      docTitle: '完成稿',
      saveStatus: 'すべての変更を保存しました',
      commentLog: [],
    }))
    document.title = '完成稿'

    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
    ;(async () => {
      await wait(1500)
      setState((s) => ({
        ...s,
        liveContent: [
          ...s.liveContent,
          { type: 'spacer' as const, id: 'ending-spacer', height: 32 },
          { type: 'text' as const, id: 'ending-1', text: 'ミナトは窓に映った自分の顔を見た。', style: { color: '#555' } },
          { type: 'text' as const, id: 'ending-2', text: 'まだ子どもだった。', style: { color: '#555' } },
          { type: 'text' as const, id: 'ending-3', text: 'けれど、その顔は少しだけ、行きたい場所を知っているように見えた。', style: { color: '#555' } },
        ],
      }))

      await wait(3000)
      setState((s) => ({
        ...s,
        commentLog: [{
          id: 'final-comment',
          editorText: 'あなたは、編集者ではありませんよね。\nでも、助かりました。',
          timestamp: nowTime(),
          isHorror: true,
        }],
      }))

      await wait(4000)
      setState((s) => ({ ...s, docTitle: '次の原稿', saveStatus: '' }))
      document.title = '次の原稿'
    })()
  }, [])

  // ─── デバッグ：指定ステージにジャンプ（前ステージまでのテキストを確定稿として詰める） ───
  const debugJumpToStage = useCallback((stageIdx: number) => {
    resetUsedAnomalies()
    pendingAnomalyRef.current = null
    document.title = '新作小説_第一稿'

    // 0 〜 stageIdx-1 の全行ブロックを confirmed として詰める
    const prefillBlocks: import('../types/document').DocumentBlock[] = []
    for (let i = 0; i < stageIdx; i++) {
      const s = stages[i]
      s.lines.forEach((l) => prefillBlocks.push(l.block))
      if (i < stageIdx - 1) {
        prefillBlocks.push({ type: 'spacer', id: `break-${i}-1`, height: 24 })
        prefillBlocks.push({ type: 'spacer', id: `break-${i}-2`, height: 24 })
      }
    }
    // 最後のステージ境目の空行
    if (stageIdx > 0) {
      prefillBlocks.push({ type: 'spacer', id: `break-${stageIdx - 1}-1`, height: 24 })
      prefillBlocks.push({ type: 'spacer', id: `break-${stageIdx - 1}-2`, height: 24 })
    }

    setState({
      ...INITIAL_STATE,
      phase: 'writing',
      saveStatus: '入力中…',
      currentStageIndex: stageIdx,
      confirmedStages: Array.from({ length: stageIdx }, (_, i) => i),
      liveContent: [...prefillBlocks],
      confirmedContent: [...prefillBlocks],
    })
  }, [])

  // ─── デバッグ：最終局面（全ステージ本文を書き終え、確定ボタン待ち）にジャンプ ───
  const debugJumpToEnding = useCallback(() => {
    resetUsedAnomalies()
    pendingAnomalyRef.current = null
    document.title = '完成稿'

    // 全ステージ（0〜最終）の全行ブロックを詰める。ステージ間に空行2つ
    const allBlocks: import('../types/document').DocumentBlock[] = []
    stages.forEach((s, i) => {
      s.lines.forEach((l) => allBlocks.push(l.block))
      if (i < stages.length - 1) {
        allBlocks.push({ type: 'spacer', id: `break-${i}-1`, height: 24 })
        allBlocks.push({ type: 'spacer', id: `break-${i}-2`, height: 24 })
      }
    })

    const lastIdx = stages.length - 1
    setState({
      ...INITIAL_STATE,
      phase: 'stage_written',          // 確定ボタン待ち
      saveStatus: 'すべての変更を保存しました',
      currentStageIndex: lastIdx,
      confirmedStages: Array.from({ length: lastIdx }, (_, i) => i),
      liveContent: [...allBlocks],
      confirmedContent: [...allBlocks],
      anomalyMissed: false,
      // 段階5の固定異変は消化済み扱いにしておく（再発火しないように）
      usedAnomalyIds: ['A5-01', 'A5-02', 'A5-03'],
    })
  }, [])


  // ─── リセット ────────────────────────────────────────────────────────────

  const resetGame = useCallback(() => {
    resetUsedAnomalies()
    pendingAnomalyRef.current = null
    document.title = '新作小説_第一稿'
    setState({ ...INITIAL_STATE })
  }, [])

  return {
    state,
    addBlock,
    updateBlock,
    updateCaption,
    redactBlock,
    backspaceBlock,
    onLineWritten,
    onStageComplete,
    onFinalStageWritten,
    beginGame,
    retryStage,
    confirmAndAdvance,
    debugJumpToStage,
    debugJumpToEnding,
    startAnomaly,
    hasMustFireAnomaly,
    getFixedAnomaly,
    getAnomalyTriggerLineId,
    buildAccuseComment,
    setLiveContent,
    appendBlocks,
    setMultiPhaseStep,
    endMultiPhase,
    applyStrikeThrough,
    applyStrikeThroughAll,
    applyBloodBleed,
    shuffleFonts,
    startFontShuffle,
    stopFontShuffle,
    startTextGlitch,
    startDarken,
    setVideoCallState,
    setAccuseDisabled,
    setVideoFinale,
    setVideoFrame,
    unblockAccuse,
    addComment,
    finalizeRewind,
    runEnding,
    resetGame,
  }
}
