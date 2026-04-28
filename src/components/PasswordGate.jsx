import { useState, useEffect } from 'react'
import { BarChart3, Lock, ArrowRight, AlertCircle } from 'lucide-react'

// ============================================================================
// PASSWORD GATE
//
// A simple shared-password lock that wraps the entire app. This is a "demo
// lock" — anyone with browser dev tools can see the password in the source.
// It's enough to stop random URL discovery, NOT real adversaries. Real
// per-user authentication comes in Phase 2 with Supabase.
//
// To change the password, edit the SHARED_PASSWORD constant below.
// ============================================================================

const SHARED_PASSWORD = 'mac2025'
const STORAGE_KEY = 'mac_gate_unlocked'

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // On mount: check if the user has already unlocked in this browser
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'yes') {
      setUnlocked(true)
    }
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (password.trim().toLowerCase() === SHARED_PASSWORD.toLowerCase()) {
      localStorage.setItem(STORAGE_KEY, 'yes')
      setUnlocked(true)
    } else {
      setError('Wrong password. Ask the club President for the access code.')
    }
  }

  if (unlocked) return children

  return (
    <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,92,255,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(74,38,176,0.5),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/40">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-brand-300">Metropolitan State University</div>
            <div className="font-bold text-xl">Metro Analytics Club</div>
          </div>
        </div>

        {/* Gate card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-brand-300" />
            <h1 className="text-xl font-bold">Private demo</h1>
          </div>
          <p className="text-navy-200 text-sm mb-6">
            This is a private preview for Metro Analytics Club officers. Enter the access code to continue.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-200 uppercase tracking-wide mb-2">
                Access code
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="Enter code"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-navy-400 outline-none focus:border-brand-400 focus:bg-white/15 transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-900/30 border border-rose-500/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-brand-900/30"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-navy-400 mt-6 leading-relaxed">
            This demo gate is for the preview phase only. Real per-user accounts with email login are coming soon.
          </p>
        </div>

        <div className="text-center text-[11px] text-navy-400 mt-6">
          © 2025 Metro Analytics Club. Built by &amp; for students.
        </div>
      </div>
    </div>
  )
}
