// Display helpers shared across the UI. Project data itself lives in Postgres
// and is fetched through `lib/api.js` — nothing here touches storage.

export const today = () => new Date().toISOString().slice(0, 10)

export function fmt(iso) {
  if (!iso) return '--'
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

export const STATUSES = ['todo', 'progress', 'done']

export const STATUS_LABEL = {
  todo: 'To do',
  progress: 'In progress',
  done: 'Done',
}

// Tallies a section's items into { todo, progress, done }.
export function countByStatus(items) {
  const counts = { todo: 0, progress: 0, done: 0 }
  for (const item of items) counts[item.status] = (counts[item.status] ?? 0) + 1
  return counts
}
