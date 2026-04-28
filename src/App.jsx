import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginScreen   from './pages/LoginScreen'
import Dashboard     from './pages/Dashboard'
import Competitions  from './pages/Competitions'
import Teams         from './pages/Teams'
import TeamDetail    from './pages/TeamDetail'
import Members       from './pages/Members'
import Matching      from './pages/Matching'
import Resources     from './pages/Resources'
import Profile       from './pages/Profile'
import Notes         from './pages/Notes'
import Budget        from './pages/Budget'
import Treasurer     from './pages/Treasurer'
import FindTeammate  from './pages/FindTeammate'
import Analytics     from './pages/Analytics'
import { useAuth }   from './data/AuthContext'
import { can } from './utils/permissions'

// Wrapper that requires a permission. Redirects to dashboard otherwise.
function Protected({ permission, children }) {
  const { currentUser } = useAuth()
  if (permission && !can(currentUser, permission)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { currentUser } = useAuth()

  // Show login screen when no user
  if (!currentUser) return <LoginScreen />

  return (
    <Layout>
      <Routes>
        <Route path="/"             element={<Dashboard />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/teams"        element={<Teams />} />
        <Route path="/teams/:teamId" element={<TeamDetail />} />
        <Route path="/find-teammate" element={<FindTeammate />} />
        <Route path="/analytics"    element={<Analytics />} />
        <Route path="/profile"      element={<Profile />} />
        <Route path="/resources"    element={<Resources />} />
        <Route path="/members"      element={<Protected permission="members.view_all"><Members /></Protected>} />
        <Route path="/matching"     element={<Protected permission="teams.assign"><Matching /></Protected>} />
        <Route path="/notes"        element={<Protected permission="notes.create"><Notes /></Protected>} />
        <Route path="/budget"       element={<Protected permission="budget.view"><Budget /></Protected>} />
        <Route path="/treasurer"    element={<Protected permission="budget.view"><Treasurer /></Protected>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
