import { useEffect, useRef } from 'react'
import type { CommentItem } from '../types/document'
import { useGlitch } from '../lib/glitchContext'
import { glitchText } from '../lib/textGlitch'

type Props = {
  comments: CommentItem[]
  hidden: boolean
  danger: boolean
}

export function CommentPanel({ comments, hidden, danger }: Props) {
  const g = useGlitch()
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // 新しいコメントが追加されたら、パネルを最下部までスクロールする
    const panel = panelRef.current
    if (panel) {
      panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' })
    }
  }, [comments.length])

  return (
    <aside ref={panelRef} className={`comment-panel${danger ? ' danger' : ''}${hidden ? ' hidden' : ''}`}>
      {comments.map((c) => (
        <div className={`comment-card${c.isAccuse ? ' accuse' : ''}${c.isBlocked ? ' blocked' : ''}`} key={c.id}>
          {c.editorText && (
            <div className="comment-editor-text">
              <span className="comment-label">{glitchText('編集コメント', g)}</span>
              <p>{glitchText(c.editorText, g)}</p>
              <span className="comment-time">{c.timestamp}</span>
            </div>
          )}
          {/* 作者返信はホラー演出のときだけ表示。連投コメントは「作者」ラベルを出さない */}
          {c.isHorror && c.authorReply && (
            <div className="comment-author-reply">
              {!c.isBlocked && <span className="comment-label">{glitchText('作者', g)}</span>}
              <p style={{ whiteSpace: 'pre-line' }}>{glitchText(c.authorReply, g)}</p>
              <span className="comment-time">{c.timestamp}</span>
            </div>
          )}
        </div>
      ))}
    </aside>
  )
}
