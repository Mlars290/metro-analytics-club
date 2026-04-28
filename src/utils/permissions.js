// ============================================================================
// PERMISSIONS — Single source of truth for role-based access control.
//
// HOW IT WORKS:
//   import { can, ROLES } from '../utils/permissions'
//   can(currentUser, 'competitions.create')   // → true / false
//
// To change what a role can do, edit the PERMISSION_MATRIX below.
//
// FUTURE UPGRADE: when migrating to a real backend, also enforce these checks
// server-side (Firebase rules / Postgres RLS / Express middleware). The client
// list below is for UI gating only — never trust it as a security boundary.
// ============================================================================

export const ROLES = {
  PRESIDENT:      'President',
  VICE_PRESIDENT: 'Vice President',
  SECRETARY:      'Secretary',
  TREASURER:      'Treasurer',
  ADVISOR:        'Professor / Advisor',
  MEMBER:         'Member'
}

export const ALL_ROLES = Object.values(ROLES)

// Short, human-readable labels for the role-switcher pill in the topbar
export const ROLE_LABELS = {
  [ROLES.PRESIDENT]:      'President View',
  [ROLES.VICE_PRESIDENT]: 'Vice President View',
  [ROLES.SECRETARY]:      'Secretary View',
  [ROLES.TREASURER]:      'Treasurer View',
  [ROLES.ADVISOR]:        'Professor View',
  [ROLES.MEMBER]:         'Member View'
}

// Tailwind color tokens for each role badge
export const ROLE_COLORS = {
  [ROLES.PRESIDENT]:      { bg: 'bg-amber-100',   text: 'text-amber-800',   ring: 'ring-amber-200',   icon: '👑' },
  [ROLES.VICE_PRESIDENT]: { bg: 'bg-brand-100',   text: 'text-brand-800',   ring: 'ring-brand-200',   icon: '🛡️' },
  [ROLES.SECRETARY]:      { bg: 'bg-sky-100',     text: 'text-sky-800',     ring: 'ring-sky-200',     icon: '📝' },
  [ROLES.TREASURER]:      { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200', icon: '💰' },
  [ROLES.ADVISOR]:        { bg: 'bg-purple-100',  text: 'text-purple-800',  ring: 'ring-purple-200',  icon: '🎓' },
  [ROLES.MEMBER]:         { bg: 'bg-slate-100',   text: 'text-slate-800',   ring: 'ring-slate-200',   icon: '👤' }
}

// ----------------------------------------------------------------------------
// PERMISSION MATRIX
// Each permission is a dot-namespaced action. Add new ones here as needed.
// ----------------------------------------------------------------------------
const P = {
  PRESIDENT: [
    'competitions.create', 'competitions.edit', 'competitions.delete',
    'teams.create', 'teams.edit', 'teams.delete', 'teams.assign',
    'members.view_all', 'members.edit_any', 'members.delete', 'members.change_role',
    'announcements.create', 'announcements.delete',
    'notes.create', 'notes.edit', 'notes.delete',
    'budget.view', 'budget.edit',
    'requests.approve', 'requests.deny',
    'reports.view',
    'settings.manage',
    'teamsupdate.send',
    'feedback.create'
  ],
  VICE_PRESIDENT: [
    'competitions.create', 'competitions.edit',
    'teams.create', 'teams.edit', 'teams.assign',
    'members.view_all',
    'announcements.create',
    'notes.create',
    'requests.approve', 'requests.deny',
    'reports.view',
    'teamsupdate.send',
    'feedback.create'
  ],
  SECRETARY: [
    'members.view_all',
    'announcements.create',
    'notes.create', 'notes.edit',
    'reports.view',
    'feedback.create'
  ],
  TREASURER: [
    'members.view_all',
    'budget.view', 'budget.edit',
    'reports.view',
    'feedback.create'
  ],
  ADVISOR: [
    'members.view_all',
    'reports.view',
    'feedback.create'
  ],
  MEMBER: [
    'requests.create',          // ask to join a team
    'tasks.update_own',         // update only own task status
    'profile.edit_own'
  ]
}

// Build a Set per role for fast lookups
const PERMISSION_SETS = Object.fromEntries(
  Object.entries(P).map(([k, v]) => [ROLES[k], new Set(v)])
)

// ----------------------------------------------------------------------------
// can(user, permission)  → boolean
// ----------------------------------------------------------------------------
export function can(user, permission) {
  if (!user) return false
  const set = PERMISSION_SETS[user.role]
  if (!set) return false
  return set.has(permission)
}

// Convenience: shorthand role checks
export const isPresident       = (u) => u?.role === ROLES.PRESIDENT
export const isVP              = (u) => u?.role === ROLES.VICE_PRESIDENT
export const isOfficer         = (u) => [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.SECRETARY, ROLES.TREASURER].includes(u?.role)
export const isAdvisor         = (u) => u?.role === ROLES.ADVISOR
export const isReadOnly        = (u) => u?.role === ROLES.ADVISOR
