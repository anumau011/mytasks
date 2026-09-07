import { env } from './env.js'
import { prisma } from './prisma.js'

// Periodic self-maintenance, run by the API process itself so there's no
// external scheduler to deploy.
//
// The health ping keeps the instance warm on hosts that idle it out. The reason
// it reads the body rather than firing and forgetting: an undici response whose
// body is never consumed holds its socket and buffered chunks until the GC gets
// around to it, so a ping every few minutes slowly accumulates them. Reading to
// completion (or cancelling) releases the connection immediately.

const TIMEOUT_MS = 10_000

async function pingHealth() {
  const url = `${env.cron.selfUrl}/api/health`
  // Without a timeout a hung request would leave the socket open until the
  // server's own keep-alive gives up, which is far longer than a tick.
  const abort = AbortSignal.timeout(TIMEOUT_MS)

  let res
  try {
    res = await fetch(url, { signal: abort })
  } catch (err) {
    console.error(`[cron] health ping failed: ${err.message}`)
    return
  }

  try {
    // Drain it. `text()` reads the stream to the end and frees the socket even
    // when the payload is discarded.
    await res.text()
  } catch {
    // A body that can't be read still has to be released explicitly.
    await res.body?.cancel().catch(() => {})
  }

  if (!res.ok) console.warn(`[cron] health ping returned ${res.status}`)
}

async function purgeExpiredResetTokens() {
  try {
    const { count } = await prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    if (count) console.log(`[cron] removed ${count} expired reset token(s)`)
  } catch (err) {
    console.error(`[cron] token purge failed: ${err.message}`)
  }
}

export function startCron() {
  const interval = env.cron.healthPingMs
  if (!interval || interval <= 0) {
    console.log('[cron] disabled (CRON_HEALTH_PING_MS is 0)')
    return () => {}
  }

  // One tick at a time. If a tick ever outruns the interval, skipping beats
  // stacking overlapping runs on top of each other.
  let running = false
  const tick = async () => {
    if (running) return
    running = true
    try {
      await pingHealth()
      await purgeExpiredResetTokens()
    } finally {
      running = false
    }
  }

  // Deliberately not unref'd: an unref'd interval doesn't reliably wake an
  // otherwise-idle event loop, which is exactly the state a keep-warm ping
  // exists for. Shutdown clears it, so the process still exits on a signal.
  const timer = setInterval(tick, interval)

  console.log(`[cron] health ping every ${Math.round(interval / 1000)}s`)
  return () => clearInterval(timer)
}
