import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { useAuth } from '../data/AuthContext'
import { useData } from '../data/DataContext'
import { LevelBadge } from '../components/Badges'
import { formatDate } from '../utils/helpers'
import Modal from '../components/Modal'

const SKILLS    = ['Python', 'R', 'SQL', 'ML', 'Statistics', 'Visualization', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Power BI']
const INTERESTS = ['Competitions', 'Hackathons', 'Workshops', 'Networking', 'GitHub Projects', 'Machine Learning', 'AI / Deep Learning']
const TIMES     = ['Light (1-3 hrs/wk)', 'Medium (4-6 hrs/wk)', 'Heavy (7+ hrs/wk)']

export default function FindTeammate() {
  const { teammatePosts, members, addTeammatePost, removeTeammatePost } = useData()
  const { realUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('')

  const myMember = members.find((m) => m.name === realUser?.name) || null
  const myPost = teammatePosts.find((p) => p.memberId === myMember?.id)

  const filtered = teammatePosts.filter((p) => {
    if (search && !p.headline.toLowerCase().includes(search.toLowerCase())) return false
    if (skillFilter && !p.skills.includes(skillFilter)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-slate-500">
            Looking to join a team or recruiting teammates? Post a quick blurb and browse the board.
          </p>
        </div>
        {myMember && !myPost && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Post: I'm Looking
          </button>
        )}
        {myPost && (
          <button onClick={() => removeTeammatePost(myPost.id)} className="btn-secondary">
            <X className="w-4 h-4" /> Remove my post
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search posts…"
                 className="bg-transparent outline-none text-sm flex-1 placeholder:text-slate-400" />
        </div>
        <select className="select max-w-xs" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
          <option value="">Filter by skill…</option>
          {SKILLS.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(search || skillFilter) && (
          <button onClick={() => { setSearch(''); setSkillFilter('') }} className="btn-ghost text-sm">Clear</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          No posts match your filters yet. Be the first to post!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const member = members.find((m) => m.id === p.memberId)
            return (
              <div key={p.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {member?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-navy-900">{member?.name || 'Unknown'}</h3>
                      {member?.skillLevel && <LevelBadge level={member.skillLevel} />}
                    </div>
                    <p className="text-sm text-slate-700 mt-2">{p.headline}</p>
                    <div className="text-xs text-slate-500 mt-1">{member?.major} · {member?.year}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide font-semibold text-slate-500">Looking for</div>
                    <div className="text-navy-800">{p.lookingFor}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 mt-1">Skills</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.skills.map((s) => <span key={s} className="text-[11px] bg-brand-50 text-brand-800 px-2 py-0.5 rounded-full font-semibold">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 mt-1">Interests</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.interests.map((s) => <span key={s} className="text-[11px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full font-semibold">{s}</span>)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span>Available: {p.availability}</span>
                  <span>Posted {formatDate(p.date)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {open && myMember && (
        <PostModal memberId={myMember.id} member={myMember} onClose={() => setOpen(false)}
                   onSave={(d) => { addTeammatePost(d); setOpen(false) }} />
      )}
    </div>
  )
}

function PostModal({ memberId, member, onClose, onSave }) {
  const [form, setForm] = useState({
    memberId,
    headline: '',
    lookingFor: '',
    skills: member.skills || [],
    interests: member.interests || [],
    availability: member.time || TIMES[0],
    date: new Date().toISOString().slice(0, 10)
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (key, v) => setForm((f) => {
    const s = new Set(f[key] || []); s.has(v) ? s.delete(v) : s.add(v)
    return { ...f, [key]: [...s] }
  })

  return (
    <Modal open onClose={onClose} title="Post: Looking for a team" maxWidth="max-w-2xl"
           footer={<>
             <button onClick={onClose} className="btn-secondary">Cancel</button>
             <button onClick={() => form.headline.trim() && onSave(form)} className="btn-primary">Post</button>
           </>}>
      <div className="space-y-4">
        <div>
          <label className="label">Headline</label>
          <input className="input" value={form.headline} onChange={set('headline')}
                 placeholder="e.g. Looking for a Kaggle team — beginner welcome to pair up!" />
        </div>
        <div>
          <label className="label">Who you're looking for</label>
          <input className="input" value={form.lookingFor} onChange={set('lookingFor')}
                 placeholder="e.g. Mentor, advanced modeler, or peer beginner" />
        </div>
        <div>
          <label className="label">Skills you bring</label>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => {
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
        <div>
          <label className="label">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((s) => {
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
        <div>
          <label className="label">Availability</label>
          <select className="select" value={form.availability} onChange={set('availability')}>
            {TIMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}
