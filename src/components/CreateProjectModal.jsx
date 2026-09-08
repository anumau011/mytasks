import { useEffect, useState } from 'react'
import { LayoutGrid, ListTodo, X } from 'lucide-react'
import { Button, Input } from './ui'

const TYPES = [
  {
    id: 'simple',
    label: 'Simple todo',
    hint: 'One flat checklist. Best for short, personal lists.',
    Icon: ListTodo,
  },
  {
    id: 'project',
    label: 'Project managed todo',
    hint: 'Tasks grouped into sections you can edit, hide or delete.',
    Icon: LayoutGrid,
  },
]

export default function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('simple')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, type)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-2xl border border-blush bg-surface p-6 shadow-xl shadow-black/40"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-semibold">New project</h2>
            <p className="mt-0.5 text-sm text-cream/55">
              Name it and pick how you want to work.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <label className="mb-1.5 block text-xs font-medium text-cream/65">
          Project name
        </label>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jewellery website"
        />

        <p className="mt-5 mb-2 text-xs font-medium text-cream/65">Type of todo</p>
        <div className="space-y-2">
          {TYPES.map(({ id, label, hint, Icon }) => {
            const selected = type === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setType(id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                  selected
                    ? 'border-mauve bg-white/10'
                    : 'border-blush hover:bg-white/10'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-mauve' : 'border-blush'
                  }`}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-mauve" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4 text-cream/55" />
                    {label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-cream/55">
                    {hint}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-blush px-5 text-sm font-medium text-ink transition-colors hover:bg-mauve disabled:pointer-events-none disabled:opacity-40"
          >
            Create project
          </button>
        </div>
      </form>
    </div>
  )
}
