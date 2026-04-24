'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

const DEPTS = ['Engineering', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Legal', 'IT Support']

const DEMO = [
  { label: 'Employee', email: 'anurag@empowertech.in', pass: 'emp123' },
  { label: 'Admin', email: 'admin@empowertech.in', pass: 'admin123' },
]

export default function AuthPage() {
  const router = useRouter()
  const setUser = useStore((s) => s.setUser)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  // shared
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // signup only
  const [name, setName] = useState('')
  const [dept, setDept] = useState('')

  function switchMode(m: 'login' | 'signup') {
    setMode(m); setError('')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error?.message || 'Login failed'); return }
    setUser(data.data.user)
    router.push(data.data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard/chat')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!dept) { setError('Please select your department'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, dept }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error?.message || 'Signup failed'); return }
    setUser(data.data.user)
    router.push('/dashboard/chat')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute -top-32 -right-32 w-125 h-125 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-100 h-100 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="fade-in w-full max-w-md z-10">

        {/* Logo */}
        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            EmpowerTech
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI IT Support Portal · Chennai</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">

          {/* Mode tabs */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Email Address</label>
                <input
                  type="email" placeholder="you@empowertech.in"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Password</label>
                <input
                  type="password" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full mt-1 bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/25 active:translate-y-0 text-sm"
              >
                {loading ? '⏳ Signing in...' : 'Sign In'}
              </button>

              {/* Demo credentials */}
              <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-4">
                <p className="text-sky-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  Demo Credentials — Click to fill
                </p>
                <div className="flex flex-col gap-2">
                  {DEMO.map((c) => (
                    <button
                      key={c.label} type="button"
                      onClick={() => { setEmail(c.email); setPassword(c.pass) }}
                      className="flex justify-between items-center px-3 py-2.5 rounded-lg bg-white/3 hover:bg-white/[0.07] border border-white/5 hover:border-white/10 transition-all text-left group"
                    >
                      <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{c.label}</span>
                      <span className="text-slate-500 text-xs group-hover:text-slate-400 transition-colors">{c.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Full Name</label>
                <input
                  type="text" placeholder="Your full name"
                  value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Department */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Department</label>
                <select
                  value={dept} onChange={(e) => setDept(e.target.value)} required
                  className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-slate-900">Select your department</option>
                  {DEPTS.map((d) => (
                    <option key={d} value={d} className="bg-slate-900">{d}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Email Address</label>
                <input
                  type="email" placeholder="you@empowertech.in"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Password</label>
                <input
                  type="password" placeholder="Min. 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full mt-1 bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/25 active:translate-y-0 text-sm"
              >
                {loading ? '⏳ Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-slate-600 text-xs">
                Signing up creates an employee account. Contact IT for admin access.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">
          EmpowerTech Solutions · IT Department · Chennai 🇮🇳
        </p>
      </div>
    </main>
  )
}
