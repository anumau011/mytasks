import { useState } from 'react'
import { LayoutGrid, ListTodo, PanelLeft, Plus, Trash2 } from 'lucide-react'
import { fmt } from '../lib/store'
import KanbanBoard from './KanbanBoard'
import SectionCard from './SectionCard'
import { AddTodo, TodoRow } from './TodoList'
import { Button } from './ui'

function Header({ project, sidebarOpen, onShowSidebar, actions, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(project.name)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed) onRename(trimmed)
    setEditing(false)
  }

  const isProject = project.type === 'project'
  const TypeIcon = isProject ? LayoutGrid : ListTodo

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-8 py-5">
      {/* Stays mounted and collapses to nothing so it fades in as the sidebar
          slides away. The negative margin swallows the header's gap-3. */}
      <div
        className={`shrink-0 overflow-hidden transition-[width,opacity,margin] duration-300 ease-in-out motion-reduce:transition-none ${
          sidebarOpen ? '-ml-3 w-0 opacity-0' : 'ml-0 w-9 opacity-100'
        }`}
        inert={sidebarOpen}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onShowSidebar}
          title="Show sidebar"
          aria-label="Show sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(project.name)
                setEditing(false)
              }
            }}
            className="w-full max-w-md rounded-lg border border-mauve bg-surface px-2.5 py-1 text-xl font-semibold outline-none"
            aria-label="Project name"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(project.name)
              setEditing(true)
            }}
            title="Rename project"
            className="max-w-full truncate rounded-lg px-1 text-xl font-semibold transition-colors hover:text-cream/70"
          >
            {project.name}
          </button>
        )}
        <p className="mt-0.5 px-1 text-xs text-cream/55">
          Created {fmt(project.createdAt)} · Updated {fmt(project.updatedAt)}
        </p>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1.5 text-ink text-[11px] font-semibold tracking-wide uppercase">
        <TypeIcon className="h-3.5 w-3.5" />
        {isProject ? 'Project' : 'Simple'}
      </span>

      {actions}
    </header>
  )
}

export default function Workspace({
  project,
  sidebarOpen,
  onShowSidebar,
  onRename,
  onDelete,
  onAddSection,
  onSection,
  onAddTodo,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
}) {
  const isProject = project.type === 'project'

  // Finished tasks sink to the bottom. sort is stable, so everything else keeps
  // the order the server sent.
  const orderedTodos = [...project.todos].sort(
    (a, b) => Number(a.status === 'done') - Number(b.status === 'done'),
  )

  const visible = project.sections.filter((s) => !s.hidden)
  const hiddenCount = project.sections.length - visible.length
  const [showHidden, setShowHidden] = useState(false)
  const sections = showHidden ? project.sections : visible

  // Which section's kanban board is open; null shows the section grid.
  const [openId, setOpenId] = useState(null)
  const openSection = project.sections.find((s) => s.id === openId) ?? null

  const actions = (
    <div className="flex items-center gap-2">
      {isProject && (
        <Button variant="soft" onClick={onAddSection}>
          <Plus className="h-4 w-4" />
          Add section
        </Button>
      )}
      <Button variant="danger" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  )

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col">
      <Header
        project={project}
        sidebarOpen={sidebarOpen}
        onShowSidebar={onShowSidebar}
        onRename={onRename}
        actions={actions}
      />

      <div className="scroll-thin flex-1 overflow-y-auto px-8 py-6">
        {isProject && openSection ? (
          <KanbanBoard
            section={openSection}
            onBack={() => setOpenId(null)}
            onAddItem={(text) => onSection.addItem(openSection.id, text)}
            onMoveItem={(itemId, status) =>
              onSection.moveItem(openSection.id, itemId, status)
            }
            onEditItem={(itemId, text) =>
              onSection.editItem(openSection.id, itemId, text)
            }
            onDeleteItem={(itemId) => onSection.deleteItem(openSection.id, itemId)}
          />
        ) : isProject ? (
          <>
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowHidden((v) => !v)}
                className="mb-4 text-xs font-medium text-cream/55 underline underline-offset-4 hover:text-cream"
              >
                {showHidden ? 'Hide' : 'Show'} {hiddenCount} hidden section
                {hiddenCount > 1 ? 's' : ''}
              </button>
            )}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onOpen={() => setOpenId(section.id)}
                  onRename={(title) => onSection.rename(section.id, title)}
                  onDelete={() => onSection.remove(section.id)}
                  onToggleHide={() => onSection.toggleHide(section.id)}
                />
              ))}
            </div>

            {sections.length === 0 && (
              <div className="rounded-2xl border border-dashed border-blush py-16 text-center">
                <p className="text-sm text-cream/55">No sections yet.</p>
                <Button variant="soft" onClick={onAddSection} className="mt-4">
                  <Plus className="h-4 w-4" />
                  Add your first section
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="mx-auto max-w-2xl">
            <AddTodo onAdd={onAddTodo} placeholder="What needs to be done?" />

            <ul className="mt-5 space-y-2">
              {orderedTodos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={() => onToggleTodo(todo.id)}
                  onEdit={(text) => onEditTodo(todo.id, text)}
                  onDelete={() => onDeleteTodo(todo.id)}
                />
              ))}
            </ul>

            {project.todos.length === 0 && (
              <p className="mt-10 text-center text-sm text-cream/55">
                Nothing here yet. Add your first task above.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
