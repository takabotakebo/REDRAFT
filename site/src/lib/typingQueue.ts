import type { DocumentBlock } from '../types/document'
import type { TypingConfig } from '../types/game'
import { glitchCharPause } from './dreamGlitch'

export type TypingTask =
  | { kind: 'char'; blockId: string; char: string; pause: number }
  | { kind: 'captionChar'; blockId: string; char: string; pause: number }
  | { kind: 'redact'; blockId: string }
  | { kind: 'backspace'; blockId: string; pause: number }
  | { kind: 'addBlock'; block: DocumentBlock }
  | { kind: 'removeBlock'; blockId: string }
  | { kind: 'wait'; ms: number }

const PUNCT_COMMA = /[、，,]/
const PUNCT_PERIOD = /[。．.！!？?]/
const PUNCT_BREAK = /\n/

// 「迷い」演出が発生する確率（テキストブロック1つあたり）
const HESITATION_PROBABILITY = 0.18
// 書いて消す文字数の範囲
const HESITATION_MIN_CHARS = 2
const HESITATION_MAX_CHARS = 4

// config の各 pause を倍率で短縮（倍率が大きいほど速い）
function scaleConfig(config: TypingConfig, multiplier: number): TypingConfig {
  return {
    charInterval:   Math.max(1, Math.round(config.charInterval   / multiplier)),
    commaPause:     Math.max(1, Math.round(config.commaPause     / multiplier)),
    periodPause:    Math.max(1, Math.round(config.periodPause    / multiplier)),
    lineBreakPause: Math.max(1, Math.round(config.lineBreakPause / multiplier)),
    blockPause:     Math.max(1, Math.round(config.blockPause     / multiplier)),
  }
}

function charPause(ch: string, config: TypingConfig): number {
  if (PUNCT_COMMA.test(ch)) return config.commaPause
  if (PUNCT_PERIOD.test(ch)) return config.periodPause
  if (PUNCT_BREAK.test(ch)) return config.lineBreakPause
  return config.charInterval
}

export function buildTasksFromBlocks(
  blocks: DocumentBlock[],
  config: TypingConfig,
  enableHesitation = false,
): TypingTask[] {
  const tasks: TypingTask[] = []

  for (const block of blocks) {
    if (block.type === 'text') {
      // このブロックを書き始める前に少し止まる（「ためてから一気に書く」演出）
      if (block.leadingPause && block.leadingPause > 0) {
        tasks.push({ kind: 'wait', ms: block.leadingPause })
      }
      // 「書いては消す」演出：1回目は全文、2回目以降はランダムな位置まで書いて消す。
      // これを rewriteCount 回繰り返し、最後に全文を書いて残す
      if (block.type === 'text' && block.rewriteCount && block.rewriteCount > 0) {
        const chars = [...block.text]
        tasks.push({ kind: 'addBlock', block: { ...block, text: '' } })
        for (let r = 0; r < block.rewriteCount; r++) {
          // 1回目は全文。2回目以降は全長の30〜90%のランダムな位置まで書く
          const writeLen = r === 0
            ? chars.length
            : Math.max(1, Math.round(chars.length * (0.3 + Math.random() * 0.6)))
          for (let i = 0; i < writeLen; i++) {
            const ch = chars[i]
            tasks.push({ kind: 'char', blockId: block.id, char: ch, pause: charPause(ch, config) })
          }
          // 少し止まってから書いた分だけ消す
          tasks.push({ kind: 'wait', ms: 300 + Math.floor(Math.random() * 300) })
          for (let k = 0; k < writeLen; k++) {
            tasks.push({ kind: 'backspace', blockId: block.id, pause: 18 })
          }
          // 仕切り直しの間
          tasks.push({ kind: 'wait', ms: 200 + Math.floor(Math.random() * 200) })
        }
        // 最後に書いて残すテキスト（未指定なら全文。未完の文を残したいときは rewriteFinalText）
        const finalChars = block.rewriteFinalText != null ? [...block.rewriteFinalText] : chars
        for (const ch of finalChars) {
          tasks.push({ kind: 'char', blockId: block.id, char: ch, pause: charPause(ch, config) })
        }
        tasks.push({ kind: 'wait', ms: config.blockPause })
        continue
      }

      tasks.push({ kind: 'addBlock', block: { ...block, text: '' } })

      const chars = [...block.text]

      // ブロック個別の速度倍率。speedMultiplierEnd があれば文字位置で線形加速する。
      // 1文字目の位置に対応する倍率を返す（i / (length-1) で 0→1 を補間）
      const startMul = block.speedMultiplier ?? 1
      const endMul = block.speedMultiplierEnd ?? startMul
      const configAt = (i: number): TypingConfig => {
        if (startMul === 1 && endMul === 1) return config
        const t = chars.length > 1 ? i / (chars.length - 1) : 1
        const mul = startMul + (endMul - startMul) * t
        return mul > 1 ? scaleConfig(config, mul) : config
      }

      // この行のどこかで「迷い」を挟むか（行が十分長いときだけ）
      let hesitateAt = -1
      if (enableHesitation && chars.length >= 12 && Math.random() < HESITATION_PROBABILITY) {
        // 行の中盤あたり（句読点直後を避けるためざっくり）
        hesitateAt = Math.floor(chars.length * (0.3 + Math.random() * 0.4))
      }

      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i]
        const blockConfig = configAt(i)
        // 夢文は文字ごとに「普通〜速い」の4段階でランダムに速度が変わる
        const pause = block.dreamGlitch
          ? glitchCharPause(block.id, i, blockConfig.charInterval)
          : charPause(ch, blockConfig)
        tasks.push({ kind: 'char', blockId: block.id, char: ch, pause })

        // 迷いポイント：少し止まって → 数文字打って → 消して打ち直す
        if (i === hesitateAt) {
          // ためらいの間
          tasks.push({ kind: 'wait', ms: 250 + Math.floor(Math.random() * 350) })
          // 次に続く本来の文字を数文字「先打ち」して消す
          const n = HESITATION_MIN_CHARS + Math.floor(Math.random() * (HESITATION_MAX_CHARS - HESITATION_MIN_CHARS + 1))
          const lookahead = chars.slice(i + 1, i + 1 + n)
          for (const lch of lookahead) {
            tasks.push({ kind: 'char', blockId: block.id, char: lch, pause: blockConfig.charInterval })
          }
          // 少し止まってから消す
          tasks.push({ kind: 'wait', ms: 180 + Math.floor(Math.random() * 220) })
          for (let k = 0; k < lookahead.length; k++) {
            tasks.push({ kind: 'backspace', blockId: block.id, pause: 35 })
          }
          // 仕切り直しの間
          tasks.push({ kind: 'wait', ms: 150 + Math.floor(Math.random() * 200) })
        }
      }
      // 行末のポーズは最後の文字時点の倍率に合わせる
      tasks.push({ kind: 'wait', ms: configAt(Math.max(0, chars.length - 1)).blockPause })
      // 書き終えた行を黒帯（黒塗り）に変える演出
      if (block.dreamGlitch !== true && block.redactAfterType) {
        tasks.push({ kind: 'wait', ms: 250 })
        tasks.push({ kind: 'redact', blockId: block.id })
        tasks.push({ kind: 'wait', ms: 250 })
      }
    } else if (block.type === 'image' && block.caption && block.captionTyping) {
      // 画像本体（キャプションなし）を出してから、キャプションを1文字ずつ高速タイピングする
      tasks.push({ kind: 'addBlock', block: { ...block, caption: '' } })
      tasks.push({ kind: 'wait', ms: config.blockPause })
      const CAPTION_CHAR_MS = 12       // 1文字あたり（とても速い）
      const CAPTION_PUNCT_MS = 60      // 句読点だけ少しだけ溜める
      for (const ch of [...block.caption]) {
        const pause = (PUNCT_PERIOD.test(ch) || PUNCT_COMMA.test(ch)) ? CAPTION_PUNCT_MS : CAPTION_CHAR_MS
        tasks.push({ kind: 'captionChar', blockId: block.id, char: ch, pause })
      }
      tasks.push({ kind: 'wait', ms: config.blockPause })
    } else {
      tasks.push({ kind: 'addBlock', block })
      tasks.push({ kind: 'wait', ms: config.blockPause })
    }
  }

  return tasks
}
