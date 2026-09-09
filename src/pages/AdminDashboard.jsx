import { useEffect, useState } from 'react'
import { Users, IndianRupee, Wallet, Check } from 'lucide-react'
import { getMembers, getExpenditures } from '../api/api'
import { dummyMembers, dummyExpenditures } from '../api/dummyData'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { isAdmin, user } = useAuth()
  const [members, setMembers] = useState([])
  const [expenditures, setExpenditures] = useState([])

  useEffect(() => {
    getMembers().then((r) => setMembers(r.data)).catch(() => setMembers(dummyMembers))
    getExpenditures().then((r) => setExpenditures(r.data)).catch(() => setExpenditures(dummyExpenditures))
  }, [])

  const totalDue = members.reduce((s, m) => s + m.amountDue, 0)
  const totalPaid = members.reduce((s, m) => s + m.amountPaid, 0)
  const totalSpent = expenditures.reduce((s, e) => s + e.amount, 0)
  const paidCount = members.filter((m) => m.isPaid).length

  return (
    <div className="page">
      <h1>Welcome, {user?.name}</h1>

      {isAdmin && (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-card-icon"><Check size={18} strokeWidth={2} /></span>
            <span>
              <span className="stat-value">{paidCount} / {members.length}</span>
              <span className="stat-label">Members Paid</span>
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon"><IndianRupee size={18} strokeWidth={2} /></span>
            <span>
              <span className="stat-value">₹{totalPaid}</span>
              <span className="stat-label">Chanda Collected</span>
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon"><IndianRupee size={18} strokeWidth={2} /></span>
            <span>
              <span className="stat-value">₹{totalDue - totalPaid}</span>
              <span className="stat-label">Chanda Pending</span>
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon"><Wallet size={18} strokeWidth={2} /></span>
            <span>
              <span className="stat-value">₹{totalSpent}</span>
              <span className="stat-label">Total Expenditure</span>
            </span>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="stat-grid">
          {members.map((m) => (
            <div className="stat-card" key={m.id}>
              <span className="stat-card-icon"><Users size={18} strokeWidth={2} /></span>
              <span>
                <span className="stat-value">₹{m.amountDue - m.amountPaid} remaining</span>
                <span className="stat-label">Your Due</span>
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
