import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Eye, EyeOff, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { STATUSES, STATUS_LABEL, countByStatus, fmt } from '../lib/store'

function Menu({ hidden, onEdit, onDelete, onToggleHide }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const run = (fn) => (e) => {
    e.stopPropagation()
    setOpen(false)
    fn()
  }

  const item =
    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-cream transition-colors hover:bg-white/10'

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Section options"
        aria-expanded={open}
        className="rounded-lg p-1.5 text-cream/50 transition-colors hover:bg-white/10 hover:text-cream"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute top-9 right-0 z-20 w-40 overflow-hidden rounded-xl border border-blush bg-surface py-1 shadow-lg shadow-black/40">
          <button type="button" className={item} onClick={run(onEdit)}>
            <Pencil className="h-4 w-4 text-cream/55" />
            Rename
          </button>
          <button type="button" className={item} onClick={run(onToggleHide)}>
            {hidden ? (
              <Eye className="h-4 w-4 text-cream/55" />
            ) : (
              <EyeOff className="h-4 w-4 text-cream/55" />
            )}
            {hidden ? 'Show' : 'Hide'}
          </button>
          <button type="button" className={item} onClick={run(onDelete)}>
            <Trash2 className="h-4 w-4 text-cream/55" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function SectionCard({ section, onOpen, onRename, onDelete, onToggleHide }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(section.title)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed) onRename(trimmed)
    else setDraft(section.title)
    setEditing(false)
  }

  const counts = countByStatus(section.items)
  const total = section.items.length
  const pct = total ? (counts.done / total) * 100 : 0

  return (
    <section
      onClick={() => !editing && onOpen()}
      onKeyDown={(e) => {
        if (!editing && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onOpen()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${section.title} board`}
      className={`flex cursor-pointer flex-col rounded-2xl border border-blush bg-surface p-5 transition-colors hover:border-mauve ${
        section.hidden ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') {
                  setDraft(section.title)
                  setEditing(false)
                }
              }}
              className="w-full rounded-lg border border-mauve bg-white/10 px-2 py-1 text-sm font-semibold outline-none"
              aria-label="Section title"
            />
          ) : (
            <h3 className="truncate text-sm font-semibold tracking-wide uppercase">
              {section.title}
            </h3>
          )}

          <p className="mt-1.5 text-[11px] text-cream/55">
            Created {fmt(section.createdAt)} · Updated {fmt(section.updatedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {section.hidden && (
            <span className="rounded-full bg-blush px-2 py-0.5 text-ink text-[10px] font-medium tracking-wide uppercase">
              Hidden
            </span>
          )}
          <Menu
            hidden={section.hidden}
            onEdit={() => {
              setDraft(section.title)
              setEditing(true)
            }}
            onDelete={onDelete}
            onToggleHide={onToggleHide}
          />
        </div>
      </div>

      {/* Per-status breakdown: how much is waiting, moving and finished. */}
      <dl className="mt-5 grid grid-cols-3 gap-2">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="rounded-xl border border-white/10 bg-white/5 px-2 py-2.5 text-center"
          >
            <dt className="text-[10px] tracking-wide text-cream/50 uppercase">
              {STATUS_LABEL[status]}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {counts[status]}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-mauve transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] text-cream/55 tabular-nums">
          {counts.done}/{total}
        </span>
      </div>

      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-mauve">
        Open board
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </section>
  )
}
