import { useMemo, useState } from 'react'
import { Plus, Filter, ExternalLink, Trash2, Pencil, Search, Link as LinkIcon, Lock } from 'lucide-react'
import { useData } from '../data/DataContext'
import { useAuth } from '../data/AuthContext'
import { can } from '../utils/permissions'
import Modal from '../components/Modal'
import { StatusBadge, LevelBadge, TypeBadge } from '../components/Badges'
import { formatDate } from '../utils/helpers'

const TYPES   = ['Kaggle', 'Hackathon', 'Local', 'Portfolio Project', 'Other']
const LEVELS  = ['Beginner', 'Intermediate', 'Advanced', 'Mixed']
const STATUSES = ['Interested', 'Upcoming', 'Active', 'Completed']
const ROLES   = ['EDA', 'Modeling', 'Visualization', 'Presentation', 'Project Management']

export default function Competitions() {
  const { competitions, addCompetition, updateCompetition, removeCompetition } = useData()
  const { currentUser } = useAuth()
  const canCreate = can(currentUser, 'competitions.create')
  const canEdit   = can(currentUser, 'competitions.edit')
  const canDelete = can(currentUser, 'competitions.delete')
  const [search, setSearch]       = useState('')
  const [statusF, setStatusF]     = useState('All')
  const [typeF, setTypeF]         = useState('All')
  const [editing, setEditing]     = useState(null)  // competition object or {}
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    return competitions.filter((c) => {
      if (statusF !== 'All' && c.status !== statusF) return false
      if (typeF   !== 'All' && c.type   !== typeF)   return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [competitions, search, statusF, typeF])

  const openNew  = () => { setEditing({}); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setModalOpen(true) }
  const close    = () => { setModalOpen(false); setEditing(null) }

  const save = (data) => {
    if (editing?.id) updateCompetition(editing.id, data)
    else addCompetition(data)
    close()
  }

  return (
    <div className="space-y-6">
      {!canCreate && !canEdit && (
        <div className="card p-3 flex items-center gap-2 bg-slate-50 text-slate-600 text-sm">
          <Lock className="w-4 h-4" /> You're viewing competitions in read-only mode. Officers can add and edit them.
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-slate-500">Track and manage every competition the club is part of.</p>
        </div>
        {canCreate && (
          <button onClick={openNew} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Competition
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search competitions…"
                 value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select className="select" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
            <option>All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="select" value={typeF} onChange={(e) => setTypeF(e.target.value)}>
            <option>All</option>{TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <div key={c.id} className="card p-5 hover:shadow-cardHover transition group">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="font-bold text-navy-900 truncate">{c.name}</h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <StatusBadge status={c.status} />
                  <LevelBadge level={c.level} />
                  <TypeBadge type={c.type} />
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                {canEdit && (
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="Edit">
                    <Pencil className="w-4 h-4 text-slate-600" />
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => confirm(`Delete ${c.name}?`) && removeCompetition(c.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-3">{c.description}</p>

            <div className="text-xs space-y-1.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Deadline</span>
                <span className="font-semibold text-navy-900">{formatDate(c.deadline)}</span>
              </div>
              {c.skills?.length > 0 && (
                <div>
                  <div className="text-slate-500 mb-1">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {c.skills.map((s) => (
                      <span key={s} className="text-[11px] bg-slate-100 text-navy-800 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {c.roles?.length > 0 && (
                <div>
                  <div className="text-slate-500 mb-1">Roles needed</div>
                  <div className="flex flex-wrap gap-1">
                    {c.roles.map((r) => (
                      <span key={r} className="text-[11px] bg-brand-50 text-brand-800 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              {c.link && (
                <a href={c.link} target="_blank" rel="noreferrer"
                   className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1">
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {c.teamsLink && (
                <a href={c.teamsLink} target="_blank" rel="noreferrer"
                   className="text-xs font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1">
                  Teams <LinkIcon className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center text-slate-500">No competitions match your filters.</div>
      )}

      {modalOpen && (
        <CompetitionModal initial={editing} onClose={close} onSave={save} />
      )}
    </div>
  )
}

// ============================================================================
// COMPETITION FORM MODAL
// ============================================================================
function CompetitionModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', type: 'Kaggle', level: 'Beginner', status: 'Interested',
    deadline: '', link: '', teamsLink: '', description: '',
    skills: [], roles: [],
    ...initial
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (key, v) => setForm((f) => {
    const set = new Set(f[key] || [])
    set.has(v) ? set.delete(v) : set.add(v)
    return { ...f, [key]: [...set] }
  })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      // skills entered as comma string → array
      skills: Array.isArray(form.skills) ? form.skills : String(form.skills).split(',').map((s) => s.trim()).filter(Boolean)
    })
  }

  return (
    <Modal open onClose={onClose} title={initial?.id ? 'Edit Competition' : 'Add Competition'} maxWidth="max-w-3xl"
           footer={<>
             <button onClick={onClose} className="btn-secondary">Cancel</button>
             <button onClick={submit} className="btn-primary">{initial?.id ? 'Save changes' : 'Add competition'}</button>
           </>}>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Name</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="e.g. MinneMUDAC 2025" />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="select" value={form.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <div>
          <label className="label">Level</label>
          <select className="select" value={form.level} onChange={set('level')}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
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
          <label className="label">External link</label>
          <input className="input" placeholder="https://…" value={form.link || ''} onChange={set('link')} />
        </div>
        <div>
          <label className="label">Microsoft Teams link</label>
          <input className="input" placeholder="https://teams.microsoft.com/…" value={form.teamsLink || ''} onChange={set('teamsLink')} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea className="textarea" rows={3} value={form.description || ''} onChange={set('description')} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Skills (comma separated)</label>
          <input className="input"
                 value={Array.isArray(form.skills) ? form.skills.join(', ') : form.skills}
                 onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
                 placeholder="Python, Pandas, EDA" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Roles needed</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => {
              const on = (form.roles || []).includes(r)
              return (
                <button type="button" key={r} onClick={() => toggle('roles', r)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition
                          ${on ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-navy-700 border-slate-200 hover:bg-slate-50'}`}>
                  {r}
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </Modal>
  )
}
