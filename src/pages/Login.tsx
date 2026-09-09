
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field } from '../components/ui'
import { resetDemo, signIn } from '../lib/store'

const demos = [
  ['Parent', 'parent@northridge.edu', 'Parent@123', 'Two siblings at Northridge'],
  ['Teacher', 'teacher@northridge.edu', 'Teacher@123', 'Meera Krishnan · Maths'],
  ['School admin', 'admin@northridge.edu', 'Admin@123', 'Northridge Academy'],
  ['Super admin', 'super@meridian.app', 'Super@123', 'All campuses'],
  ['Other school parent', 'parent@harborview.edu', 'Parent@123', 'Isolation check'],
]

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('parent@northridge.edu')
  const [password, setPassword] = useState('Parent@123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function go(role: string) {
    if (role === 'parent') nav('/parent')
    else if (role === 'teacher') nav('/teacher')
    else if (role === 'school_admin') nav('/admin')
    else nav('/super')
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const s = signIn(email, password)
      go(s.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,#bae6fd,transparent_45%),linear-gradient(#ecfeff,#f8fafc)] px-4 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:gap-10 lg:grid-cols-2">
        <div className="hidden md:block">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">Meridian</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-slate-900">
            One campus platform.<br />Every school stays private.
          </h1>
          <p className="mt-4 max-w-md text-slate-600">
            Families see one child at a time. Staff stay inside their own school. Super admins run the network.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(8,145,178,0.55)]">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-600 font-extrabold text-white">M</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Meridian</p>
              <p className="text-sm text-slate-500">Campus for families</p>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Use a demo account or your school credentials.</p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" className="mt-2 w-full py-3" disabled={busy}>
              {busy ? 'Signing in…' : 'Continue'}
            </Button>
          </form>
          <div className="mt-6 space-y-2">
            {demos.map(([label, em, pw, hint]) => (
              <button
                key={em}
                type="button"
                onClick={() => {
                  setEmail(em)
                  setPassword(pw)
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="text-xs text-slate-500">{em}</span>
                </span>
                <span className="text-[11px] text-slate-400">{hint}</span>
              </button>
            ))}
          </div>
          <button onClick={() => resetDemo()} className="mt-4 w-full text-center text-xs text-slate-400">
            Reset demo data
          </button>
        </div>
      </div>
    </div>
  )
}
