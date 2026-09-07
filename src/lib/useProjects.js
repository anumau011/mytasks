import { useCallback, useEffect, useState } from 'react'
import { api, apiStatus } from './api'
import { today } from './store'

// Owns the project list and every mutation against it.
//
// Reads go through the API on mount. Writes update local state first so the UI
// stays responsive, then hit the API; a failed write refetches so the screen
// never keeps a change the database rejected.
export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setProjects(await api.listProjects())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load. The `live` flag drops a late response that arrives after the
  // component is gone, which is what a logout mid-request would produce.
  useEffect(() => {
    let live = true
    api
      .listProjects()
      .then((list) => {
        if (!live) return
        setProjects(list)
        setError(null)
      })
      .catch((err) => live && setError(err.message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])

  // Applies the optimistic updater, then the API call behind it.
  const mutate = useCallback(
    async (updater, call) => {
      if (updater) setProjects(updater)
      try {
        await call()
        setError(null)
      } catch (err) {
        setError(err.message)
        refresh()
      }
    },
    [refresh],
  )

  // Replaces one project and stamps it as updated, mirroring the server's touch.
  const patchProject = (id, updater) => (prev) =>
    prev.map((p) => (p.id === id ? { ...updater(p), updatedAt: today() } : p))

  const patchSection = (projectId, sectionId, updater) =>
    patchProject(projectId, (p) => ({
      ...p,
      sections: p.sections.map((s) =>
        s.id === sectionId ? { ...updater(s), updatedAt: today() } : s,
      ),
    }))

  const actions = {
    // Creates need the server-generated id, so they insert after the response.
    createProject: async (name, type) => {
      try {
        const project = await api.createProject(name, type)
        setProjects((prev) => [project, ...prev])
        setError(null)
        return project
      } catch (err) {
        setError(err.message)
        return null
      }
    },

    renameProject: (id, name) =>
      mutate(patchProject(id, (p) => ({ ...p, name })), () =>
        api.renameProject(id, name),
      ),

    deleteProject: (id) =>
      mutate(
        (prev) => prev.filter((p) => p.id !== id),
        () => api.deleteProject(id),
      ),

    addSection: async (projectId, title = 'New section') => {
      try {
        const section = await api.addSection(projectId, title)
        setProjects(
          patchProject(projectId, (p) => ({
            ...p,
            sections: [...p.sections, section],
          })),
        )
        setError(null)
      } catch (err) {
        setError(err.message)
      }
    },

    renameSection: (projectId, sectionId, title) =>
      mutate(patchSection(projectId, sectionId, (s) => ({ ...s, title })), () =>
        api.updateSection(sectionId, { title }),
      ),

    removeSection: (projectId, sectionId) =>
      mutate(
        patchProject(projectId, (p) => ({
          ...p,
          sections: p.sections.filter((s) => s.id !== sectionId),
        })),
        () => api.deleteSection(sectionId),
      ),

    toggleSectionHidden: (projectId, sectionId, hidden) =>
      mutate(patchSection(projectId, sectionId, (s) => ({ ...s, hidden })), () =>
        api.updateSection(sectionId, { hidden }),
      ),

    addSectionItem: async (projectId, sectionId, text) => {
      try {
        const item = await api.addSectionTodo(sectionId, text)
        setProjects(
          patchSection(projectId, sectionId, (s) => ({
            ...s,
            items: [...s.items, item],
          })),
        )
        setError(null)
      } catch (err) {
        setError(err.message)
      }
    },

    moveSectionItem: (projectId, sectionId, itemId, status) =>
      mutate(
        patchSection(projectId, sectionId, (s) => ({
          ...s,
          items: s.items.map((i) => (i.id === itemId ? { ...i, status } : i)),
        })),
        () => api.updateTodo(itemId, { status: apiStatus(status) }),
      ),

    editSectionItem: (projectId, sectionId, itemId, text) =>
      mutate(
        patchSection(projectId, sectionId, (s) => ({
          ...s,
          items: s.items.map((i) => (i.id === itemId ? { ...i, text } : i)),
        })),
        () => api.updateTodo(itemId, { text }),
      ),

    deleteSectionItem: (projectId, sectionId, itemId) =>
      mutate(
        patchSection(projectId, sectionId, (s) => ({
          ...s,
          items: s.items.filter((i) => i.id !== itemId),
        })),
        () => api.deleteTodo(itemId),
      ),

    addTodo: async (projectId, text) => {
      try {
        const todo = await api.addProjectTodo(projectId, text)
        setProjects(
          patchProject(projectId, (p) => ({ ...p, todos: [...p.todos, todo] })),
        )
        setError(null)
      } catch (err) {
        setError(err.message)
      }
    },

    toggleTodo: (projectId, todoId, status) =>
      mutate(
        patchProject(projectId, (p) => ({
          ...p,
          todos: p.todos.map((t) => (t.id === todoId ? { ...t, status } : t)),
        })),
        () => api.updateTodo(todoId, { status: apiStatus(status) }),
      ),

    editTodo: (projectId, todoId, text) =>
      mutate(
        patchProject(projectId, (p) => ({
          ...p,
          todos: p.todos.map((t) => (t.id === todoId ? { ...t, text } : t)),
        })),
        () => api.updateTodo(todoId, { text }),
      ),

    deleteTodo: (projectId, todoId) =>
      mutate(
        patchProject(projectId, (p) => ({
          ...p,
          todos: p.todos.filter((t) => t.id !== todoId),
        })),
        () => api.deleteTodo(todoId),
      ),
  }

  return { projects, loading, error, dismissError: () => setError(null), actions }
}
