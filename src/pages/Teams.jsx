import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Pencil, Copy, Check, Link as LinkIcon, UserPlus, Lock, CheckCircle, XCircle, Clock, Github } from 'lucide-react'
import { useData } from '../data/DataContext'
import { useAuth } from '../data/AuthContext'
import { can } from '../utils/permissions'
import Modal from '../components/Modal'
import { StatusBadge } from '../components/Badges'
import { formatDate, daysUntil } from '../utils/helpers'
import { portfolioScore } from '../utils/portfolio'

const STATUSES = ['Not Started', 'In Progress', 'Review Needed', 'Done']

export default function Teams() {
  const { teams, members, competitions, addTeam, updateTeam, removeTeam, joinRequests } = useData()
  const { currentUser } = useAuth()
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState(null)

  const canCreate  = can(currentUser, 'teams.create')
  const canEdit    = can(currentUser, 'teams.edit')
  const canDelete  = can(currentUser, 'teams.delete')
  const canApprove = can(currentUser, 'requests.approve')
  const canRequest = can(currentUser, 'requests.create')

  // Member's own record (for join-request UI)
  const myRecord = members.find((m) => m.name === currentUser.name) || null
  const myPendingRequests = joinRequests.filter((r) => r.memberId === myRecord?.id && r.status === 'Pending')

  const openNew  = () => { setEditing({}); setOpen(true) }
  const openEdit = (t) => { setEditing(t); setOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <p className="text-slate-500">Teams working on competitions and projects this semester.</p>
        {canCreate && (
          <button onClick={openNew} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Team
          </button>
        )}
      </div>

      {!canCreate && (
        <div className="card p-3 flex items-center gap-2 bg-slate-50 text-slate-600 text-sm">
          <Lock className="w-4 h-4" /> You can browse teams and request to join. Officers create and manage teams.
        </div>
      )}

      {/* Join requests panel — for officers who can approve */}
      {canApprove && <PendingRequestsPanel />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {teams.map((t) => (
          <TeamCard key={t.id} team={t}
                    members={members} competitions={competitions}
                    canEdit={canEdit} canDelete={canDelete} canRequest={canRequest}
                    myRecord={myRecord}
                    myPendingRequests={myPendingRequests}
                    onEdit={() => openEdit(t)}
                    onDelete={() => confirm(`Delete ${t.name}?`) && removeTeam(t.id)} />
        ))}
      </div>

      {teams.length === 0 && <div className="card p-10 text-center text-slate-500">No teams yet.</div>}

      {open && (
        <TeamModal
          initial={editing} members={members} competitions={competitions}
          onClose={() => { setOpen(false); setEditing(null) }}
          onSave={(d) => {
            if (editing?.id) updateTeam(editing.id, d)
            else addTeam(d)
            setOpen(false); setEditing(null)
          }}
        />
      )}
    </div>
  )
}

// ----- Pending requests panel for officers -----
function PendingRequestsPanel() {
  const { joinRequests, members, teams, approveJoinRequest, denyJoinRequest } = useData()
  const pending = joinRequests.filter((r) => r.status === 'Pending')
  if (pending.length === 0) return null

  return (
    <div className="card p-5 border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold text-navy-900">Pending Join Requests ({pending.length})</h3>
      </div>
      <div className="space-y-2">
        {pending.map((r) => {
          const m = members.find((x) => x.id === r.memberId)
          const t = teams.find((x) => x.id === r.teamId)
          return (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white text-xs font-bold flex items-center justify-center">
                {m?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?'}
              </div>
              <div className="flex-1 min-w-0 text-sm">
                <span className="font-semibold text-navy-900">{m?.name || 'Unknown'}</span>
                <span className="text-slate-600"> wants to join </span>
                <span className="font-semibold text-navy-900">{t?.name}</span>
                {r.message && <div className="text-xs text-slate-500 mt-0.5 italic">"{r.message}"</div>}
              </div>
              <button onClick={() => approveJoinRequest(r.id)} className="p-1.5 hover:bg-emerald-100 rounded-lg" title="Approve">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </button>
              <button onClick={() => denyJoinRequest(r.id)} className="p-1.5 hover:bg-rose-100 rounded-lg" title="Deny">
                <XCircle className="w-5 h-5 text-rose-500" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ----- Team card -----
function TeamCard({ team, members, competitions, canEdit, canDelete, canRequest, myRecord, myPendingRequests, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const comp = competitions.find((c) => c.id === team.competitionId)
  const teamMembers = members.filter((m) => team.memberIds?.includes(m.id))
  const days = daysUntil(team.deadline)

  // Member-related flags
  const isOnTeam   = myRecord && team.memberIds?.includes(myRecord.id)
  const hasPending = myPendingRequests?.some((r) => r.teamId === team.id)
  const canJoin    = canRequest && myRecord && !isOnTeam && !hasPending

  const update =
`Metro Analytics Club Weekly Update — ${team.name}

Active Competition:
• ${comp?.name || '(unassigned)'}

Team Progress:
• Current task: ${team.currentTask || '—'}
• Status: ${team.status} (${team.progress}%)
• Members: ${teamMembers.map((m) => m.name).join(', ') || '—'}

Upcoming Deadline:
• ${team.deadline ? formatDate(team.deadline) : '(none set)'}

Help Needed:
• ${team.status === 'Review Needed' ? team.weeklyNotes || 'Yes — see notes' : 'None'}

Notes:
${team.weeklyNotes || '(none)'}

Next Meeting: Wednesday 6 PM`

  const copy = async () => {
    try { await navigator.clipboard.writeText(update); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { /* noop */ }
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/teams/${team.id}`} className="hover:underline">
            <h3 className="font-bold text-navy-900 text-lg">{team.name}</h3>
          </Link>
          <div className="text-sm text-slate-500">{comp?.name || 'No competition assigned'}</div>
        </div>
        <div className="flex gap-1">
          {canEdit && (
            <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded-lg"><Pencil className="w-4 h-4 text-slate-600" /></button>
          )}
          {canDelete && (
            <button onClick={onDelete} className="p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4 text-rose-500" /></button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <StatusBadge status={team.status} />
        {team.deadline && (
          <span className="text-xs text-slate-500">
            Due {formatDate(team.deadline)}
            {days != null && days >= 0 && <span className="ml-1 text-slate-400">· {days}d left</span>}
          </span>
        )}
        {team.repo && (
          <a href={team.repo} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
             className="badge bg-slate-100 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200">
            <Github className="w-3 h-3" /> Repo
          </a>
        )}
        {isOnTeam && (
          <span className="badge bg-brand-100 text-brand-800 ring-1 ring-brand-200">You're on this team</span>
        )}
        {hasPending && (
          <span className="badge bg-amber-100 text-amber-800 ring-1 ring-amber-200">Request pending</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="font-semibold text-navy-800">{team.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${team.progress >= 60 ? 'bg-emerald-500' : team.progress >= 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
                 style={{ width: `${team.progress}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Portfolio</span>
            <span className="font-semibold text-navy-800">{portfolioScore(team)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${portfolioScore(team)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-slate-500 mb-2">Members ({teamMembers.length})</div>
        <div className="flex -space-x-2">
          {teamMembers.map((m) => (
            <div key={m.id} title={m.name}
                 className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
              {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Current Task</div>
        <div className="text-sm text-navy-900">{team.currentTask || '—'}</div>
      </div>

      {team.weeklyNotes && (
        <div className="mt-3 text-sm text-slate-700 italic border-l-2 border-brand-300 pl-3">
          “{team.weeklyNotes}”
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-100 flex-wrap">
        <button onClick={copy} className="btn-secondary flex-1 justify-center text-sm py-2 min-w-[140px]">
          {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Teams Update</>}
        </button>
        {team.teamsLink && (
          <a href={team.teamsLink} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2"><LinkIcon className="w-4 h-4" /> Teams</a>
        )}
        {canJoin && (
          <button onClick={() => setJoinOpen(true)} className="btn-primary text-sm py-2">
            <UserPlus className="w-4 h-4" /> Request to Join
          </button>
        )}
      </div>

      {joinOpen && (
        <JoinRequestModal team={team} memberId={myRecord.id} onClose={() => setJoinOpen(false)} />
      )}
    </div>
  )
}

// ----- Join request modal -----
function JoinRequestModal({ team, memberId, onClose }) {
  const { requestToJoin } = useData()
  const [message, setMessage] = useState('')
  const submit = () => {
    requestToJoin(memberId, team.id, message)
    onClose()
  }
  return (
    <Modal open onClose={onClose} title={`Request to join ${team.name}`}
           footer={<>
             <button onClick={onClose} className="btn-secondary">Cancel</button>
             <button onClick={submit} className="btn-primary">Send request</button>
           </>}>
      <p className="text-sm text-slate-600 mb-3">
        Tell the team why you'd like to join. The President or Vice President will review your request.
      </p>
      <textarea className="textarea" rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="I have experience with… and I'd love to contribute to…" />
    </Modal>
  )
}

// ----- Team form modal (officer only) -----
function TeamModal({ initial, members, competitions, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', competitionId: competitions[0]?.id || '', memberIds: [],
    currentTask: '', deadline: '', status: 'Not Started', progress: 0,
    teamsLink: '', weeklyNotes: '',
    ...initial
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleMember = (id) => setForm((f) => {
    const s = new Set(f.memberIds || []); s.has(id) ? s.delete(id) : s.add(id)
    return { ...f, memberIds: [...s] }
  })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, progress: Number(form.progress) || 0 })
  }

  return (
    <Modal open onClose={onClose} title={initial?.id ? 'Edit Team' : 'Create Team'} maxWidth="max-w-3xl"
           footer={<>
             <button onClick={onClose} className="btn-secondary">Cancel</button>
             <button onClick={submit} className="btn-primary">{initial?.id ? 'Save changes' : 'Create team'}</button>
           </>}>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Team name</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="e.g. Team Insight" />
        </div>
        <div>
          <label className="label">Competition / Project</label>
          <select className="select" value={form.competitionId} onChange={set('competitionId')}>
            <option value="">— None —</option>
            {competitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label className="label">Deadline</label>
          <input type="date" className="input" value={form.deadline || ''} onChange={set('deadline')} />
        </div>
        <div>
          <label className="label">Progress ({form.progress}%)</label>
          <input type="range" min="0" max="100" value={form.progress} onChange={set('progress')} className="w-full" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Current task</label>
          <input className="input" value={form.currentTask || ''} onChange={set('currentTask')} placeholder="What is the team working on right now?" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Microsoft Teams link</label>
          <input className="input" value={form.teamsLink || ''} onChange={set('teamsLink')} placeholder="https://teams.microsoft.com/…" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Weekly check-in notes</label>
          <textarea className="textarea" rows={3} value={form.weeklyNotes || ''} onChange={set('weeklyNotes')} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Members</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto scroll-thin border border-slate-200 rounded-xl p-2">
            {members.map((m) => {
              const on = (form.memberIds || []).includes(m.id)
              return (
                <label key={m.id}
                       className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition
                         ${on ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleMember(m.id)} className="accent-brand-600" />
                  <span className="font-medium text-navy-900">{m.name}</span>
                  <span className="text-xs text-slate-500 ml-auto">{m.skillLevel}</span>
                </label>
              )
            })}
          </div>
        </div>
      </form>
    </Modal>
  )
}
