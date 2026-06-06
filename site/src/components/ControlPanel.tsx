import { useGlitch } from '../lib/glitchContext'
import { glitchText } from '../lib/textGlitch'

type Phase = 'idle' | 'writing' | 'stage_written' | 'ending'

type Props = {
  phase: Phase
  isFinalStage: boolean
  anomalyMissed: boolean
  onAccuse: () => void
  onConfirm: () => void
  onRetry: () => void
  onReset: () => void
  onRestartStage: () => void
  paused: boolean
  onPauseToggle: () => void
  showShare: boolean
  // 「この原稿を校了する」に一度でも到達した人に出す「修正履歴」ボタン
  showHistory: boolean
  onHistory: () => void
  accuseGlitch?: boolean
  accuseDisabled?: boolean
}

export function ControlPanel({ phase, isFinalStage, anomalyMissed, onAccuse, onConfirm, onRetry, onReset, onRestartStage, paused, onPauseToggle, showShare, showHistory, onHistory, accuseGlitch, accuseDisabled }: Props) {
  const g = useGlitch()
  const shareText = encodeURIComponent('指摘し続けました。原稿は完成しましたか？ #REDRAFT')
  const shareUrl = encodeURIComponent(window.location.origin + '/intro.html')
  const shareHref = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`

  const isEnding = phase === 'ending'

  return (
    <div className={`control-panel${isEnding ? ' ending' : ''}`}>
      {/* 左：はじめから／章のはじめから */}
      <div className="control-left">
        <button
          className="btn-reset"
          onClick={onReset}
          disabled={isEnding}
        >
          {glitchText('はじめから', g)}
        </button>
        <button
          className="btn-restart-stage"
          onClick={onRestartStage}
          disabled={isEnding}
        >
          {glitchText('章のはじめから', g)}
        </button>
      </div>

      {/* 校了に一度でも到達した人：中央ボタンの左に「修正履歴」ボタンを常設。
          control-center とは独立配置にして「指摘する」を画面中央からずらさない */}
      {showHistory && (
        <button className="btn-history" onClick={onHistory} title="赤入れ修正履歴">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3v5h5" />
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span>{glitchText('修正履歴', g)}</span>
        </button>
      )}

      {/* 中央：状態によって切り替え */}
      <div className="control-center">
        {/* phase === 'idle' のときは下部にボタンを出さない（起動ポップアップで開始する） */}
        {phase === 'writing' && (
          <button className={`btn-accuse${accuseGlitch ? ' glitching' : ''}`} onClick={onAccuse} disabled={accuseDisabled}>
            {glitchText('指摘する', g)}
          </button>
        )}
        {phase === 'stage_written' && !anomalyMissed && isFinalStage && (
          <button className="btn-confirm" onClick={() => { window.location.href = 'ending.html' }}>
            {glitchText('この原稿を校了する', g)}
          </button>
        )}
        {phase === 'stage_written' && !anomalyMissed && !isFinalStage && (
          <button className="btn-confirm" onClick={onConfirm}>
            {glitchText('ここまでの稿を確定する', g)}
          </button>
        )}
        {phase === 'stage_written' && anomalyMissed && (
          <button className="btn-retry" onClick={onRetry}>
            {glitchText('正しく指摘できなかったようだ', g)}
          </button>
        )}
        {isEnding && (
          <span className="btn-placeholder" />
        )}
      </div>

      {/* 一時停止：control-panel 基準で「指摘する」の右に絶対配置（指摘するを中央に保つ） */}
      {phase === 'writing' && (
        <button
          className={`btn-pause${paused ? ' paused' : ''}`}
          onClick={onPauseToggle}
          aria-label={paused ? '再開' : '一時停止'}
          title={paused ? '再開' : '一時停止'}
        >
          {paused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
          )}
        </button>
      )}

      {/* 右：シェアボタン */}
      <div className="control-right">
        {showShare && (
          <a
            className="btn-share"
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Xでシェア
          </a>
        )}
      </div>
    </div>
  )
}
