import { useEffect, useState } from 'react'
import {
  getExpenditures,
  createExpenditure,
  deleteExpenditure
} from '../api/api'
import {
  dummyExpenditures,
  expenditureCategories
} from '../api/dummyData'
import { useAuth } from '../context/AuthContext'

export default function Expenditure() {
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const { isAdmin } = useAuth()

  const loadItems = () => {
    getExpenditures()
      .then((r) => {
        setItems(Array.isArray(r.data) ? r.data : [])
      })
      .catch(() => {
        setItems(dummyExpenditures)
      })
  }

  useEffect(() => {
    loadItems()
  }, [])

  const isOther = category === 'Other'

  const handleAdd = async (e) => {
    e.preventDefault()

    const finalCategory = isOther
      ? customCategory
      : category

    if (!finalCategory || !amount) {
      return
    }

    try {
      await createExpenditure({
        category: finalCategory,
        description,
        amount: Number(amount),
        date: new Date().toISOString()
      })

      setCategory('')
      setCustomCategory('')
      setDescription('')
      setAmount('')

      loadItems()
    } catch {
      alert(
        'Could not save expenditure — check the backend connection.'
      )
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expenditure?')) {
      return
    }

    try {
      await deleteExpenditure(id)
      loadItems()
    } catch {
      alert(
        'Could not delete — check the backend connection.'
      )
    }
  }

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  )

  return (
    <div className="page">

      <h1>Expenditure</h1>

      {isAdmin && (
        <form
          className="inline-form"
          onSubmit={handleAdd}
        >
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            required
          >
            <option value="" disabled>
              Select category
            </option>

            {expenditureCategories.map((c) => (
              <option
                key={c}
                value={c}
              >
                {c}
              </option>
            ))}
          </select>

          {isOther && (
            <input
              placeholder="Type product/purpose"
              value={customCategory}
              onChange={(e) =>
                setCustomCategory(e.target.value)
              }
              required
            />
          )}

          <input
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <input
            placeholder="Amount"
            type="number"
            min="0"
            required
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />

          <button type="submit">
            Add
          </button>
        </form>
      )}

      <table className="grid-table">

        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>

            {isAdmin && (
              <th>Action</th>
            )}
          </tr>
        </thead>

        <tbody>

          {items.length > 0 ? (

            items.map((item) => (
              <tr key={item.id}>

                <td>
                  {item.category}
                </td>

                <td>
                  {item.description}
                </td>

                <td>
                  ₹{Number(
                    item.amount || 0
                  ).toFixed(2)}
                </td>

                <td>
                  {item.date
                    ? new Date(
                        item.date
                      ).toLocaleDateString(
                        'en-IN'
                      )
                    : ''}
                </td>

                {isAdmin && (
                  <td>
                    <button
                      className="danger-btn"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                )}

              </tr>
            ))

          ) : (

            <tr>
              <td
                colSpan={isAdmin ? 5 : 4}
                style={{
                  textAlign: 'center'
                }}
              >
                No expenditure records found.
              </td>
            </tr>

          )}

        </tbody>

        <tfoot>

          <tr>

            <td
              colSpan={isAdmin ? 2 : 2}
            >
              <strong>
                Total
              </strong>
            </td>

            <td
              colSpan={isAdmin ? 3 : 2}
            >
              <strong>
                ₹{total.toFixed(2)}
              </strong>
            </td>

          </tr>

        </tfoot>

      </table>

    </div>
  )
}