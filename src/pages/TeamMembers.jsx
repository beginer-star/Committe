import { useEffect, useRef, useState } from 'react'
import { UserPlus, Upload, X, Smartphone } from 'lucide-react'
import {
  getMembers, createMember, deleteMember, getUpiOptions, payMember, bulkImportMembers,
  getPayments
} from '../api/api'
import { dummyMembers } from '../api/dummyData'
import { useAuth } from '../context/AuthContext'

export default function TeamMembers() {
  const { isAdmin } = useAuth()
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [payAmounts, setPayAmounts] = useState({})
  const [payment, setPayment] = useState(null)
  const [transactionId, setTransactionId] = useState('')
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', mobile: '', username: '', password: '', amountDue: '' })
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  const loadMembers = async () => {
    try {
      const r = await getMembers()
      setMembers(Array.isArray(r.data) ? r.data : [])
    } catch {
      setMembers(dummyMembers)
    }
  }

  const loadPayments = async () => {
    try {
      const r = await getPayments()
      setPayments(Array.isArray(r.data) ? r.data : [])
    } catch {
      setPayments([])
    }
  }

  useEffect(() => {
    loadMembers()
    loadPayments()
    const timer = window.setInterval(() => {
      loadMembers()
      loadPayments()
    }, 10000)
    return () => window.clearInterval(timer)
  }, [])

  const latestPaymentByUser = payments.reduce((map, item) => {
    if (!map[item.userId]) map[item.userId] = item
    return map
  }, {})

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await createMember({ ...newMember, amountDue: Number(newMember.amountDue) })
      setNewMember({ name: '', mobile: '', username: '', password: '', amountDue: '' })
      setShowAddForm(false)
      loadMembers()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add member — check the backend connection.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this member?')) return
    try {
      await deleteMember(id)
      loadMembers()
    } catch {
      alert('Could not delete member — check the backend connection.')
    }
  }

  const handlePay = async (member) => {
    const amount = Number(payAmounts[member.id] || (member.amountDue - member.amountPaid))
    if (!amount || amount <= 0) return

    setLoadingPayment(true)
    try {
      const res = await getUpiOptions(member.id, amount)
      setTransactionId('')
      setPayment({ member, amount, upiId: res.data.upiId, options: res.data.options })
    } catch (err) {
      alert(err.response?.data?.message || 'Could not load payment options.')
    } finally {
      setLoadingPayment(false)
    }
  }

  const openPaymentApp = (option) => {
    const href = option.fallback || option.scheme
    const a = document.createElement('a')
    a.href = href
    a.target = '_self'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const confirmPayment = async () => {
    if (!payment) return
    try {
      const app = payment.selectedApp || 'UPI'
      await payMember(payment.member.id, {
        amount: payment.amount,
        upiApp: app,
        transactionId: transactionId.trim() || null
      })
      setPayment(null)
      setTransactionId('')
      setPayAmounts({ ...payAmounts, [payment.member.id]: '' })
      await Promise.all([loadMembers(), loadPayments()])
      alert('Payment request submitted. It is pending admin approval.')
    } catch (err) {
      alert(err.response?.data?.message || 'Could not record payment.')
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await bulkImportMembers(importFile)
      setImportResult(res.data)
      loadMembers()
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed — check the backend connection and file format.')
    } finally {
      setImporting(false)
      setImportFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const paymentLabel = (member) => {
    const item = latestPaymentByUser[member.id]
    if (!item) return 'No payment'
    if (item.status === 0) return 'Pending approval'
    if (item.status === 1) return 'Paid ✓'
    return 'Failed'
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isAdmin ? 'Team Members' : 'My Payment'}</h1>
        {isAdmin && (
          <div className="import-actions">
            <button onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? 'Cancel' : (<><UserPlus size={14} strokeWidth={2.4} /> Add Member</>)}
            </button>
            <button onClick={() => setShowImport((v) => !v)}>
              {showImport ? 'Cancel Import' : (<><Upload size={14} strokeWidth={2.4} /> Import from Excel</>)}
            </button>
          </div>
        )}
      </div>

      {isAdmin && showAddForm && (
        <form className="inline-form" onSubmit={handleAdd}>
          <input placeholder="Name" required value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
          <input placeholder="Mobile" required value={newMember.mobile}
            onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })} />
          <input placeholder="Username (optional, defaults to mobile)" value={newMember.username}
            onChange={(e) => setNewMember({ ...newMember, username: e.target.value })} />
          <input placeholder="Password (optional, defaults to Member@123)" value={newMember.password}
            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} />
          <input placeholder="Amount Due" type="number" required value={newMember.amountDue}
            onChange={(e) => setNewMember({ ...newMember, amountDue: e.target.value })} />
          <button type="submit">Save</button>
        </form>
      )}

      {isAdmin && showImport && (
        <div className="import-panel">
          <h3>Bulk Import Members from Excel</h3>
          <p>
            Upload an <code>.xlsx</code> file with columns <strong>Name</strong>, <strong>Mobile</strong>{' '}
            (required) and <strong>Username</strong>, <strong>Password</strong>, <strong>AmountDue</strong> (optional).{' '}
            <a className="template-link" href="/bulk_import_template.xlsx" download>Download template</a>
          </p>
          <form className="inline-form" onSubmit={handleImport}>
            <input type="file" accept=".xlsx" ref={fileInputRef}
              onChange={(e) => setImportFile(e.target.files[0])} required />
            <button type="submit" disabled={importing || !importFile}>
              {importing ? 'Importing...' : 'Upload & Import'}
            </button>
          </form>

          {importResult && (
            <div className="import-summary">
              <p>
                Imported <strong>{importResult.imported}</strong> of {importResult.totalRows} rows
                {importResult.skipped > 0 && <> — {importResult.skipped} skipped</>}.
              </p>
              {importResult.skipped > 0 && (
                <ul>
                  {importResult.details.filter((d) => !d.success).map((d) => (
                    <li key={d.rowNumber} className="import-row-fail">
                      Row {d.rowNumber} ({d.name || 'blank'}): {d.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid-table-wrap">
        <table className="grid-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Mobile</th>
              <th>Due</th>
              <th>Paid</th>
              <th>Payment Status</th>
              <th>Pay Amount</th>
              <th></th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.username}</td>
                <td>{m.mobile}</td>
                <td>₹{m.amountDue}</td>
                <td>₹{m.amountPaid}</td>
                <td>
                  <span className={`payment-status payment-status-${latestPaymentByUser[m.id]?.status ?? 'none'}`}>
                    {m.isPaid ? 'Paid ✓' : paymentLabel(m)}
                  </span>
                </td>
                <td>
                  <input type="number" className="pay-input"
                    placeholder={`${m.amountDue - m.amountPaid}`}
                    value={payAmounts[m.id] || ''}
                    onChange={(e) => setPayAmounts({ ...payAmounts, [m.id]: e.target.value })}
                    disabled={m.isPaid || (!isAdmin && latestPaymentByUser[m.id]?.status === 0)} />
                </td>
                <td>
                  <button className="pay-btn" disabled={m.isPaid || loadingPayment || (!isAdmin && latestPaymentByUser[m.id]?.status === 0)} onClick={() => handlePay(m)}>
                    {m.isPaid ? 'Paid ✓' : (!isAdmin && latestPaymentByUser[m.id]?.status === 0) ? 'Pending' : loadingPayment ? 'Loading...' : 'Pay'}
                  </button>
                </td>
                {isAdmin && <td><button className="danger-btn" onClick={() => handleDelete(m.id)}>Remove</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payment && (
        <div className="payment-overlay" onClick={() => setPayment(null)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="payment-close" onClick={() => setPayment(null)} aria-label="Close">
              <X size={18} />
            </button>
            <div className="payment-icon"><Smartphone size={22} /></div>
            <h2>Choose payment app</h2>
            <p className="payment-member">{payment.member.name} · ₹{payment.amount.toFixed(2)}</p>
            <div className="upi-box">
              <span>UPI ID</span>
              <strong>{payment.upiId}</strong>
            </div>
            <div className="payment-options">
              {payment.options.map((option) => (
                <button key={option.id} className="payment-option" onClick={() => { setPayment({ ...payment, selectedApp: option.name }); openPaymentApp(option) }}>
                  <span className="payment-option-icon">{option.icon}</span>
                  <span>{option.name}</span>
                  <span className="payment-arrow">›</span>
                </button>
              ))}
            </div>
            <label className="payment-transaction-label">UPI transaction/reference ID (optional)</label>
            <input className="payment-transaction-input" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Example: 123456789012" />
            <button className="payment-confirm-btn" type="button" onClick={confirmPayment}>I completed the payment</button>
            <p className="payment-note">After completing the payment, return here and submit it. The payment will stay pending until an admin checks the payment and clicks Received.</p>
          </div>
        </div>
      )}
    </div>
  )
}
