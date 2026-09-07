import jwt from 'jsonwebtoken'
import { env } from '../lib/env.js'
import { asyncHandler, unauthorized } from '../lib/http.js'
import { prisma } from '../lib/prisma.js'

export const COOKIE_NAME = 'token'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

// The client calls this API from another origin, so the session cookie has to
// survive a cross-site request.
//
// In production the two halves sit on different *.onrender.com subdomains, and
// onrender.com is on the Public Suffix List — so they are different *sites*,
// not just different origins, and SameSite=Lax would drop the cookie. None is
// the only value a browser will send there, and it is only honoured alongside
// Secure, which Render's HTTPS provides.
//
// Locally the client is on :5173 and this server on :4000. Ports play no part
// in what counts as a site, so those are same-site and Lax still applies —
// which matters, because Secure would fail over plain http.
const cookieOptions = {
  httpOnly: true,
  sameSite: env.isProd ? 'none' : 'lax',
  secure: env.isProd,
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '7d' })
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: MAX_AGE_MS })
}

// Must match the options the cookie was set with, or the browser keeps it.
export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions)
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
