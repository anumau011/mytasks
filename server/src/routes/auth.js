import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { z } from 'zod'
import { env } from '../lib/env.js'
import { emailConfigured, sendPasswordResetEmail } from '../lib/email.js'
import { asyncHandler, badRequest, conflict, parse, unauthorized } from '../lib/http.js'
import { prisma } from '../lib/prisma.js'
import {
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signToken,
} from '../middleware/auth.js'

const router = Router()

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
})

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
})

const resetSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
})

const publicUser = { id: true, email: true, name: true, createdAt: true }

// The token travels in the email link; only its hash is ever stored.
const hashToken = (token) => createHash('sha256').update(token).digest('hex')

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = parse(registerSchema, req.body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw conflict('An account with that email already exists')

    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 10) },
      select: publicUser,
    })

    const token = signToken(user.id)
    setAuthCookie(res, token)
    res.status(201).json({ user, token })
  }),
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = parse(loginSchema, req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    // Same message either way, so the response can't be used to probe emails.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw unauthorized('Incorrect email or password')
    }

    const token = signToken(user.id)
    setAuthCookie(res, token)
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    })
  }),
)

router.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// Always answers 200. A different response for unknown addresses would turn
// this into an oracle for which emails have accounts.
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = parse(forgotSchema, req.body)
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // One live link per user: issuing a new one invalidates the last.
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

      const token = randomBytes(32).toString('hex')
      const minutes = env.resetTokenMinutes
      await prisma.passwordResetToken.create({
        data: {
          tokenHash: hashToken(token),
          userId: user.id,
          expiresAt: new Date(Date.now() + minutes * 60 * 1000),
        },
      })

      // Root path rather than /reset-password: the client reads ?token= off any
      // path, and this needs no SPA history fallback on the host serving it.
      const link = `${env.appUrl}/?token=${token}`
      if (emailConfigured) {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          link,
          minutes,
        })
      } else {
        // No EmailJS credentials: surface the link so local dev still works.
        console.log(`[password reset] ${user.email} -> ${link}`)
      }
    }

    res.json({
      ok: true,
      message: 'If that email has an account, a reset link is on its way.',
    })
  }),
)

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, password } = parse(resetSchema, req.body)

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: publicUser } },
    })

    // An expired row is deleted on sight rather than left for the cron sweep.
    if (record && record.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } })
      throw badRequest('That reset link has expired. Request a new one.')
    }
    if (!record) throw badRequest('That reset link is invalid or already used.')

    // Changing the password and consuming every outstanding link for the
    // account happen together, so a retry can't reuse a spent token.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: await bcrypt.hash(password, 10) },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ])

    // Signing them straight in saves a round trip through the login form.
    setAuthCookie(res, signToken(record.userId))
    res.json({ user: record.user })
  }),
)

export default router
