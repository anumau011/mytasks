import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, parse } from '../lib/http.js'
import {
  nextPosition,
  ownedProject,
  projectInclude,
  touchProject,
} from '../lib/ownership.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  type: z.enum(['SIMPLE', 'PROJECT']).default('SIMPLE'),
})

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    type: z.enum(['SIMPLE', 'PROJECT']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update')

const sectionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
})

const todoSchema = z.object({
  text: z.string().trim().min(1, 'Text is required').max(500),
})

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: projectInclude,
    })
    res.json({ projects })
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = parse(createSchema, req.body)
    const project = await prisma.project.create({
      data: { ...data, userId: req.user.id },
      include: projectInclude,
    })
    res.status(201).json({ project })
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ project: await ownedProject(req.user.id, req.params.id) })
  }),
)

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = parse(updateSchema, req.body)
    await ownedProject(req.user.id, req.params.id, undefined)

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
      include: projectInclude,
    })
    res.json({ project })
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await ownedProject(req.user.id, req.params.id, undefined)
    // Sections and todos cascade from the schema.
    await prisma.project.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  }),
)

router.post(
  '/:id/sections',
  asyncHandler(async (req, res) => {
    const { title } = parse(sectionSchema, req.body)
    const project = await ownedProject(req.user.id, req.params.id, undefined)

    const section = await prisma.section.create({
      data: {
        title,
        projectId: project.id,
        position: await nextPosition('section', { projectId: project.id }),
      },
      include: { todos: true },
    })
    await touchProject(project.id)
    res.status(201).json({ section })
  }),
)

// Todos attached straight to the project — the SIMPLE project checklist.
router.post(
  '/:id/todos',
  asyncHandler(async (req, res) => {
    const { text } = parse(todoSchema, req.body)
    const project = await ownedProject(req.user.id, req.params.id, undefined)

    const todo = await prisma.todo.create({
      data: {
        text,
        projectId: project.id,
        position: await nextPosition('todo', {
          projectId: project.id,
          sectionId: null,
        }),
      },
    })
    await touchProject(project.id)
    res.status(201).json({ todo })
  }),
)

export default router
