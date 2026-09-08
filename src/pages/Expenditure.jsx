import { useEffect, useState } from 'react'
import { getExpenditures, createExpenditure, deleteExpenditure } from '../api/api'
import { dummyExpenditures, expenditureCategories } from '../api/dummyData'

export default function Expenditure() {
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const loadItems = () => {
    getExpenditures().then((r) => setItems(r.data)).catch(() => setItems(dummyExpenditures))
  }

  useEffect(loadItems, [])

  const isOther = category === 'Other'

  const handleAdd = async (e) => {
    e.preventDefault()
    const finalCategory = isOther ? customCategory : category
    if (!finalCategory || !amount) return

    try {
      await createExpenditure({
        category: finalCategory,
        description,
        amount: Number(amount),
        date: new Date().toISOString()
      })
      setCategory(''); setCustomCategory(''); setDescription(''); setAmount('')
      loadItems()
    } catch {
      alert('Could not save expenditure — check the backend connection.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expenditure?')) return
    try {
      await deleteExpenditure(id)
      loadItems()
    } catch {
      alert('Could not delete — check the backend connection.')
    }
  }

  const total = items.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="page">
      <h1>Expenditure</h1>

      <form className="inline-form" onSubmit={handleAdd}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="" disabled>Select category</option>
          {expenditureCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {isOther && (
          <input
            placeholder="Type product/purpose"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            required
          />
        )}

        <input placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)} />
        <input placeholder="Amount" type="number" required value={amount}
          onChange={(e) => setAmount(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <table className="grid-table">
        <thead>
          <tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.category}</td>
              <td>{i.description}</td>
              <td>₹{i.amount}</td>
              <td>{new Date(i.date).toLocaleDateString()}</td>
              <td><button className="danger-btn" onClick={() => handleDelete(i.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={2}><strong>Total</strong></td><td colSpan={3}><strong>₹{total}</strong></td></tr>
        </tfoot>
      </table>
    </div>
  )
}
