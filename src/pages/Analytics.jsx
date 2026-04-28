import { Users, Briefcase, Trophy, Calendar, TrendingUp, Award } from 'lucide-react'
import { useData } from '../data/DataContext'
import { ACHIEVEMENT_META } from '../utils/portfolio'
import { daysUntil, formatDate } from '../utils/helpers'
import { portfolioScore } from '../utils/portfolio'

export default function Analytics() {
  const { members, teams, competitions, achievements } = useData()
  const activeComps    = competitions.filter((c) => c.status === 'Active')
  const completedComps = competitions.filter((c) => c.status === 'Completed')
  const upcomingDeadlines = competitions
    .filter((c) => c.deadline && c.status !== 'Completed')
    .map((c) => ({ ...c, days: daysUntil(c.deadline) }))
    .filter((c) => c.days != null && c.days >= 0)
    .sort((a, b) => a.days - b.days)

  // Aggregate counts per achievement kind
  const kindCounts = achievements.reduce((acc, a) => {
    acc[a.kind] = (acc[a.kind] || 0) + 1
    return acc
  }, {})

  // Member leaderboard by achievement count
  const byMember = achievements.reduce((acc, a) => {
    acc[a.memberId] = (acc[a.memberId] || 0) + 1
    return acc
  }, {})
  const top = Object.entries(byMember)
    .map(([mid, n]) => ({ member: members.find((m) => m.id === mid), count: n }))
    .filter((r) => r.member)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Top portfolio scores
  const topPortfolios = teams
    .map((t) => ({ team: t, score: portfolioScore(t), comp: competitions.find((c) => c.id === t.competitionId) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const skillCounts = members.reduce((acc, m) => {
    (m.skills || []).forEach((s) => { acc[s] = (acc[s] || 0) + 1 })
    return acc
  }, {})
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <div className="space-y-6">
      <p className="text-slate-500">Club-wide stats, achievement leaderboard, and portfolio rankings.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users}     iconBg="bg-brand-100 text-brand-700"     label="Total members"     value={members.length} />
        <Stat icon={Briefcase} iconBg="bg-sky-100 text-sky-700"          label="Active teams"      value={teams.length} />
        <Stat icon={Trophy}    iconBg="bg-emerald-100 text-emerald-700" label="Active comps"      value={activeComps.length} />
        <Stat icon={Award}     iconBg="bg-amber-100 text-amber-700"     label="Achievements"      value={achievements.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Top portfolios */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" /> Top Portfolio Scores
            </h3>
            {topPortfolios.length === 0 ? (
              <p className="text-sm text-slate-500">No teams yet.</p>
            ) : (
              <div className="space-y-3">
                {topPortfolios.map(({ team, score, comp }, i) => {
                  const tone = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  return (
                    <div key={team.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-navy-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-navy-900 truncate">{team.name}</div>
                        <div className="text-xs text-slate-500 truncate">{comp?.name || '—'}</div>
                      </div>
                      <div className="w-32">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${tone}`} style={{ width: `${score}%` }} />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-navy-800 w-10 text-right">{score}%</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top skills */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4">Skill Coverage Across the Club</h3>
            <div className="space-y-3">
              {topSkills.map(([skill, count]) => {
                const pct = Math.round((count / members.length) * 100)
                return (
                  <div key={skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-navy-800 font-semibold">{skill}</span>
                      <span className="text-slate-500">{count} member{count === 1 ? '' : 's'} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Achievement counts */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" /> Achievements awarded
            </h3>
            <div className="space-y-2">
              {Object.entries(ACHIEVEMENT_META).map(([kind, meta]) => (
                <div key={kind} className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-full ring-1 text-xs font-semibold flex items-center gap-1 ${meta.color}`}>
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </div>
                  <div className="ml-auto text-sm font-bold text-navy-800">{kindCounts[kind] || 0}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top earners */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4">Achievement Leaderboard</h3>
            {top.length === 0 ? (
              <p className="text-sm text-slate-500">No achievements yet.</p>
            ) : (
              <ul className="space-y-2">
                {top.map((row, i) => (
                  <li key={row.member.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-navy-700 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {row.member.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 text-sm text-navy-800 truncate">{row.member.name}</div>
                    <div className="text-sm font-bold text-amber-600">{row.count}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" /> Upcoming Deadlines
            </h3>
            <ul className="space-y-3">
              {upcomingDeadlines.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-navy-900">{c.name}</div>
                    <div className="text-xs text-slate-500">{formatDate(c.deadline)}</div>
                  </div>
                  <span className={`text-xs font-bold ${c.days <= 3 ? 'text-rose-600' : c.days <= 7 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {c.days}d
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, iconBg, label, value }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-navy-900 leading-none">{value}</div>
          <div className="text-xs text-slate-500 mt-1">{label}</div>
        </div>
      </div>
    </div>
  )
}
