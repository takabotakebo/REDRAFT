import type { Anomaly } from '../types/anomaly'

export function selectAnomaly(
  pool: Anomaly[],
  stageId: string,
  usedAnomalyIds: string[] = [],
): Anomaly | null {
  const used = new Set(usedAnomalyIds)
  const candidates = pool.filter(
    (a) => a.stageIds.includes(stageId) && !used.has(a.id)
  )
  if (candidates.length === 0) return null
  // 必ず発生する異変（mustFire）が未使用で候補にあれば最優先で返す
  const mustFire = candidates.find((a) => a.mustFire)
  if (mustFire) return mustFire
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function resetUsedAnomalies() {
  // 使用済み管理は GameState.usedAnomalyIds で行う（「はじめから」でリセット）
}
