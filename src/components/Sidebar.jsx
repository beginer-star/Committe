import { NavLink } from 'react-router-dom'
import { Home, Users, Wallet, Calendar as CalendarIcon, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">॥ श्री ॥</span>
      </div>

      <div className="sidebar-header">
        <h2>{user?.teamName || 'Vinayaka Committee'}</h2>
        <p className="sidebar-sub">{user?.name} · {user?.role}</p>
      </div>

      <nav>
        <NavLink to="/" end className="nav-link">
          <Home size={16} strokeWidth={2.2} />
          <span>Home</span>
        </NavLink>
        {isAdmin && (
          <NavLink to="/members" className="nav-link">
            <Users size={16} strokeWidth={2.2} />
            <span>Team Members</span>
          </NavLink>
        )}
        {!isAdmin && (
          <NavLink to="/members" className="nav-link">
            <Users size={16} strokeWidth={2.2} />
            <span>My Payment</span>
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/expenditure" className="nav-link">
            <Wallet size={16} strokeWidth={2.2} />
            <span>Expenditure</span>
          </NavLink>
        )}
          {!isAdmin && (
          <NavLink to="/expenditure" className="nav-link">
            <Wallet size={16} strokeWidth={2.2} />
            <span>Expenditure</span>
          </NavLink>
        )}
        <NavLink to="/calendar" className="nav-link">
          <CalendarIcon size={16} strokeWidth={2.2} />
          <span>Calendar</span>
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={15} strokeWidth={2.2} />
        <span>Logout</span>
      </button>
    </aside>
  )
}
