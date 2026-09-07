import { PrismaClient } from '@prisma/client'

// `node --watch` re-imports this module on every restart, so cache the client
// on globalThis to avoid exhausting the connection pool in development.
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
