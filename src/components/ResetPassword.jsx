import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { auth } from '../lib/api'
import { Input } from './ui'

// Landing screen for the emailed link. The token comes from ?token= in the URL;
// a successful reset signs the user in, so there is no second login step.
export default function ResetPassword({ token, onDone, onCancel }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const mismatch = confirm.length > 0 && password !== confirm

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Those passwords do not match.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      onDone(await auth.resetPassword(token, password))
    } catch (err) {
      const first = err.details && Object.values(err.details).flat()[0]
      setError(first ?? err.message)
      setBusy(false)
    }
  }

  return (
    <main className="flex h-screen items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-blush bg-surface p-7 shadow-xl shadow-black/40"
      >
        <div className="mb-6 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-mauve" />
          <span className="text-sm font-semibold tracking-wide">Tasks</span>
        </div>

        <h1 className="text-xl font-semibold">Choose a new password</h1>
        <p className="mt-1 text-sm text-cream/55">
          This link works once, then it stops working.
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <label
              htmlFor="reset-password"
              className="mb-1.5 block text-xs font-medium text-cream/65"
            >
              New password
            </label>
            <Input
              id="reset-password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              htmlFor="reset-confirm"
              className="mb-1.5 block text-xs font-medium text-cream/65"
            >
              Confirm password
            </label>
            <Input
              id="reset-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              autoComplete="new-password"
              className={mismatch ? 'border-blush' : ''}
            />
            {mismatch && (
              <p className="mt-1.5 text-xs text-blush">
                Those passwords do not match.
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-blush/60 bg-blush/10 px-3.5 py-2.5 text-sm text-blush">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || password.length < 8 || mismatch || !confirm}
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-blush px-5 text-sm font-medium text-ink transition-colors hover:bg-mauve disabled:pointer-events-none disabled:opacity-40"
        >
          {busy ? 'Please wait…' : 'Set new password'}
        </button>

        <p className="mt-5 text-center text-sm text-cream/55">
          <button
            type="button"
            onClick={onCancel}
            className="font-medium text-cream underline underline-offset-4 hover:text-mauve"
          >
            Back to log in
          </button>
        </p>
      </form>
    </main>
  )
}
