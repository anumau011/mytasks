import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import CreateProjectModal from './CreateProjectModal'
import Sidebar from './Sidebar'
import Workspace from './Workspace'
import { Button } from './ui'
import { useProjects } from '../lib/useProjects'

// The signed-in app. Mounted only once there is a user, so the project state
// below starts empty for every session.
export default function Dashboard({ user, onLogout }) {
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [creating, setCreating] = useState(false)

  const { projects, loading, error, dismissError, actions } = useProjects()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? projects.filter((p) => p.name.toLowerCase().includes(q)) : projects
  }, [projects, query])

  // Derived rather than synced: falls back to the first project whenever the
  // selection is empty or points at something that was just deleted.
  const active = projects.find((p) => p.id === selectedId) ?? projects[0] ?? null

  const createProject = async (name, type) => {
    const project = await actions.createProject(name, type)
    if (project) setSelectedId(project.id)
    setCreating(false)
  }

  const deleteProject = () => {
    if (!active) return
    if (!confirm(`Delete "${active.name}" and everything in it?`)) return
    actions.deleteProject(active.id)
  }

  // Each handler is bound to the active project id before reaching Workspace.
  const section = active && {
    rename: (id, title) => actions.renameSection(active.id, id, title),
    remove: (id) => actions.removeSection(active.id, id),
    toggleHide: (id) => {
      const current = active.sections.find((s) => s.id === id)
      actions.toggleSectionHidden(active.id, id, !current?.hidden)
    },
    addItem: (id, text) => actions.addSectionItem(active.id, id, text),
    moveItem: (id, itemId, status) =>
      actions.moveSectionItem(active.id, id, itemId, status),
    editItem: (id, itemId, text) =>
      actions.editSectionItem(active.id, id, itemId, text),
    deleteItem: (id, itemId) => actions.deleteSectionItem(active.id, id, itemId),
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Always mounted so collapsing can animate; it hides itself at width 0. */}
      <Sidebar
        open={sidebarOpen}
        projects={filtered}
        activeId={active?.id ?? null}
        query={query}
        user={user}
        onQuery={setQuery}
        onSelect={setSelectedId}
        onNew={() => setCreating(true)}
        onCollapse={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      {loading ? (
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-cream/55">Loading your projects…</p>
        </main>
      ) : active ? (
        <Workspace
          key={active.id}
          project={active}
          sidebarOpen={sidebarOpen}
          onShowSidebar={() => setSidebarOpen(true)}
          onRename={(name) => actions.renameProject(active.id, name)}
          onDelete={deleteProject}
          onAddSection={() => actions.addSection(active.id)}
          onSection={section}
          onAddTodo={(text) => actions.addTodo(active.id, text)}
          onToggleTodo={(id) => {
            const todo = active.todos.find((t) => t.id === id)
            if (!todo) return
            actions.toggleTodo(active.id, id, todo.status === 'done' ? 'todo' : 'done')
          }}
          onEditTodo={(id, text) => actions.editTodo(active.id, id, text)}
          onDeleteTodo={(id) => actions.deleteTodo(active.id, id)}
        />
      ) : (
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          {!sidebarOpen && (
            <Button variant="soft" onClick={() => setSidebarOpen(true)}>
              Show sidebar
            </Button>
          )}
          <p className="text-sm text-cream/55">No projects yet.</p>
          <Button variant="primary" onClick={() => setCreating(true)}>
            Create a project
          </Button>
        </main>
      )}

      {creating && (
        <CreateProjectModal
          onClose={() => setCreating(false)}
          onCreate={createProject}
        />
      )}

      {error && (
        <div className="fixed bottom-5 left-1/2 z-50 flex max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-blush/60 bg-surface px-4 py-3 shadow-xl shadow-black/40">
          <p className="text-sm text-blush">{error}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={dismissError}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
