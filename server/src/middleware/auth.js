import jwt from 'jsonwebtoken'
import { env } from '../lib/env.js'
import { asyncHandler, unauthorized } from '../lib/http.js'
import { prisma } from '../lib/prisma.js'

export const COOKIE_NAME = 'token'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '7d' })
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    maxAge: MAX_AGE_MS,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
  })
}

// Accepts the token from the httpOnly cookie or an Authorization header,
// so browsers and API clients can both authenticate.
function readToken(req) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) return header.slice(7)
  return req.cookies?.[COOKIE_NAME] ?? null
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = readToken(req)
  if (!token) throw unauthorized()

  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret)
  } catch {
    throw unauthorized('Session expired or invalid')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, createdAt: true },
  })
  if (!user) throw unauthorized('Account no longer exists')

  req.user = user
  next()
})
