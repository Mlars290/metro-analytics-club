import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Github, Copy, Check, Calendar, ExternalLink, AlertCircle, Plus, Star } from 'lucide-react'
import { useData } from '../data/DataContext'
import { useAuth } from '../data/AuthContext'
import { can } from '../utils/permissions'
import { StatusBadge } from '../components/Badges'
import { formatDate, daysUntil } from '../utils/helpers'
import { portfolioScore, portfolioBreakdown } from '../utils/portfolio'
import Modal from '../components/Modal'

export default function TeamDetail() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { teams, members, competitions, updateTeam, setDeliverable, addCheckin } = useData()
  const { currentUser } = useAuth()
  const team = teams.find((t) => t.id === teamId)

  if (!team) {
    return (
      <div className="card p-10 text-center">
        <p className="text-slate-500 mb-4">Team not found.</p>
        <Link to="/teams" className="btn-primary inline-flex">Back to Teams</Link>
      </div>
    )
  }

  const comp = competitions.find((c) => c.id === team.competitionId)
  const teamMembers = members.filter((m) => team.memberIds?.includes(m.id))
  const myMember = members.find((m) => m.name === currentUser?.name)
  const isOnTeam = myMember && team.memberIds?.includes(myMember.id)
  const canEdit  = can(currentUser, 'teams.edit') || isOnTeam   // members on the team can update their own team's deliverables/check-ins

  const score = portfolioScore(team)
  const checks = portfolioBreakdown(team)
  const days = daysUntil(team.deadline)

  const [checkinOpen, setCheckinOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const update =
`Metro Analytics Club Weekly Update — ${team.name}

This week's progress:
• ${(team.checkins?.[0]?.did) || team.currentTask || '—'}

Deadlines:
• ${team.deadline ? formatDate(team.deadline) : '(no deadline)'}${days != null && days >= 0 ? ` (${days} days left)` : ''}

Help needed:
• ${team.checkins?.[0]?.help || (team.status === 'Review Needed' ? 'Yes — see notes' : 'None')}

Next meeting: Wednesday 6 PM`

  const copy = async () => {
    try { await navigator.clipboard.writeText(update); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { /* noop */ }
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/teams')} className="text-sm text-slate-600 hover:text-navy-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> All teams
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-navy-900">{team.name}</h1>
              <StatusBadge status={team.status} />
            </div>
            <div className="text-slate-500 mt-1">{comp?.name || 'No competition assigned'}</div>
            {team.deadline && (
              <div className="text-sm text-slate-600 mt-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due {formatDate(team.deadline)}
                {days != null && days >= 0 && <span className="text-slate-400">· {days}d left</span>}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={copy} className="btn-secondary">
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Teams Update</>}
            </button>
            {team.repo && (
              <a href={team.repo} target="_blank" rel="noreferrer" className="btn-secondary">
                <Github className="w-4 h-4" /> Open repo <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Members:</span>
          {teamMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
              <span className="text-sm text-navy-800">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* GitHub project tracker */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-navy-800" />
                <h3 className="font-bold text-navy-900">GitHub Project Tracker</h3>
              </div>
              {canEdit && team.repo && (
                <button onClick={() => {
                  const url = prompt('GitHub repo URL:', team.repo)
                  if (url !== null) updateTeam(team.id, { repo: url })
                }} className="text-xs text-brand-600 hover:underline">Edit URL</button>
              )}
            </div>

            {team.repo ? (
              <a href={team.repo} target="_blank" rel="noreferrer"
                 className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-sm text-navy-800 hover:bg-slate-100 mb-4 break-all">
                <Github className="w-4 h-4 shrink-0" />
                <span className="flex-1 min-w-0 truncate">{team.repo}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : canEdit ? (
              <button
                onClick={() => {
                  const url = prompt('GitHub repo URL:')
                  if (url) updateTeam(team.id, { repo: url })
                }}
                className="w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-brand-300 hover:text-brand-600 mb-4 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add GitHub repo URL
              </button>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-500 mb-4 italic">No GitHub repo linked yet.</div>
            )}

            <div className="space-y-2">
              {[
                { key: 'readme',   label: 'README complete' },
                { key: 'notebook', label: 'Notebook uploaded' },
                { key: 'visuals',  label: 'Visualizations done' },
                { key: 'writeup',  label: 'Final write-up done' }
              ].map(({ key, label }) => {
                const checked = !!team.deliverables?.[key]
                return (
                  <label key={key}
                         className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer
                           ${checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}
                           ${!canEdit ? 'cursor-default opacity-90' : 'hover:border-brand-300'}`}>
                    <input type="checkbox" checked={checked} disabled={!canEdit}
                           onChange={(e) => setDeliverable(team.id, key, e.target.checked)}
                           className="w-4 h-4 accent-emerald-600" />
                    <span className={`text-sm ${checked ? 'text-emerald-900 font-semibold' : 'text-navy-800'}`}>{label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Weekly check-ins */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-900">Weekly Check-ins</h3>
              {canEdit && (
                <button onClick={() => setCheckinOpen(true)} className="btn-primary text-sm py-2">
                  <Plus className="w-4 h-4" /> Post Check-in
                </button>
              )}
            </div>

            {(team.checkins || []).length === 0 ? (
              <div className="text-sm text-slate-500 italic p-6 text-center bg-slate-50 rounded-xl">
                No check-ins yet. Post your first one to keep the club in the loop.
              </div>
            ) : (
              <div className="space-y-4">
                {(team.checkins || []).map((c) => (
                  <div key={c.id} className="border-l-2 border-brand-300 pl-4 pb-2">
                    <div className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{formatDate(c.date)}</div>
                    <div className="mt-2 text-sm">
                      <Field label="What we did" body={c.did} />
                      {c.blockers && <Field label="Blockers" body={c.blockers} kind="warn" />}
                      {c.next && <Field label="Next steps" body={c.next} />}
                      {c.help && <Field label="Help needed" body={c.help} kind="warn" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Portfolio Readiness */}
          <PortfolioCard score={score} checks={checks} />

          {/* Progress */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-3">Progress</h3>
            <div className="text-3xl font-bold text-navy-900">{team.progress}%</div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
              <div className={`h-full ${team.progress >= 60 ? 'bg-emerald-500' : team.progress >= 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
                   style={{ width: `${team.progress}%` }} />
            </div>
            <div className="mt-4 text-sm">
              <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Current task</div>
              <div className="text-navy-800">{team.currentTask || '—'}</div>
            </div>
          </div>

          {team.weeklyNotes && (
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-3">Notes</h3>
              <p className="text-sm text-slate-700 italic">"{team.weeklyNotes}"</p>
            </div>
          )}
        </div>
      </div>

      {checkinOpen && (
        <CheckinModal teamId={team.id} onClose={() => setCheckinOpen(false)}
                      onSave={(d) => { addCheckin(team.id, d); setCheckinOpen(false) }} />
      )}
    </div>
  )
}

function Field({ label, body, kind }) {
  const isWarn = kind === 'warn'
  return (
    <div className="mt-2">
      <div className={`text-[11px] uppercase tracking-wide font-semibold ${isWarn ? 'text-amber-700' : 'text-slate-500'}`}>{label}</div>
      <div className={`text-sm ${isWarn ? 'text-amber-900' : 'text-navy-800'}`}>{body}</div>
    </div>
  )
}

function PortfolioCard({ score, checks }) {
  const tone = score >= 80 ? 'emerald' : score >= 50 ? 'amber' : 'rose'
  const colors = {
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-900',
    amber:   'from-amber-50 to-amber-100 text-amber-900',
    rose:    'from-rose-50 to-rose-100 text-rose-900'
  }
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[tone]} p-6 border border-slate-200/50`}>
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-4 h-4" />
        <h3 className="font-bold text-sm uppercase tracking-wide">Portfolio Readiness</h3>
      </div>
      <div className="text-4xl font-bold mt-2">{score}%</div>
      <div className="text-xs mt-1 opacity-80">How recruiter-ready this project is</div>

      <div className="mt-4 space-y-1">
        {[
          ['repo', 'GitHub repo'], ['readme', 'README'], ['notebook', 'Notebook'],
          ['visuals', 'Visualizations'], ['writeup', 'Write-up'], ['shipped', 'Shipped']
        ].map(([k, label]) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center
              ${checks[k] ? 'bg-emerald-500' : 'bg-white/60 ring-1 ring-current/20'}`}>
              {checks[k] && <Check className="w-2 h-2 text-white" />}
            </div>
            <span className={checks[k] ? 'font-semibold' : 'opacity-70'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckinModal({ teamId, onClose, onSave }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    did: '', blockers: '', next: '', help: ''
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Modal open onClose={onClose} title="New Weekly Check-in" maxWidth="max-w-2xl"
           footer={<>
             <button onClick={onClose} className="btn-secondary">Cancel</button>
             <button onClick={() => form.did.trim() && onSave(form)} className="btn-primary">Post</button>
           </>}>
      <div className="space-y-4">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className="label">What we did this week</label>
          <textarea className="textarea" rows={3} value={form.did} onChange={set('did')}
                    placeholder="Completed EDA, started baseline model…" />
        </div>
        <div>
          <label className="label">Blockers</label>
          <textarea className="textarea" rows={2} value={form.blockers} onChange={set('blockers')}
                    placeholder="Stuck on…" />
        </div>
        <div>
          <label className="label">Next steps</label>
          <textarea className="textarea" rows={2} value={form.next} onChange={set('next')}
                    placeholder="Plan for next week…" />
        </div>
        <div>
          <label className="label">Help needed</label>
          <input className="input" value={form.help} onChange={set('help')}
                 placeholder="Anyone with feature engineering experience?" />
        </div>
      </div>
    </Modal>
  )
}
