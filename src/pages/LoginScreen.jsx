import { useState } from 'react'
import { BarChart3, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../data/AuthContext'
import { ROLES, ALL_ROLES } from '../utils/permissions'

const YEARS  = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const TIMES  = ['Light (1-3 hrs/wk)', 'Medium (4-6 hrs/wk)', 'Heavy (7+ hrs/wk)']
const ROLES_FIT = ['EDA', 'Modeling', 'Visualization', 'Presentation', 'Project Management']

export default function LoginScreen() {
  const [mode, setMode] = useState('login')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left brand panel — only on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,92,255,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(74,38,176,0.5),transparent_60%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/40">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-brand-300">Metropolitan State University</div>
              <div className="font-bold text-lg">Metro Analytics Club</div>
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Track every <span className="text-brand-300">competition.</span><br />
              Build every <span className="text-brand-300">team.</span>
            </h1>
            <p className="text-navy-200 text-lg max-w-md">
              Your club's home for MinneMUDAC, Kaggle, hackathons, and portfolio projects — all in one place.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="6" label="Active competitions" />
              <Stat n="42" label="Members" />
              <Stat n="9" label="Teams" />
            </div>
          </div>

          <div className="text-xs text-navy-400">
            © 2025 Metro Analytics Club. Built by &amp; for students.
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-navy-900">Metro Analytics Club</div>
              <div className="text-xs text-slate-500">Competition Tracker</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex mb-6 max-w-xs">
            <button onClick={() => setMode('login')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-600'}`}>
              Sign in
            </button>
            <button onClick={() => setMode('signup')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === 'signup' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-600'}`}>
              Create account
            </button>
          </div>

          {mode === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
      <div className="text-2xl font-bold">{n}</div>
      <div className="text-[11px] text-navy-300 leading-tight">{label}</div>
    </div>
  )
}

// ============================================================================
// LOGIN FORM
// ============================================================================
function LoginForm() {
  const { login, users } = useAuth()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const result = login(username)
    if (!result.ok) setError(result.error)
  }

  // Demo accounts shown as role-based cards. Each represents what that role
  // can see and do — we hide personal usernames in favor of role responsibilities.
  const demoAccounts = [
    { username: 'maria',    role: 'President',           icon: '👑',
      desc: 'Full system access. Manage members, teams, competitions, and approve requests.' },
    { username: 'sarah',    role: 'Vice President',      icon: '🛡️',
      desc: 'Operations manager. Create teams, edit competitions, post updates.' },
    { username: 'david',    role: 'Secretary',           icon: '📝',
      desc: 'Information hub. Meeting notes, action items, and announcements.' },
    { username: 'jamie',    role: 'Treasurer',           icon: '💰',
      desc: 'View access plus budget notes. No editing of teams or competitions.' },
    { username: 'yuezhang', role: 'Professor / Advisor', icon: '🎓',
      desc: 'Read-only mentor view. Can leave feedback for the officers.' },
    { username: 'alex',     role: 'Member',              icon: '👤',
      desc: 'Edit your profile, join teams, submit weekly check-ins.' }
  ].filter((d) => users.some((u) => u.username === d.username))

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-900 mb-1">Welcome back</h2>
      <p className="text-slate-500 text-sm mb-6">Sign in to your Metro Analytics Club account.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Username</label>
          <input className="input" value={username} onChange={(e) => { setUsername(e.target.value); setError('') }}
                 placeholder="e.g. maria" autoFocus />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full justify-center">
          Sign in <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {demoAccounts.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <div className="text-xs font-semibold text-navy-700 uppercase tracking-wide">Select a Role (Demo Mode)</div>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Each role sees a different version of the app. Click one to sign in and explore.
          </p>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((d) => (
              <button key={d.username}
                      onClick={() => { setUsername(d.username); setError('') }}
                      className="text-left p-3 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 transition flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-lg shrink-0">
                  {d.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-navy-900">{d.role}</div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{d.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Click a role to autofill, then press Sign in. (No personal accounts yet — coming in Phase 2.)
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SIGNUP FORM
// ============================================================================
function SignupForm() {
  const { signup } = useAuth()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    username: '', name: '', role: ROLES.MEMBER, major: '', year: 'Freshman',
    skillLevel: 'Beginner', preferredRole: 'EDA', availability: TIMES[0]
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const r = signup(form)
    if (!r.ok) setError(r.error)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-900 mb-1">Join the club</h2>
      <p className="text-slate-500 text-sm mb-6">Create your member profile.</p>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Username</label>
            <input className="input" required value={form.username} onChange={set('username')} placeholder="e.g. msmith" />
          </div>
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={set('name')} />
          </div>
        </div>

        <div>
          <label className="label">Role</label>
          <select className="select" value={form.role} onChange={set('role')}>
            {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">
            Most signups should choose "Member". Officer/Advisor accounts are normally created by the President.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Major</label>
            <input className="input" value={form.major} onChange={set('major')} placeholder="Data Science" />
          </div>
          <div>
            <label className="label">Year</label>
            <select className="select" value={form.year} onChange={set('year')}>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Skill level</label>
            <select className="select" value={form.skillLevel} onChange={set('skillLevel')}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Preferred role</label>
            <select className="select" value={form.preferredRole} onChange={set('preferredRole')}>
              {ROLES_FIT.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Weekly availability</label>
          <select className="select" value={form.availability} onChange={set('availability')}>
            {TIMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full justify-center">
          Create account <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
