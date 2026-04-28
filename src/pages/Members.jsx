import { useMemo, useState } from 'react'
import { Plus, Search, Trash2, Pencil, Filter } from 'lucide-react'
import { useData } from '../data/DataContext'
import { useAuth } from '../data/AuthContext'
import { can, ALL_ROLES, ROLE_COLORS } from '../utils/permissions'
import Modal from '../components/Modal'

const YEARS  = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const TIMES  = ['Light (1-3 hrs/wk)', 'Medium (4-6 hrs/wk)', 'Heavy (7+ hrs/wk)']
const ROLES  = ['EDA', 'Modeling', 'Visualization', 'Presentation', 'Project Management']
const SKILLS = ['Python', 'R', 'SQL', 'ML', 'Visualization', 'Statistics', 'Presentation']
const INTERESTS = ['Competitions', 'Hackathons', 'GitHub Projects', 'Networking', 'Workshops']

export default function Members() {
  const { members, addMember, updateMember, removeMember } = useData()
  const { currentUser, users, setUserRole } = useAuth()
  const [search, setSearch]     = useState('')
  const [yearF, setYearF]       = useState('All')
  const [levelF, setLevelF]     = useState('All')
  const [editing, setEditing]   = useState(null)
  const [open, setOpen]         = useState(false)

  const canEditAny    = can(currentUser, 'members.edit_any')
  const canDelete     = can(currentUser, 'members.delete')
  const canChangeRole = can(currentUser, 'members.change_role')

  const filtered = useMemo(() => members.filter((m) => {
    if (yearF  !== 'All' && m.year       !== yearF)  return false
    if (levelF !== 'All' && m.skillLevel !== levelF) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [members, search, yearF, levelF])

  const openNew  = () => { setEditing({}); setOpen(true) }
  const openEdit = (m) => { setEditing(m); setOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <p className="text-slate-500">Roster of all club members and their skill profiles.</p>
        {canEditAny && (
          <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Member</button>
        )}
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name…"
                 value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select className="select" value={yearF} onChange={(e) => setYearF(e.target.value)}>
            <option>All</option>{YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
          <select className="select" value={levelF} onChange={(e) => setLevelF(e.target.value)}>
            <option>All</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Members table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Club Role</th>
                <th className="px-5 py-3 hidden md:table-cell">Year</th>
                <th className="px-5 py-3 hidden md:table-cell">Major</th>
                <th className="px-5 py-3">Skill</th>
                <th className="px-5 py-3 hidden lg:table-cell">Skills</th>
                <th className="px-5 py-3 hidden lg:table-cell">Project Role</th>
                {(canEditAny || canDelete) && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => {
                const userAccount = users.find((u) => u.name === m.name)
                const colors = ROLE_COLORS[m.role] || ROLE_COLORS.Member
                return (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white text-xs font-bold flex items-center justify-center">
                        {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-navy-900">{m.name}</div>
                        {userAccount && <div className="text-xs text-slate-500">@{userAccount.username}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {canChangeRole && userAccount ? (
                      <select
                        value={m.role}
                        onChange={(e) => {
                          updateMember(m.id, { role: e.target.value })
                          if (userAccount) setUserRole(userAccount.username, e.target.value)
                        }}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-0 ring-1 cursor-pointer outline-none ${colors.bg} ${colors.text} ${colors.ring}`}
                      >
                        {ALL_ROLES.map((r) => <option key={r} value={r} className="bg-white text-navy-900">{r}</option>)}
                      </select>
                    ) : (
                      <span className={`badge ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
                        {colors.icon} {m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-slate-700">{m.year}</td>
                  <td className="px-5 py-3 hidden md:table-cell text-slate-700">{m.major}</td>
                  <td className="px-5 py-3"><span className={`badge badge-${m.skillLevel.toLowerCase()}`}>{m.skillLevel}</span></td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {(m.skills || []).slice(0, 3).map((s) => (
                        <span key={s} className="text-[10px] bg-slate-100 text-navy-800 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {(m.skills || []).length > 3 && (
                        <span className="text-[10px] text-slate-500">+{m.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell text-slate-700 text-xs">{m.preferredRole}</td>
                  {(canEditAny || canDelete) && (
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {canEditAny && <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Pencil className="w-4 h-4 text-slate-600" /></button>}
                      {canDelete && <button onClick={() => confirm(`Delete ${m.name}?`) && removeMember(m.id)} className="p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4 text-rose-500" /></button>}
                    </td>
                  )}
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-10 text-center text-slate-500">No members match your filters.</div>}
      </div>

      {open && (
        <MemberModal
          initial={editing}
          onClose={() => { setOpen(false); setEditing(null) }}
          onSave={(d) => {
            if (editing?.id) updateMember(editing.id, d)
            else addMember({ ...d, role: d.role || 'Member' })
            setOpen(false); setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function MemberModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', major: '', year: 'Freshman', skillLevel: 'Beginner',
    skills: [], interests: [], time: TIMES[0], preferredRole: 'EDA', role: 'Member',
    ...initial
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (key, v) => setForm((f) => {
    const s = new Set(f[key] || []); s.has(v) ? s.delete(v) : s.add(v)
    return { ...f, [key]: [...s] }
  })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <Modal open onClose={onClose} title={initial?.id ? 'Edit Member' : 'Add Member'} maxWidth="max-w-2xl"
           footer={<>
             <button onClick={onClose} className="btn-secondary">Cancel</button>
             <button onClick={submit} className="btn-primary">{initial?.id ? 'Save' : 'Add'}</button>
           </>}>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="label">Name</label><input className="input" required value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Major</label><input className="input" value={form.major || ''} onChange={set('major')} /></div>
        <div>
          <label className="label">Year</label>
          <select className="select" value={form.year} onChange={set('year')}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select>
        </div>
        <div>
          <label className="label">Skill level</label>
          <select className="select" value={form.skillLevel} onChange={set('skillLevel')}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        </div>
        <div>
          <label className="label">Time commitment</label>
          <select className="select" value={form.time} onChange={set('time')}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <div>
          <label className="label">Preferred role</label>
          <select className="select" value={form.preferredRole} onChange={set('preferredRole')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Skills</label>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => {
              const on = (form.skills || []).includes(s)
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
            {INTERESTS.map((s) => {
              const on = (form.interests || []).includes(s)
              return (
                <button type="button" key={s} onClick={() => toggle('interests', s)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition
                          ${on ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-navy-700 border-slate-200 hover:bg-slate-50'}`}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </Modal>
  )
}
