'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [setupRequired, setSetupRequired] = useState(false)
  const [destination, setDestination] = useState('/')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSetupRequired(params.get('setup') === 'required')
    const next = params.get('next')
    if (next?.startsWith('/') && !next.startsWith('//')) setDestination(next)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Unable to sign in.')
        return
      }

      router.replace(destination)
      router.refresh()
    } catch {
      setError('Could not reach the KX sign-in service. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090e] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_68%)]" />
      <section className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold">KX</div>
          <div>
            <p className="text-sm font-semibold tracking-wide">KX Sanctuary OS</p>
            <p className="mt-0.5 text-xs text-slate-500">Private workspace</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.09] bg-[#0b1019]/95 p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-300/[0.08] text-sky-200">
            {setupRequired ? <ShieldCheck className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {setupRequired ? 'Private access is not configured' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {setupRequired
              ? 'The deployment owner must configure KX_WEB_ACCESS_PASSWORD and a 32-character KX_WEB_SESSION_SECRET before this workspace can be opened.'
              : 'Enter your private workspace password to continue.'}
          </p>

          {!setupRequired && (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="kx-password" className="mb-2 block text-xs font-medium text-slate-300">
                  Access password
                </label>
                <div className="flex overflow-hidden rounded-lg border border-white/10 bg-black/20 focus-within:border-sky-300/40">
                  <input
                    id="kx-password"
                    type={visible ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((value) => !value)}
                    className="px-3 text-xs text-slate-500 transition hover:text-slate-200"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                  >
                    {visible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs text-rose-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !password}
                className="flex w-full items-center justify-center rounded-lg border border-sky-300/20 bg-sky-300/[0.10] px-4 py-3 text-sm font-medium text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-300/[0.15] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Verifying…' : 'Unlock workspace'}
              </button>
            </form>
          )}

          <p className="mt-7 border-t border-white/[0.07] pt-5 text-[11px] leading-5 text-slate-600">
            Private access session · 12-hour expiry · HttpOnly secure cookie
          </p>
        </div>
      </section>
    </main>
  )
}
