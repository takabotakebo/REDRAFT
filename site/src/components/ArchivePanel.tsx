import { useState } from 'react'
import { archiveChapters } from '../data/archive'
import type { ArchiveEntry } from '../data/archive'
import { stages } from '../data/stages'

type Props = {
  open: boolean
  onClose: () => void
  seenAnomalyIds: string[]
  reachedStageIds: string[]
  onJumpToStage: (stageIdx: number) => void
}

// stageId → アウトライン表示（「1.夕方の部屋」）に変換する
function outlineLabel(stageId: string): string {
  const idx = stages.findIndex((s) => s.id === stageId)
  if (idx < 0) return stageId
  return `${idx + 1}.${stages[idx].heading}`
}

export function ArchivePanel({ open, onClose, seenAnomalyIds, reachedStageIds, onJumpToStage }: Props) {
  // 拡大表示中の異変（null なら拡大なし）
  const [zoom, setZoom] = useState<ArchiveEntry | null>(null)

  if (!open) return null

  const seen = new Set(seenAnomalyIds)
  const reached = new Set(reachedStageIds)
  // 到達済みの章だけ表示する
  const visibleChapters = archiveChapters.filter((c) => reached.has(c.stageId))

  return (
    <div className="archive-overlay" onClick={onClose}>
      <div className="archive-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="archive-header">
          <h2 className="archive-title">赤入れ修正履歴</h2>
          <button className="archive-close" onClick={onClose} aria-label="閉じる" title="閉じる">×</button>
        </div>

        <div className="archive-body">
          {visibleChapters.length === 0 && (
            <p className="archive-empty">まだ記録された異変はありません。</p>
          )}

          {visibleChapters.map((chapter) => {
            const stageIdx = stages.findIndex((s) => s.id === chapter.stageId)
            return (
            <section className="archive-chapter" key={chapter.stageId}>
              <div className="archive-chapter-head">
                <h3 className="archive-chapter-label">{outlineLabel(chapter.stageId)}</h3>
                <button
                  className="archive-jump-btn"
                  onClick={() => { onClose(); onJumpToStage(stageIdx) }}
                  aria-label={`${outlineLabel(chapter.stageId)} へ移動`}
                  title="この章へ移動"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="archive-grid">
                {chapter.entries.map((entry) => {
                  const isSeen = seen.has(entry.id)
                  return (
                    <div className="archive-cell" key={entry.id}>
                      {isSeen ? (
                        <button
                          className="archive-thumb"
                          onClick={() => setZoom(entry)}
                          title={entry.displayName}
                        >
                          <img src={entry.image} alt={entry.displayName} loading="lazy" />
                        </button>
                      ) : (
                        <div className="archive-thumb archive-thumb-locked" aria-hidden="true">
                          <span>まだ確認していません</span>
                        </div>
                      )}
                      <span className={`archive-name${isSeen ? '' : ' locked'}`}>
                        {isSeen ? entry.displayName : '???'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
            )
          })}
        </div>
      </div>

      {/* 拡大表示（ライトボックス）：背景・×どちらでも閉じる。
          クリックは親（archive-overlay の onClose）へ伝播させない */}
      {zoom && (
        <div className="archive-lightbox" onClick={(e) => { e.stopPropagation(); setZoom(null) }}>
          <button className="archive-lightbox-close" onClick={(e) => { e.stopPropagation(); setZoom(null) }} aria-label="閉じる">×</button>
          <figure className="archive-lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={zoom.image} alt={zoom.displayName} />
            <figcaption>{zoom.displayName}</figcaption>
          </figure>
        </div>
      )}
    </div>
  )
}
