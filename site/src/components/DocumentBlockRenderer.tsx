import { useState } from 'react'
import type { DocumentBlock } from '../types/document'
import { glitchCharStyle } from '../lib/dreamGlitch'
import { useGlitch } from '../lib/glitchContext'
import { glitchText } from '../lib/textGlitch'

type Props = {
  block: DocumentBlock
  // 指定されると、このテキストブロックの文末に点滅カーソルを描画する
  cursorClass?: string
}

// 押しても遷移しないリンク風ボタン。クリックすると一瞬グリッチする
function GlitchLinkButton({ label }: { label: string }) {
  const [glitching, setGlitching] = useState(false)
  return (
    <button
      type="button"
      className={`doc-link-button${glitching ? ' glitching' : ''}`}
      onClick={() => {
        setGlitching(true)
        setTimeout(() => setGlitching(false), 450)
      }}
    >
      → {label}
    </button>
  )
}

export function DocumentBlockRenderer({ block, cursorClass }: Props) {
  const glitch = useGlitch()
  if (block.type === 'text') {
    const s = block.style ?? {}
    const style: React.CSSProperties = {
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      color: s.color,
      backgroundColor: s.backgroundColor,
      fontWeight: s.fontWeight,
      fontStyle: s.fontStyle,
      textDecoration: s.textDecoration,
      textAlign: s.textAlign,
      letterSpacing: s.letterSpacing,
      lineHeight: s.lineHeight,
      marginLeft: s.marginLeft,
      opacity: s.opacity,
    }
    const cls = ['doc-text-block', block.className].filter(Boolean).join(' ')

    // 黒塗り：書いた文字を隠して、連続した黒帯で覆う（左→右に塗られるアニメ）
    if (block._redacted) {
      const barCls = ['redacted-bar',
        block.redactWidth === 'overflow' ? 'redacted-overflow' : '',
        block.redactWidth === 'overflow-long' ? 'redacted-overflow-long' : '',
        block.redactWidth === 'screen' ? 'redacted-screen' : '',
      ].filter(Boolean).join(' ')
      return (
        <p className={`${cls} redacted`} style={style}>
          <span className={barCls}>{block.text}</span>
          {cursorClass && <span className={cursorClass} aria-hidden="true" />}
        </p>
      )
    }

    // 夢文：文字サイズがばらつき、たまに斜め・太字が混ざる。
    // 指摘ハイライト時も装飾（サイズ・傾き・太字）を保ったまま、
    // 一番大きい文字に合わせて行全体に選択マーカー（赤背景）を引く
    if (block.dreamGlitch) {
      const chars = [...block.text]
      // 文字ごとの装飾（サイズ・傾き・太字）は常に保持する。
      // ・行まるごと選択(_fullSelected)：行全体を赤背景に
      // ・部分選択(_selectedChars)：右からN文字を赤背景に（指摘アニメが右→左に進む）
      const selChars = block._selectedChars ?? 0
      const selFrom = selChars > 0 ? Math.max(0, chars.length - selChars) : chars.length
      const pCls = block._fullSelected ? `${cls} line-selected` : cls
      return (
        <p className={pCls} style={style}>
          {chars.map((ch, i) => (
            <span
              key={i}
              className={!block._fullSelected && i >= selFrom ? 'char-selected dream-mark' : undefined}
              style={glitchCharStyle(block.id, i)}
            >
              {ch}
            </span>
          ))}
          {cursorClass && <span className={cursorClass} aria-hidden="true" />}
        </p>
      )
    }

    // 左→右に打ち消し線を引くアニメーション（正常文に後から線が入る）
    if (block._strikeAnim) {
      const strikeCls = block._strikeFast ? 'strike-anim strike-fast' : 'strike-anim'
      return (
        <p className={cls} style={style}>
          <span className={strikeCls}>{block.text}</span>
          {cursorClass && <span className={cursorClass} aria-hidden="true" />}
        </p>
      )
    }

    // 行まるごと選択（起点より上の行）：行末の余白まで反転
    if (block._fullSelected) {
      return (
        <p className={`${cls} line-selected${block._whiteMark ? ' line-white' : ''}`} style={style}>
          {block.text}
        </p>
      )
    }

    // テキスト選択風ハイライト：右から _selectedChars 文字を選択色にする（選択起点の行）
    if (block._selectedChars && block._selectedChars > 0) {
      const chars = [...block.text]
      const selFrom = Math.max(0, chars.length - block._selectedChars)
      return (
        <p className={cls} style={style}>
          {chars.map((ch, i) => (
            <span key={i} className={i >= selFrom ? 'char-selected' : undefined}>
              {ch}
            </span>
          ))}
        </p>
      )
    }


    // インライン連結：段落で改行せず前のブロックと同じ行に続けて表示する
    if (block.inlineChain) {
      const inlineCls = ['doc-text-inline', cls, block._blooding ? 'blood-bleed' : '']
        .filter(Boolean).join(' ')
      return (
        <span className={inlineCls} style={style}>
          {block.bloodDrip
            ? [...block.text].map((ch, i) => <span key={i} className="blood-drip">{ch}</span>)
            : glitchText(block.text, glitch)}
          {cursorClass && <span className={cursorClass} aria-hidden="true" />}
        </span>
      )
    }

    // 血が下に垂れる演出（短い語に。1文字ずつ滴らせる）
    if (block.bloodDrip) {
      const chars = [...block.text]
      return (
        <p className={cls} style={style}>
          {chars.map((ch, i) => (
            <span key={i} className="blood-drip">{ch}</span>
          ))}
          {cursorClass && <span className={cursorClass} aria-hidden="true" />}
        </p>
      )
    }

    // 血でにじむ演出（薄いグレーの不穏描写が血色へにじむ）
    const bloodCls = block._blooding ? `${cls} blood-bleed` : cls
    return (
      <p id={`block-${block.id}`} className={bloodCls} style={style}>
        {glitchText(block.text, glitch)}
        {cursorClass && <span className={cursorClass} aria-hidden="true" />}
      </p>
    )
  }

  if (block.type === 'image') {
    const img = (
      <img
        src={block.src}
        alt={block.alt ?? ''}
        onError={(e) => {
          const el = e.currentTarget.parentElement
          if (el) el.classList.add('image-missing')
        }}
      />
    )
    return (
      <figure className="doc-image-block">
        {block._fullSelected ? (
          // 指摘アニメ：画像の上に選択色（テキストと同色）の半透明マーカーを重ねる
          <span className="image-mark-wrap">
            {img}
            <span className="image-mark-overlay" aria-hidden="true" />
          </span>
        ) : img}
        {block.caption && (
          <figcaption className="doc-image-caption">
            {block._fullSelected ? <span className="line-selected">{block.caption}</span> : block.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  if (block.type === 'table') {
    return (
      <table className="doc-table-block">
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (block.type === 'audio') {
    const cls = ['doc-audio-block', block._fullSelected ? 'line-selected' : '']
      .filter(Boolean).join(' ')
    return (
      <div className={cls}>
        {block.label && <div className="doc-audio-label">{block.label}</div>}
        <audio controls src={block.src} preload="metadata" />
      </div>
    )
  }

  if (block.type === 'linkButton') {
    const cls = `doc-link-button-wrap${block._fullSelected ? ' line-selected' : ''}`
    return (
      <div className={cls}>
        <GlitchLinkButton label={block.label} />
      </div>
    )
  }

  if (block.type === 'spacer') {
    return (
      <div
        id={`block-${block.id}`}
        className={block._fullSelected ? `spacer-marking${block._whiteMark ? ' spacer-marking-white' : ''}` : undefined}
        style={{ height: block.height }}
      />
    )
  }

  return null
}
