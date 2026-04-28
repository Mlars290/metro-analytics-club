// ============================================================================
// SAMPLE DATA — Edit this file to add/remove/update club content.
// Everything in the app is driven by these arrays. No backend required.
// ============================================================================
//
// HOW TO EDIT:
//  • Add a new competition → push an object onto `initialCompetitions`
//  • Add a new member      → push an object onto `initialMembers`
//  • Add a new team        → push an object onto `initialTeams`
//  • Add a resource link   → push an object onto `initialResources`
//
// IDs must be unique strings. Dates use 'YYYY-MM-DD'.
// ============================================================================


// ---------- COMPETITIONS ----------
// type:   'Kaggle' | 'Hackathon' | 'Local' | 'Portfolio Project' | 'Other'
// level:  'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed'
// status: 'Interested' | 'Upcoming' | 'Active' | 'Completed'
// roles:  any of 'EDA', 'Modeling', 'Visualization', 'Presentation', 'Project Management'
export const initialCompetitions = [
  {
    id: 'comp-minnemudac',
    name: 'MinneMUDAC 2025',
    type: 'Local',
    level: 'Mixed',
    status: 'Active',
    deadline: '2025-10-18',
    link: 'https://minneanalytics.org/minnemudac/',
    teamsLink: 'https://teams.microsoft.com/l/channel/minnemudac',
    description: 'Fall analytics competition hosted by MinneAnalytics. Our flagship fall event — primary team prep focus.',
    skills: ['Python', 'EDA', 'Modeling', 'Presentation', 'Storytelling'],
    roles: ['EDA', 'Modeling', 'Visualization', 'Presentation', 'Project Management']
  },
  {
    id: 'comp-titanic',
    name: 'Kaggle Titanic',
    type: 'Kaggle',
    level: 'Beginner',
    status: 'Active',
    deadline: '2025-06-30',
    link: 'https://www.kaggle.com/c/titanic',
    teamsLink: '',
    description: 'Beginner-friendly ML competition — always open. Great for new members learning the Kaggle workflow.',
    skills: ['Python', 'Pandas', 'Scikit-learn', 'EDA'],
    roles: ['EDA', 'Modeling']
  },
  {
    id: 'comp-playground',
    name: 'Kaggle Playground Series',
    type: 'Kaggle',
    level: 'Mixed',
    status: 'Upcoming',
    deadline: '2025-07-15',
    link: 'https://www.kaggle.com/competitions?listOption=active&hostSegmentIdFilter=8',
    teamsLink: '',
    description: 'Monthly tabular ML challenges. Practice machine learning skills with synthetic datasets.',
    skills: ['Python', 'XGBoost', 'Feature Engineering', 'Cross-validation'],
    roles: ['EDA', 'Modeling', 'Visualization']
  },
  {
    id: 'comp-orbitwars',
    name: 'Orbit Wars',
    type: 'Other',
    level: 'Advanced',
    status: 'Upcoming',
    deadline: '2025-08-10',
    link: '',
    teamsLink: '',
    description: 'Advanced AI/game strategy competition. Reinforcement learning and agent design.',
    skills: ['Python', 'RL', 'Game Theory', 'PyTorch'],
    roles: ['Modeling', 'Project Management']
  },
  {
    id: 'comp-portfolio',
    name: 'Personal Portfolio Project',
    type: 'Portfolio Project',
    level: 'Mixed',
    status: 'Interested',
    deadline: '',
    link: '',
    teamsLink: '',
    description: 'Open-ended portfolio project to publish on GitHub for internships and grad school applications.',
    skills: ['GitHub', 'README writing', 'Data Visualization'],
    roles: ['EDA', 'Visualization', 'Presentation']
  }
]


// ---------- MEMBERS ----------
// year:       'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate'
// skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'
// time:       'Light (1-3 hrs/wk)' | 'Medium (4-6 hrs/wk)' | 'Heavy (7+ hrs/wk)'
// role:       'President' | 'Vice President' | 'Secretary' | 'Treasurer' | 'Professor / Advisor' | 'Member'
// tasks:      [{ id, title, status, teamId }]   status: 'Not Started' | 'In Progress' | 'Done'
export const initialMembers = [
  {
    id: 'mem-maria',
    name: 'Maria Larson',
    role: 'President',
    major: 'Data Science',
    year: 'Junior',
    skillLevel: 'Advanced',
    skills: ['Python', 'SQL', 'ML', 'Visualization', 'Presentation'],
    interests: ['Competitions', 'Networking', 'Workshops'],
    time: 'Heavy (7+ hrs/wk)',
    preferredRole: 'Project Management',
    tasks: [
      { id: 't-1', title: 'Lead MinneMUDAC kickoff',     status: 'In Progress', teamId: 'team-insight' },
      { id: 't-2', title: 'Review competition calendar', status: 'Done',        teamId: null }
    ]
  },
  {
    id: 'mem-sarah',
    name: 'Sarah Chen',
    role: 'Vice President',
    major: 'Statistics',
    year: 'Senior',
    skillLevel: 'Advanced',
    skills: ['R', 'Statistics', 'ML', 'Visualization'],
    interests: ['Competitions', 'GitHub Projects'],
    time: 'Heavy (7+ hrs/wk)',
    preferredRole: 'Modeling',
    tasks: [
      { id: 't-3', title: 'Finish EDA on dataset',     status: 'Done',        teamId: 'team-insight' },
      { id: 't-4', title: 'Build baseline model',      status: 'In Progress', teamId: 'team-insight' }
    ]
  },
  {
    id: 'mem-david',
    name: 'David Kim',
    role: 'Secretary',
    major: 'Computer Science',
    year: 'Sophomore',
    skillLevel: 'Intermediate',
    skills: ['Python', 'SQL', 'ML'],
    interests: ['Hackathons', 'GitHub Projects'],
    time: 'Medium (4-6 hrs/wk)',
    preferredRole: 'Modeling',
    tasks: [
      { id: 't-5', title: 'Write meeting notes',           status: 'In Progress', teamId: null },
      { id: 't-6', title: 'Submit Titanic baseline',       status: 'In Progress', teamId: 'team-dynasty' }
    ]
  },
  {
    id: 'mem-priya',
    name: 'Priya Patel',
    role: 'Member',
    major: 'Business Analytics',
    year: 'Junior',
    skillLevel: 'Intermediate',
    skills: ['Python', 'SQL', 'Visualization', 'Presentation'],
    interests: ['Competitions', 'Networking'],
    time: 'Medium (4-6 hrs/wk)',
    preferredRole: 'Presentation',
    tasks: [
      { id: 't-7', title: 'Draft MinneMUDAC slide deck', status: 'Not Started', teamId: 'team-insight' }
    ]
  },
  {
    id: 'mem-jamie',
    name: 'Jamie Park',
    role: 'Treasurer',
    major: 'Mathematics',
    year: 'Senior',
    skillLevel: 'Advanced',
    skills: ['R', 'Python', 'Statistics'],
    interests: ['Competitions', 'Workshops'],
    time: 'Medium (4-6 hrs/wk)',
    preferredRole: 'EDA',
    tasks: [
      { id: 't-8', title: 'Update spring budget',  status: 'Done',        teamId: null },
      { id: 't-9', title: 'File MUDAC reimbursement', status: 'In Progress', teamId: null }
    ]
  },
  {
    id: 'mem-alex',
    name: 'Alex Kim',
    role: 'Member',
    major: 'Data Science',
    year: 'Sophomore',
    skillLevel: 'Beginner',
    skills: ['Python'],
    interests: ['Workshops', 'Hackathons'],
    time: 'Light (1-3 hrs/wk)',
    preferredRole: 'EDA',
    tasks: [
      { id: 't-10', title: 'Complete Kaggle Titanic tutorial', status: 'In Progress', teamId: 'team-predictors' }
    ]
  },
  {
    id: 'mem-noah',
    name: 'Noah Williams',
    role: 'Member',
    major: 'Economics',
    year: 'Freshman',
    skillLevel: 'Beginner',
    skills: ['Python', 'Statistics'],
    interests: ['Workshops', 'Networking'],
    time: 'Light (1-3 hrs/wk)',
    preferredRole: 'Visualization',
    tasks: []
  },
  {
    id: 'mem-emma',
    name: 'Emma Rodriguez',
    role: 'Member',
    major: 'Computer Science',
    year: 'Junior',
    skillLevel: 'Intermediate',
    skills: ['Python', 'ML', 'SQL'],
    interests: ['Competitions', 'GitHub Projects'],
    time: 'Medium (4-6 hrs/wk)',
    preferredRole: 'Modeling',
    tasks: [
      { id: 't-11', title: 'Pair on baseline with David', status: 'In Progress', teamId: 'team-dynasty' }
    ]
  }
]


// ---------- TEAMS ----------
// status: 'Not Started' | 'In Progress' | 'Review Needed' | 'Done'
// progress: 0-100
// repo: GitHub URL (or '')
// deliverables: { readme, notebook, visuals, writeup }  — each a boolean
// checkins: array of { id, date, did, blockers, next, help }
export const initialTeams = [
  {
    id: 'team-insight',
    name: 'Team Insight',
    competitionId: 'comp-minnemudac',
    memberIds: ['mem-maria', 'mem-sarah', 'mem-priya'],
    currentTask: 'Initial EDA on the provided dataset',
    deadline: '2025-05-15',
    status: 'In Progress',
    progress: 75,
    teamsLink: 'https://teams.microsoft.com/l/channel/team-insight',
    weeklyNotes: 'Strong start. Maria leading EDA, Sarah working on baseline model. Need to schedule a sync with Priya for the deck draft next week.',
    repo: 'https://github.com/metro-analytics-club/team-insight',
    deliverables: { readme: true, notebook: true, visuals: true, writeup: false },
    checkins: [
      { id: 'ci-1', date: '2025-04-22', did: 'Completed EDA and baseline visualizations.', blockers: '', next: 'Build first model and review with team.', help: '' },
      { id: 'ci-2', date: '2025-04-15', did: 'Loaded dataset, ran initial profiling.', blockers: 'Some columns have inconsistent encoding.', next: 'Clean and document the schema.', help: '' }
    ]
  },
  {
    id: 'team-dynasty',
    name: 'Data Dynasty',
    competitionId: 'comp-titanic',
    memberIds: ['mem-david', 'mem-emma', 'mem-noah'],
    currentTask: 'Submit baseline model to Kaggle',
    deadline: '2025-06-30',
    status: 'In Progress',
    progress: 60,
    teamsLink: '',
    weeklyNotes: 'David has a logistic regression baseline. Noah is learning pandas — paired with Emma for the next session.',
    repo: 'https://github.com/metro-analytics-club/data-dynasty',
    deliverables: { readme: true, notebook: true, visuals: false, writeup: false },
    checkins: [
      { id: 'ci-3', date: '2025-04-21', did: 'Pair-programmed the baseline; logged first Kaggle submission.', blockers: 'Score below median, need feature engineering ideas.', next: 'Try titles + family-size features.', help: 'Anyone with feature engineering experience?' }
    ]
  },
  {
    id: 'team-predictors',
    name: 'The Predictors',
    competitionId: 'comp-playground',
    memberIds: ['mem-jamie', 'mem-alex'],
    currentTask: 'Choose July playground series and read rules',
    deadline: '2025-07-15',
    status: 'Review Needed',
    progress: 30,
    teamsLink: '',
    weeklyNotes: 'Need a third member with modeling experience — flagged in survey results.',
    repo: '',
    deliverables: { readme: false, notebook: false, visuals: false, writeup: false },
    checkins: []
  },
  {
    id: 'team-orbit',
    name: 'Orbit Aces',
    competitionId: 'comp-orbitwars',
    memberIds: ['mem-sarah'],
    currentTask: 'Review competition rules and build first agent skeleton',
    deadline: '2025-08-10',
    status: 'Not Started',
    progress: 15,
    teamsLink: '',
    weeklyNotes: 'Recruiting advanced members. Open to anyone with RL or PyTorch experience.',
    repo: '',
    deliverables: { readme: false, notebook: false, visuals: false, writeup: false },
    checkins: []
  }
]


// ---------- RESOURCES ----------
// category: 'Learning' | 'Tools' | 'Competitions' | 'Club'
export const initialResources = [
  { id: 'res-kaggle',     name: 'Kaggle',                       url: 'https://www.kaggle.com',                                category: 'Competitions', description: 'Where most of our online competitions live.' },
  { id: 'res-mudac',      name: 'MinneMUDAC Prep Hub',          url: 'https://minneanalytics.org/minnemudac/',                category: 'Competitions', description: 'Past datasets, winners, and prep materials.' },
  { id: 'res-github',     name: 'Club GitHub Repo Templates',   url: 'https://github.com/',                                   category: 'Tools',        description: 'Starter repos for new projects — fork and go.' },
  { id: 'res-pythontut',  name: 'Python for Data Science',      url: 'https://wesmckinney.com/book/',                         category: 'Learning',     description: 'McKinney\'s free pandas / NumPy book.' },
  { id: 'res-rtut',       name: 'R for Data Science',           url: 'https://r4ds.hadley.nz/',                               category: 'Learning',     description: 'Hadley Wickham\'s tidyverse-first textbook.' },
  { id: 'res-xgboost',    name: 'XGBoost Guide',                url: 'https://xgboost.readthedocs.io/',                       category: 'Learning',     description: 'Reference for our most-used tabular model.' },
  { id: 'res-meeting',    name: 'Weekly Meeting Notes',         url: '#',                                                     category: 'Club',         description: 'Shared OneDrive folder — ask an officer for access.' }
]


// ---------- ANNOUNCEMENTS (dashboard widget) ----------
export const initialAnnouncements = [
  { id: 'a1', title: 'Weekly Meeting',     body: 'Don\'t forget our meeting this Wednesday at 6 PM in Teams.', date: '2025-05-12' },
  { id: 'a2', title: 'New Resource Added', body: 'Check out the new feature engineering guide in Resources.',   date: '2025-05-10' },
  { id: 'a3', title: 'Survey Results',     body: 'Thanks to everyone who completed the team-matching survey!', date: '2025-05-08' }
]


// ---------- ACTIVITY FEED (dashboard widget) ----------
export const initialActivity = [
  { id: 'act1', who: 'Sarah Chen',    what: 'updated task in Team Insight',           when: '2 hours ago' },
  { id: 'act2', who: 'David Kim',     what: 'joined the club',                        when: '5 hours ago' },
  { id: 'act3', who: 'Data Dynasty',  what: 'submitted progress update',              when: '1 day ago'  },
  { id: 'act4', who: 'Officer',       what: 'added new resource: XGBoost Guide',      when: '2 days ago' }
]
