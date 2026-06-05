import { useEffect, useRef } from 'react'
import type { DocumentBlock } from '../types/document'
import { DocumentBlockRenderer } from './DocumentBlockRenderer'

// A4 @ 96dpi: 210mm = 794px, 297mm = 1123px
// 上下マージン各96px を引いた印字領域高さ
const PAGE_CONTENT_HEIGHT = 1123 - 96 * 2  // ≒ 931px

type Props = {
  blocks: DocumentBlock[]
  isStopped: boolean
  suppressAutoScroll?: boolean
}

export function DocumentView({ blocks, isStopped, suppressAutoScroll }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // マルチフェーズ演出中は末尾への自動スクロールを抑止（手動スクロールを尊重）
    if (suppressAutoScroll) return
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [blocks.length, suppressAutoScroll])

  // ブロックをページに振り分ける（推定行数ベース）
  // 実際のレイアウトエンジンを使わず、固定高さのページを積み上げて
  // 全ブロックを最後のページに流し込む。ページ区切り線は飾り。
  const pages = splitIntoPages(blocks)

  // 最後のブロックがテキストなら、その文末にカーソルを埋め込む。
  // それ以外（spacer 等＝改行直後・空）はブロックの外（次行・左端）に出す。
  const lastBlock = blocks[blocks.length - 1]
  const cursorInLastText = lastBlock?.type === 'text'
  const cursorClass = `cursor${isStopped ? ' stopped' : ''}`

  return (
    <div className="doc-paper">
      {pages.map((pageBlocks, pageIdx) => {
        const isLastPage = pageIdx === pages.length - 1
        return (
          <div key={pageIdx} className="doc-page">
            <div className="doc-body" id={isLastPage ? 'document-body' : undefined}>
              {pageBlocks.map((block, i) => {
                const isLastBlockOfDoc =
                  isLastPage && i === pageBlocks.length - 1
                return (
                  <DocumentBlockRenderer
                    key={block.id}
                    block={block}
                    cursorClass={isLastBlockOfDoc && cursorInLastText ? cursorClass : undefined}
                  />
                )
              })}
              {isLastPage && (
                <>
                  {/* 末尾がテキストでない（改行直後・空）ときだけブロック外にカーソルを出す */}
                  {!cursorInLastText && (
                    <span className={cursorClass} aria-hidden="true" />
                  )}
                  <div ref={endRef} />
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// テキストブロックの文字数から推定高さを計算してページ分割する
// 1ページの印字高さ = PAGE_CONTENT_HEIGHT px
// 1行の高さ = 14.67px * 1.75 ≒ 25.7px
// 1行の文字数 = 624px / 14.67px ≒ 42文字（横幅624px = 816 - 96*2）
const LINE_HEIGHT_PX = 14.67 * 1.75
const CHARS_PER_LINE = 42

function estimateBlockHeight(block: DocumentBlock): number {
  if (block.type === 'text') {
    const lines = Math.ceil((block.text.length || 1) / CHARS_PER_LINE)
    return lines * LINE_HEIGHT_PX + 8 // 下マージン
  }
  if (block.type === 'image') return 220
  if (block.type === 'spacer') return block.height
  if (block.type === 'table') return 80
  return LINE_HEIGHT_PX
}

function splitIntoPages(blocks: DocumentBlock[]): DocumentBlock[][] {
  if (blocks.length === 0) return [[]]

  const pages: DocumentBlock[][] = [[]]
  let currentHeight = 0
  // inlineChain で1行に連続するブロックは、1ブロック=1行と数えると高さを
  // 過大に見積もって不要な改ページが起きる。連続する文字数を貯めて行数換算する
  let inlineCharCarry = 0

  for (const block of blocks) {
    const isInline = block.type === 'text' && block.inlineChain
    let h: number
    if (isInline) {
      // この inline ブロックを足した時点での連続文字数から高さの増分を出す
      const before = Math.ceil((inlineCharCarry || 1) / CHARS_PER_LINE)
      inlineCharCarry += block.text.length
      const after = Math.ceil((inlineCharCarry || 1) / CHARS_PER_LINE)
      h = (after - before) * LINE_HEIGHT_PX
    } else {
      inlineCharCarry = 0
      h = estimateBlockHeight(block)
    }
    if (currentHeight + h > PAGE_CONTENT_HEIGHT && pages[pages.length - 1].length > 0) {
      pages.push([])
      currentHeight = 0
    }
    pages[pages.length - 1].push(block)
    currentHeight += h
  }

  return pages
}
