// ============================================================================
// PORTFOLIO READINESS SCORE
//
// A team's "portfolio readiness" is how close they are to having a shareable,
// recruiter-ready artifact. We bias toward GitHub completeness because that's
// what students send to internships.
// ============================================================================

export const PORTFOLIO_CHECKS = [
  { key: 'repo',     label: 'GitHub repo linked',  weight: 20 },
  { key: 'readme',   label: 'README complete',     weight: 20 },
  { key: 'notebook', label: 'Notebook uploaded',   weight: 15 },
  { key: 'visuals',  label: 'Visualizations done', weight: 15 },
  { key: 'writeup',  label: 'Final write-up done', weight: 20 },
  { key: 'shipped',  label: 'Shipped (Done status)', weight: 10 }
]

export function portfolioScore(team) {
  if (!team) return 0
  const d = team.deliverables || {}
  let score = 0
  if (team.repo)    score += 20
  if (d.readme)     score += 20
  if (d.notebook)   score += 15
  if (d.visuals)    score += 15
  if (d.writeup)    score += 20
  if (team.status === 'Done') score += 10
  return Math.min(100, score)
}

export function portfolioBreakdown(team) {
  const d = team?.deliverables || {}
  return {
    repo:     !!team?.repo,
    readme:   !!d.readme,
    notebook: !!d.notebook,
    visuals:  !!d.visuals,
    writeup:  !!d.writeup,
    shipped:  team?.status === 'Done'
  }
}

// ============================================================================
// NEEDS ATTENTION — computed alerts (no real notification system).
// Returns a list of items the dashboard surfaces, ordered by severity.
// ============================================================================

export function computeAlerts({ teams, competitions, joinRequests }) {
  const out = []
  const now = new Date()
  const daysFrom = (iso) => Math.round((new Date(iso) - now) / 86400000)

  // Pending join requests
  const pendingReqs = (joinRequests || []).filter((r) => r.status === 'Pending')
  if (pendingReqs.length > 0) {
    out.push({
      kind: 'request',
      severity: 'info',
      title: `${pendingReqs.length} join request${pendingReqs.length === 1 ? '' : 's'} pending approval`,
      sub: 'Review in Teams page'
    })
  }

  // Upcoming deadlines (any active comp within 7 days)
  ;(competitions || []).forEach((c) => {
    if (c.status === 'Completed') return
    const d = daysFrom(c.deadline)
    if (d != null && d >= 0 && d <= 7) {
      out.push({
        kind: 'deadline',
        severity: d <= 3 ? 'danger' : 'warning',
        title: `${c.name} deadline in ${d} day${d === 1 ? '' : 's'}`,
        sub: c.name,
        compId: c.id
      })
    }
  })

  // Stale teams (no check-in in 7+ days, or never)
  ;(teams || []).forEach((t) => {
    const last = (t.checkins || [])[0]
    if (!last) {
      if (t.status !== 'Not Started') {
        out.push({
          kind: 'stale', severity: 'warning',
          title: `${t.name} hasn't posted a check-in yet`,
          sub: 'Weekly check-in missing',
          teamId: t.id
        })
      }
      return
    }
    const d = -daysFrom(last.date)
    if (d >= 7) {
      out.push({
        kind: 'stale', severity: 'warning',
        title: `${t.name} hasn't updated in ${d} days`,
        sub: 'Weekly check-in overdue',
        teamId: t.id
      })
    }
  })

  // Severity sort
  const sev = { danger: 0, warning: 1, info: 2 }
  return out.sort((a, b) => sev[a.severity] - sev[b.severity])
}

// ============================================================================
// ACHIEVEMENTS — badge metadata
// ============================================================================
export const ACHIEVEMENT_META = {
  'first-github':     { icon: '🐙', label: 'First GitHub Project', color: 'bg-slate-100 text-slate-800 ring-slate-200' },
  'team-contributor': { icon: '🤝', label: 'Team Contributor',     color: 'bg-brand-100 text-brand-800 ring-brand-200' },
  'competed':         { icon: '🏆', label: 'Competition Veteran',  color: 'bg-amber-100 text-amber-800 ring-amber-200' },
  'portfolio-ready':  { icon: '⭐', label: 'Portfolio Ready',       color: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  'survey-complete':  { icon: '✅', label: 'Profile Complete',     color: 'bg-sky-100 text-sky-800 ring-sky-200' },
  'first-checkin':    { icon: '📝', label: 'First Check-in',       color: 'bg-purple-100 text-purple-800 ring-purple-200' }
}
