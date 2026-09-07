import { useState } from 'react'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { STATUSES, STATUS_LABEL, countByStatus, fmt } from '../lib/store'
import { Button, InlineEdit, Input } from './ui'

function AddCard({ onAdd }) {
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <form onSubmit={submit} className="mt-2 flex gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task"
        aria-label="Add a task"
        className="h-9 text-[13px]"
      />
      <Button
        variant="primary"
        size="icon"
        onClick={submit}
        disabled={!text.trim()}
        aria-label="Add task"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}

function Card({ item, onMove, onEdit, onDelete, onDragStart }) {
  const [editing, setEditing] = useState(false)
  const index = STATUSES.indexOf(item.status)
  const prev = STATUSES[index - 1]
  const next = STATUSES[index + 1]
  const done = item.status === 'done'

  // Dragging has to be off while editing, or selecting text starts a drag.
  return (
    <li
      draggable={!editing}
      onDragStart={onDragStart}
      className={`group rounded-xl border border-blush bg-surface px-3 py-2.5 transition-all ${
        editing ? '' : 'cursor-grab active:cursor-grabbing'
      } ${done ? 'opacity-45' : ''}`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => onMove(done ? 'todo' : 'done')}
          aria-label={done ? 'Mark as not done' : 'Mark as done'}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
            done ? 'border-mauve bg-mauve' : 'border-blush hover:border-mauve'
          }`}
        >
          {done && <Check className="h-2.5 w-2.5 text-ink" strokeWidth={3} />}
        </button>

        {editing ? (
          <InlineEdit
            value={item.text}
            ariaLabel="Task text"
            onCommit={onEdit}
            onDone={() => setEditing(false)}
            className="min-w-0 flex-1"
          />
        ) : (
          <p
            onDoubleClick={() => setEditing(true)}
            className="min-w-0 flex-1 text-sm break-words"
          >
            {item.text}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          disabled={!prev}
          onClick={() => onMove(prev)}
          aria-label={prev ? `Move to ${STATUS_LABEL[prev]}` : 'Already first'}
          className="rounded-md p-1 text-cream/45 transition-colors hover:bg-white/10 hover:text-cream disabled:pointer-events-none disabled:opacity-25"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={!next}
          onClick={() => onMove(next)}
          aria-label={next ? `Move to ${STATUS_LABEL[next]}` : 'Already last'}
          className="rounded-md p-1 text-cream/45 transition-colors hover:bg-white/10 hover:text-cream disabled:pointer-events-none disabled:opacity-25"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit task"
          className="ml-auto rounded-md p-1 text-cream/40 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-cream focus-visible:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete task"
          className="rounded-md p-1 text-cream/40 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-cream focus-visible:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  )
}

export default function KanbanBoard({
  section,
  onBack,
  onAddItem,
  onMoveItem,
  onEditItem,
  onDeleteItem,
}) {
  const [dragging, setDragging] = useState(null)
  const [over, setOver] = useState(null)
  const counts = countByStatus(section.items)

  const drop = (status) => (e) => {
    e.preventDefault()
    const id = dragging ?? e.dataTransfer.getData('text/plain')
    if (id) onMoveItem(id, status)
    setDragging(null)
    setOver(null)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" onClick={onBack} aria-label="Back to sections">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold tracking-wide uppercase">
            {section.title}
          </h2>
          <p className="text-xs text-cream/55">
            Created {fmt(section.createdAt)} · Updated {fmt(section.updatedAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {STATUSES.map((status) => (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(status)
            }}
            onDragLeave={() => setOver((s) => (s === status ? null : s))}
            onDrop={drop(status)}
            className={`flex min-h-64 flex-col rounded-2xl border p-4 transition-colors ${
              over === status ? 'border-mauve bg-white/10' : 'border-white/15 bg-white/5'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-widest text-cream/70 uppercase">
                {STATUS_LABEL[status]}
              </h3>
              <span className="rounded-full bg-blush px-2 py-0.5 text-[11px] font-semibold text-ink tabular-nums">
                {counts[status]}
              </span>
            </div>

            <ul className="flex-1 space-y-2">
              {section.items
                .filter((item) => item.status === status)
                .map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    onDragStart={(e) => {
                      setDragging(item.id)
                      e.dataTransfer.setData('text/plain', item.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onMove={(to) => onMoveItem(item.id, to)}
                    onEdit={(text) => onEditItem(item.id, text)}
                    onDelete={() => onDeleteItem(item.id)}
                  />
                ))}

              {counts[status] === 0 && (
                <li className="rounded-xl border border-dashed border-white/15 px-3 py-6 text-center text-xs text-cream/40">
                  Drop tasks here
                </li>
              )}
            </ul>

            {/* Tasks start in To do; the other columns are reached by moving. */}
            {status === 'todo' && <AddCard onAdd={onAddItem} />}
          </section>
        ))}
      </div>
    </div>
  )
}
