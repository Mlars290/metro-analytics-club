import { useState } from 'react'
import { Plus, Pencil, Trash2, FileText, Calendar, User, X, Save, CheckCircle2, Circle } from 'lucide-react'
import { useAuth } from '../data/AuthContext'
import { useData } from '../data/DataContext'
import { can } from '../utils/permissions'
import { formatDate } from '../utils/helpers'
import Modal from '../components/Modal'

export default function Notes() {
  const { meetingNotes, members, addNote, updateNote, removeNote } = useData()
  const { currentUser } = useAuth()
  const canEdit   = can(currentUser, 'notes.edit')
  const canDelete = can(currentUser, 'notes.delete')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const openNew  = () => { setEditing(null); setOpen(true) }
  const openEdit = (n) => { setEditing(n); setOpen(true) }

  const toggleActionItem = (note, aiId) => {
    const updated = (note.actionItems || []).map((a) =>
      a.id === aiId ? { ...a, done: !a.done } : a
    )
    updateNote(note.id, { actionItems: updated })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <p className="text-slate-500">Meeting notes, decisions, and action items recorded by the Secretary.</p>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Note</button>
      </div>

      {meetingNotes.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          No meeting notes yet. Create the first one.
        </div>
      ) : (
        <div className="space-y-5">
          {meetingNotes.map((n) => (
            <div key={n.id} className="card p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-navy-900 text-lg">{n.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(n.date)}</span>
                    {n.author && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {n.author}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {canEdit && (
                    <button onClick={() => openEdit(n)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                      <Pencil className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => confirm(`Delete "${n.title}"?`) && removeNote(n.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">{n.body}</p>

              {(n.decisions || []).length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 mb-2">Decisions</div>
                  <ul className="space-y-1">
                    {n.decisions.map((d, i) => (
                      <li key={i} className="text-sm text-navy-800 flex gap-2 items-start">
                        <span className="text-brand-500 shrink-0">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(n.actionItems || []).length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <div className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 mb-2">Action Items</div>
                  <div className="space-y-2">
                    {n.actionItems.map((a) => {
                      const assignee = members.find((m) => m.id === a.assigneeId)
                      return (
                        <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border transition
                          ${a.done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                          <button onClick={() => canEdit && toggleActionItem(n, a.id)}
                                  disabled={!canEdit}
                                  className="shrink-0">
                            {a.done
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              : <Circle className="w-5 h-5 text-slate-400" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${a.done ? 'line-through text-slate-400' : 'text-navy-900'}`}>{a.task}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {assignee && <span>{assignee.name}</span>}
                              {a.deadline && <span className="ml-2">· Due {formatDate(a.deadline)}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <NoteModal
          initial={editing}
          authorName={currentUser.name}
          members={members}
          onClose={() => { setOpen(false); setEditing(null) }}
          onSave={(d) => {
            if (editing?.id) updateNote(editing.id, d)
            else addNote(d)
            setOpen(false); setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function NoteModal({ initial, authorName, members, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', date: new Date().toISOString().slice(0, 10), author: authorName, body: '',
    decisions: [], actionItems: [],
    ...initial
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addDecision = () => setForm((f) => ({ ...f, decisions: [...f.decisions, ''] }))
  const setDecision = (i, v) => setForm((f) => ({ ...f, decisions: f.decisions.map((d, j) => j === i ? v : d) }))
  const removeDecision = (i) => setForm((f) => ({ ...f, decisions: f.decisions.filter((_, j) => j !== i) }))

  const addAction = () => setForm((f) => ({ ...f, actionItems: [...f.actionItems, { id: `ai-${Date.now()}`, task: '', assigneeId: '', deadline: '', done: false }] }))
  const setAction = (i, k, v) => setForm((f) => ({ ...f, actionItems: f.actionItems.map((a, j) => j === i ? { ...a, [k]: v } : a) }))
  const removeAction = (i) => setForm((f) => ({ ...f, actionItems: f.actionItems.filter((_, j) => j !== i) }))

  return (
    <Modal open onClose={onClose} title={initial?.id ? 'Edit Note' : 'New Meeting Note'} maxWidth="max-w-3xl"
           footer={<>
             <button onClick={onClose} className="btn-secondary"><X className="w-4 h-4" /> Cancel</button>
             <button onClick={() => form.title.trim() && onSave({
               ...form,
               decisions:   form.decisions.filter((d) => d.trim()),
               actionItems: form.actionItems.filter((a) => a.task.trim())
             })} className="btn-primary"><Save className="w-4 h-4" /> Save</button>
           </>}>
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={set('title')} required
                 placeholder="e.g. Spring Kickoff Meeting" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.date} onChange={set('date')} />
          </div>
          <div>
            <label className="label">Author</label>
            <input className="input" value={form.author} onChange={set('author')} />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="textarea" rows={4} value={form.body} onChange={set('body')}
                    placeholder="Attendees, key discussion points…" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Decisions made</label>
            <button type="button" onClick={addDecision} className="text-xs font-semibold text-brand-600 hover:underline">+ Add</button>
          </div>
          {form.decisions.length === 0 && <div className="text-sm text-slate-400 italic">None yet.</div>}
          {form.decisions.map((d, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input className="input flex-1" value={d} onChange={(e) => setDecision(i, e.target.value)}
                     placeholder="Decision text…" />
              <button type="button" onClick={() => removeDecision(i)} className="p-1.5 text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Action items</label>
            <button type="button" onClick={addAction} className="text-xs font-semibold text-brand-600 hover:underline">+ Add</button>
          </div>
          {form.actionItems.length === 0 && <div className="text-sm text-slate-400 italic">None yet.</div>}
          {form.actionItems.map((a, i) => (
            <div key={a.id} className="border border-slate-200 rounded-xl p-3 mb-2 space-y-2">
              <div className="flex gap-2">
                <input className="input flex-1" value={a.task} onChange={(e) => setAction(i, 'task', e.target.value)}
                       placeholder="Task…" />
                <button type="button" onClick={() => removeAction(i)} className="p-1.5 text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select className="select" value={a.assigneeId} onChange={(e) => setAction(i, 'assigneeId', e.target.value)}>
                  <option value="">— Assign to —</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="date" className="input" value={a.deadline} onChange={(e) => setAction(i, 'deadline', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
