import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerTeam } from '../api/api'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  teamName: '',
  username: '',
  upiId: '',
  optionalUpiId: '',
  mobileNumber: '',
  password: ''
}

export default function TeamRegister() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerTeam({
        teamName: form.teamName,
        username: form.username,
        upiId: form.upiId,
        optionalUpiId: form.optionalUpiId || null,
        mobileNumber: form.mobileNumber,
        password: form.password
      })
      loginUser(res.data) // registration logs the new admin straight in
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check the details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-mark">॥ श्री ॥</div>
      <form className="login-card register-card" onSubmit={handleSubmit}>
        <h1>Register Your Team</h1>
        <p className="subtitle">Create a committee admin account</p>

        <label>Team Name</label>
        <input value={form.teamName} onChange={update('teamName')} placeholder="e.g. Sri Ganesh Youth Committee" required />

        <label>Username</label>
        <input value={form.username} onChange={update('username')} placeholder="Login username" required />

        <label>UPI ID</label>
        <input value={form.upiId} onChange={update('upiId')} placeholder="e.g. team@okhdfcbank" required />

        <label>Optional UPI ID</label>
        <input value={form.optionalUpiId} onChange={update('optionalUpiId')} placeholder="Alternate UPI ID (optional)" />

        <label>Mobile Number</label>
        <input value={form.mobileNumber} onChange={update('mobileNumber')} placeholder="10-digit mobile number" required />

        <label>Password</label>
        <input type="password" value={form.password} onChange={update('password')} placeholder="Password" required />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="switch-link">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}
