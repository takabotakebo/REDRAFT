// アーカイブの進捗を localStorage に永続保存する。
// - seenAnomalyIds: 一度でも画面に発火した異変の ID
// - reachedStageIds: 一度でも到達した章の stageId
// 「はじめから」やリロードでも消えない（コレクション的に残す）。

const STORAGE_KEY = 'redraft_archive_v1'

export type ArchiveProgress = {
  seenAnomalyIds: string[]
  reachedStageIds: string[]
  // 「この原稿を校了する」ボタン（最終章の書き終わり）に一度でも到達したか
  reachedEnding: boolean
}

const EMPTY: ArchiveProgress = { seenAnomalyIds: [], reachedStageIds: [], reachedEnding: false }

export function loadArchive(): ArchiveProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<ArchiveProgress>
    return {
      seenAnomalyIds: Array.isArray(parsed.seenAnomalyIds) ? parsed.seenAnomalyIds : [],
      reachedStageIds: Array.isArray(parsed.reachedStageIds) ? parsed.reachedStageIds : [],
      reachedEnding: parsed.reachedEnding === true,
    }
  } catch {
    return { ...EMPTY }
  }
}

function save(progress: ArchiveProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage が使えない環境では黙って無視する
  }
}

// 異変の発火を記録し、更新後の進捗を返す
export function markAnomalySeen(anomalyId: string): ArchiveProgress {
  const cur = loadArchive()
  if (!cur.seenAnomalyIds.includes(anomalyId)) {
    cur.seenAnomalyIds = [...cur.seenAnomalyIds, anomalyId]
    save(cur)
  }
  return cur
}

// アーカイブを空にする（デバッグ用）。更新後（空）の進捗を返す
export function clearArchive(): ArchiveProgress {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage が使えない環境では黙って無視する
  }
  return { ...EMPTY }
}

// 章への到達を記録し、更新後の進捗を返す
export function markStageReached(stageId: string): ArchiveProgress {
  const cur = loadArchive()
  if (!cur.reachedStageIds.includes(stageId)) {
    cur.reachedStageIds = [...cur.reachedStageIds, stageId]
    save(cur)
  }
  return cur
}

// 「この原稿を校了する」到達を記録し、更新後の進捗を返す
export function markEndingReached(): ArchiveProgress {
  const cur = loadArchive()
  if (!cur.reachedEnding) {
    cur.reachedEnding = true
    save(cur)
  }
  return cur
}
