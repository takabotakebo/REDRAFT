import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DocumentHeader } from './components/DocumentHeader'
import { DocumentToolbar } from './components/DocumentToolbar'
import { DocumentView } from './components/DocumentView'
import { CommentPanel } from './components/CommentPanel'
import { ControlPanel } from './components/ControlPanel'
import { StageOutline } from './components/StageOutline'
import { DebugPanel } from './components/DebugPanel'
import { VideoCallPopup } from './components/VideoCallPopup'
import { useGameState } from './hooks/useGameState'
import { useTypingEngine } from './hooks/useTypingEngine'
import { useAccuseAnimation } from './hooks/useAccuseAnimation'
import { stages } from './data/stages'
import { GlitchContext } from './lib/glitchContext'
import type { DocumentBlock } from './types/document'
import './styles/document.css'
import './styles/effects.css'

export default function App() {
  const {
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
  } = useGameState()

  const [showShare, setShowShare] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [showNoise, setShowNoise] = useState(false)
  const [accuseBtnGlitch, setAccuseBtnGlitch] = useState(false)
  const [vsReady, setVsReady] = useState(false)  // A5-02: 「机の上で〜ブッ」書き終え＝スクリプト開始可
  const animatingRef = useRef(false)
  const blockedSpamRef = useRef(false)  // 指摘無効時のコメント連投が進行中か（多重起動防止）
  const stateRef = useRef(state)
  stateRef.current = state

  const animDeps = useMemo(() => ({
    getLiveContent: () => stateRef.current.liveContent,
    setLiveContent,
    addComment,
    onDone: () => {},
  }), [setLiveContent, addComment])

  const { runAnimation } = useAccuseAnimation(animDeps)

  const callbacks = useMemo(() => ({
    onAddBlock:    (block: DocumentBlock) => addBlock(block),
    onUpdateChar:  (id: string, ch: string) => updateBlock(id, ch),
    onUpdateCaption: (id: string, ch: string) => updateCaption(id, ch),
    onRedact:      (id: string) => redactBlock(id),
    onBackspace:   (id: string) => backspaceBlock(id),
    onLineWritten: (si: number, li: number) => onLineWritten(si, li),
    onAnomalyBlocksDone: () => {
      // A5-02 は「机の上で〜ブッ」を書き終えた合図 → スクリプト開始可にする（指摘無効は維持）
      if (stateRef.current.activeAnomalyId === 'A5-02') setVsReady(true)
      else unblockAccuse()
    },
    onStageComplete: (si: number) => onStageComplete(si),
    onFinalStageWritten: (si: number) => onFinalStageWritten(si),
    onAnomalyTrigger: (stageId: string, lineId: string) => startAnomaly(stageId, lineId) ?? null,
    onFixedAnomalyTrigger: (id: string) => getFixedAnomaly(id) ?? null,
    getAnomalyTriggerLineId: (id: string) => getAnomalyTriggerLineId(id),
    applyStrikeThrough: (id: string) => applyStrikeThrough(id),
    applyStrikeThroughAll: () => applyStrikeThroughAll(),
    onFontShuffleStart: () => startFontShuffle(),
    onBloodBleedStart: () => applyBloodBleed(),
    onTextGlitchStart: () => startTextGlitch(),
    onDarkenStart: () => startDarken(),
    hasMustFireAnomaly: (stageId: string, lineId: string) => hasMustFireAnomaly(stageId, lineId),
    onAllStagesComplete: () => runEnding(),
  }), [addBlock, updateBlock, updateCaption, redactBlock, backspaceBlock, onLineWritten, onStageComplete, onFinalStageWritten, startAnomaly, hasMustFireAnomaly, getFixedAnomaly, getAnomalyTriggerLineId, applyStrikeThrough, applyStrikeThroughAll, applyBloodBleed, startFontShuffle, startTextGlitch, startDarken, unblockAccuse, runEnding])

  const engine = useTypingEngine(stages, callbacks)

  // ─── 一時停止／再開 ───────────────────────────────────────────────────────
  const [paused, setPaused] = useState(false)
  // 「一時停止しました」の画面全体アニメーション表示フラグ
  const [showPausedFx, setShowPausedFx] = useState(false)

  const handlePauseToggle = useCallback(() => {
    const now = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    // 副作用は更新関数の外で実行する（StrictMode の二重呼び出しによる二重投稿を防ぐ）
    if (paused) {
      engine.resumeFromCurrent()
      addComment({ id: `pause-resume-${Date.now()}`, editorText: '執筆を再開してください', timestamp: now })
      setPaused(false)
    } else {
      engine.pause()
      setShowPausedFx(true)
      addComment({ id: `pause-stop-${Date.now()}`, editorText: '少し書くのを止めてください', timestamp: now })
      setPaused(true)
    }
  }, [paused, engine, addComment])

  // 一時停止のオーバーレイは一定時間で自動的にフェードアウトさせる
  useEffect(() => {
    if (!showPausedFx) return
    const t = setTimeout(() => setShowPausedFx(false), 1400)
    return () => clearTimeout(t)
  }, [showPausedFx])

  // 書き込み中以外（章確定・指摘・ミス・終了など）に移ったら一時停止状態を解除
  useEffect(() => {
    if (state.phase !== 'writing' && paused) setPaused(false)
  }, [state.phase, paused])

  // ─── 開始ボタン ──────────────────────────────────────────────────────────
  const handleStart = useCallback(() => { beginGame() }, [beginGame])

  // ─── 確定ボタン ──────────────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    confirmAndAdvance(runEnding)
  }, [confirmAndAdvance, runEnding])

  // ─── ミス時：見逃した異変にマーカー → ノイズ → ステージ先頭に戻す ─────────
  const handleRetry = useCallback(() => {
    if (animatingRef.current) return
    animatingRef.current = true

    // 1. 見逃した異変ブロック（_anomalyInstanceId 付き）に、指摘時と同じ
    //    赤背景・白文字の選択ハイライト（_fullSelected）を一括で付ける
    const live = stateRef.current.liveContent
    const markedIds = new Set(
      live
        .filter((b) => (b as { _anomalyInstanceId?: string })._anomalyInstanceId)
        .map((b) => b.id)
    )
    setLiveContent(
      live.map((b) => (markedIds.has(b.id) ? { ...b, _fullSelected: true } : b))
    )

    // 2. マーカーが引かれるのを見せてから、一瞬ノイズを走らせる
    setTimeout(() => {
      setShowNoise(true)
      const stageIdx = stateRef.current.currentStageIndex
      // 3. ノイズの最中に章の先頭へ戻す（戻った直後にノイズが消える）
      setTimeout(() => {
        engine.stopEngine()
        retryStage()
        // animatingRef は true のままにして useEffect の自動 startStage を抑止し、
        // ここから明示的に再開する（二重起動を防ぐ）。再開後にフラグを戻す。
        setTimeout(() => {
          setShowNoise(false)
          engine.startStage(stageIdx)
          animatingRef.current = false
        }, 250)
      }, 200)
    }, 1100)
  }, [engine, retryStage, setLiveContent])

  // ─── フォントシャッフル異変：開始後、一定間隔でフォントを切り替え続ける ──
  // fontShuffleStart 行を書き終えると fontShuffleActive=true になり、ここから開始する
  useEffect(() => {
    if (!state.fontShuffleActive) return
    const id = setInterval(() => shuffleFonts(), 120)
    return () => clearInterval(id)
  }, [state.fontShuffleActive, shuffleFonts])

  // ─── 文字化け侵食：開始後、侵食の進行度(0→1)を少しずつ上げていく ──
  // 実際の文字化けは各コンポーネントが progress を見て描画する（React 管理下で安全に行う）
  const [glitchProgress, setGlitchProgress] = useState(0)
  useEffect(() => {
    if (!state.textGlitchActive) {
      setGlitchProgress(0)
      return
    }
    const id = setInterval(() => {
      setGlitchProgress((p) => Math.min(0.85, p + 0.05))
    }, 250)
    return () => clearInterval(id)
  }, [state.textGlitchActive])

  // phase が 'writing' に変わったらタイピング開始
  // ただしアニメーション中は発火しない
  const prevPhaseRef = useRef(state.phase)
  const prevStageRef = useRef(state.currentStageIndex)
  useEffect(() => {
    const phaseChanged = prevPhaseRef.current !== state.phase
    const stageChanged = prevStageRef.current !== state.currentStageIndex
    // phase か stage が実際に変化したときだけログを出す（再レンダリングの洪水を防ぐ）
    if (phaseChanged || stageChanged) {
      console.log(
        '%c[EFFECT] phase=%s(prev=%s) stage=%d(prev=%d) animating=%s',
        'color:#795548',
        state.phase, prevPhaseRef.current,
        state.currentStageIndex, prevStageRef.current,
        animatingRef.current,
      )
    }
    if (
      prevPhaseRef.current !== 'writing' &&
      state.phase === 'writing' &&
      !animatingRef.current
    ) {
      console.log('%c[EFFECT] → startStage(%d) 呼出', 'color:#795548;font-weight:bold', state.currentStageIndex)
      engine.startStage(state.currentStageIndex)
    }
    prevPhaseRef.current = state.phase
    prevStageRef.current = state.currentStageIndex
  }, [state.phase, state.currentStageIndex, engine])

  // ─── 指摘ボタン ──────────────────────────────────────────────────────────
  // ─── A5-01 マルチフェーズ演出 ───────────────────────────────────────────
  // 各フェーズで追加される文章（指摘 or 10秒自動で次へ進む）
  const MULTI_PHASE_TEXTS: string[][] = [
    ['そうか。アンタ、編集の山島じゃないのか。', 'なんで忘れていたんだろう。'],
    ['・・・、そのままおとなしく完成まで見ておけよ。'],
  ]
  const PAGE_PX = 1123  // A4 1ページの高さ
  const mpRunningRef = useRef(false)        // 1フェーズの書き込み中（多重防止）
  const mpAutoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 指定行を「15ページ空白 → スムーズスクロール → スクロール完了後にタイピング」で追加する
  const mpTypeLines = useCallback((lines: string[], onDone: () => void) => {
    const stamp = Date.now()
    // 15ページ分の空白＋各行の空ブロックを先に置く（位置を確定させてからタイプする）
    const lineBlocks = lines.map((_, i): DocumentBlock => ({ type: 'text', id: `mp-${stamp}-${i}`, text: '' }))
    appendBlocks([{ type: 'spacer', id: `mp-gap-${stamp}`, height: PAGE_PX * 15 }, ...lineBlocks])

    // 追加テキストが入るページの上端を表示エリアの上に収める（スムーズ）
    const scrollToTextPage = () => {
      const el = document.getElementById(`block-mp-${stamp}-0`)
      const paper = el?.closest('.doc-paper') as HTMLElement | null
      const page = el?.closest('.doc-page') as HTMLElement | null
      if (page && paper) {
        const pageRect = page.getBoundingClientRect()
        const paperRect = paper.getBoundingClientRect()
        const margin = 24
        const target = paper.scrollTop + (pageRect.top - paperRect.top) - margin
        paper.scrollTo({ top: target, behavior: 'smooth' })
      }
    }

    // 各行を1文字ずつタイプする
    let li = 0
    const typeLine = () => {
      if (li >= lines.length) { onDone(); return }
      const blockId = `mp-${stamp}-${li}`
      const chars = [...lines[li]]
      let ci = 0
      const charTimer = setInterval(() => {
        updateBlock(blockId, chars[ci])
        ci++
        if (ci >= chars.length) {
          clearInterval(charTimer)
          li++
          setTimeout(typeLine, 400)
        }
      }, 70)
    }

    // スクロール開始 → スクロール完了（約0.7s）＋1秒待ってからタイピング
    setTimeout(scrollToTextPage, 60)
    setTimeout(typeLine, 1760)
  }, [appendBlocks, updateBlock])

  // 次のフェーズへ進む（指摘ボタン or 自動）
  const mpAdvance = useCallback(() => {
    if (mpRunningRef.current) return
    const step = stateRef.current.multiPhaseStep
    if (step >= MULTI_PHASE_TEXTS.length) return
    mpRunningRef.current = true
    if (mpAutoTimerRef.current) { clearTimeout(mpAutoTimerRef.current); mpAutoTimerRef.current = null }
    const lines = MULTI_PHASE_TEXTS[step]
    const nextStep = step + 1
    setMultiPhaseStep(nextStep)
    mpTypeLines(lines, () => {
      mpRunningRef.current = false
      if (nextStep >= MULTI_PHASE_TEXTS.length) {
        // 最終フェーズ完了 → 3秒後、空白ページ含めて下から上へ一気にマーカーを引いて削除
        setTimeout(() => {
          // 対象：異変ブロック＋マルチフェーズで追加したブロック（空白ページ含む）
          const targetIds = stateRef.current.liveContent
            .filter((b) => (b as { _anomalyInstanceId?: string })._anomalyInstanceId || b.id.startsWith('mp-'))
            .map((b) => b.id)
          // 下（末尾）から上（先頭）へ順にマーカーを付けていく
          const orderedBottomUp = [...targetIds].reverse()
          // まず一番下が見えるよう最下部へスクロール
          const paper = document.querySelector('.doc-paper') as HTMLElement | null
          if (paper) paper.scrollTo({ top: paper.scrollHeight, behavior: 'smooth' })

          let i = 0
          const markTimer = setInterval(() => {
            const id = orderedBottomUp[i]
            if (id !== undefined) {
              setLiveContent(
                stateRef.current.liveContent.map((b) =>
                  b.id === id ? ({ ...b, _fullSelected: true } as typeof b) : b
                )
              )
              // マーカーが上へ進むのに合わせて上へスクロール
              const el = document.getElementById(`block-${id}`)
              if (el && paper) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            i++
            if (i >= orderedBottomUp.length) {
              clearInterval(markTimer)
              // 全部引き終えた → 少し見せてから削除して巻き戻す
              setTimeout(() => {
                const idSet = new Set(targetIds)
                setLiveContent(stateRef.current.liveContent.filter((b) => !idSet.has(b.id)))
                endMultiPhase()
                finalizeRewind()
                const stageIdx = stateRef.current.currentStageIndex
                const resumeLineIdx = stateRef.current.anomalyInstances.find((i2) => i2.isLatest)?.resumeLineIndex ?? stateRef.current.nextLineIndex
                setTimeout(() => engine.resumeFromLine(stageIdx, resumeLineIdx), 800)
              }, 600)
            }
          }, 40)
        }, 3000)
      } else {
        // 次フェーズの自動進行タイマー（10秒）
        mpAutoTimerRef.current = setTimeout(() => mpAdvance(), 10000)
      }
    })
  }, [mpTypeLines, setMultiPhaseStep, setLiveContent, endMultiPhase, finalizeRewind, engine])

  // 「アンタは誰なんだ？」表示完了（accuseBlocked 解除）後、指摘されなければ5秒で自動フェーズ1へ
  useEffect(() => {
    if (state.multiPhaseActive && !state.accuseBlocked && state.multiPhaseStep === 0) {
      const t = setTimeout(() => mpAdvance(), 5000)
      return () => clearTimeout(t)
    }
  }, [state.multiPhaseActive, state.accuseBlocked, state.multiPhaseStep, mpAdvance])

  // ─── A5-02 ビデオ通話スクリプト ─────────────────────────────────────────
  const vsRunRef = useRef(false)
  const miseroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)  // 「見せろ」連投
  const miseroBlockRef = useRef<string | null>(null)  // 連投先ブロックID
  const tellNoiseRef = useRef<HTMLAudioElement | null>(null)  // 通話中ループ音
  const stopTellNoise = useCallback(() => {
    if (tellNoiseRef.current) { tellNoiseRef.current.pause(); tellNoiseRef.current = null }
  }, [])
  // 指定行を1文字ずつ追記する（既存 liveContent の末尾に足していく）
  // opts.charMs: 1文字の間隔, opts.style: スタイル, opts.lineGap: 行末の余韻, opts.punctuate: 句読点で止まる
  const vsTypeLines = useCallback((
    lines: string[],
    onDone: () => void,
    opts?: { charMs?: number; style?: Record<string, string>; lineGap?: number; punctuate?: boolean },
  ) => {
    const stamp = Date.now()
    const charMs = opts?.charMs ?? 70
    const lineGap = opts?.lineGap ?? 350
    let li = 0
    const typeLine = () => {
      if (li >= lines.length) { onDone(); return }
      const blockId = `vs-${stamp}-${li}`
      addBlock({ type: 'text', id: blockId, text: '', style: opts?.style })
      const chars = [...lines[li]]
      let ci = 0
      const step = () => {
        const ch = chars[ci]
        updateBlock(blockId, ch); ci++
        if (ci >= chars.length) { li++; setTimeout(typeLine, lineGap); return }
        // 句読点では少し長く止まる（余韻）
        const pause = opts?.punctuate && /[、。]/.test(ch) ? charMs * 6 : charMs
        setTimeout(step, pause)
      }
      setTimeout(step, charMs)
    }
    setTimeout(typeLine, 300)
  }, [addBlock, updateBlock])

  useEffect(() => {
    if (vsRunRef.current) return
    // 「机の上で〜ブッ」をエンジンが書き終えた合図（vsReady）が来てから開始
    if (state.activeAnomalyId !== 'A5-02' || !vsReady) return
    vsRunRef.current = true
    // 1) 「そうか。電話か…」（余韻をもって）
    setTimeout(() => {
      vsTypeLines(['そうか。', '電話か・・・。', '電話があったな。'], () => {
        // 2) 通話アイコン赤化 → ローディング → ビデオ表示
        setVideoCallState('loading')
        setTimeout(() => {
          setVideoCallState('on')
          // 通話がつながった効果音 → 続けて通話中ノイズをループ
          try { new Audio('audio/tell_start.mp3').play().catch(() => {}) } catch { /* noop */ }
          try {
            const noise = new Audio('audio/tellnoise.mp3')
            noise.loop = true
            noise.play().catch(() => {})
            tellNoiseRef.current = noise
          } catch { /* noop */ }
          setTimeout(() => {
            // 3) カメラ表示後の本文（大きめ・0.7倍速・余韻あり）→「見せろ。」連投
            const bigStyle = { fontSize: '20px' }
            vsTypeLines(
              [
                '・・・、ダメだ。',
                'マイクが壊れてるし、そっちの声も聞こえない。',
                'もうすぐ書き終わる。',
                'やっと。',
                '最後にアンタの顔見せてくれよ。',
                'ここまでさんざん赤入れしてきた、アンタの顔を。',
                'なあ。',
              ],
              () => {
                // 「なあ。」の後2秒止めてから、「見せろ。」を一気に連投開始
                setTimeout(() => {
                  // 指摘可能＋UI赤黒＋ボタン震え（videoFinale）
                  setVideoFinale(true)
                  // カメラ映像を 01→05 の画像に順次切り替え、05 の後はノイズ画面に
                  const frames: Array<0 | 1 | 2 | 3 | 4 | 'noise'> = [0, 1, 2, 3, 4, 'noise']
                  frames.forEach((f, idx) => {
                    setTimeout(() => setVideoFrame(f), idx * 600)
                  })
                  const blockId = `vs-misero-${Date.now()}`
                  miseroBlockRef.current = blockId
                  addBlock({ type: 'text', id: blockId, text: '', style: bigStyle })
                  const seq = [...'見せろ。']
                  let k = 0
                  // 指摘されるまで「見せろ。」を改行なしで連投し続ける（4倍速）
                  miseroTimerRef.current = setInterval(() => {
                    updateBlock(blockId, seq[k % seq.length])
                    k++
                  }, 18)
                }, 2000)
              },
              { charMs: 100, style: bigStyle, lineGap: 900, punctuate: true },  // 0.7倍速・大きめ・余韻
            )
          }, 4000) // ビデオ表示後4秒待ち
        }, 2500) // ローディング（長め）
      }, { punctuate: true, lineGap: 700 })  // 「そうか。電話か…」も余韻をもって
    }, 600)
  }, [state.activeAnomalyId, vsReady, vsTypeLines, setVideoCallState, setVideoFinale, setVideoFrame, addBlock, updateBlock])

  const handleAccuse = useCallback(() => {
    // 指摘すると巻き戻って自動再開するため、一時停止表示も解除する
    setPaused(false)
    const s = stateRef.current
    console.group('%c[ACCUSE] 指摘ボタン押下', 'color:#e91e63;font-weight:bold')
    console.log('phase:', s.phase)
    console.log('animating:', animatingRef.current)
    console.log('isAnomalyActive:', s.isAnomalyActive)
    console.log('accuseBlocked:', s.accuseBlocked)
    console.log('activeAnomalyId:', s.activeAnomalyId)
    console.log('activeAnomalyInstanceId:', s.activeAnomalyInstanceId)
    console.log('anomalyStartLineIndex:', s.anomalyStartLineIndex)
    console.log('currentStageIndex:', s.currentStageIndex, '/ nextLineIndex:', s.nextLineIndex)
    console.log('anomalyInstances:', JSON.parse(JSON.stringify(s.anomalyInstances)))
    console.log('usedAnomalyIds:', JSON.parse(JSON.stringify(s.usedAnomalyIds)))
    console.log('liveContent.length:', s.liveContent.length)
    console.table(s.liveContent.map((b: any) => ({
      id: b.id, type: b.type,
      text: b.type === 'text' ? b.text.slice(0, 20) : '',
      _anomalyInstanceId: b._anomalyInstanceId ?? '',
    })))

    if (state.phase !== 'writing') { console.log('→ 中断: phase != writing'); console.groupEnd(); return }
    if (animatingRef.current) { console.log('→ 中断: animating中'); console.groupEnd(); return }

    // 「見せろ」連投フェーズの指摘 → 連投停止・白マーカー・削除して即座に元へ戻す
    if (stateRef.current.videoFinale) {
      console.log('→ videoFinale 指摘：連投停止して終了'); console.groupEnd()
      if (miseroTimerRef.current) { clearInterval(miseroTimerRef.current); miseroTimerRef.current = null }
      stopTellNoise()
      animatingRef.current = true
      // 異変ブロック（a5-02-*, vs-*）に白マーカーを引く
      const ids = stateRef.current.liveContent
        .filter((b) => (b as { _anomalyInstanceId?: string })._anomalyInstanceId || b.id.startsWith('vs-'))
        .map((b) => b.id)
      const idSet = new Set(ids)
      setLiveContent(
        stateRef.current.liveContent.map((b) =>
          idSet.has(b.id) ? ({ ...b, _fullSelected: true, _whiteMark: true } as typeof b) : b
        )
      )
      // 白マーカーを見せてから一気に削除＆全演出を元へ戻す
      setTimeout(() => {
        setLiveContent(stateRef.current.liveContent.filter((b) => !idSet.has(b.id)))
        setVideoCallState('none')
        setVideoFinale(false)
        setAccuseDisabled(true)  // 以降グレーアウト
        finalizeRewind()
        animatingRef.current = false
        const stageIdx = stateRef.current.currentStageIndex
        const resumeLineIdx = stateRef.current.anomalyInstances.find((i) => i.isLatest)?.resumeLineIndex ?? stateRef.current.nextLineIndex
        // 異変が消えてから、正常文を書き始めるまで4秒あける
        setTimeout(() => engine.resumeFromLine(stageIdx, resumeLineIdx), 4000)
      }, 500)
      return
    }

    if (stateRef.current.accuseDisabled) { console.log('→ 中断: グレーアウト'); console.groupEnd(); return }

    // 指摘ブロック中（A5-03 等が書き終わるまで）→ 巻き戻さず、ボタンにグリッチだけ出す。
    // さらに作者のコメントを 0.2 秒間隔で 30 個連投する（マルチフェーズ異変は連投しない）
    if (stateRef.current.accuseBlocked) {
      console.log('→ 中断: accuseBlocked。ボタングリッチ'); console.groupEnd()
      setAccuseBtnGlitch(true)
      setTimeout(() => setAccuseBtnGlitch(false), 450)
      // コメント連投は A5-03 のときだけ（一度だけ）。A5-01/A5-02 のグリッチ時は連投しない
      if (!blockedSpamRef.current && stateRef.current.activeAnomalyId === 'A5-03') {
        blockedSpamRef.current = true
        let n = 0
        const timer = setInterval(() => {
          const now = `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`
          addComment({
            id: `blocked-spam-${Date.now()}-${n}`,
            editorText: '',
            authorReply: '今執筆中です。黙ってみていてください。',
            isHorror: true,
            isBlocked: true,
            timestamp: now,
          })
          n++
          if (n >= 30) clearInterval(timer)
        }, 200)
      }
      return
    }

    // マルチフェーズ演出中（A5-01）→ 巻き戻さず、段階を進める
    if (stateRef.current.multiPhaseActive) {
      console.log('→ マルチフェーズ：次の段階へ'); console.groupEnd()
      mpAdvance()
      return
    }

    // 表示中の未指摘異変が無い（空振り指摘）→ エンジンは止めず、コメントだけ出す
    if (!stateRef.current.isAnomalyActive) {
      console.log('%c→ 空振り指摘: isAnomalyActive=false。エンジン継続、コメントのみ', 'color:#ff9800;font-weight:bold')
      console.groupEnd()
      addComment({ ...buildAccuseComment(), timestamp: `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}` })
      return
    }

    animatingRef.current = true

    engine.pause()

    const comment = buildAccuseComment()
    const stageIdx = stateRef.current.currentStageIndex
    // 「最新」フラグを持つ異変インスタンス
    const latestInstance = stateRef.current.anomalyInstances.find((inst) => inst.isLatest)

    // 異変開始の直前まで残し、それ以降（異変ブロック＋異変後に書いた正常文）を全削除する。
    // 削除対象 = liveContent の blockStartIndex 以降の全ブロックID。
    // 再開行 = その異変が発火した時点の行（resumeLineIndex）。
    const blockStartIndex = latestInstance?.blockStartIndex ?? -1
    const resumeLineIdx = latestInstance?.resumeLineIndex ?? stateRef.current.anomalyStartLineIndex
    const deleteTargetIds =
      blockStartIndex >= 0
        ? stateRef.current.liveContent.slice(blockStartIndex).map((b) => b.id)
        : []

    console.log('→ latestInstance:', latestInstance ? JSON.parse(JSON.stringify(latestInstance)) : null)
    console.log('→ blockStartIndex:', blockStartIndex, '削除対象数:', deleteTargetIds.length)
    console.log('→ 再開行:', resumeLineIdx >= 0 ? resumeLineIdx : 0)
    console.groupEnd()

    // 削除対象に打ち消し線アニメ中の行（A2-11 の s2-01 等）があれば解除しておく。
    // 解除しないと選択ハイライト（マーカー）より打ち消し線描画が優先されて見えない
    const deleteIdSet = new Set(deleteTargetIds)
    setLiveContent(
      stateRef.current.liveContent.map((b) =>
        b.type === 'text' && b._strikeAnim && deleteIdSet.has(b.id)
          ? { ...b, _strikeAnim: false }
          : b
      )
    )

    runAnimation(comment, deleteTargetIds, () => {
      console.log('%c[ACCUSE] runAnimation完了 → finalizeRewind+resume', 'color:#e91e63')
      finalizeRewind()
      animatingRef.current = false
      // 文字を消し終えてから、再び書き始めるまで1秒の間をあける
      setTimeout(() => {
        console.log('%c[ACCUSE] resumeFromLine(stage=%d, line=%d)', 'color:#e91e63', stageIdx, resumeLineIdx >= 0 ? resumeLineIdx : 0)
        engine.resumeFromLine(stageIdx, resumeLineIdx >= 0 ? resumeLineIdx : 0)
      }, 1000)
    })
  }, [engine, buildAccuseComment, runAnimation, finalizeRewind, state.phase, addComment, setLiveContent, mpAdvance, setVideoCallState, setVideoFinale, setAccuseDisabled, stopTellNoise])

  // ─── はじめから ──────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    animatingRef.current = false
    blockedSpamRef.current = false
    vsRunRef.current = false
    setVsReady(false)
    if (miseroTimerRef.current) { clearInterval(miseroTimerRef.current); miseroTimerRef.current = null }
    stopTellNoise()
    engine.stopEngine()
    setShowShare(false)
    setIsReadOnly(false)
    resetGame()
  }, [engine, resetGame, stopTellNoise])

  // ─── 章のはじめから：現在のステージの先頭に戻す ──────────────────────────
  const handleRestartStage = useCallback(() => {
    animatingRef.current = false
    engine.stopEngine()
    const stageIdx = stateRef.current.currentStageIndex
    retryStage()
    // retryStage は writing→writing なので useEffect が発火しない → 明示的に再開
    setTimeout(() => engine.startStage(stageIdx), 100)
  }, [engine, retryStage])

  return (
    <GlitchContext.Provider value={glitchProgress}>
    <div className={`app${state.darkenActive ? ' darkening' : ''}${state.videoFinale ? ' video-finale' : ''}`}>
      <DocumentHeader
        title={state.docTitle}
        saveStatus={state.saveStatus}
        isReadOnly={isReadOnly}
        videoActive={state.videoCallState !== 'none'}
      />
      <DocumentToolbar
        fontName={state.toolbarFontName}
        activeTool={state.toolbarActiveTool}
      />
      <div className="doc-main">
        <StageOutline
          currentStageIndex={state.currentStageIndex}
          confirmedStages={state.confirmedStages}
          phase={state.phase}
          foundAnomalies={state.accuseCount}
        />
        <DocumentView
          blocks={state.liveContent}
          isStopped={state.isStopped}
          suppressAutoScroll={state.multiPhaseActive}
        />
        <CommentPanel
          comments={state.commentLog}
          hidden={state.commentPanelHidden}
          danger={state.commentPanelDanger}
        />
      </div>
      <ControlPanel
        phase={state.phase}
        isFinalStage={state.currentStageIndex === stages.length - 1}
        anomalyMissed={state.anomalyMissed}
        onAccuse={handleAccuse}
        onConfirm={handleConfirm}
        onRetry={handleRetry}
        onReset={handleReset}
        onRestartStage={handleRestartStage}
        paused={paused}
        onPauseToggle={handlePauseToggle}
        showShare={showShare}
        accuseGlitch={accuseBtnGlitch}
        accuseDisabled={state.accuseDisabled}
      />
    </div>
    {state.phase === 'idle' && (
      <div className="open-doc-overlay">
        <div className="open-doc-popup" role="dialog" aria-modal="true">
          <p className="open-doc-text">共有リンクでアクセスしています。</p>
          <button className="open-doc-btn" onClick={handleStart}>
            ドキュメントを開く
          </button>
        </div>
      </div>
    )}
    {showPausedFx && (
      <div className="pause-fx" aria-hidden="true">
        <div className="pause-fx-card">
          <svg className="pause-fx-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
          <span className="pause-fx-label">一時停止しました</span>
        </div>
      </div>
    )}
    {showNoise && <div className="noise-overlay" aria-hidden="true" />}
    {(state.videoCallState === 'on' || state.videoCallState === 'ending') && (
      <div className="video-vignette" aria-hidden="true" />
    )}
    <VideoCallPopup state={state.videoCallState} frame={state.videoFrame} />
    {import.meta.env.DEV && (
      <DebugPanel
        state={state}
        onJumpToStage={debugJumpToStage}
        onJumpToEnding={() => { engine.stopEngine(); debugJumpToEnding() }}
        onReserveAnomaly={engine.reserveAnomaly}
        onStopEngine={engine.stopEngine}
        onStartStage={engine.startStage}
        onPause={engine.pause}
        onResume={engine.resumeFromCurrent}
        onSetSpeed={engine.setSpeed}
      />
    )}
    </GlitchContext.Provider>
  )
}
