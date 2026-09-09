import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLoginTeams, getTeamMembersForLogin, login, memberLogin } from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [role, setRole] = useState('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [teamId, setTeamId] = useState('')
  const [memberId, setMemberId] = useState('')
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const isMember = role === 'member'

  useEffect(() => {
    if (!isMember) return
    setLoadingTeams(true)
    setError('')
    getLoginTeams()
      .then((res) => setTeams(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load teams.'))
      .finally(() => setLoadingTeams(false))
  }, [isMember])

  useEffect(() => {
    if (!teamId || !isMember) {
      setMembers([])
      setMemberId('')
      return
    }

    setLoadingMembers(true)
    setError('')
    setMemberId('')
    getTeamMembersForLogin(teamId)
      .then((res) => setMembers(res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load team members.'))
      .finally(() => setLoadingMembers(false))
  }, [teamId, isMember])

  const switchRole = (nextRole) => {
    setRole(nextRole)
    setError('')
    setUsername('')
    setPassword('')
    setTeamId('')
    setMemberId('')
    setMembers([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = isMember
        ? await memberLogin(Number(teamId), Number(memberId), password)
        : await login(username, password)

      loginUser(res.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const selectedMember = members.find((m) => m.id === Number(memberId))

  return (
    <div className="login-page">
      <div className="login-mark">॥ श्री ॥</div>
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Vinayaka Committee</h1>
        <p className="subtitle">Chanda collection &amp; expense tracker</p>

        <div className="role-toggle">
          <button type="button" className={role === 'admin' ? 'is-active' : ''} onClick={() => switchRole('admin')}>
            Admin
          </button>
          <button type="button" className={isMember ? 'is-active' : ''} onClick={() => switchRole('member')}>
            Team member
          </button>
        </div>

        {isMember ? (
          <>
            <label>Team</label>
            <select value={teamId} onChange={(e) => setTeamId(e.target.value)} required>
              <option value="">{loadingTeams ? 'Loading teams...' : 'Select your team'}</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>

            <label>Team member</label>
            <select
              value={memberId}
              onChange={(e) => { setMemberId(e.target.value); setPassword(e.target.value ? 'Member@123' : '') }}
              disabled={!teamId || loadingMembers}
              required
            >
              <option value="">
                {loadingMembers ? 'Loading members...' : teamId ? 'Select your name' : 'Select a team first'}
              </option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} {member.mobile ? `(${member.mobile})` : ''}
                </option>
              ))}
            </select>

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Member@123"
              required
            />

            {selectedMember && (
              <p className="login-selection">
                Signing in as <strong>{selectedMember.name}</strong>. Default password: <strong>Member@123</strong>.
              </p>
            )}
          </>
        ) : (
          <>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your admin username"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </>
        )}

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading || (isMember && (!teamId || !memberId))}>
          {loading ? 'Signing in...' : isMember ? 'Log in as team member' : 'Log in as admin'}
        </button>

        <p className="login-hint">
          {isMember
            ? 'Select your team and name, then enter your password. New members use "Member@123" unless the admin changed it.'
            : 'Committee admin? Sign in with the username and password you registered with.'}
        </p>

        <p className="switch-link">
          New committee? <Link to="/register">Register your team</Link>
        </p>
      </form>
    </div>
  )
}
