// 文字化け侵食を React 管理下で安全に行うためのユーティリティ。
// DOM を直接書き換えず、文字列を受け取って「一部を化け文字に置換した React 要素配列」を返す。

import type { ReactNode } from 'react'
import { createElement } from 'react'

const GLITCH_CHARS = [
  '繧', 'ゅ', '≧', '譖', 'ｸ', '縺', '代', '↑', '髮', 'ｻ', '霆', '翫',
  '′', '譚', '九', '繝', 'い', 'ｯ', '髢', '＞', '溘', '昴', 'ｌ', '〒',
  '吶', '°', '蟶', '荳', '繞', '骰', '黎', '黷', '矜', '矣', '彁', '彜',
  '□', '▓', '▒', '░', '×', '〓',
]

function randChar(): string {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
}

// text の各文字を progress(0〜1) の確率で化け文字に置換した ReactNode 配列を返す。
// 化けた文字は <span class="glitch-char"> で包んでアニメさせる。
// progress<=0 のときは元テキストをそのまま返す（毎回 new ノードを作らない）。
export function glitchText(text: string, progress: number): ReactNode {
  if (progress <= 0) return text
  const out: ReactNode[] = []
  let i = 0
  for (const ch of text) {
    if (ch.trim() !== '' && Math.random() < progress) {
      out.push(createElement('span', { key: i, className: 'glitch-char' }, randChar()))
    } else {
      out.push(ch)
    }
    i++
  }
  return out
}
