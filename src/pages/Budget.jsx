import { useState } from 'react'
import { Plus, Pencil, Trash2, Wallet, Calendar, User, X, Save, DollarSign, TrendingUp } from 'lucide-react'
import { useAuth } from '../data/AuthContext'
import { useData } from '../data/DataContext'
import { can } from '../utils/permissions'
import { formatDate } from '../utils/helpers'
import Modal from '../components/Modal'

export default function Budget() {
  const { budgetNotes, addBudget, updateBudget, removeBudget } = useData()
  const { currentUser } = useAuth()
  const canEdit = can(currentUser, 'budget.edit')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const openNew  = () => { setEditing(null); setOpen(true) }
  const openEdit = (b) => { setEditing(b); setOpen(true) }

  const totalAllocated = budgetNotes.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <p className="text-slate-500">Track club budget allocations and funding notes.</p>
        {canEdit && (
          <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> New Budget Note</button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-900 leading-none">${totalAllocated.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">Total Allocated</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-900 leading-none">{budgetNotes.length}</div>
              <div className="text-xs text-slate-500 mt-1">Line Items</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-navy-900">Spring 2025</div>
              <div className="text-xs text-slate-500 mt-1">Current Period</div>
            </div>
          </div>
        </div>
      </div>

      {budgetNotes.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          No budget notes yet.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3 hidden md:table-cell">Date</th>
                <th className="px-5 py-3 hidden md:table-cell">Author</th>
                <th className="px-5 py-3 text-right">Amount</th>
                {canEdit && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetNotes.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-navy-900">{b.title}</div>
                    {b.body && <div className="text-xs text-slate-500 mt-0.5 line-clamp-2 max-w-md">{b.body}</div>}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-slate-700 text-xs">{formatDate(b.date)}</td>
                  <td className="px-5 py-4 hidden md:table-cell text-slate-700 text-xs">{b.author}</td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-700">${Number(b.amount || 0).toLocaleString()}</td>
                  {canEdit && (
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <Pencil className="w-4 h-4 text-slate-600" />
                      </button>
                      <button onClick={() => confirm(`Delete "${b.title}"?`) && removeBudget(b.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <BudgetModal
          initial={editing}
          authorName={currentUser.name}
          onClose={() => { setOpen(false); setEditing(null) }}
          onSave={(d) => {
            if (editing?.id) updateBudget(editing.id, d)
            else addBudget(d)
            setOpen(false); setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function BudgetModal({ initial, authorName, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', date: new Date().toISOString().slice(0, 10), author: authorName,
    amount: 0, body: '',
    ...initial
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Modal open onClose={onClose} title={initial?.id ? 'Edit Budget Note' : 'New Budget Note'} maxWidth="max-w-2xl"
           footer={<>
             <button onClick={onClose} className="btn-secondary"><X className="w-4 h-4" /> Cancel</button>
             <button onClick={() => form.title.trim() && onSave({ ...form, amount: Number(form.amount) || 0 })} className="btn-primary">
               <Save className="w-4 h-4" /> Save
             </button>
           </>}>
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={set('title')} required
                 placeholder="e.g. MinneMUDAC team supplies" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount ($)</label>
            <input type="number" className="input" value={form.amount} onChange={set('amount')} min="0" step="1" />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.date} onChange={set('date')} />
          </div>
        </div>
        <div>
          <label className="label">Author</label>
          <input className="input" value={form.author} onChange={set('author')} />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="textarea" rows={4} value={form.body} onChange={set('body')}
                    placeholder="What is this allocation for? Who approved it?" />
        </div>
      </div>
    </Modal>
  )
}
