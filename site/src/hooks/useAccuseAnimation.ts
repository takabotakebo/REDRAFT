import { useCallback } from 'react'
import type { DocumentBlock, CommentItem } from '../types/document'

type Deps = {
  getLiveContent: () => DocumentBlock[]
  setLiveContent: (blocks: DocumentBlock[]) => void
  addComment: (comment: CommentItem) => void
  onDone: () => void
}

// 文字選択の速度（ms）：右から1文字ずつ選択していく間隔
const SELECT_CHAR_INTERVAL = 10
// コメント表示後の削除開始までの間（ms）
const COMMENT_PAUSE = 700
// バックスペース間隔（ms）: 文字削除
const BACKSPACE_CHAR_INTERVAL = 14
// バックスペース間隔（ms）: ブロック削除
const BACKSPACE_BLOCK_INTERVAL = 60

function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export function useAccuseAnimation(deps: Deps) {

  const runAnimation = useCallback((
    comment: CommentItem,
    deleteTargetIds: string[],
    onRewind: () => void,
  ) => {
    const live = deps.getLiveContent()
    // 渡されたIDのうち、実際に liveContent に存在するものだけを対象にする
    const liveIds = new Set(live.map((b) => b.id))
    const anomalyIds = deleteTargetIds.filter((id) => liveIds.has(id))

    console.group('%c[ANIM] runAnimation', 'color:#2196f3;font-weight:bold')
    console.log('削除対象 ids:', JSON.parse(JSON.stringify(anomalyIds)))
    console.log('live.length:', live.length)
    console.groupEnd()

    if (anomalyIds.length === 0) {
      // 異変ブロックがない（異変なし指摘）→ 即コメント追加してrewind
      console.log('%c[ANIM] 異変ブロック0件 → 削除せずコメントのみ→onRewind', 'color:#ff9800;font-weight:bold')
      deps.addComment({ ...comment, timestamp: nowTime() })
      setTimeout(onRewind, 300)
      return
    }

    // ─── Phase 1: 末尾ブロックから順に、各ブロック内を右から1文字ずつ選択 ──
    // テキスト選択（ドラッグ）風の見た目。末尾行の最後の文字から選択が始まる
    const orderedIds = [...anomalyIds].reverse()  // 末尾ブロック → 先頭ブロック

    function selectBlock(blockIdx: number) {
      if (blockIdx >= orderedIds.length) {
        // ─── Phase 2: コメントを表示 ──────────────────────────────────────
        deps.addComment({ ...comment, timestamp: nowTime() })
        setTimeout(() => {
          // ─── Phase 3: 異変ブロックを末尾からバックスペース削除 ───────────
          deleteAnomalyBlocks([...anomalyIds].reverse())
        }, COMMENT_PAUSE)
        return
      }

      const id = orderedIds[blockIdx]
      const block = deps.getLiveContent().find((b) => b.id === id)
      const totalChars = block && block.type === 'text' ? [...block.text].length : 0

      // 起点（最下行）以外、またはテキスト以外は「行まるごと選択」して一気に進む
      if (blockIdx > 0 || totalChars === 0) {
        deps.setLiveContent(
          deps.getLiveContent().map((b) =>
            b.id === id ? { ...b, _fullSelected: true } : b
          )
        )
        setTimeout(() => selectBlock(blockIdx + 1), SELECT_CHAR_INTERVAL)
        return
      }

      // 起点（最下行）だけ、右から1文字ずつ選択していく
      let sel = 0
      const charTimer = setInterval(() => {
        sel++
        deps.setLiveContent(
          deps.getLiveContent().map((b) =>
            b.id === id ? { ...b, _selectedChars: sel } : b
          )
        )
        if (sel >= totalChars) {
          clearInterval(charTimer)
          setTimeout(() => selectBlock(blockIdx + 1), SELECT_CHAR_INTERVAL)
        }
      }, SELECT_CHAR_INTERVAL)
    }

    selectBlock(0)

    // ─── Phase 3 実装 ────────────────────────────────────────────────────────
    function deleteAnomalyBlocks(ids: string[]) {
      if (ids.length === 0) {
        // 全削除完了 → rewind
        onRewind()
        return
      }

      const targetId = ids[0]
      const remaining = ids.slice(1)

      // 対象ブロックのテキストを後ろから1文字ずつ消す
      deleteCharsFromBlock(targetId, remaining)
    }

    function deleteCharsFromBlock(blockId: string, remainingIds: string[]) {
      const current = deps.getLiveContent()
      const block = current.find((b) => b.id === blockId)

      if (!block) {
        // ブロックが見つからない → 次へ
        setTimeout(() => deleteAnomalyBlocks(remainingIds), BACKSPACE_BLOCK_INTERVAL)
        return
      }

      if (block.type === 'text') {
        if (block.text.length === 0) {
          // テキストが空になった → ブロックごと削除
          deps.setLiveContent(deps.getLiveContent().filter((b) => b.id !== blockId))
          setTimeout(() => deleteAnomalyBlocks(remainingIds), BACKSPACE_BLOCK_INTERVAL)
          return
        }
        // 末尾1文字を削除
        deps.setLiveContent(
          deps.getLiveContent().map((b) =>
            b.id === blockId && b.type === 'text'
              ? { ...b, text: b.text.slice(0, -1) }
              : b
          )
        )
        setTimeout(() => deleteCharsFromBlock(blockId, remainingIds), BACKSPACE_CHAR_INTERVAL)
      } else {
        // 非テキストブロック（画像・スペーサー等）はまとめて削除
        deps.setLiveContent(deps.getLiveContent().filter((b) => b.id !== blockId))
        setTimeout(() => deleteAnomalyBlocks(remainingIds), BACKSPACE_BLOCK_INTERVAL)
      }
    }
  }, [deps])

  return { runAnimation }
}
