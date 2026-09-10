import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import TeamRegister from './pages/TeamRegister'
import AdminDashboard from './pages/AdminDashboard'
import TeamMembers from './pages/TeamMembers'
import Expenditure from './pages/Expenditure'
import CalendarPage from './pages/CalendarPage'
import './styles.css'

function Layout({ children }) {
  const { user } = useAuth()
  if (!user) return children
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<TeamRegister />} />
            <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
            <Route path="/expenditure" element={<ProtectedRoute ><Expenditure /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}
