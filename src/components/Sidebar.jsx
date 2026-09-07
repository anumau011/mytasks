import { CheckCircle2, ListTodo, LayoutGrid, LogOut, PanelLeft, Plus, Search } from 'lucide-react'
import { fmt } from '../lib/store'
import { Button, Input } from './ui'

// Falls back to the first letter when a name has no second word.
const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

export default function Sidebar({
  projects,
  activeId,
  query,
  user,
  onQuery,
  onSelect,
  onNew,
  onCollapse,
  onLogout,
  open = true,
}) {
  return (
    // The width animates on the <aside> while the panel keeps its full 18rem
    // inside, so the contents slide out of view instead of reflowing to 0.
    <aside
      className={`h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out motion-reduce:transition-none ${
        open ? 'w-72' : 'w-0'
      }`}
      inert={!open}
      aria-hidden={!open}
    >
      <div
        className={`flex h-full w-72 flex-col border-r border-white/10 bg-surface transition-[opacity,transform] duration-300 ease-in-out motion-reduce:transition-none ${
          open ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-mauve" />
            <span className="text-sm font-semibold tracking-wide">Tasks</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            title="Hide sidebar"
            aria-label="Hide sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 px-5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-cream/45" />
            <Input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search projects"
              className="pl-10"
              aria-label="Search projects"
            />
          </div>
          <Button variant="soft" onClick={onNew} className="w-full">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>

        <div className="mt-6 px-5 pb-2 text-[11px] font-semibold tracking-widest text-cream/50 uppercase">
          Projects · {projects.length}
        </div>

        <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {projects.map((p) => {
            const active = p.id === activeId
            const Icon = p.type === 'project' ? LayoutGrid : ListTodo
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  active ? 'bg-blush text-ink' : 'hover:bg-white/10'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-ink/70' : 'text-cream/50'}`}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {p.name}
                </span>
                <span
                  className={`shrink-0 text-[11px] tabular-nums ${
                    active ? 'text-ink/65' : 'text-cream/55'
                  }`}
                >
                  {fmt(p.createdAt)}
                </span>
              </button>
            )
          })}

          {projects.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-cream/55">
              No projects found.
            </p>
          )}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mauve text-sm font-semibold text-ink">
            {initials(user?.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-cream/55">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
        </div>
      </div>
    </aside>
  )
}
