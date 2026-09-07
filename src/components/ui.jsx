import { useRef, useState } from 'react'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none'

const variants = {
  // Light pink fill carries dark text; everything else is outlined in white.
  primary: 'bg-blush text-ink hover:bg-mauve',
  soft: 'border border-white/20 bg-white/10 text-cream hover:bg-white/20',
  outline: 'border border-white/25 text-cream hover:bg-white/10',
  ghost: 'text-cream/70 hover:bg-white/10 hover:text-cream',
  danger: 'border border-blush/60 text-blush hover:bg-blush hover:text-ink',
}

const sizes = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  icon: 'h-9 w-9 rounded-lg',
}

export function Button({
  variant = 'outline',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

// Click-to-edit text field. Enter or blur commits, Escape reverts, and an
// empty value leaves the original text alone rather than clearing the record.
// Mounted only while editing, so the draft seeds itself from `value`.
export function InlineEdit({
  value,
  onCommit,
  onDone,
  ariaLabel,
  maxLength = 500,
  className = '',
}) {
  const [draft, setDraft] = useState(value)
  // Escape unmounts the input, which fires blur; this stops that blur from
  // committing the edit the user just abandoned.
  const abandoned = useRef(false)

  const finish = () => {
    if (abandoned.current) return
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onCommit(trimmed)
    onDone()
  }

  return (
    <input
      autoFocus
      value={draft}
      maxLength={maxLength}
      aria-label={ariaLabel}
      onFocus={(e) => e.target.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={finish}
      // Stops Enter/Escape and clicks from reaching a clickable ancestor.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Enter') {
          e.preventDefault()
          finish()
        }
        if (e.key === 'Escape') {
          abandoned.current = true
          onDone()
        }
      }}
      className={`rounded-lg border border-mauve bg-white/10 px-2 py-1 text-sm text-cream outline-none ${className}`}
    />
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-xl border border-white/25 bg-white/5 px-3.5 text-sm text-cream outline-none transition-colors placeholder:text-cream/40 focus:border-mauve ${className}`}
      {...props}
    />
  )
}
