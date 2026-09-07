import { useState } from 'react'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, InlineEdit, Input } from './ui'

export function AddTodo({ onAdd, placeholder = 'Add a task' }) {
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <Button
        variant="primary"
        onClick={submit}
        disabled={!text.trim()}
        className="shrink-0"
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </form>
  )
}

export function TodoRow({ todo, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const done = todo.status === 'done'

  return (
    <li
      className={`group flex items-center gap-3 rounded-xl border border-blush bg-surface px-3.5 py-3 transition-all hover:border-mauve ${
        done ? 'opacity-45' : ''
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          done ? 'border-mauve bg-mauve' : 'border-blush hover:border-mauve'
        }`}
      >
        {done && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
      </button>

      {editing ? (
        <InlineEdit
          value={todo.text}
          ariaLabel="Task text"
          onCommit={onEdit}
          onDone={() => setEditing(false)}
          className="min-w-0 flex-1"
        />
      ) : (
        <>
          {/* Completed tasks fade back rather than getting struck through. */}
          <span
            onDoubleClick={() => setEditing(true)}
            className="min-w-0 flex-1 truncate text-sm"
          >
            {todo.text}
          </span>

          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit task"
            className="shrink-0 rounded-lg p-1.5 text-cream/45 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-cream focus-visible:opacity-100"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete task"
            className="shrink-0 rounded-lg p-1.5 text-cream/45 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-cream focus-visible:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </li>
  )
}
