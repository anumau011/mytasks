import { useEffect, useState } from 'react'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'
import Landing from './components/Landing'
import ResetPassword from './components/ResetPassword'
import Seo from './components/Seo'
import { auth } from './lib/api'

// There is no router, so the reset link is read straight off the query string.
const readResetToken = () =>
  new URLSearchParams(window.location.search).get('token')

// Drops ?token= from the address bar so a refresh (or a shared screenshot)
// doesn't replay a spent link.
const clearResetToken = () =>
  window.history.replaceState({}, '', window.location.pathname)

export default function App() {
  // undefined while the session cookie is being checked, null when signed out.
  const [user, setUser] = useState(undefined)
  const [resetToken, setResetToken] = useState(readResetToken)
  // Where a signed-out visitor is: the marketing page, or the form they opened
  // from it. Signed-in users never see either.
  const [view, setView] = useState('landing')

  useEffect(() => {
    auth
      .me()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  const finishReset = (nextUser) => {
    clearResetToken()
    setResetToken(null)
    setUser(nextUser)
  }

  // The link takes priority: someone following it is trying to change the
  // password on the account, whether or not this browser has a live session.
  if (resetToken) {
    return (
      <>
        <Seo title="Reset your password — MyTasks" path="/" noindex />
        <ResetPassword
          token={resetToken}
          onDone={finishReset}
          onCancel={() => {
            clearResetToken()
            setResetToken(null)
          }}
        />
      </>
    )
  }

  if (user === undefined) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-sm text-cream/55">Loading…</p>
      </main>
    )
  }

  if (!user) {
    // The landing page is what "/" means to a crawler and to anyone who has
    // not signed up yet; the auth form is one click behind it.
    if (view === 'landing') {
      return (
        <Landing
          onLogin={() => setView('login')}
          onSignup={() => setView('register')}
        />
      )
    }

    return (
      <>
        <Seo
          title={
            view === 'register'
              ? 'Create your MyTasks account'
              : 'Log in to MyTasks'
          }
          path="/"
          noindex
        />
        <AuthScreen
          initialMode={view}
          onAuthed={setUser}
          onBack={() => setView('landing')}
        />
      </>
    )
  }

  const logout = async () => {
    await auth.logout().catch(() => {})
    setUser(null)
    setView('landing')
  }

  // Keying on the user id drops every project from state when the account
  // changes, so one user's data can never flash in another's session.
  return (
    <>
      <Seo title="Your tasks — MyTasks" path="/" noindex />
      <Dashboard key={user.id} user={user} onLogout={logout} />
    </>
  )
}
