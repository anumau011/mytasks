import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, parse } from '../lib/http.js'
import { nextPosition, ownedSection, touchProject } from '../lib/ownership.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

const updateSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    hidden: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update')

const todoSchema = z.object({
  text: z.string().trim().min(1, 'Text is required').max(500),
})

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = parse(updateSchema, req.body)
    const existing = await ownedSection(req.user.id, req.params.id)

    const section = await prisma.section.update({
      where: { id: existing.id },
      data,
      include: { todos: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] } },
    })
    await touchProject(existing.projectId)
    res.json({ section })
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const section = await ownedSection(req.user.id, req.params.id)
    await prisma.section.delete({ where: { id: section.id } })
    await touchProject(section.projectId)
    res.json({ ok: true })
  }),
)

router.post(
  '/:id/todos',
  asyncHandler(async (req, res) => {
    const { text } = parse(todoSchema, req.body)
    const section = await ownedSection(req.user.id, req.params.id)

    const todo = await prisma.todo.create({
      data: {
        text,
        sectionId: section.id,
        projectId: section.projectId,
        position: await nextPosition('todo', { sectionId: section.id }),
      },
    })
    await touchProject(section.projectId)
    res.status(201).json({ todo })
  }),
)

export default router
