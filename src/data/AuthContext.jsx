// ============================================================================
// AuthContext — username-based auth for the MVP.
//
// All accounts live in localStorage under 'mac_users' and 'mac_session'.
// No passwords yet — username only, like a class roster sign-in.
//
// FUTURE UPGRADE: replace with real auth.
//   • Firebase Auth — drop-in <SignIn /> components, free tier
//   • Auth0 / Clerk  — better RBAC integration
//   • Supabase Auth  — pairs nicely if you also migrate the DB
//
// FUTURE UPGRADE: real admin approval workflow for sensitive role changes
// (President promotion, Advisor invitation, etc).
// ============================================================================
import { createContext, useContext, useEffect, useState } from 'react'
import { ROLES } from '../utils/permissions'
import { initialMembers } from './sampleData'

const AuthContext = createContext(null)

const USERS_KEY   = 'mac_users_v2'   // bumped from 'mac_users' to invalidate
                                     // pre-rename caches with personal names.
const SESSION_KEY = 'mac_session_v2' // bumped so old sessions don't reference dead usernames.
const VIEW_AS_KEY = 'mac_view_as'

// Seed accounts so the app feels alive on first run.
// FUTURE: remove these once you have real signups.
const seedUsers = () => {
  const seeds = initialMembers.map((m) => ({
    username: m.id.replace('mem-', ''),  // e.g. 'president', 'vp'
    name:     m.name,
    role:     m.role && Object.values(ROLES).includes(m.role) ? m.role : ROLES.MEMBER,
    major:    m.major,
    year:     m.year,
    skillLevel: m.skillLevel,
    skills:   m.skills,
    interests: m.interests,
    preferredRole: m.preferredRole,
    availability: m.time,
    teamsLink: '',
    bio: '',
    memberId: m.id,        // links auth account ↔ members directory entry
    createdAt: '2025-01-01T00:00:00Z'
  }))
  // Add a Professor/Advisor seed account
  seeds.push({
    username: 'advisor',
    name: 'Advisor Demo',
    role: ROLES.ADVISOR,
    major: 'Faculty Advisor',
    year: 'Graduate',
    skillLevel: 'Advanced',
    skills: ['Statistics', 'ML', 'Mentorship'],
    interests: ['Mentoring', 'Research'],
    preferredRole: 'Project Management',
    availability: 'Light (1-3 hrs/wk)',
    teamsLink: '',
    bio: 'Faculty advisor — read-only access. Reach out for mentorship.',
    memberId: null,
    createdAt: '2025-01-01T00:00:00Z'
  })
  return seeds
}

export function AuthProvider({ children }) {
  // ----- Users: full registry of accounts -----
  const [users, setUsers] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(USERS_KEY) || 'null')
      if (stored?.length) return stored
    } catch { /* fall through */ }
    const seeded = seedUsers()
    localStorage.setItem(USERS_KEY, JSON.stringify(seeded))
    return seeded
  })

  // ----- Session: currently logged-in username -----
  const [sessionUsername, setSessionUsername] = useState(
    () => localStorage.getItem(SESSION_KEY) || null
  )

  // ----- View-as: officers can preview other roles without changing role -----
  const [viewAs, setViewAs] = useState(
    () => localStorage.getItem(VIEW_AS_KEY) || null
  )

  // Persist on change
  useEffect(() => { localStorage.setItem(USERS_KEY, JSON.stringify(users)) }, [users])
  useEffect(() => {
    if (sessionUsername) localStorage.setItem(SESSION_KEY, sessionUsername)
    else localStorage.removeItem(SESSION_KEY)
  }, [sessionUsername])
  useEffect(() => {
    if (viewAs) localStorage.setItem(VIEW_AS_KEY, viewAs)
    else localStorage.removeItem(VIEW_AS_KEY)
  }, [viewAs])

  const realUser    = users.find((u) => u.username === sessionUsername) || null
  // currentUser respects viewAs; realUser is the actual logged-in account
  const currentUser = realUser
    ? (viewAs && realUser.role === ROLES.PRESIDENT ? { ...realUser, role: viewAs, _viewing: true } : realUser)
    : null

  // ----- Auth actions -----
  const login = (username) => {
    const cleaned = username.trim().toLowerCase()
    const found = users.find((u) => u.username.toLowerCase() === cleaned)
    if (!found) return { ok: false, error: 'No account with that username. Try signing up.' }
    setSessionUsername(found.username)
    setViewAs(null)
    return { ok: true }
  }

  const signup = (data) => {
    const username = (data.username || '').trim().toLowerCase()
    if (!username) return { ok: false, error: 'Username is required.' }
    if (users.some((u) => u.username.toLowerCase() === username))
      return { ok: false, error: 'Username already taken.' }
    if (!data.name?.trim())  return { ok: false, error: 'Name is required.' }

    const newUser = {
      username,
      name: data.name.trim(),
      role: data.role || ROLES.MEMBER,
      major: data.major || '',
      year: data.year || 'Freshman',
      skillLevel: data.skillLevel || 'Beginner',
      skills: data.skills || [],
      interests: data.interests || [],
      preferredRole: data.preferredRole || 'EDA',
      availability: data.availability || 'Light (1-3 hrs/wk)',
      bio: data.bio || '',
      memberId: null,
      createdAt: new Date().toISOString()
    }
    setUsers((arr) => [...arr, newUser])
    setSessionUsername(username)
    setViewAs(null)
    return { ok: true }
  }

  const logout = () => { setSessionUsername(null); setViewAs(null) }

  const updateProfile = (patch) => {
    if (!realUser) return
    setUsers((arr) => arr.map((u) =>
      u.username === realUser.username ? { ...u, ...patch } : u
    ))
  }

  // President-only: change someone's role
  const setUserRole = (username, role) => {
    setUsers((arr) => arr.map((u) =>
      u.username === username ? { ...u, role } : u
    ))
  }

  return (
    <AuthContext.Provider value={{
      users, currentUser, realUser,
      login, signup, logout, updateProfile, setUserRole,
      viewAs, setViewAs
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
