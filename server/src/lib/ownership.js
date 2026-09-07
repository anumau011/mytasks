import { notFound } from './http.js'
import { prisma } from './prisma.js'

// Shape returned for a single project: sections in order, each with its todos,
// plus the loose todos used by SIMPLE projects.
export const projectInclude = {
  sections: {
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    include: {
      todos: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
    },
  },
  todos: {
    where: { sectionId: null },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  },
}

// Each lookup is scoped by userId, so another user's id reads as "not found"
// rather than leaking that the record exists.
export async function ownedProject(userId, projectId, include = projectInclude) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include,
  })
  if (!project) throw notFound('Project not found')
  return project
}

export async function ownedSection(userId, sectionId) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, project: { userId } },
  })
  if (!section) throw notFound('Section not found')
  return section
}

export async function ownedTodo(userId, todoId) {
  const todo = await prisma.todo.findFirst({
    where: { id: todoId, project: { userId } },
  })
  if (!todo) throw notFound('Todo not found')
  return todo
}

// Appends new rows to the end of their list.
export async function nextPosition(model, where) {
  const last = await prisma[model].findFirst({
    where,
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  return (last?.position ?? -1) + 1
}

// A child changing means the project changed, which drives "last updated" in the UI.
export const touchProject = (projectId) =>
  prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } })
