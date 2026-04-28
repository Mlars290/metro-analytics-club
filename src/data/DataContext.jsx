// ============================================================================
// DataContext — global, in-memory state for the MVP.
// Swap this for a real backend by replacing the useState() calls with API calls.
//
// FUTURE UPGRADE: replace these arrays with Firebase Firestore / Supabase
// queries. The shape of each array maps 1:1 to a database table.
// FUTURE UPGRADE: real-time updates via WebSockets / Firestore listeners.
// FUTURE UPGRADE: notifications system on top of joinRequests + announcements.
// ============================================================================
import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import {
  initialCompetitions,
  initialMembers,
  initialTeams,
  initialResources,
  initialAnnouncements,
  initialActivity
} from './sampleData'

const DataContext = createContext(null)

// ----- Persistence helpers -----
const PERSIST_KEY = 'mac_data_v2'
const loadPersisted = () => {
  try { return JSON.parse(localStorage.getItem(PERSIST_KEY) || 'null') } catch { return null }
}

export function DataProvider({ children }) {
  const initial = loadPersisted() || {}

  const [competitions, setCompetitions]   = useState(initial.competitions   || initialCompetitions)
  const [members, setMembers]             = useState(initial.members        || initialMembers)
  const [teams, setTeams]                 = useState(initial.teams          || initialTeams)
  const [resources, setResources]         = useState(initial.resources      || initialResources)
  const [announcements, setAnnouncements] = useState(initial.announcements  || initialAnnouncements)
  const [activity, setActivity]           = useState(initial.activity       || initialActivity)
  const [joinRequests, setJoinRequests]   = useState(initial.joinRequests   || [])
  const [meetingNotes, setMeetingNotes]   = useState(initial.meetingNotes   || [
    { id: 'note-1', title: 'Spring Kickoff Meeting', date: '2025-04-15', author: 'Vice President Demo',
      body: 'Welcomed 12 new members. Outlined competition calendar. Assigned MinneMUDAC sub-leads.',
      decisions: ['Run Kaggle Titanic as the onboarding track for new members', 'Meet weekly Wednesdays 6 PM'],
      actionItems: [
        { id: 'ai-1', task: 'Email faculty advisor about MinneMUDAC budget', assigneeId: 'mem-president', deadline: '2025-04-22', done: true },
        { id: 'ai-2', task: 'Set up Kaggle Titanic team page', assigneeId: 'mem-secretary', deadline: '2025-04-28', done: false }
      ]
    }
  ])
  const [budgetNotes, setBudgetNotes]     = useState(initial.budgetNotes    || [
    { id: 'budget-1', title: 'Spring Semester Budget', date: '2025-02-01', author: 'Treasurer Demo',
      amount: 1500, body: 'Allocated $500 for Kaggle submissions, $1000 for MinneMUDAC team supplies and travel.' }
  ])
  const [feedback, setFeedback]           = useState(initial.feedback       || [])
  const [teammatePosts, setTeammatePosts] = useState(initial.teammatePosts  || [
    { id: 'tp-1', memberId: 'mem-member3', headline: 'Looking for a Kaggle team — beginner welcome to pair up!',
      lookingFor: 'Mentor or peer beginner', skills: ['Python', 'Statistics'], interests: ['Workshops', 'Kaggle'],
      availability: 'Light (1-3 hrs/wk)', date: '2025-04-20' },
    { id: 'tp-2', memberId: 'mem-member4', headline: 'Want to join an Orbit Wars team — RL curious',
      lookingFor: 'Advanced modelers / RL experience', skills: ['Python', 'ML'], interests: ['Competitions', 'AI / Deep Learning'],
      availability: 'Medium (4-6 hrs/wk)', date: '2025-04-23' }
  ])
  const [achievements, setAchievements]   = useState(initial.achievements   || [
    { id: 'ach-1', memberId: 'mem-president', kind: 'first-github',     date: '2025-02-10' },
    { id: 'ach-2', memberId: 'mem-president', kind: 'team-contributor', date: '2025-03-05' },
    { id: 'ach-3', memberId: 'mem-president', kind: 'competed',         date: '2025-03-22' },
    { id: 'ach-4', memberId: 'mem-vp', kind: 'first-github',     date: '2025-02-12' },
    { id: 'ach-5', memberId: 'mem-vp', kind: 'team-contributor', date: '2025-03-05' },
    { id: 'ach-6', memberId: 'mem-secretary', kind: 'first-github',     date: '2025-03-01' },
    { id: 'ach-7', memberId: 'mem-secretary', kind: 'competed',         date: '2025-04-01' }
  ])

  // Persist any change
  useEffect(() => {
    localStorage.setItem(PERSIST_KEY, JSON.stringify({
      competitions, members, teams, resources, announcements,
      activity, joinRequests, meetingNotes, budgetNotes, feedback,
      teammatePosts, achievements
    }))
  }, [competitions, members, teams, resources, announcements,
      activity, joinRequests, meetingNotes, budgetNotes, feedback,
      teammatePosts, achievements])

  // Generic CRUD helpers
  const addItem = (setter, prefix = 'id') => (item) =>
    setter((list) => [{ ...item, id: item.id || `${prefix}-${Date.now()}` }, ...list])
  const updateItem = (setter) => (id, patch) =>
    setter((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const removeItem = (setter) => (id) =>
    setter((list) => list.filter((it) => it.id !== id))

  // Activity logging (used by all actions)
  const logActivity = (who, what) => {
    setActivity((arr) => [{ id: `act-${Date.now()}`, who, what, when: 'Just now' }, ...arr].slice(0, 30))
  }

  // ---- Join request workflow ----
  const requestToJoin = (memberId, teamId, message = '') => {
    setJoinRequests((arr) => [
      ...arr,
      { id: `req-${Date.now()}`, memberId, teamId, message, status: 'Pending', createdAt: new Date().toISOString() }
    ])
  }
  const approveJoinRequest = (reqId) => {
    setJoinRequests((arr) => {
      const req = arr.find((r) => r.id === reqId)
      if (req) {
        // Add the member to the team
        setTeams((tt) => tt.map((t) =>
          t.id === req.teamId
            ? { ...t, memberIds: [...new Set([...(t.memberIds || []), req.memberId])] }
            : t
        ))
      }
      return arr.map((r) => r.id === reqId ? { ...r, status: 'Approved' } : r)
    })
  }
  const denyJoinRequest = (reqId) => {
    setJoinRequests((arr) => arr.map((r) => r.id === reqId ? { ...r, status: 'Denied' } : r))
  }

  // ---- Reset everything to seed data (handy in dev) ----
  const resetDemoData = () => {
    localStorage.removeItem(PERSIST_KEY)
    setCompetitions(initialCompetitions)
    setMembers(initialMembers)
    setTeams(initialTeams)
    setResources(initialResources)
    setAnnouncements(initialAnnouncements)
    setActivity(initialActivity)
    setJoinRequests([])
    setMeetingNotes([])
    setBudgetNotes([])
    setFeedback([])
  }

  // Helper: post a weekly check-in for a team
  const addCheckin = (teamId, checkin) => {
    setTeams((arr) => arr.map((t) =>
      t.id === teamId
        ? { ...t, checkins: [{ id: `ci-${Date.now()}`, ...checkin }, ...(t.checkins || [])] }
        : t
    ))
  }

  // Helper: update GitHub deliverables checklist
  const setDeliverable = (teamId, key, val) => {
    setTeams((arr) => arr.map((t) =>
      t.id === teamId ? { ...t, deliverables: { ...(t.deliverables || {}), [key]: val } } : t
    ))
  }

  const value = useMemo(() => ({
    competitions, members, teams, resources, announcements, activity,
    joinRequests, meetingNotes, budgetNotes, feedback,
    teammatePosts, achievements,
    addCompetition:    addItem(setCompetitions, 'comp'),
    updateCompetition: updateItem(setCompetitions),
    removeCompetition: removeItem(setCompetitions),
    addMember:    addItem(setMembers, 'mem'),
    updateMember: updateItem(setMembers),
    removeMember: removeItem(setMembers),
    addTeam:    addItem(setTeams, 'team'),
    updateTeam: updateItem(setTeams),
    removeTeam: removeItem(setTeams),
    addResource:    addItem(setResources, 'res'),
    removeResource: removeItem(setResources),
    addAnnouncement:    addItem(setAnnouncements, 'a'),
    removeAnnouncement: removeItem(setAnnouncements),
    addNote:    addItem(setMeetingNotes, 'note'),
    updateNote: updateItem(setMeetingNotes),
    removeNote: removeItem(setMeetingNotes),
    addBudget:    addItem(setBudgetNotes, 'budget'),
    updateBudget: updateItem(setBudgetNotes),
    removeBudget: removeItem(setBudgetNotes),
    addFeedback:    addItem(setFeedback, 'fb'),
    removeFeedback: removeItem(setFeedback),
    addTeammatePost:    addItem(setTeammatePosts, 'tp'),
    removeTeammatePost: removeItem(setTeammatePosts),
    addAchievement:     addItem(setAchievements, 'ach'),
    addCheckin, setDeliverable,
    requestToJoin, approveJoinRequest, denyJoinRequest,
    logActivity, resetDemoData
  }), [
    competitions, members, teams, resources, announcements, activity,
    joinRequests, meetingNotes, budgetNotes, feedback, teammatePosts, achievements
  ])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
