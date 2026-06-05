import type { DocumentBlock } from '../types/document'

export function rewindToCheckpoint(
  checkpoint: DocumentBlock[],
): DocumentBlock[] {
  return checkpoint.map((b) => ({ ...b }))
}
