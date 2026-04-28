// ============================================================================
// Helpers used across pages
// ============================================================================

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d)) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function daysUntil(iso) {
  if (!iso) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(iso + 'T00:00:00')
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
}

export const STATUS_CLASS = {
  Active:        'badge-active',
  Upcoming:      'badge-upcoming',
  Completed:     'badge-completed',
  Interested:    'badge-interested',
  'Not Started': 'badge-todo',
  'In Progress': 'badge-progress',
  'Review Needed': 'badge-review',
  'Done':        'badge-done'
}

export const LEVEL_CLASS = {
  Beginner:     'badge-beginner',
  Intermediate: 'badge-intermediate',
  Advanced:     'badge-advanced',
  Mixed:        'badge-mixed'
}

// ============================================================================
// TEAM-MATCHING ALGORITHM
// Simple, transparent, and easy to tweak. Used on the "Team Matching" page.
// Score = how well a member fits a competition. Higher = better.
// ============================================================================
export function scoreMemberForCompetition(member, comp) {
  let score = 0
  const reasons = []

  // 1. Skill-level match against competition level
  const levelMap = { Beginner: 1, Intermediate: 2, Advanced: 3, Mixed: 2 }
  const memberLevel = { Beginner: 1, Intermediate: 2, Advanced: 3 }[member.skillLevel] || 1
  const compLevel = levelMap[comp.level] || 2
  const levelDiff = Math.abs(memberLevel - compLevel)
  if (levelDiff === 0) { score += 30; reasons.push('Skill level matches') }
  else if (levelDiff === 1) { score += 15; reasons.push('Skill level close') }

  // 2. Preferred role overlap with required roles
  if (comp.roles?.includes(member.preferredRole)) {
    score += 25
    reasons.push(`Preferred role (${member.preferredRole}) needed`)
  }

  // 3. Skill keyword overlap
  const overlap = (member.skills || []).filter((s) =>
    (comp.skills || []).some((cs) => cs.toLowerCase() === s.toLowerCase())
  )
  score += overlap.length * 8
  if (overlap.length) reasons.push(`Skills overlap: ${overlap.join(', ')}`)

  // 4. Time commitment
  const timeBonus = { 'Heavy (7+ hrs/wk)': 15, 'Medium (4-6 hrs/wk)': 10, 'Light (1-3 hrs/wk)': 3 }
  score += timeBonus[member.time] || 0

  // 5. Interest in competitions in general
  if ((member.interests || []).includes('Competitions')) {
    score += 10
    reasons.push('Interested in competitions')
  }

  return { score, reasons }
}

// Suggest a balanced team of `size` members for a given competition.
// Heuristic: top scorers, but enforce skill-level diversity when possible.
export function suggestTeam(members, comp, size = 4) {
  const scored = members
    .map((m) => ({ ...m, ...scoreMemberForCompetition(m, comp) }))
    .sort((a, b) => b.score - a.score)

  const picked = []
  const levelsSeen = new Set()
  for (const m of scored) {
    if (picked.length >= size) break
    // For Mixed/Beginner-friendly comps, encourage at least one of each level
    if (comp.level === 'Mixed' && picked.length < size - 1) {
      if (levelsSeen.has(m.skillLevel) && picked.length >= 2) continue
    }
    picked.push(m)
    levelsSeen.add(m.skillLevel)
  }
  return picked
}
