type Props = {
  fontName: string
  activeTool: string
}

import { useGlitch } from '../lib/glitchContext'
import { glitchText } from '../lib/textGlitch'

export function DocumentToolbar({ fontName, activeTool }: Props) {
  const g = useGlitch()
  return (
    <div className="doc-toolbar" aria-hidden="true">
      <span className="tb-font-name">{fontName || ' '}</span>
      <span className="tb-sep">▾</span>
      <span className="tb-divider" />
      <span className="tb-size">{glitchText('11', g)}</span>
      <span className="tb-sep">▾</span>
      <span className="tb-divider" />
      <span className={`tb-btn${activeTool === 'bold' ? ' active' : ''}`}>B</span>
      <span className="tb-btn tb-italic">I</span>
      <span className={`tb-btn${activeTool === 'strikethrough' ? ' active' : ''}`}>S̶</span>
      <span className="tb-btn">U</span>
      <span className="tb-divider" />
      <span className="tb-btn">A▾</span>
      <span className="tb-divider" />
      <span className="tb-btn">≡</span>
      <span className={`tb-btn${activeTool === 'center' ? ' active' : ''}`}>≡</span>
      <span className="tb-btn">≡</span>
    </div>
  )
}
