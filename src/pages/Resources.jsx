import { useState } from 'react'
import { Plus, ExternalLink, Trash2, BookOpen, Wrench, Trophy, Users } from 'lucide-react'
import { useData } from '../data/DataContext'
import { useAuth } from '../data/AuthContext'
import { can } from '../utils/permissions'
import Modal from '../components/Modal'

const CATS = ['Learning', 'Tools', 'Competitions', 'Club']
const CAT_META = {
  Learning:     { icon: BookOpen, color: 'bg-emerald-100 text-emerald-700' },
  Tools:        { icon: Wrench,   color: 'bg-blue-100 text-blue-700' },
  Competitions: { icon: Trophy,   color: 'bg-amber-100 text-amber-700' },
  Club:         { icon: Users,    color: 'bg-brand-100 text-brand-700' }
}

export default function Resources() {
  const { resources, addResource, removeResource } = useData()
  const { currentUser } = useAuth()
  // Resources are managed by anyone who can post announcements (President / VP / Secretary)
  const canManage = can(currentUser, 'announcements.create')
  const [open, setOpen] = useState(false)

  const grouped = CATS.reduce((acc, c) => {
    acc[c] = resources.filter((r) => r.category === c)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <p className="text-slate-500">Curated links to help members learn, prep, and ship projects.</p>
        {canManage && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        )}
      </div>

      {CATS.map((cat) => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        const { icon: Icon, color } = CAT_META[cat]
        return (
          <section key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-navy-900">{cat}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((r) => (
                <div key={r.id} className="card p-5 hover:shadow-cardHover transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-navy-900 truncate">{r.name}</h4>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{r.description}</p>
                    </div>
                    {canManage && (
                      <button onClick={() => confirm(`Remove ${r.name}?`) && removeResource(r.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    )}
                  </div>
                  <a href={r.url} target="_blank" rel="noreferrer"
                     className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
                    Open <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {open && <ResourceModal onClose={() => setOpen(false)} onSave={(d) => { addResource(d); setOpen(false) }} />}
    </div>
  )
}

function ResourceModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', url: '', description: '', category: 'Learning' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => { e.preventDefault(); if (!form.name.trim() || !form.url.trim()) return; onSave(form) }

  return (
    <Modal open onClose={onClose} title="Add Resource"
           footer={<>
             <button onClick={onClose} className="btn-secondary">Cancel</button>
             <button onClick={submit} className="btn-primary">Add</button>
           </>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Name</label><input className="input" required value={form.name} onChange={set('name')} /></div>
        <div><label className="label">URL</label><input className="input" required type="url" value={form.url} onChange={set('url')} placeholder="https://…" /></div>
        <div>
          <label className="label">Category</label>
          <select className="select" value={form.category} onChange={set('category')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div><label className="label">Description</label><textarea className="textarea" rows={2} value={form.description} onChange={set('description')} /></div>
      </form>
    </Modal>
  )
}
