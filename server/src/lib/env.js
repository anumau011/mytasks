import 'dotenv/config'

function required(name, fallback) {
  const value = process.env[name] ?? fallback
  if (!value) {
    console.error(`Missing required environment variable: ${name}`)
    console.error('Copy server/.env.example to server/.env and fill it in.')
    process.exit(1)
  }
  return value
}

const port = Number(process.env.PORT ?? 4000)
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  port,
  clientOrigin,
  isProd: process.env.NODE_ENV === 'production',

  // Reset links point at the client, which is a different origin in dev.
  appUrl: (process.env.APP_URL ?? clientOrigin).replace(/\/$/, ''),
  resetTokenMinutes: Number(process.env.RESET_TOKEN_MINUTES ?? 30),

  // Optional: without these the reset route still works, it just logs the link
  // instead of mailing it. Keeps local development running with no account.
  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID ?? '',
    templateId: process.env.EMAILJS_TEMPLATE_ID ?? '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY ?? '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY ?? '',
  },

  cron: {
    // 0 disables the self-ping entirely.
    healthPingMs: Number(process.env.CRON_HEALTH_PING_MS ?? 5 * 60 * 1000),
    selfUrl: (process.env.SELF_URL ?? `http://127.0.0.1:${port}`).replace(/\/$/, ''),
  },
}
