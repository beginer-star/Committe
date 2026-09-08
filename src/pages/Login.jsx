import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(username, password)
      loginUser(res.data) // { token, name, username, role, teamId, teamName, userId }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Vinayaka Committee</h1>
        <p className="subtitle">Sign in to your account</p>

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <p className="switch-link">
          New committee? <Link to="/register">Register your team</Link>
        </p>
      </form>
    </div>
  )
}
