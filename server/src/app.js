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

  // The client is always a separate origin now that the Vite proxy is gone, so
  // every API call is a real CORS request. credentials:true is what puts
  // Access-Control-Allow-Credentials on the response and lets the browser both
  // send and store the httpOnly auth cookie; a wildcard origin is not allowed
  // in combination with it, which is why the origin is echoed back explicitly.
  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header: curl, the cron self-ping, same-origin navigations.
        if (!origin || env.clientOrigins.includes(origin)) {
          return callback(null, true)
        }
        // Answer without the CORS headers rather than raising — the browser
        // blocks it either way, and this keeps a stray origin out of the logs
        // as a 500.
        callback(null, false)
      },
      credentials: true,
    }),
  )
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
