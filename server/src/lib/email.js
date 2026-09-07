import { env } from './env.js'

const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

// EmailJS rejects server-side calls unless the account has
// "Allow EmailJS API for non-browser applications" switched on under
// Account -> Security, and `accessToken` (the private key) is what authorises
// them. See server/README.md for the setup steps.
export const emailConfigured = Boolean(
  env.emailjs.serviceId &&
    env.emailjs.templateId &&
    env.emailjs.publicKey &&
    env.emailjs.privateKey,
)

// Sends one templated email. Resolves to true on success; never throws, so a
// provider outage can't turn into a 500 on a route the user is waiting on.
export async function sendEmail(templateParams) {
  if (!emailConfigured) {
    console.warn('EmailJS is not configured; skipping send.')
    return false
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: env.emailjs.serviceId,
        template_id: env.emailjs.templateId,
        user_id: env.emailjs.publicKey,
        accessToken: env.emailjs.privateKey,
        template_params: templateParams,
      }),
    })

    // EmailJS answers in plain text, and the body has to be read either way so
    // the socket is released back to the agent pool.
    const body = await res.text()
    if (!res.ok) {
      console.error(`EmailJS send failed (${res.status}): ${body}`)
      return false
    }
    return true
  } catch (err) {
    console.error('EmailJS request threw:', err.message)
    return false
  }
}

export function sendPasswordResetEmail({ to, name, link, minutes }) {
  // These keys are the variables the EmailJS template is expected to declare:
  // {{to_email}}, {{to_name}}, {{reset_link}}, {{expires_minutes}}.
  return sendEmail({
    to_email: to,
    to_name: name,
    reset_link: link,
    expires_minutes: String(minutes),
  })
}
