// Axios client for the Express API.
//
// The API is addressed absolutely, through VITE_API_URL, rather than through a
// dev-server proxy — the proxy only ever existed in `vite dev`, so the built
// site had no way to reach the server at all.
//
// That makes requests cross-origin, so two things have to line up: this client
// sends credentials, and the server must answer with its origin in
// Access-Control-Allow-Origin and set the session cookie SameSite=None once the
// two halves are on different sites. See server/src/middleware/auth.js.

import axios from 'axios'

// Trailing slash trimmed so the join below can't produce a double slash.
// Empty (the default) means same-origin: correct when something in front of the
// static host rewrites /api to the server.
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const client = axios.create({
  baseURL: `${API_URL}/api`,
  // Sends and accepts the httpOnly session cookie on cross-origin calls.
  withCredentials: true,
  // No blanket Content-Type: it would make every GET a preflighted request.
  // Axios sets application/json itself whenever there is a body.
})

// Axios rejects on any non-2xx, so both failure modes land here: `response` is
// set when the server answered, absent when the request never arrived.
function toApiError(err) {
  const { response } = err
  if (!response) {
    const where = API_URL || window.location.origin
    throw new ApiError(0, `Cannot reach the server at ${where}. Is it running?`)
  }
  const data = response.data
  throw new ApiError(
    response.status,
    data?.error ?? `Request failed (${response.status})`,
    data?.details,
  )
}

async function request(path, { method = 'GET', body } = {}) {
  try {
    const res = await client.request({ url: path, method, data: body })
    // 204s come back as an empty string; the old fetch wrapper returned null.
    return res.data === '' ? null : res.data
  } catch (err) {
    toApiError(err)
  }
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
