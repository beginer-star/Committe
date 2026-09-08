import { useEffect, useRef, useState } from 'react'
import {
  getMembers, createMember, deleteMember, payMember, getUpiLink, bulkImportMembers
} from '../api/api'
import { dummyMembers } from '../api/dummyData'
import { useAuth } from '../context/AuthContext'

export default function TeamMembers() {
  const { isAdmin } = useAuth()
  const [members, setMembers] = useState([])
  const [payAmounts, setPayAmounts] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', mobile: '', username: '', password: '', amountDue: '' })

  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  const loadMembers = () => {
    getMembers().then((r) => setMembers(r.data)).catch(() => setMembers(dummyMembers))
  }

  useEffect(loadMembers, [])

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

    try {
      const linkRes = await getUpiLink(member.id, amount)
      window.location.href = linkRes.data.upiLink
      await payMember(member.id, { amount, upiApp: 'PhonePe' })
      loadMembers()
    } catch {
      alert('Could not process payment — check the backend connection.')
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await bulkImportMembers(importFile)
      setImportResult(res.data) // { totalRows, imported, skipped, details: [...] }
      loadMembers()
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed — check the backend connection and file format.')
    } finally {
      setImporting(false)
      setImportFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isAdmin ? 'Team Members' : 'My Payment'}</h1>
        {isAdmin && (
          <div className="import-actions">
            <button onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? 'Cancel' : '+ Add Member'}
            </button>
            <button onClick={() => setShowImport((v) => !v)}>
              {showImport ? 'Cancel Import' : '⇪ Import from Excel'}
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
            <input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={(e) => setImportFile(e.target.files[0])}
              required
            />
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

      <table className="grid-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Mobile</th>
            <th>Due</th>
            <th>Paid</th>
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
                <input
                  type="number"
                  className="pay-input"
                  placeholder={`${m.amountDue - m.amountPaid}`}
                  value={payAmounts[m.id] || ''}
                  onChange={(e) => setPayAmounts({ ...payAmounts, [m.id]: e.target.value })}
                  disabled={m.isPaid}
                />
              </td>
              <td>
                <button className="pay-btn" disabled={m.isPaid} onClick={() => handlePay(m)}>
                  {m.isPaid ? 'Paid ✓' : 'Pay'}
                </button>
              </td>
              {isAdmin && (
                <td>
                  <button className="danger-btn" onClick={() => handleDelete(m.id)}>Remove</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
