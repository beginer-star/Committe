import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>{user?.teamName || 'Vinayaka Committee'}</h2>
        <p className="sidebar-sub">{user?.name} · {user?.role}</p>
      </div>

      <nav>
        <NavLink to="/" end className="nav-link">Home</NavLink>
        {isAdmin && <NavLink to="/members" className="nav-link">Team Members</NavLink>}
        {!isAdmin && <NavLink to="/members" className="nav-link">My Payment</NavLink>}
        {isAdmin && <NavLink to="/expenditure" className="nav-link">Expenditure</NavLink>}
        <NavLink to="/calendar" className="nav-link">Calendar</NavLink>
      </nav>

      <button className="logout-btn" onClick={logout}>Logout</button>
    </aside>
  )
}
