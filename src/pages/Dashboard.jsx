import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Users, Briefcase, Trophy, Calendar, AlertTriangle, Send,
  Copy, Check, Sparkles, MessageSquareText, Eye, ChevronRight,
  CheckCircle2, ListTodo, Clock, CheckCircle, XCircle
} from 'lucide-react'
import { useData } from '../data/DataContext'
import { useAuth } from '../data/AuthContext'
import { formatDate, daysUntil } from '../utils/helpers'
import { StatusBadge } from '../components/Badges'
import { can, ROLES } from '../utils/permissions'
import { computeAlerts } from '../utils/portfolio'
import { suggestTeam } from '../utils/helpers'

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { currentUser } = useAuth()
  if (currentUser.role === ROLES.MEMBER)  return <MemberDashboard />
  if (currentUser.role === ROLES.ADVISOR) return <AdvisorDashboard />
  return <OfficerDashboard />
}

// ============================================================================
// OFFICER DASHBOARD — matches the screenshot layout
// ============================================================================
function OfficerDashboard() {
  const { currentUser } = useAuth()
  const { competitions, teams, members, joinRequests } = useData()
  const alerts = computeAlerts({ teams, competitions, joinRequests })
  const activeComps = competitions.filter((c) => c.status === 'Active')

  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '')
  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  const greet = timeOfDay()
  const firstName = currentUser.name.split(' ')[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">{greet}, {firstName}! <span>👋</span></h2>
        <p className="text-slate-500 mt-1">Here's what's happening with Metro Analytics Club.</p>
      </div>

      <PendingRequestsBanner />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     iconBg="bg-brand-100 text-brand-700"     label="Total Members"      value={members.length}      sub={members.length >= 5 ? '↑ +2 this week' : ''} />
        <StatCard icon={Briefcase} iconBg="bg-sky-100 text-sky-700"          label="Active Teams"        value={teams.length}        sub={teams.length >= 3 ? '↑ +1 this week' : ''} />
        <StatCard icon={Trophy}    iconBg="bg-emerald-100 text-emerald-700" label="Active Competitions" value={activeComps.length}  sub="No change" />
        <StatCard icon={Calendar}  iconBg="bg-amber-100 text-amber-700"     label="Upcoming Deadlines"  value={alerts.filter((a) => a.kind === 'deadline').length} sub={alerts.filter((a) => a.kind === 'deadline').length > 0 ? `${alerts.filter((a) => a.kind === 'deadline').length} need attention` : ''} subTone="warn" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Teams Overview table */}
          <TeamsOverview teams={teams} competitions={competitions} />

          {/* Recent check-ins */}
          <RecentCheckins teams={teams} />

          {/* Active competitions cards */}
          <ActiveCompetitionsRow competitions={competitions} />
        </div>

        <div className="space-y-6">
          {/* Needs Attention */}
          <NeedsAttentionCard alerts={alerts} />

          {/* Copy Teams Update */}
          {can(currentUser, 'teamsupdate.send') && (
            <CopyTeamsUpdateCard
              teams={teams} competitions={competitions}
              selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId}
              selectedTeam={selectedTeam}
            />
          )}

          {/* Quick Stats */}
          <QuickStatsCard teams={teams} competitions={competitions} />
        </div>
      </div>

      {activeComps.length > 0 && (
        <SeasonalCallout />
      )}
    </div>
  )
}

// ----- Header components -----
function StatCard({ icon: Icon, iconBg, label, value, sub, subTone }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-navy-900 leading-none">{value}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-sm font-semibold text-navy-800">{label}</div>
        {sub && <div className={`text-[11px] font-semibold mt-0.5 ${subTone === 'warn' ? 'text-amber-600' : 'text-emerald-600'}`}>
          {subTone === 'warn' && '⚠ '}{sub}
        </div>}
      </div>
    </div>
  )
}

function TeamsOverview({ teams, competitions }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-navy-900">Teams Overview</h3>
        <Link to="/teams" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          View all teams <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-2 pb-3 font-semibold">Team</th>
              <th className="px-2 pb-3 font-semibold">Competition</th>
              <th className="px-2 pb-3 font-semibold">Progress</th>
              <th className="px-2 pb-3 font-semibold">Status</th>
              <th className="px-2 pb-3 font-semibold">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {teams.map((t) => {
              const comp  = competitions.find((c) => c.id === t.competitionId)
              const days  = daysUntil(t.deadline)
              const tone  = t.progress >= 60 ? 'bg-emerald-500' : t.progress >= 30 ? 'bg-amber-500' : 'bg-rose-500'
              const initials = t.name.split(' ').slice(0, 2).map((s) => s[0]).join('')
              return (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-2 py-3">
                    <Link to={`/teams/${t.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 text-[11px] font-bold flex items-center justify-center">
                        {initials}
                      </div>
                      <span className="font-semibold text-navy-900">{t.name}</span>
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-slate-600 text-xs">{comp?.name || '—'}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-navy-800 w-9">{t.progress}%</div>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                        <div className={`h-full ${tone}`} style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-2 py-3 text-xs">
                    <div className="text-navy-800">{formatDate(t.deadline)}</div>
                    {days != null && days >= 0 && (
                      <div className={`${days <= 7 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {days} days left
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RecentCheckins({ teams }) {
  // Latest check-in across all teams
  const recent = teams
    .flatMap((t) => (t.checkins || []).map((c) => ({ ...c, team: t })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  if (recent.length === 0) return null
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-navy-900">Recent Check-ins</h3>
        <Link to="/teams" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {recent.map((c) => (
          <Link key={c.id} to={`/teams/${c.team.id}`} className="block p-3 rounded-xl hover:bg-slate-50 -mx-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                {c.team.name.split(' ').slice(0,2).map((s) => s[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-navy-900 text-sm">{c.team.name}</span>
                  <span className="text-xs text-slate-500">Updated {formatDate(c.date)}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 mb-1 uppercase tracking-wide font-semibold">What we did:</div>
                <div className="text-sm text-navy-800 line-clamp-2">{c.did}</div>
              </div>
              {c.help
                ? <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full whitespace-nowrap">⚠ Need help</span>
                : c.blockers
                  ? <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full whitespace-nowrap">Blocked</span>
                  : <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full whitespace-nowrap">No blockers</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ActiveCompetitionsRow({ competitions }) {
  const items = competitions.filter((c) => c.status !== 'Completed').slice(0, 3)
  if (items.length === 0) return null
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-navy-900">Active Competitions</h3>
        <Link to="/competitions" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 text-[10px] font-bold flex items-center justify-center">
                {c.name.split(' ')[0].slice(0, 2).toUpperCase()}
              </div>
              <div className="font-semibold text-navy-900 text-sm">{c.name}</div>
            </div>
            <StatusBadge status={c.status} />
            <div className="text-xs text-slate-500 mt-3">Deadline: {formatDate(c.deadline)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NeedsAttentionCard({ alerts }) {
  const sevColors = {
    danger:  'border-rose-200 bg-rose-50 text-rose-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info:    'border-sky-200 bg-sky-50 text-sky-900'
  }
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-navy-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" /> Needs Attention
        </h3>
        {alerts.length > 0 && (
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{alerts.length}</span>
        )}
      </div>
      {alerts.length === 0 ? (
        <div className="text-sm text-slate-500 italic">All clear — no urgent items.</div>
      ) : (
        <div className="space-y-2">
          {alerts.slice(0, 6).map((a, i) => (
            <div key={i} className={`p-3 rounded-xl border ${sevColors[a.severity]}`}>
              <div className="text-sm font-semibold">{a.title}</div>
              <div className="text-xs opacity-80 mt-0.5">{a.sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CopyTeamsUpdateCard({ teams, competitions, selectedTeamId, setSelectedTeamId, selectedTeam }) {
  const [copied, setCopied] = useState(false)

  const message = (() => {
    if (!selectedTeam) return ''
    const comp = competitions.find((c) => c.id === selectedTeam.competitionId)
    const days = daysUntil(selectedTeam.deadline)
    const last = (selectedTeam.checkins || [])[0]
    return `Metro Analytics Club Weekly Update — ${selectedTeam.name}

This week's progress:
• ${last?.did || selectedTeam.currentTask || '—'}

Deadlines:
• ${comp?.name || 'No competition'} — ${formatDate(selectedTeam.deadline)}${days != null && days >= 0 ? ` (${days} days left)` : ''}

Help needed:
• ${last?.help || (selectedTeam.status === 'Review Needed' ? 'Yes — see notes' : 'None')}

Next meeting: Wednesday 6 PM`
  })()

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { /* noop */ }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-navy-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-brand-600" /> Copy Teams Update
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">Generate a ready-to-send update for Microsoft Teams.</p>

      <select className="select text-xs mb-3" value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
        {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      {selectedTeam && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-navy-900 whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto">
{message}
        </div>
      )}

      <button onClick={copy} className="btn-primary w-full justify-center mt-3 text-sm">
        {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy to Clipboard</>}
      </button>
    </div>
  )
}

function QuickStatsCard({ teams, competitions }) {
  const completed = competitions.filter((c) => c.status === 'Completed').length
  const checkinCount = teams.reduce((s, t) => s + (t.checkins?.length || 0), 0)
  const avg = teams.length === 0 ? 0 : Math.round(teams.reduce((s, t) => s + t.progress, 0) / teams.length)

  return (
    <div className="card p-6">
      <h3 className="font-bold text-navy-900 mb-4">Quick Stats</h3>
      <div className="space-y-3 text-sm">
        <Row label="Active Teams"      value={teams.length}    delta="+1" />
        <Row label="Completed Projects" value={completed}      delta="" />
        <Row label="Check-ins Submitted" value={checkinCount}  delta="" />
        <Row label="Average Progress"   value={`${avg}%`}      delta="" />
      </div>
    </div>
  )
}

function Row({ label, value, delta }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-navy-900">{value}</span>
        {delta && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 rounded">{delta}</span>}
      </div>
    </div>
  )
}

function SeasonalCallout() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-amber-400" />
        <div>
          <div className="font-bold">Summer = Practice, Fall = MinneMUDAC.</div>
          <div className="text-sm text-navy-200">Build skills, win competitions, and create awesome projects together! 🚀</div>
        </div>
      </div>
      <Link to="/competitions" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold">
        View Roadmap
      </Link>
    </div>
  )
}

// ============================================================================
// PENDING JOIN REQUESTS BANNER (President / VP only)
// ============================================================================
function PendingRequestsBanner() {
  const { currentUser } = useAuth()
  const { joinRequests, members, teams, approveJoinRequest, denyJoinRequest } = useData()
  if (!can(currentUser, 'requests.approve')) return null
  const pending = joinRequests.filter((r) => r.status === 'Pending')
  if (pending.length === 0) return null

  return (
    <div className="card p-5 border-amber-200 bg-amber-50/50">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold text-amber-900">Pending Join Requests ({pending.length})</h3>
      </div>
      <div className="space-y-2">
        {pending.map((r) => {
          const m = members.find((x) => x.id === r.memberId)
          const t = teams.find((x) => x.id === r.teamId)
          return (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white text-xs font-bold flex items-center justify-center">
                {m?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?'}
              </div>
              <div className="flex-1 min-w-0 text-sm">
                <span className="font-semibold text-navy-900">{m?.name || 'Unknown'}</span>
                <span className="text-slate-600"> wants to join </span>
                <span className="font-semibold text-navy-900">{t?.name || 'Unknown team'}</span>
                {r.message && <div className="text-xs text-slate-500 mt-0.5 italic">"{r.message}"</div>}
              </div>
              <button onClick={() => approveJoinRequest(r.id)} className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Approve">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </button>
              <button onClick={() => denyJoinRequest(r.id)} className="p-1.5 hover:bg-rose-50 rounded-lg" title="Deny">
                <XCircle className="w-5 h-5 text-rose-500" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// MEMBER DASHBOARD
// ============================================================================
function MemberDashboard() {
  const { currentUser } = useAuth()
  const { competitions, teams, members, announcements, updateMember } = useData()
  const memberRecord = members.find((m) => m.name === currentUser.name) || null
  const myTeams = teams.filter((t) => memberRecord && t.memberIds?.includes(memberRecord.id))
  const myTasks = memberRecord?.tasks || []
  const tasksDone = myTasks.filter((t) => t.status === 'Done').length

  const setStatus = (taskId, status) => {
    if (!memberRecord) return
    const updated = myTasks.map((t) => t.id === taskId ? { ...t, status } : t)
    updateMember(memberRecord.id, { tasks: updated })
  }

  const greet = timeOfDay()
  const firstName = currentUser.name.split(' ')[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">{greet}, {firstName}! <span>🚀</span></h2>
        <p className="text-slate-500 mt-1">Your teams, tasks, and the latest from the club.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}    iconBg="bg-brand-100 text-brand-700"     label="My Teams"  value={myTeams.length} />
        <StatCard icon={ListTodo}     iconBg="bg-sky-100 text-sky-700"          label="My Tasks"   value={myTasks.length} />
        <StatCard icon={Trophy}       iconBg="bg-emerald-100 text-emerald-700" label="Competitions" value={competitions.filter((c) => c.status === 'Active').length} />
        <StatCard icon={CheckCircle2} iconBg="bg-amber-100 text-amber-700"     label="Tasks Done"  value={tasksDone} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-900">My Teams</h3>
              <Link to="/teams" className="text-sm font-semibold text-brand-600 hover:text-brand-700">All teams</Link>
            </div>
            {myTeams.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">
                You're not on a team yet. <Link to="/find-teammate" className="text-brand-600 font-semibold">Post you're looking</Link> or <Link to="/teams" className="text-brand-600 font-semibold">browse teams</Link>.
              </div>
            ) : (
              <div className="space-y-3">
                {myTeams.map((t) => {
                  const comp = competitions.find((c) => c.id === t.competitionId)
                  return (
                    <Link to={`/teams/${t.id}`} key={t.id} className="block p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-navy-900">{t.name}</div>
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="text-xs text-slate-500 mb-2">{comp?.name || '—'} · Due {formatDate(t.deadline)}</div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: `${t.progress}%` }} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4">My Tasks</h3>
            {myTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No tasks yet.</p>
            ) : (
              <ul className="space-y-2">
                {myTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                    <button
                      onClick={() => setStatus(t.id, t.status === 'Done' ? 'In Progress' : 'Done')}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0
                        ${t.status === 'Done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-brand-500'}`}
                    >
                      {t.status === 'Done' && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${t.status === 'Done' ? 'line-through text-slate-400' : 'text-navy-900'}`}>{t.title}</div>
                    </div>
                    <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white">
                      <option>Not Started</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4">Announcements</h3>
            <ul className="space-y-4">
              {announcements.slice(0, 5).map((a) => (
                <li key={a.id} className="border-l-2 border-brand-400 pl-3">
                  <div className="font-semibold text-sm text-navy-900">{a.title}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{a.body}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{formatDate(a.date)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ADVISOR DASHBOARD — read-only with feedback
// ============================================================================
function AdvisorDashboard() {
  const { currentUser } = useAuth()
  const { competitions, teams, members, activity, feedback, addFeedback, removeFeedback } = useData()
  const [text, setText] = useState('')

  const submit = () => {
    if (!text.trim()) return
    addFeedback({ author: currentUser.name, body: text.trim(), date: new Date().toISOString().slice(0, 10) })
    setText('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">Welcome, {currentUser.name}</h2>
        <p className="text-slate-500 mt-1">Read-only view of club progress and team activity.</p>
      </div>

      <div className="card p-4 flex items-center gap-3 bg-purple-50 border-purple-200 text-purple-900">
        <Eye className="w-5 h-5" />
        <div className="text-sm">
          <strong>Read-only access.</strong> You can view all data and leave feedback, but not edit. Reach out to the club officers for changes.
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     iconBg="bg-purple-100 text-purple-700"   label="Club Members"   value={members.length} />
        <StatCard icon={Briefcase} iconBg="bg-sky-100 text-sky-700"          label="Active Teams"   value={teams.length} />
        <StatCard icon={Trophy}    iconBg="bg-emerald-100 text-emerald-700" label="Active Comps"   value={competitions.filter((c) => c.status === 'Active').length} />
        <StatCard icon={CheckCircle2} iconBg="bg-amber-100 text-amber-700"  label="Completed"      value={competitions.filter((c) => c.status === 'Completed').length} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <TeamsOverview teams={teams} competitions={competitions} />

          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4">Leave Feedback for the Club</h3>
            <textarea className="textarea" rows={3} placeholder="Share suggestions, encouragement, or questions for the officers…"
                      value={text} onChange={(e) => setText(e.target.value)} />
            <div className="mt-2 flex justify-end">
              <button onClick={submit} className="btn-primary">Post feedback</button>
            </div>

            {feedback.length > 0 && (
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                {feedback.map((f) => (
                  <div key={f.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                      {f.author.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <div className="font-semibold text-sm text-navy-900">{f.author}</div>
                        <div className="text-[11px] text-slate-400">{formatDate(f.date)}</div>
                        <button onClick={() => removeFeedback(f.id)} className="ml-auto text-[11px] text-slate-400 hover:text-rose-500">Remove</button>
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5">{f.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4">Recent Club Activity</h3>
            <ul className="space-y-3">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <MessageSquareText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-navy-900"><span className="font-semibold">{a.who}</span> {a.what}</div>
                    <div className="text-xs text-slate-500">{a.when}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
