import { randomUUID } from 'crypto'
export function ensureIdempotencyKey(h?: string | null) {
  return h && h.trim() ? h : randomUUID()
}
