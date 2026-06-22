# Metro Analytics Club — Competition Tracker (Demo Prototype)

A club management dashboard concept designed for Metropolitan State University’s Analytics Club. This project demonstrates how competition tracking, team coordination, and member progress could be centralized in a single system.

> **Status:** Demo/prototype project (not deployed for official club operations)

**Live demo:** https://metro-analytics-club.vercel.app

---

## Features

- Six role-based interfaces: President, Vice President, Secretary, Treasurer, Advisor, Member
- Username-based login with role preview (President view)
- Competition library (Kaggle, MinneMUDAC, Hackathons, Portfolio Projects)
- Team creation and progress tracking dashboards
- GitHub project tracker with deliverables checklist
- Weekly check-in system (progress, blockers, next steps)
- Portfolio readiness scoring system (0–100%)
- Skill-based team matching for balanced group formation
- “Find a Teammate” board for open collaboration
- Meeting notes with action items and decisions
- Budget notes module (Treasurer/President)
- Resource hub for competition preparation materials
- Achievement badges for member engagement
- Auto-generated team updates (copy-ready format)
- Alerts dashboard for deadlines and missing updates
- Analytics dashboard (skill coverage, progress, engagement)

---

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router
- LocalStorage (frontend-only prototype; no backend)

---

## Demo Accounts

Login using role-based usernames:

- `president` — full access
- `vicepresident`
- `secretary`
- `treasurer`
- `advisor` — read-only view
- `member`

> All accounts are simulated for demonstration purposes only.

---

## Local Development

```bash
npm install
npm run dev
