// Thin fetch wrapper around the Express API.
// Vite proxies /api to the server in dev, so requests stay same-origin and the
// httpOnly auth cookie is sent automatically.

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is it running on port 4000?')
  }

  // 204s and error pages may not carry JSON.
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error ?? `Request failed (${res.status})`,
      data?.details,
    )
  }
  return data
}

// --- shape translation -------------------------------------------------
// The API speaks Prisma enums and nests todos under `section.todos`; the UI
// works in lowercase strings and calls them `section.items`.

const day = (value) => (value ? String(value).slice(0, 10) : '')
const uiType = (type) => (type === 'PROJECT' ? 'project' : 'simple')
const uiItem = (todo) => ({
  id: todo.id,
  text: todo.text,
  status: todo.status.toLowerCase(),
})

export const apiType = (type) => (type === 'project' ? 'PROJECT' : 'SIMPLE')
export const apiStatus = (status) => status.toUpperCase()

const uiSection = (section) => ({
  id: section.id,
  title: section.title,
  hidden: section.hidden,
  createdAt: day(section.createdAt),
  updatedAt: day(section.updatedAt),
  items: (section.todos ?? []).map(uiItem),
})

export const uiProject = (project) => ({
  id: project.id,
  name: project.name,
  type: uiType(project.type),
  createdAt: day(project.createdAt),
  updatedAt: day(project.updatedAt),
  todos: (project.todos ?? []).map(uiItem),
  sections: (project.sections ?? []).map(uiSection),
})

// --- endpoints ---------------------------------------------------------

export const auth = {
  me: () => request('/auth/me').then((d) => d.user),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }).then(
      (d) => d.user,
    ),
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }).then((d) => d.user),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Resolves the same way whether or not the address has an account, so the
  // response can't be used to discover who is registered.
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }).then(
      (d) => d.message,
    ),

  // The server signs the user in on success, so this returns straight to the app.
  resetPassword: (token, password) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }).then((d) => d.user),
}

export const api = {
  listProjects: () =>
    request('/projects').then((d) => d.projects.map(uiProject)),

  createProject: (name, type) =>
    request('/projects', {
      method: 'POST',
      body: { name, type: apiType(type) },
    }).then((d) => uiProject(d.project)),

  renameProject: (id, name) =>
    request(`/projects/${id}`, { method: 'PATCH', body: { name } }),

  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  addSection: (projectId, title) =>
    request(`/projects/${projectId}/sections`, {
      method: 'POST',
      body: { title },
    }).then((d) => uiSection(d.section)),

  updateSection: (id, data) =>
    request(`/sections/${id}`, { method: 'PATCH', body: data }),

  deleteSection: (id) => request(`/sections/${id}`, { method: 'DELETE' }),

  addProjectTodo: (projectId, text) =>
    request(`/projects/${projectId}/todos`, { method: 'POST', body: { text } }).then(
      (d) => uiItem(d.todo),
    ),

  addSectionTodo: (sectionId, text) =>
    request(`/sections/${sectionId}/todos`, { method: 'POST', body: { text } }).then(
      (d) => uiItem(d.todo),
    ),

  updateTodo: (id, data) => request(`/todos/${id}`, { method: 'PATCH', body: data }),

  deleteTodo: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
}
