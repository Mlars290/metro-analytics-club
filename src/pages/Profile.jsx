import { useState } from 'react'
import { Mail, MapPin, Calendar, Briefcase, Trophy, CheckCircle2, Clock, ListTodo, Pencil, Save, X, AtSign, Award } from 'lucide-react'
import { useAuth } from '../data/AuthContext'
import { useData } from '../data/DataContext'
import { ROLE_COLORS } from '../utils/permissions'
import { ACHIEVEMENT_META } from '../utils/portfolio'
import { formatDate } from '../utils/helpers'
import { StatusBadge, LevelBadge } from '../components/Badges'

const YEARS  = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const TIMES  = ['Light (1-3 hrs/wk)', 'Medium (4-6 hrs/wk)', 'Heavy (7+ hrs/wk)']
const ROLES_FIT = ['EDA', 'Modeling', 'Visualization', 'Presentation', 'Project Management']
const SKILL_OPTS = ['Python', 'R', 'SQL', 'ML', 'Statistics', 'Visualization', 'Presentation', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Power BI', 'Git']
const INTEREST_OPTS = ['Competitions', 'Hackathons', 'Workshops', 'Networking', 'GitHub Projects', 'Machine Learning', 'Data Visualization', 'AI / Deep Learning']

export default function Profile() {
  const { realUser, updateProfile } = useAuth()
  const { teams, competitions, members, achievements } = useData()
  const [editing, setEditing] = useState(false)

  if (!realUser) return null
  const colors = ROLE_COLORS[realUser.role]
  const initials = realUser.name.split(' ').map((p) => p[0]).slice(0, 2).join('')

  // Linked member record (for tasks + team membership)
  const memberRecord = members.find((m) => m.name === realUser.name) || null
  const myAchievements = memberRecord
    ? achievements.filter((a) => a.memberId === memberRecord.id)
    : []
  const myTeams = teams.filter((t) => memberRecord && t.memberIds?.includes(memberRecord.id))
  const myTasks = memberRecord?.tasks || []
  const myCompetitions = competitions.filter((c) =>
    myTeams.some((t) => t.competitionId === c.id)
  )
  const tasksDone = myTasks.filter((t) => t.status === 'Done').length

  // Profile completion: count filled fields
  const fields = [
    realUser.major, realUser.year, realUser.skillLevel,
    realUser.skills?.length, realUser.interests?.length,
    realUser.preferredRole, realUser.availability, realUser.bio
  ]
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100)

  return (
    <div className="space-y-6">
      {/* ----- Top profile card ----- */}
      <div className="card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Avatar + name */}
          <div className="flex flex-col items-center lg:items-start shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-4xl font-bold flex items-center justify-center shadow-lg ring-4 ring-white">
              {initials}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100">
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-navy-900">{realUser.name}</h1>
              <span className={`badge ${colors.bg} ${colors.text} ring-1 ${colors.ring} font-bold`}>
                {colors.icon} {realUser.role}
              </span>
            </div>
            <div className="text-slate-600">
              {[realUser.major && `${realUser.major} Major`, realUser.year, 'Metropolitan State University']
                .filter(Boolean).join(' · ')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mt-5">
              <InfoRow icon={AtSign}   label={`@${realUser.username}`} />
              <InfoRow icon={Calendar} label={`Joined ${formatDate(realUser.createdAt)}`} />
              <InfoRow icon={Briefcase} label={realUser.preferredRole || 'Project role not set'} />
              <InfoRow icon={Clock}    label={realUser.availability || 'Availability not set'} />
            </div>
          </div>

          {/* At a glance */}
          <div className="lg:w-64 shrink-0 bg-slate-50 rounded-2xl p-5">
            <h3 className="font-bold text-navy-900 mb-4">At a Glance</h3>
            <div className="space-y-3">
              <GlanceRow icon={Briefcase}  iconBg="bg-brand-100 text-brand-700"     value={myTeams.length} label="Teams" />
              <GlanceRow icon={Trophy}     iconBg="bg-emerald-100 text-emerald-700" value={myCompetitions.length} label="Competitions" />
              <GlanceRow icon={ListTodo}   iconBg="bg-sky-100 text-sky-700"          value={myTasks.length} label="Total Tasks" />
              <GlanceRow icon={CheckCircle2} iconBg="bg-amber-100 text-amber-700"   value={tasksDone} label="Tasks Done" />
            </div>
          </div>
        </div>

        {/* Profile completion */}
        {!editing && completion < 100 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-navy-900">Profile Completion</div>
              <div className="text-sm font-bold text-brand-700">{completion}%</div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-2">Fill out your profile to get better team matches.</p>
          </div>
        )}
      </div>

      {editing && <EditProfileForm user={realUser} onSave={(p) => { updateProfile(p); setEditing(false) }} onCancel={() => setEditing(false)} />}

      {!editing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-3">About Me</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {realUser.bio || <span className="text-slate-400 italic">No bio yet — click "Edit Profile" to add one.</span>}
              </p>
            </div>

            {/* My Teams */}
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4">My Teams</h3>
              {myTeams.length === 0 ? (
                <p className="text-sm text-slate-500">Not on any teams yet.</p>
              ) : (
                <div className="space-y-3">
                  {myTeams.map((t) => {
                    const comp = competitions.find((c) => c.id === t.competitionId)
                    return (
                      <div key={t.id} className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-navy-900">{t.name}</div>
                            <div className="text-xs text-slate-500">{comp?.name || '—'}</div>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500" style={{ width: `${t.progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-navy-800">{t.progress}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* My Tasks */}
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4">My Active Tasks</h3>
              {myTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks yet.</p>
              ) : (
                <ul className="space-y-2">
                  {myTasks.map((t) => {
                    const team = teams.find((x) => x.id === t.teamId)
                    const isDone = t.status === 'Done'
                    return (
                      <li key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                          {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm ${isDone ? 'line-through text-slate-400' : 'text-navy-900'}`}>{t.title}</div>
                          {team && <div className="text-xs text-slate-500">{team.name}</div>}
                        </div>
                        <StatusBadge status={t.status} />
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Achievements */}
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Achievements
              </h3>
              {myAchievements.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No badges yet — keep contributing!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {myAchievements.map((a) => {
                    const meta = ACHIEVEMENT_META[a.kind] || { icon: '⭐', label: a.kind, color: 'bg-slate-100 text-slate-800 ring-slate-200' }
                    return (
                      <div key={a.id} title={`Earned ${formatDate(a.date)}`}
                           className={`px-2.5 py-1 rounded-full ring-1 text-xs font-semibold flex items-center gap-1 ${meta.color}`}>
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(realUser.skills || []).length === 0 && <p className="text-sm text-slate-400 italic">None added yet.</p>}
                {(realUser.skills || []).map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">{s}</span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(realUser.interests || []).length === 0 && <p className="text-sm text-slate-400 italic">None added yet.</p>}
                {(realUser.interests || []).map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">{s}</span>
                ))}
              </div>
            </div>

            {/* Joined Competitions */}
            {myCompetitions.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-navy-900 mb-3">Joined Competitions</h3>
                <ul className="space-y-2">
                  {myCompetitions.map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-navy-900">{c.name}</div>
                        <div className="text-xs text-slate-500">Due {formatDate(c.deadline)}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-700">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  )
}

function GlanceRow({ icon: Icon, iconBg, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="text-lg font-bold text-navy-900 leading-none">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}

// ============================================================================
// EDIT FORM
// ============================================================================
function EditProfileForm({ user, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: user.name || '',
    major: user.major || '',
    year: user.year || 'Freshman',
    skillLevel: user.skillLevel || 'Beginner',
    skills: user.skills || [],
    interests: user.interests || [],
    preferredRole: user.preferredRole || 'EDA',
    availability: user.availability || TIMES[0],
    bio: user.bio || ''
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (key, v) => setForm((f) => {
    const s = new Set(f[key] || []); s.has(v) ? s.delete(v) : s.add(v)
    return { ...f, [key]: [...s] }
  })

  return (
    <div className="card p-6">
      <h3 className="font-bold text-navy-900 mb-4">Edit Profile</h3>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.name} onChange={set('name')} required />
        </div>
        <div>
          <label className="label">Major</label>
          <input className="input" value={form.major} onChange={set('major')} />
        </div>
        <div>
          <label className="label">Year</label>
          <select className="select" value={form.year} onChange={set('year')}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select>
        </div>
        <div>
          <label className="label">Skill level</label>
          <select className="select" value={form.skillLevel} onChange={set('skillLevel')}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        </div>
        <div>
          <label className="label">Preferred project role</label>
          <select className="select" value={form.preferredRole} onChange={set('preferredRole')}>{ROLES_FIT.map((r) => <option key={r}>{r}</option>)}</select>
        </div>
        <div>
          <label className="label">Weekly availability</label>
          <select className="select" value={form.availability} onChange={set('availability')}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Bio</label>
          <textarea className="textarea" rows={4} value={form.bio} onChange={set('bio')}
                    placeholder="Tell the club a bit about yourself…" />
        </div>

        <div className="md:col-span-2">
          <label className="label">Skills</label>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTS.map((s) => {
              const on = form.skills.includes(s)
              return (
                <button type="button" key={s} onClick={() => toggle('skills', s)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition
                          ${on ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-navy-700 border-slate-200 hover:bg-slate-50'}`}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="label">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTS.map((s) => {
              const on = form.interests.includes(s)
              return (
                <button type="button" key={s} onClick={() => toggle('interests', s)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition
                          ${on ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-navy-700 border-slate-200 hover:bg-slate-50'}`}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="btn-secondary"><X className="w-4 h-4" /> Cancel</button>
          <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> Save changes</button>
        </div>
      </form>
    </div>
  )
}
