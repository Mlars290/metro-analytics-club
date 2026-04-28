import { useMemo, useState } from 'react'
import { Sparkles, Wand2, UserPlus } from 'lucide-react'
import { useData } from '../data/DataContext'
import { useAuth } from '../data/AuthContext'
import { can } from '../utils/permissions'
import { LevelBadge, StatusBadge } from '../components/Badges'
import { scoreMemberForCompetition, suggestTeam } from '../utils/helpers'

export default function Matching() {
  const { competitions, members, addTeam } = useData()
  const { currentUser } = useAuth()
  const canCreate = can(currentUser, 'teams.create')
  const [compId, setCompId] = useState(competitions[0]?.id || '')
  const [size, setSize]     = useState(4)

  const comp = competitions.find((c) => c.id === compId)

  const ranked = useMemo(() => {
    if (!comp) return []
    return members
      .map((m) => ({ ...m, ...scoreMemberForCompetition(m, comp) }))
      .sort((a, b) => b.score - a.score)
  }, [members, comp])

  const suggestion = useMemo(() => {
    if (!comp) return []
    return suggestTeam(members, comp, size)
  }, [members, comp, size])

  const createTeamFromSuggestion = () => {
    if (!comp || suggestion.length === 0) return
    addTeam({
      id: `team-${Date.now()}`,
      name: `${comp.name} Team`,
      competitionId: comp.id,
      memberIds: suggestion.map((m) => m.id),
      currentTask: 'Kickoff meeting',
      deadline: comp.deadline || '',
      status: 'Not Started',
      progress: 0,
      teamsLink: '',
      weeklyNotes: 'Auto-generated from team matching.'
    })
    alert('Team created! Check the Teams page.')
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-500">
        See how each member fits a competition based on skill level, role, time commitment, and skill overlap.
        The algorithm is in <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">src/utils/helpers.js</code> — easy to tweak.
      </p>

      {/* Controls */}
      <div className="card p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Competition</label>
          <select className="select" value={compId} onChange={(e) => setCompId(e.target.value)}>
            {competitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Suggested team size</label>
          <input type="number" min="1" max="10" className="input"
                 value={size} onChange={(e) => setSize(Number(e.target.value) || 4)} />
        </div>
        <div className="flex items-end">
          {canCreate ? (
            <button onClick={createTeamFromSuggestion} className="btn-primary w-full">
              <UserPlus className="w-4 h-4" /> Create team from suggestion
            </button>
          ) : (
            <div className="w-full text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
              Only officers can create teams from suggestions.
            </div>
          )}
        </div>
      </div>

      {comp && (
        <div className="card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Selected competition</div>
              <h3 className="font-bold text-navy-900 text-lg">{comp.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={comp.status} /><LevelBadge level={comp.level} />
              </div>
            </div>
            <div className="text-sm text-slate-600 max-w-md">{comp.description}</div>
          </div>
        </div>
      )}

      {/* Suggested team */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-navy-900">Suggested Balanced Team</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestion.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-gradient-to-br from-brand-50 to-white border border-brand-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-navy-900 text-sm truncate">{m.name}</div>
                  <div className="text-[11px] text-slate-500">{m.skillLevel} · {m.preferredRole}</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 line-clamp-2">{m.reasons.join(' · ')}</div>
              <div className="mt-2 text-xs font-bold text-brand-700">Score: {m.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full ranking table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-navy-900">All Members — Ranked Fit</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Skill Level</th>
                <th className="px-5 py-3">Preferred Role</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Why</th>
                <th className="px-5 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranked.map((m, i) => (
                <tr key={m.id} className={i < size ? 'bg-brand-50/40' : ''}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {i < size && <Sparkles className="w-3.5 h-3.5 text-brand-500" />}
                      <span className="font-semibold text-navy-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className={`badge badge-${m.skillLevel.toLowerCase()}`}>{m.skillLevel}</span></td>
                  <td className="px-5 py-3 text-slate-700">{m.preferredRole}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{m.time?.split(' ')[0]}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{m.reasons.join(' · ') || '—'}</td>
                  <td className="px-5 py-3 text-right font-bold text-navy-900">{m.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
