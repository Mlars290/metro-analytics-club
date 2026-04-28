// ============================================================================
// TREASURER DASHBOARD — MOCK DATA
//
// All numbers here are samples for the leadership meeting demo. Tweak any
// values directly in this file — no other code needs to change. When we
// upgrade to Supabase in Phase 2, this whole file gets replaced by a query.
// ============================================================================

// -- Budget overview (top stat cards) --
export const BUDGET = {
  totalAllocated: 4500,    // total semester budget
  spent:          2840,    // spent so far
  pendingPledged: 1500,    // sponsorship $ verbally committed but not received
  asOf:           'Apr 28, 2025'
}

// -- Spend by category (drives the bar chart) --
export const SPEND_BY_CATEGORY = [
  { category: 'Competition Fees',   spent: 850,  budget: 1200, color: '#6b3df5' },
  { category: 'Travel',             spent: 720,  budget: 1000, color: '#10b981' },
  { category: 'Workshops & Events', spent: 540,  budget: 900,  color: '#f59e0b' },
  { category: 'Software & Tools',   spent: 380,  budget: 500,  color: '#3b82f6' },
  { category: 'Supplies',           spent: 220,  budget: 400,  color: '#ec4899' },
  { category: 'Misc',               spent: 130,  budget: 500,  color: '#94a3b8' }
]

// -- Event ROI table --
// engagement = average post-event survey score (1-5), n = attendees
// roiScore = engagement points * attendees / cost dollars (higher = better)
export const EVENTS = [
  { name: 'Kaggle Titanic Workshop',   date: 'Feb 12', cost: 120, attendance: 24, engagement: 4.6, type: 'Workshop' },
  { name: 'MinneMUDAC Kickoff',        date: 'Mar 5',  cost: 280, attendance: 31, engagement: 4.8, type: 'Competition' },
  { name: 'Tableau Crash Course',      date: 'Mar 19', cost: 90,  attendance: 18, engagement: 4.4, type: 'Workshop' },
  { name: 'Networking Mixer',          date: 'Mar 28', cost: 450, attendance: 22, engagement: 3.6, type: 'Social' },
  { name: 'Resume Review Session',     date: 'Apr 4',  cost: 60,  attendance: 16, engagement: 4.7, type: 'Career' },
  { name: 'GitHub Onboarding',         date: 'Apr 11', cost: 40,  attendance: 14, engagement: 4.5, type: 'Workshop' },
  { name: 'Spring Banquet',            date: 'Apr 24', cost: 680, attendance: 28, engagement: 4.1, type: 'Social' }
]

// -- Sponsorship & funding pipeline --
// stages: 'Prospecting' | 'Pitched' | 'Verbal Yes' | 'Funds Received'
export const SPONSORSHIPS = [
  { sponsor: 'Local Tech Co.',        amount: 750, stage: 'Funds Received', date: 'Feb 10', contact: 'Recruiting team' },
  { sponsor: 'University Engagement', amount: 500, stage: 'Funds Received', date: 'Mar 1',  contact: 'Student Affairs' },
  { sponsor: 'Regional Bank',         amount: 1000, stage: 'Verbal Yes',    date: 'Apr 14', contact: 'CSR partnership lead' },
  { sponsor: 'Data Conference',       amount: 500, stage: 'Pitched',         date: 'Apr 22', contact: 'Sponsorship coordinator' },
  { sponsor: 'Insurance Analytics Co.', amount: 750, stage: 'Pitched',      date: 'Apr 25', contact: 'University recruiter' },
  { sponsor: 'Startup Accelerator',   amount: 250, stage: 'Prospecting',     date: 'Apr 27', contact: 'TBD' }
]

// -- Computed helpers --

export function eventROI(e) {
  // ROI score = engagement * attendees / cost — gives us "value per dollar"
  // Multiplied by 100 to make the number readable (e.g. 9.2 instead of 0.092)
  if (!e.cost) return 0
  return Math.round((e.engagement * e.attendance / e.cost) * 100) / 10
}

export function roiTier(score) {
  if (score >= 6)   return { label: 'Excellent', tone: 'emerald' }
  if (score >= 3)   return { label: 'Good',      tone: 'sky' }
  if (score >= 1.5) return { label: 'Fair',      tone: 'amber' }
  return                  { label: 'Poor',      tone: 'rose' }
}

export const STAGES = ['Prospecting', 'Pitched', 'Verbal Yes', 'Funds Received']

export function stageColor(stage) {
  return {
    'Prospecting':    'bg-slate-100 text-slate-700',
    'Pitched':        'bg-sky-100 text-sky-800',
    'Verbal Yes':     'bg-amber-100 text-amber-800',
    'Funds Received': 'bg-emerald-100 text-emerald-800'
  }[stage] || 'bg-slate-100 text-slate-700'
}
