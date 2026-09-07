import { HttpError } from '../lib/http.js'

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
  }

  // Unique constraint violation from Prisma.
  if (err?.code === 'P2002') {
    return res.status(409).json({ error: 'That value is already taken' })
  }
  // Record required but not found.
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Not found' })
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
