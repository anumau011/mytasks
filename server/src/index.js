import { env } from './lib/env.js'
import { prisma } from './lib/prisma.js'
import { startCron } from './lib/cron.js'
import { createApp } from './app.js'

const app = createApp()

const server = app.listen(env.port, () => {
  console.log(`API ready on http://localhost:${env.port}`)
})

// Started after listen, so the first self-ping has something to talk to.
const stopCron = startCron()

const shutdown = async (signal) => {
  console.log(`\n${signal} received, shutting down.`)
  stopCron()
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
