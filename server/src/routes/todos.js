import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, parse } from '../lib/http.js'
import { ownedTodo, touchProject } from '../lib/ownership.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

const updateSchema = z
  .object({
    text: z.string().trim().min(1).max(500).optional(),
    status: z.enum(['TODO', 'PROGRESS', 'DONE']).optional(),
    position: z.number().int().min(0).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update')

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = parse(updateSchema, req.body)
    const existing = await ownedTodo(req.user.id, req.params.id)

    const todo = await prisma.todo.update({ where: { id: existing.id }, data })
    await touchProject(existing.projectId)
    res.json({ todo })
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const todo = await ownedTodo(req.user.id, req.params.id)
    await prisma.todo.delete({ where: { id: todo.id } })
    await touchProject(todo.projectId)
    res.json({ ok: true })
  }),
)

export default router
