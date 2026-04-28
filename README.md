# Metro Analytics Club — Competition Tracker

A club management dashboard for Metropolitan State University's Analytics Club. Built to help officers and members track competitions, teams, weekly check-ins, and member progress in one place.

**Live demo:** _add your Vercel URL here once deployed_

## Features

- **Six roles** with permission-aware UI: President, Vice President, Secretary, Treasurer, Professor/Advisor, Member
- **Username-based login** with President "preview as other role" support
- **Competitions** library (Kaggle, MinneMUDAC, Hackathons, Portfolio Projects)
- **Teams** with progress tracking, member lists, and per-team detail pages
- **GitHub Project Tracker** — repo links + deliverables checklist (README, notebook, visuals, write-up)
- **Weekly Check-ins** — what we did, blockers, next steps, help needed
- **Portfolio Readiness Score** for each team (0-100% based on deliverables)
- **Skill-based Team Matching** that suggests balanced teams (mix of beginner / intermediate / advanced)
- **Find a Teammate** board — members can post "looking for a team"
- **Meeting Notes** with action items and decisions (Secretary/President)
- **Budget Notes** (Treasurer/President)
- **Resources hub** for tutorials, templates, and competition prep
- **Achievements** with badges on member profiles
- **Copy Teams Update** — generates a ready-to-paste Microsoft Teams weekly update
- **Needs Attention** dashboard alerts (overdue check-ins, urgent deadlines, pending requests)
- **Analytics** page with portfolio rankings, skill coverage, and achievement leaderboard

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router
- localStorage (no backend yet — Phase 2 will move to Supabase)

## Demo Accounts

Sign in by username on the login screen:
- `maria` — President (full access)
- `sarah` — Vice President
- `david` — Secretary
- `jamie` — Treasurer
- `yuezhang` — Professor / Advisor (read-only)
- `alex`, `priya`, `noah`, `emma` — Members

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

## Roadmap

- **Phase 2:** Replace localStorage with Supabase for shared data and real authentication
- **Phase 3:** Polish President dashboard with priority panel, smart matching suggestions, and weekly report generator
