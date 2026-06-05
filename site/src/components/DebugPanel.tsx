import { useState } from 'react'
import { stages } from '../data/stages'
import { anomalies } from '../data/anomalies'
import type { GameState } from '../types/game'

type Props = {
  state: GameState
  onJumpToStage: (stageIdx: number) => void
  onJumpToEnding: () => void
  onReserveAnomaly: (anomalyId: string) => void
  onStopEngine: () => void
  onStartStage: (stageIdx: number) => void
  onPause: () => void
  onResume: () => void
  onSetSpeed: (multiplier: number) => void
}

const SPEED_OPTIONS = [1, 2, 4, 8]

export function DebugPanel({ state, onJumpToStage, onJumpToEnding, onReserveAnomaly, onStopEngine, onStartStage, onPause, onResume, onSetSpeed }: Props) {
  const [open, setOpen] = useState(false)
  const [alert, setAlert] = useState('')
  const [reserved, setReserved] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)

  const currentStage = stages[state.currentStageIndex]

  // 各異変のトリガー行インデックスと現在の行を比較
  function isAnomalyPast(anomalyId: string): boolean {
    const anomaly = anomalies.find((a) => a.id === anomalyId)
    if (!anomaly || !currentStage) return false
    const triggerIdx = currentStage.lines.findIndex((l) => l.id === anomaly.triggerAfterLineId)
    if (triggerIdx < 0) return false
    return state.nextLineIndex > triggerIdx
  }

  function showAlert(msg: string) {
    setAlert(msg)
    setTimeout(() => setAlert(''), 3000)
  }

  function handleReserveAnomaly(anomalyId: string) {
    if (state.phase !== 'writing') {
      showAlert('書き込み中でないと予約できません')
      return
    }
    if (state.usedAnomalyIds.includes(anomalyId)) {
      showAlert('この異変は使用済みです')
      return
    }
    if (isAnomalyPast(anomalyId)) {
      showAlert('異変開始位置を過ぎています')
      return
    }
    // 予約済みでも上書き可能
    setAlert('')
    setReserved(anomalyId)
    onReserveAnomaly(anomalyId)
    setTimeout(() => setReserved(null), 10000)
  }

  function handleJump(stageIdx: number) {
    setAlert('')
    onStopEngine()
    onJumpToStage(stageIdx)
    setTimeout(() => onStartStage(stageIdx), 100)
  }

  function handlePauseToggle() {
    if (paused) {
      onResume()
      setPaused(false)
    } else {
      onPause()
      setPaused(true)
    }
  }

  function handleSetSpeed(m: number) {
    setSpeed(m)
    onSetSpeed(m)
  }

  const stageAnomalies = anomalies
    .filter((a) => currentStage ? a.stageIds.includes(currentStage.id) : false)
    .sort((a, b) => {
      // triggerAfterLineId の行インデックスでソート
      if (!currentStage) return 0
      const idxA = currentStage.lines.findIndex((l) => l.id === a.triggerAfterLineId)
      const idxB = currentStage.lines.findIndex((l) => l.id === b.triggerAfterLineId)
      return idxA - idxB
    })

  return (
    <div className="debug-panel-wrap">
      <button className="debug-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? '▼ DEBUG' : '▲ DEBUG'}
      </button>

      {open && (
        <div className="debug-panel">
          {/* ステージ選択 */}
          <div className="debug-section">
            <div className="debug-section-title">ステージジャンプ</div>
            <div className="debug-stage-list">
              {stages.map((s, i) => (
                <button
                  key={s.id}
                  className={`debug-btn-stage${state.currentStageIndex === i ? ' active' : ''}`}
                  onClick={() => handleJump(i)}
                >
                  {i + 1}. {s.heading}
                </button>
              ))}
              <button
                className="debug-btn-stage debug-btn-ending"
                onClick={onJumpToEnding}
              >
                ★ エンディング直前（確定待ち）
              </button>
            </div>
          </div>

          {/* 現在の状態 */}
          <div className="debug-section">
            <div className="debug-section-title">現在の状態</div>
            <div className="debug-info">
              <span>phase: <b>{state.phase}</b></span>
              <span>line: <b>{state.nextLineIndex}</b> / {currentStage?.lines.length ?? '?'}</span>
              <span>isAnomalyActive: <b>{String(state.isAnomalyActive)}</b></span>
            </div>
          </div>

          {/* 再生コントロール */}
          <div className="debug-section">
            <div className="debug-section-title">再生コントロール</div>
            <div className="debug-playback">
              <button
                className={`debug-btn-playback${paused ? ' paused' : ''}`}
                onClick={handlePauseToggle}
              >
                {paused ? '▶ 再開' : '⏸ 停止'}
              </button>
              <div className="debug-speed">
                <span className="debug-speed-label">速度</span>
                {SPEED_OPTIONS.map((m) => (
                  <button
                    key={m}
                    className={`debug-btn-speed${speed === m ? ' active' : ''}`}
                    onClick={() => handleSetSpeed(m)}
                  >
                    ×{m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 異変一覧 */}
          <div className="debug-section">
            <div className="debug-section-title">
              異変（{currentStage?.heading ?? '-'}）
            </div>
            {alert && <div className="debug-alert">{alert}</div>}
            <div className="debug-anomaly-list">
              {stageAnomalies.length === 0 && (
                <span className="debug-empty">このステージに異変はありません</span>
              )}
              {stageAnomalies.map((a) => {
                const isPastThisAnomaly = isAnomalyPast(a.id)
                const isUsed = state.usedAnomalyIds.includes(a.id)
                const cls = [
                  'debug-btn-anomaly',
                  reserved === a.id ? 'reserved' : '',
                  isUsed ? 'used' : (isPastThisAnomaly ? 'past' : 'available'),
                ].filter(Boolean).join(' ')
                // 開始位置のテキスト（anomaly.triggerAfterLineId の行テキスト）
                const triggerLineIdx = currentStage
                  ? currentStage.lines.findIndex((l) => l.id === a.triggerAfterLineId)
                  : -1
                const triggerLine = triggerLineIdx >= 0
                  ? currentStage?.lines[triggerLineIdx]?.block
                  : null
                const triggerText = triggerLine?.type === 'text'
                  ? triggerLine.text.slice(0, 24) + (triggerLine.text.length > 24 ? '…' : '')
                  : ''
                return (
                  <button
                    key={a.id}
                    className={cls}
                    onClick={() => handleReserveAnomaly(a.id)}
                    title={isUsed ? '使用済み（二度と発生しない）' : (isPastThisAnomaly ? '開始位置を通過済み' : a.id)}
                  >
                    <div className="debug-anomaly-row">
                      <span className="debug-anomaly-status">
                        {reserved === a.id ? '⏳' : isUsed ? '✓' : isPastThisAnomaly ? '✕' : '▶'}
                      </span>
                      <span className="debug-anomaly-id">{a.id}</span>
                      <span className="debug-anomaly-name">{a.name}</span>
                      {isUsed && <span className="debug-anomaly-used-tag">使用済み</span>}
                    </div>
                    {triggerText && (
                      <div className="debug-anomaly-trigger">開始：{triggerText}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
