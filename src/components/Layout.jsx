import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Trophy, Users, UsersRound, ClipboardList,
  BookOpen, Search, Bell, Menu, X, BarChart3, MessagesSquare,
  FileText, Wallet, ChevronDown, LogOut, Eye, UserCircle, Crown,
  UserPlus, TrendingUp
} from 'lucide-react'
import { useAuth } from '../data/AuthContext'
import { can, ROLES, ROLE_LABELS, ROLE_COLORS, ALL_ROLES, isPresident } from '../utils/permissions'
import { useData } from '../data/DataContext'

// Each nav item lists which permission gates it (or null for everyone)
const NAV = [
  { to: '/',              label: 'Dashboard',     icon: LayoutDashboard, perm: null },
  { to: '/competitions',  label: 'Competitions',  icon: Trophy,          perm: null },
  { to: '/teams',         label: 'Teams',         icon: UsersRound,      perm: null },
  { to: '/find-teammate', label: 'Find a Teammate', icon: UserPlus,      perm: null },
  { to: '/members',       label: 'Members',       icon: Users,           perm: 'members.view_all' },
  { to: '/matching',      label: 'Team Matching', icon: ClipboardList,   perm: 'teams.assign' },
  { to: '/notes',         label: 'Meeting Notes', icon: FileText,        perm: 'notes.create' },
  { to: '/treasurer',     label: 'Treasurer',     icon: Wallet,          perm: 'budget.view', isNew: true },
  { to: '/budget',        label: 'Budget Notes',  icon: Wallet,          perm: 'budget.view' },
  { to: '/analytics',     label: 'Analytics',     icon: TrendingUp,      perm: null },
  { to: '/resources',     label: 'Resources',     icon: BookOpen,        perm: null },
  { to: '/profile',       label: 'My Profile',    icon: UserCircle,      perm: 'profile.edit_own' }
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { currentUser, realUser } = useAuth()
  const { joinRequests } = useData()

  const visibleNav = NAV.filter((item) => !item.perm || can(currentUser, item.perm))

  const titleMap = {
    '/': 'Dashboard', '/competitions': 'Competitions', '/teams': 'Teams',
    '/members': 'Members', '/matching': 'Team Matching', '/notes': 'Meeting Notes',
    '/budget': 'Budget Notes', '/treasurer': 'Treasurer Dashboard',
    '/resources': 'Resources', '/profile': 'My Profile',
    '/find-teammate': 'Find a Teammate', '/analytics': 'Club Analytics'
  }
  // Match dynamic team detail route
  let title = titleMap[location.pathname] || 'Metro Analytics Club'
  if (location.pathname.startsWith('/teams/')) title = 'Team Detail'

  const pendingRequests = joinRequests.filter((r) => r.status === 'Pending').length

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ---------- SIDEBAR ---------- */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-navy-900 text-white
                         flex flex-col transform transition-transform
                         ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 pt-7 pb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
                          flex items-center justify-center shadow-lg shadow-brand-900/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-[15px]">Metro Analytics Club</div>
            <div className="text-[11px] text-navy-300 uppercase tracking-wider">Competition Tracker</div>
          </div>
        </div>

        <nav className="px-4 py-2 flex-1 overflow-y-auto scroll-thin">
          <div className="text-[10px] uppercase tracking-widest text-navy-400 px-3 py-2 font-semibold">
            {currentUser?.role === ROLES.MEMBER ? 'Main' :
             currentUser?.role === ROLES.ADVISOR ? 'Advisor View' : 'Officer Tools'}
          </div>
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-[14px] font-medium transition-colors
                 ${isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-900/40'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-white'}`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="flex-1">{label}</span>
              {to === '/teams' && pendingRequests > 0 && can(currentUser, 'requests.approve') && (
                <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                  {pendingRequests}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-4 p-4 rounded-2xl bg-navy-800/70 border border-navy-700">
          <div className="flex items-start gap-3">
            <MessagesSquare className="w-5 h-5 text-brand-300 mt-0.5 shrink-0" />
            <div className="text-[12px] leading-snug">
              <div className="font-semibold text-white mb-0.5">Microsoft Teams</div>
              <div className="text-navy-300">Stay connected with the club.</div>
            </div>
          </div>
          <a href="https://teams.microsoft.com" target="_blank" rel="noreferrer"
             className="mt-3 w-full inline-flex items-center justify-center text-[12px] font-semibold
                        bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 transition">
            Open Teams →
          </a>
        </div>

        {realUser && <SidebarUserCard />}
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-30 lg:hidden" />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setOpen((o) => !o)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100" aria-label="Toggle navigation">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-navy-900 truncate">{title}</h1>
          </div>

          {currentUser && <RolePill />}

          <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-2 w-56 lg:w-64">
            <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <input placeholder="Search…" className="bg-transparent outline-none text-sm flex-1 placeholder:text-slate-500" />
          </div>

          <button className="relative p-2 rounded-lg hover:bg-slate-100" aria-label="Notifications">
            <Bell className="w-5 h-5 text-navy-700" />
            {pendingRequests > 0 && can(currentUser, 'requests.approve') && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingRequests}
              </span>
            )}
          </button>

          <UserMenu />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <PreviewBanner />
          {children}
        </main>
      </div>
    </div>
  )
}

function PreviewBanner() {
  const { currentUser, setViewAs } = useAuth()
  if (!currentUser?._viewing) return null
  return (
    <div className="mb-4 flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="text-sm text-amber-900 flex items-center gap-2">
        <Eye className="w-4 h-4" />
        Previewing as <strong>{currentUser.role}</strong>. Buttons and pages are filtered to that role's access.
      </div>
      <button onClick={() => setViewAs(null)} className="text-xs font-semibold text-amber-900 hover:underline">
        Exit preview
      </button>
    </div>
  )
}

function RolePill() {
  const { currentUser, realUser, viewAs, setViewAs } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const colors = ROLE_COLORS[currentUser.role] || ROLE_COLORS.Member
  const canSwitch = isPresident(realUser)

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => canSwitch && setMenuOpen((o) => !o)}
        disabled={!canSwitch}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ring-1 transition
          ${colors.bg} ${colors.text} ${colors.ring}
          ${canSwitch ? 'hover:brightness-95 cursor-pointer' : 'cursor-default'}`}
      >
        <span>{colors.icon}</span>
        {ROLE_LABELS[currentUser.role]}
        {canSwitch && <ChevronDown className="w-3 h-3" />}
      </button>

      {menuOpen && canSwitch && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1">
            <Crown className="w-3 h-3" /> Preview as
          </div>
          {ALL_ROLES.map((r) => (
            <button key={r}
                    onClick={() => { setViewAs(r === ROLES.PRESIDENT ? null : r); setMenuOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between
                      ${currentUser.role === r ? 'bg-brand-50 text-brand-800 font-semibold' : 'hover:bg-slate-50'}`}>
                <span>{ROLE_COLORS[r].icon} {r}</span>
                {currentUser.role === r && <span className="text-[10px] text-brand-700">Current</span>}
            </button>
          ))}
          {viewAs && (
            <button onClick={() => { setViewAs(null); setMenuOpen(false) }}
                    className="w-full text-left px-3 py-2 mt-1 rounded-lg text-sm border-t border-slate-100 text-rose-600 hover:bg-rose-50">
              Exit preview, return to President
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const { currentUser, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!currentUser) return null
  const initials = currentUser.name.split(' ').map((p) => p[0]).slice(0, 2).join('')

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-3 p-1 pr-2 rounded-lg hover:bg-slate-100">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-xs font-bold flex items-center justify-center shadow">
          {initials}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <div className="text-sm font-semibold text-navy-900">{currentUser.name}</div>
          <div className="text-[11px] text-slate-500">{currentUser.role}</div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="font-semibold text-sm text-navy-900">{currentUser.name}</div>
            <div className="text-xs text-slate-500">@{currentUser.username}</div>
          </div>
          <NavLink to="/profile" onClick={() => setOpen(false)}
                   className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-slate-50">
            <UserCircle className="w-4 h-4 text-slate-500" /> My Profile
          </NavLink>
          <button onClick={() => { logout(); setOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-rose-50 text-rose-600">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function SidebarUserCard() {
  const { realUser } = useAuth()
  if (!realUser) return null
  const initials = realUser.name.split(' ').map((p) => p[0]).slice(0, 2).join('')
  const colors = ROLE_COLORS[realUser.role]
  return (
    <div className="m-4 p-3 rounded-2xl bg-navy-800/50 border border-navy-700 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white truncate">{realUser.name}</div>
        <div className="text-[10px] font-bold uppercase tracking-wide text-brand-300">
          {colors.icon} {realUser.role}
        </div>
      </div>
    </div>
  )
}
