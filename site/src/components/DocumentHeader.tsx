import { useGlitch } from '../lib/glitchContext'
import { glitchText } from '../lib/textGlitch'

type Props = {
  title: string
  saveStatus: string
  isReadOnly: boolean
  onHistory?: () => void
  onVideo?: () => void
  videoActive?: boolean
}

export function DocumentHeader({ title, saveStatus, isReadOnly, onHistory, onVideo, videoActive }: Props) {
  const g = useGlitch()
  return (
    <header className="doc-header">
      <div className="doc-header-left">
        <div className="doc-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="2" width="16" height="20" rx="2" fill="#4a8cf7" />
            <rect x="7" y="7" width="10" height="1.5" rx="0.75" fill="white" />
            <rect x="7" y="10.5" width="10" height="1.5" rx="0.75" fill="white" />
            <rect x="7" y="14" width="7" height="1.5" rx="0.75" fill="white" />
          </svg>
        </div>
        <span className="doc-title" id="doc-title">{glitchText(title, g)}</span>
      </div>
      <div className="doc-header-right">
        <span className="doc-save-status" id="save-status">{glitchText(saveStatus, g)}</span>
        {/* 履歴（時計）ボタン */}
        <button className="doc-header-btn" onClick={onHistory} aria-label="履歴" title="変更履歴">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v5h5" />
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
            <path d="M12 7v5l3 2" />
          </svg>
        </button>
        {/* ビデオ通話ボタン（目立つ角丸枠。通話中は赤くなる） */}
        <button className={`doc-header-btn-video${videoActive ? ' active' : ''}`} onClick={onVideo} aria-label="ビデオ通話" title="ビデオ通話">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={videoActive ? '#d93025' : '#5f6368'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="14" height="12" rx="2" />
            <path d="M22 8l-6 4 6 4V8z" />
          </svg>
        </button>
        <span className="doc-share-label">{glitchText('共有リンクで閲覧中', g)}</span>
        <span className="doc-viewer-count">{glitchText('閲覧者 1', g)}</span>
        {isReadOnly && <span className="doc-readonly-badge">閲覧専用</span>}
      </div>
    </header>
  )
}
