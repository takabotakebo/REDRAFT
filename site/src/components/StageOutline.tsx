import { stages } from '../data/stages'
import { anomalies } from '../data/anomalies'
import { useGlitch } from '../lib/glitchContext'
import { glitchText } from '../lib/textGlitch'

// ゲーム全体で見つけうる異変の総数
const TOTAL_ANOMALIES = anomalies.length

type Props = {
  currentStageIndex: number
  confirmedStages: number[]
  phase: string
  foundAnomalies: number  // 指摘して見つけた異変の累計数
}

export function StageOutline({ currentStageIndex, confirmedStages, phase, foundAnomalies }: Props) {
  const g = useGlitch()
  return (
    <nav className="stage-outline">
      <div className="stage-outline-title">{glitchText('アウトライン', g)}</div>
      <ul className="stage-outline-list">
        {stages.map((stage, i) => {
          const isConfirmed = confirmedStages.includes(i)
          const isCurrent = i === currentStageIndex && phase !== 'idle'

          // 未到達（現在ステージより先 or まだ idle）は表示しない
          const isVisible = isConfirmed || isCurrent
          if (!isVisible) return null

          const cls = `stage-outline-item${isConfirmed ? ' confirmed' : ' current'}`

          return (
            <li key={stage.id} className={cls}>
              <span className="stage-outline-num">{i + 1}</span>
              <span className="stage-outline-heading">{glitchText(stage.heading, g)}</span>
            </li>
          )
        })}
      </ul>

      {/* 最下部：見つけた異変数 */}
      <div className="stage-outline-counter">
        <span className="stage-outline-counter-value">
          {foundAnomalies} / {TOTAL_ANOMALIES}
        </span>
      </div>
    </nav>
  )
}
