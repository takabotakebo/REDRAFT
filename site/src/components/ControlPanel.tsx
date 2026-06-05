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
  showShare: boolean
  accuseGlitch?: boolean
  accuseDisabled?: boolean
}

export function ControlPanel({ phase, isFinalStage, anomalyMissed, onAccuse, onConfirm, onRetry, onReset, onRestartStage, showShare, accuseGlitch, accuseDisabled }: Props) {
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
