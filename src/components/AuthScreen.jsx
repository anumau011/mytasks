import { useState } from 'react'
import { ArrowLeft, CheckCircle2, MailCheck } from 'lucide-react'
import { auth } from '../lib/api'
import { Input } from './ui'

// Gate in front of the app: every /api route below /auth needs a session.
// Three modes share the one form — log in, sign up, and request a reset link.
// `initialMode` is which of them the landing page's button asked for; `onBack`
// returns there, since the marketing page is now what "/" shows when signed out.
export default function AuthScreen({ onAuthed, initialMode = 'login', onBack }) {
  const [mode, setMode] = useState(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(null)
  const [busy, setBusy] = useState(false)

  const isLogin = mode === 'login'
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (isForgot) {
        setSent(await auth.forgotPassword(email))
        setBusy(false)
        return
      }
      const user = isLogin
        ? await auth.login(email, password)
        : await auth.register(name, email, password)
      onAuthed(user)
    } catch (err) {
      // Zod sends field-level details; show the first one, it's the specific message.
      const first = err.details && Object.values(err.details).flat()[0]
      setError(first ?? err.message)
      setBusy(false)
    }
  }

  const go = (next) => () => {
    setMode(next)
    setError(null)
    setSent(null)
  }

  const heading = isForgot
    ? 'Reset your password'
    : isLogin
      ? 'Welcome back'
      : 'Create your account'

  const blurb = isForgot
    ? 'Enter your email and we will send you a reset link.'
    : isLogin
      ? 'Log in to load your projects.'
      : 'Your projects are saved to your account.'

  // Once the request is in, there is nothing left to do on this screen, so the
  // confirmation replaces the form rather than sitting above it.
  if (sent) {
    return (
      <main className="flex h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-blush bg-surface p-7 text-center shadow-xl shadow-black/40">
          <MailCheck className="mx-auto h-8 w-8 text-mauve" />
          <h1 className="mt-4 text-lg font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-cream/55">{sent}</p>
          <button
            type="button"
            onClick={go('login')}
            className="mt-6 text-sm font-medium text-cream underline underline-offset-4 hover:text-mauve"
          >
            Back to log in
          </button>
        </div>
      </main>
    )
  }

  const submitLabel = isForgot
    ? 'Send reset link'
    : isLogin
      ? 'Log in'
      : 'Create account'

  return (
    <main className="flex h-screen items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-blush bg-surface p-7 shadow-xl shadow-black/40"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-mauve" />
            <span className="text-sm font-semibold tracking-wide">MyTasks</span>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-cream/55 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </button>
          )}
        </div>

        <h1 className="text-xl font-semibold">{heading}</h1>
        <p className="mt-1 text-sm text-cream/55">{blurb}</p>

        <div className="mt-6 space-y-3">
          {isRegister && (
            <div>
              <label
                htmlFor="auth-name"
                className="mb-1.5 block text-xs font-medium text-cream/65"
              >
                Name
              </label>
              <Input
                id="auth-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-xs font-medium text-cream/65"
            >
              Email
            </label>
            <Input
              id="auth-email"
              type="email"
              autoFocus={!isRegister}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {!isForgot && (
            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label
                  htmlFor="auth-password"
                  className="text-xs font-medium text-cream/65"
                >
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={go('forgot')}
                    className="text-xs text-cream/55 underline underline-offset-4 hover:text-cream"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-blush/60 bg-blush/10 px-3.5 py-2.5 text-sm text-blush">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={
            busy ||
            !email.trim() ||
            (!isForgot && !password) ||
            (isRegister && !name.trim())
          }
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-blush px-5 text-sm font-medium text-ink transition-colors hover:bg-mauve disabled:pointer-events-none disabled:opacity-40"
        >
          {busy ? 'Please wait…' : submitLabel}
        </button>

        <p className="mt-5 text-center text-sm text-cream/55">
          {isForgot ? (
            <button
              type="button"
              onClick={go('login')}
              className="font-medium text-cream underline underline-offset-4 hover:text-mauve"
            >
              Back to log in
            </button>
          ) : (
            <>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={go(isLogin ? 'register' : 'login')}
                className="font-medium text-cream underline underline-offset-4 hover:text-mauve"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </>
          )}
        </p>
      </form>
    </main>
  )
}
