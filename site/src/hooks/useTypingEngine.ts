import { useCallback, useEffect, useRef } from 'react'
import type { Stage, TypingConfig } from '../types/game'
import type { DocumentBlock } from '../types/document'
import type { Anomaly } from '../types/anomaly'
import { buildTasksFromBlocks } from '../lib/typingQueue'
import { STAGE_START_LINE_ID } from './useGameState'

const PHASE_CONFIG: Record<string, TypingConfig> = {
  normal:   { charInterval: 75,  commaPause: 275, periodPause: 500, lineBreakPause: 400, blockPause: 650 },
  tired:    { charInterval: 90,  commaPause: 350, periodPause: 600, lineBreakPause: 500, blockPause: 800 },
  anxious:  { charInterval: 35,  commaPause: 80,  periodPause: 150, lineBreakPause: 100, blockPause: 200 },
  loop:     { charInterval: 20,  commaPause: 20,  periodPause: 20,  lineBreakPause: 20,  blockPause: 20  },
  distress: { charInterval: 120, commaPause: 500, periodPause: 800, lineBreakPause: 700, blockPause: 1000 },
}

// 異変を終えて正常の文章を書き始める前の待機（全異変共通）
const ANOMALY_TO_NORMAL_DELAY_MS = 1000
// 正常行を書き終えたあと、たまに少し止まる（カモフラージュ）確率と長さ
const NORMAL_PAUSE_PROBABILITY = 0.15
const NORMAL_PAUSE_MS = 600

type Callbacks = {
  onAddBlock:  (block: DocumentBlock) => void
  onUpdateChar: (blockId: string, char: string) => void
  onUpdateCaption: (blockId: string, char: string) => void
  onRedact: (blockId: string) => void
  onBackspace: (blockId: string) => void
  onLineWritten: (stageIdx: number, lineIdx: number) => void
  // 異変ブロックを最後まで書き終えた（指摘ブロック解除などに使う）
  onAnomalyBlocksDone: () => void
  onStageComplete: (stageIdx: number) => void
  // lineId：書き終えた行のID。その行をトリガーとする異変を返す
  onAnomalyTrigger: (stageId: string, lineId: string) => Anomaly | null
  onFixedAnomalyTrigger: (anomalyId: string) => Anomaly | null
  // 副作用なしで予約異変のトリガー行IDを返す（発火可否判定のみ）
  getAnomalyTriggerLineId: (anomalyId: string) => string | null
  // 指定IDの既存行に左→右の打ち消し線アニメを適用する
  applyStrikeThrough: (lineId: string) => void
  // これまで書かれた全テキスト行に打ち消し線アニメを適用する
  applyStrikeThroughAll: () => void
  // フォントシャッフルを開始する（fontShuffleStart 行を書き終えた瞬間に呼ぶ）
  onFontShuffleStart: () => void
  // 血のにじみを開始する（bloodBleedStart 行を書き終えた瞬間に呼ぶ）
  onBloodBleedStart: () => void
  // 画面全体の文字化け侵食を開始する（textGlitchStart 行を書き終えた瞬間に呼ぶ）
  onTextGlitchStart: () => void
  // 紙面が黒くなる演出を開始する（darkenStart 行を書き終えた瞬間に呼ぶ）
  onDarkenStart: () => void
  // この行に「必ず発生する（未使用のmustFire）」異変があるか。あれば確率抽選を無視する
  hasMustFireAnomaly: (stageId: string, lineId: string) => boolean
  // 最終ステージ（段階5）の本文を最後まで書き終えた（確定ボタン待ちにする）
  onFinalStageWritten: (stageIdx: number) => void
  onAllStagesComplete: () => void
}

function runTasks(
  tasks: ReturnType<typeof buildTasksFromBlocks>,
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  pausedRef: React.MutableRefObject<boolean>,
  stoppedRef: React.MutableRefObject<boolean>,
  callbacks: Pick<Callbacks, 'onAddBlock' | 'onUpdateChar' | 'onUpdateCaption' | 'onRedact' | 'onBackspace'>,
  onDone: () => void,
  // 世代チェック：自分が最新世代でなければ即停止（古いループの生き残り対策）
  isAlive: () => boolean = () => true,
) {
  let idx = 0
  function next() {
    if (!isAlive()) return
    if (stoppedRef.current || pausedRef.current) return
    if (idx >= tasks.length) { onDone(); return }
    const t = tasks[idx++]
    if (t.kind === 'char') {
      callbacks.onUpdateChar(t.blockId, t.char)
      timerRef.current = setTimeout(next, t.pause)
    } else if (t.kind === 'captionChar') {
      callbacks.onUpdateCaption(t.blockId, t.char)
      timerRef.current = setTimeout(next, t.pause)
    } else if (t.kind === 'redact') {
      callbacks.onRedact(t.blockId)
      timerRef.current = setTimeout(next, 0)
    } else if (t.kind === 'backspace') {
      callbacks.onBackspace(t.blockId)
      timerRef.current = setTimeout(next, t.pause)
    } else if (t.kind === 'addBlock') {
      callbacks.onAddBlock(t.block)
      timerRef.current = setTimeout(next, 0)
    } else if (t.kind === 'wait') {
      timerRef.current = setTimeout(next, t.ms)
    } else {
      next()
    }
  }
  next()
}

export function useTypingEngine(stages: Stage[], callbacks: Callbacks) {
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pausedRef   = useRef(true)
  const stoppedRef  = useRef(false)
  // 走行世代。新しいループを起動するたびに +1。古い世代のループは自滅する
  const generationRef = useRef(0)
  // ステージ別「一度でも異変が起きたか」フラグ
  const anomalyEverFiredRef = useRef<Record<number, boolean>>({})
  // デバッグ予約：次の異変タイミングで強制発動するID
  const reservedAnomalyIdRef = useRef<string | null>(null)
  // デバッグ用：タイピング速度倍率（1=標準, 2=2倍速…）。大きいほど速い
  const speedRef = useRef(1)
  // 現在書いている位置（停止→再開で使う）
  const cursorRef = useRef<{ stageIdx: number; lineIdx: number }>({ stageIdx: 0, lineIdx: 0 })

  /** デバッグ用：次の異変タイミングで指定IDを強制発動 */
  const reserveAnomaly = useCallback((anomalyId: string) => {
    reservedAnomalyIdRef.current = anomalyId
  }, [])

  /** 速度倍率を config に適用（倍率が大きいほど各 pause が短くなる） */
  const applySpeed = (config: TypingConfig): TypingConfig => {
    const m = speedRef.current
    if (m === 1) return config
    return {
      charInterval:   Math.max(1, Math.round(config.charInterval   / m)),
      commaPause:     Math.max(1, Math.round(config.commaPause     / m)),
      periodPause:    Math.max(1, Math.round(config.periodPause    / m)),
      lineBreakPause: Math.max(1, Math.round(config.lineBreakPause / m)),
      blockPause:     Math.max(1, Math.round(config.blockPause     / m)),
    }
  }

  /** デバッグ用：速度倍率を設定（次に生成されるタスクから反映） */
  const setSpeed = useCallback((multiplier: number) => {
    speedRef.current = multiplier
  }, [])

  const clearTimer = () => {
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  // ─── 通常ステージ：lineIdx から書き始める ─────────────────────────────────
  const runFromLine = useCallback((stageIdx: number, startLineIdx: number) => {
    // 新しいループ世代を発行。これ以前に走っていたループは自滅する
    const myGen = ++generationRef.current
    const isAlive = () => generationRef.current === myGen
    console.log('%c[ENGINE] runFromLine(stage=%d, startLine=%d) 全%d行 gen=%d', 'color:#4caf50', stageIdx, startLineIdx, stages[stageIdx]?.lines.length, myGen)
    if (stoppedRef.current) return
    const stage = stages[stageIdx]
    if (!stage) { callbacks.onAllStagesComplete(); return }

    pausedRef.current = false
    const baseConfig = PHASE_CONFIG[stage.phase] ?? PHASE_CONFIG.normal
    let lineIdx = startLineIdx
    function fireAnomaly(anomaly: Anomaly, onDone: () => void) {
      anomalyEverFiredRef.current[stageIdx] = true
      const config = applySpeed(baseConfig)

      const finishAnomaly = () => {
        // 異変ブロックを最後まで書き終えた → 指摘ブロックの解除などを通知
        callbacks.onAnomalyBlocksDone()
        // マルチフェーズ／ビデオスクリプト異変は、ここで正常文へ進まずエンジンを止める。
        // 演出が終わって削除・巻き戻し後に resumeFromLine で再開する
        if (anomaly.isMultiPhase || anomaly.isVideoScript) {
          pausedRef.current = true
          return
        }
        // 異変が正常文の代わりを果たす場合、対応する正常行をスキップする
        // （例：A1-07 は「母は春から〜」を反復するので、その正常行を二重に書かない）
        if (anomaly.skipNormalLines && anomaly.skipNormalLines > 0) {
          lineIdx += anomaly.skipNormalLines
          cursorRef.current = { stageIdx, lineIdx }
        }
        // 異変を終えて正常の文章を書き始める前に必ず1秒待つ（全異変共通）
        timerRef.current = setTimeout(onDone, ANOMALY_TO_NORMAL_DELAY_MS)
      }

      // ブロック列を、特別な合図（fontShuffleStart / bloodBleedStart / trailingPause）の
      // 境界で区切りながら順番に書く。境界ブロックを書き終えるたびに対応する処理を行う
      const writeBlocksFrom = (blocks: typeof anomaly.blocks, from: number) => {
        if (from >= blocks.length) { finishAnomaly(); return }
        // from 以降で最初に「境界」となるブロックを探す
        let cut = -1
        for (let i = from; i < blocks.length; i++) {
          const b = blocks[i]
          if (b.type === 'text' && (b.fontShuffleStart || b.bloodBleedStart || b.textGlitchStart || b.darkenStart || b.trailingPause)) {
            cut = i
            break
          }
        }
        const end = cut >= 0 ? cut + 1 : blocks.length
        const group = blocks.slice(from, end)
        const tasks = buildTasksFromBlocks(group, config)
        runTasks(tasks, timerRef, pausedRef, stoppedRef, callbacks, () => {
          const b = cut >= 0 ? blocks[cut] : null
          if (b && b.type === 'text' && b.fontShuffleStart) callbacks.onFontShuffleStart()
          if (b && b.type === 'text' && b.bloodBleedStart) callbacks.onBloodBleedStart()
          if (b && b.type === 'text' && b.textGlitchStart) callbacks.onTextGlitchStart()
          if (b && b.type === 'text' && b.darkenStart) callbacks.onDarkenStart()
          const extra = b && b.type === 'text' && b.trailingPause ? b.trailingPause : 0
          if (end >= blocks.length) {
            if (extra > 0) { timerRef.current = setTimeout(finishAnomaly, extra); return }
            finishAnomaly()
            return
          }
          timerRef.current = setTimeout(() => writeBlocksFrom(blocks, end), extra)
        }, isAlive)
      }

      const writeAnomalyBlocks = () => writeBlocksFrom(anomaly.blocks, 0)

      // 既存の正常行へ「左→右の打ち消し線」を引いてから、続きのブロックを書く
      if (anomaly.strikeThroughAll) {
        // 全テキスト行（過去ステージ含む）を下から上へ順に塗りつぶす。
        // ある程度塗りが進んでから「もう書けない。」を書き始める
        callbacks.applyStrikeThroughAll()
        timerRef.current = setTimeout(writeAnomalyBlocks, 900)
      } else if (anomaly.strikeThroughLineId) {
        const ids = Array.isArray(anomaly.strikeThroughLineId)
          ? anomaly.strikeThroughLineId
          : [anomaly.strikeThroughLineId]
        ids.forEach((id) => callbacks.applyStrikeThrough(id))
        // 打ち消し線アニメ（約0.12s）を見せてから続きを書き始める
        timerRef.current = setTimeout(writeAnomalyBlocks, 250)
      } else {
        writeAnomalyBlocks()
      }
    }

    function nextLine() {
      if (!isAlive()) return
      if (stoppedRef.current || pausedRef.current) return

      if (lineIdx >= stage.lines.length) {
        callbacks.onStageComplete(stageIdx)
        pausedRef.current = true
        return
      }

      // 速度倍率を都度反映（早送りを途中から効かせる）
      const config = applySpeed(baseConfig)
      cursorRef.current = { stageIdx, lineIdx }
      const line = stage.lines[lineIdx]
      console.log('%c[ENGINE]   行書込 line=%d id=%s gen=%d', 'color:#4caf50', lineIdx, line.id, myGen)
      // 正常行のみ「迷い（書いて消す）」演出を有効化
      const tasks = buildTasksFromBlocks([line.block], config, true)

      runTasks(tasks, timerRef, pausedRef, stoppedRef, callbacks, () => {
        if (!isAlive()) return
        callbacks.onLineWritten(stageIdx, lineIdx)
        const writtenLineId = line.id
        lineIdx++
        // 行を書き終えた → カーソルを次の行へ進める。
        // 行間の待ち中に停止した場合、再開はこの次行から始まる（書き終えた行を書き直さない）
        cursorRef.current = { stageIdx, lineIdx }

        // デバッグ予約があれば、トリガー行に到達したときだけ発動する。
        // トリガー判定は副作用のない getAnomalyTriggerLineId で行う
        // （onFixedAnomalyTrigger は呼ぶだけで usedAnomalyIds に登録してしまうため、
        //  トリガー行より手前で呼ぶと到達前に「使用済み」になり発火しなくなる）
        const reservedId = reservedAnomalyIdRef.current
        if (reservedId) {
          const triggerLineId = callbacks.getAnomalyTriggerLineId(reservedId)
          if (triggerLineId === writtenLineId) {
            const reserved = callbacks.onFixedAnomalyTrigger(reservedId)
            if (reserved && reserved.blocks.length > 0) {
              reservedAnomalyIdRef.current = null
              fireAnomaly(reserved, nextLine)
              return
            }
          }
          // 予約中はトリガー行に着くまで他の異変を一切発火させず素通りする
          // （途中で別の異変が出ると予約異変まで到達できないため）
          timerRef.current = setTimeout(nextLine, config.blockPause)
          return
        }

        // 通常：この行IDをトリガーとする異変を選ぶ
        // mustFire（必ず発生）異変がある行は確率抽選を無視して必ず発火させる
        const everFired = anomalyEverFiredRef.current[stageIdx] ?? false
        const prob = everFired ? 0.60 : 1.0
        const mustFire = callbacks.hasMustFireAnomaly(stage.id, writtenLineId)
        if (mustFire || Math.random() < prob) {
          const anomaly = callbacks.onAnomalyTrigger(stage.id, writtenLineId)
          if (anomaly && anomaly.blocks.length > 0) {
            fireAnomaly(anomaly, nextLine)
            return
          }
        }

        // カモフラージュ：正常文でもたまに少し書くのを止める
        // （異変後の1秒待機を「作者がときどき手を止める」ものに見せかける）
        const extraPause = Math.random() < NORMAL_PAUSE_PROBABILITY ? NORMAL_PAUSE_MS : 0
        timerRef.current = setTimeout(nextLine, config.blockPause + extraPause)
      }, isAlive)
    }

    // ステージ先頭から始めるときは、最初の行を書く前にステージ開始異変があれば発火する。
    // （先頭の正常行そのものを異変が置き換えるケース。デバッグ予約中は割り込ませない）
    function startFirstStep() {
      if (!isAlive()) return
      if (stoppedRef.current || pausedRef.current) return
      if (startLineIdx === 0 && !reservedAnomalyIdRef.current) {
        const anomaly = callbacks.onAnomalyTrigger(stage.id, STAGE_START_LINE_ID)
        if (anomaly && anomaly.blocks.length > 0) {
          fireAnomaly(anomaly, nextLine)
          return
        }
      }
      nextLine()
    }

    timerRef.current = setTimeout(startFirstStep, startLineIdx === 0 ? 600 : 300)
  }, [stages, callbacks])

  // ─── 外部 API ────────────────────────────────────────────────────────────

  /** ステージを最初から開始 */
  const startStage = useCallback((stageIdx: number) => {
    console.log('%c[ENGINE] startStage(%d) stageId=%s', 'color:#009688;font-weight:bold', stageIdx, stages[stageIdx]?.id)
    // 既存ループを確実に殺す（世代+1）＋タイマー停止
    generationRef.current++
    clearTimer()
    stoppedRef.current = false
    // 新しいステージ開始時にそのステージの異変フラグをリセット
    anomalyEverFiredRef.current[stageIdx] = false
    runFromLine(stageIdx, 0)
  }, [stages, runFromLine])

  /** 指摘後：lineIdx から再開（異変ブロックはすでに削除済み） */
  const resumeFromLine = useCallback((stageIdx: number, lineIdx: number) => {
    console.log('%c[ENGINE] resumeFromLine(stage=%d, line=%d) stageId=%s', 'color:#4caf50;font-weight:bold', stageIdx, lineIdx, stages[stageIdx]?.id)
    // 既存ループを確実に殺す（世代+1）＋タイマー停止
    generationRef.current++
    clearTimer()
    stoppedRef.current = false
    const stage = stages[stageIdx]
    if (!stage) return

    // 異変発生行の次から再開（stage-5 も通常システムで扱う）
    runFromLine(stageIdx, lineIdx)
  }, [stages, runFromLine])

  // pause/stop 時に世代を上げ、走行中の全ループを確実に無効化する
  const pause      = useCallback(() => { generationRef.current++; pausedRef.current = true;  clearTimer() }, [])
  const stopEngine = useCallback(() => { generationRef.current++; stoppedRef.current = true; clearTimer() }, [])

  /** デバッグ用：現在の行から執筆を再開する（pause で止めた位置から） */
  const resumeFromCurrent = useCallback(() => {
    const { stageIdx, lineIdx } = cursorRef.current
    stoppedRef.current = false
    runFromLine(stageIdx, lineIdx)
  }, [runFromLine])

  useEffect(() => () => clearTimer(), [])

  return { startStage, resumeFromLine, pause, stopEngine, reserveAnomaly, setSpeed, resumeFromCurrent }
}
