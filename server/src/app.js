import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { env } from './lib/env.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import { requireAuth } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import sectionRoutes from './routes/sections.js'
import todoRoutes from './routes/todos.js'

export function createApp() {
  const app = express()

  // credentials:true is what lets the browser send the httpOnly auth cookie.
  app.use(cors({ origin: env.clientOrigin, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/projects', requireAuth, projectRoutes)
  app.use('/api/sections', requireAuth, sectionRoutes)
  app.use('/api/todos', requireAuth, todoRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
