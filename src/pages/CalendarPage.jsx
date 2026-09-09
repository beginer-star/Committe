import { useEffect, useMemo, useState } from 'react'
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '../api/api'
import { useAuth } from '../context/AuthContext'

const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const sameDay = (a, b) => iso(a) === iso(b)

export default function CalendarPage() {
  const { isAdmin, user } = useAuth()
  const [events, setEvents] = useState([])
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState('')
  const [type, setType] = useState('Available')
  const [eventName, setEventName] = useState('')
  const [availableDays, setAvailableDays] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const r = await getCalendarEvents()
      setEvents(r.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load calendar.')
    }
  }

  useEffect(() => { load() }, [])

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
    const start = new Date(first)
    start.setDate(1 - first.getDay())
    const total = Math.ceil((first.getDay() + last.getDate()) / 7) * 7
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [cursor])

  const eventsOn = (d) => events.filter(e => sameDay(new Date(e.date), d))

  const openForm = (d) => {
    setSelectedDate(iso(d))
    setType(isAdmin ? 'Event' : 'Available')
    const existing = eventsOn(d).find(e => isAdmin ? e.type === 'Event' : e.memberId === user?.userId)
    setEventName(existing?.eventName || (isAdmin ? '' : 'Available'))
    setAvailableDays(existing?.availableDays || 1)
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createCalendarEvent({
        date: selectedDate,
        type,
        eventName: eventName.trim() || (isAdmin ? 'Team Event' : type),
        memberId: null,
        memberName: '',
        availableDays: isAdmin ? 1 : Number(availableDays) || 1
      })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save calendar entry.')
    } finally { setSaving(false) }
  }

  const removeEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try { await deleteCalendarEvent(id); await load() }
    catch (err) { setError(err.response?.data?.message || 'Could not delete event.') }
  }

  const monthName = cursor.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="page calendar-page">
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p className="page-subtitle">{isAdmin ? 'Manage team events' : 'Update your availability'}</p>
        </div>
      </div>

      <div className="calendar-card calendar-compact">
        <div className="calendar-toolbar">
          <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button>
          <h2>{monthName}</h2>
          <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button>
        </div>
        <div className="calendar-weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x => <div key={x}>{x}</div>)}</div>
        <div className="calendar-grid">
          {days.map(d => {
            const dayEvents = eventsOn(d)
            const outside = d.getMonth() !== cursor.getMonth()
            return (
              <button type="button" key={iso(d)} className={`calendar-cell ${outside ? 'outside' : ''}`} onClick={() => openForm(d)}>
                <span className="calendar-cell-number">{d.getDate()}</span>
                <div className="calendar-cell-events">
                  {dayEvents.slice(0, 2).map(ev => (
                    <span key={ev.id} className={`calendar-event ${ev.type === 'Unavailable' ? 'unavailable' : ev.type === 'Event' ? 'team-event' : 'available'}`}>
                      <strong>{ev.type === 'Event' ? ev.eventName : (ev.memberId === user?.userId ? 'My availability' : ev.memberName)}</strong>
                      <small>{ev.type === 'Event' ? 'Event' : ev.type}</small>
                    </span>
                  ))}
                  {dayEvents.length > 2 && <span className="calendar-more">+{dayEvents.length - 2} more</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="calendar-legend">
        {isAdmin ? <span className="legend-event">Team event</span> : <><span className="legend-available">Available</span><span className="legend-unavailable">Not available</span></>}
      </div>
      {error && <p className="error-text calendar-error">{error}</p>}

      {!isAdmin && events.length > 0 && (
        <div className="calendar-info-card">
          <strong>Your availability</strong>
          <span>Click any date to mark yourself Available or Not Available.</span>
        </div>
      )}

      {isAdmin && events.filter(e => e.type === 'Event').length > 0 && (
        <div className="calendar-events-list">
          <h2 className="section-title">Team Events</h2>
          <div className="grid-table-wrap"><table className="grid-table"><thead><tr><th>Date</th><th>Event</th><th></th></tr></thead><tbody>
            {events.filter(e => e.type === 'Event').map(ev => <tr key={ev.id}><td>{new Date(ev.date).toLocaleDateString()}</td><td>{ev.eventName}</td><td><button className="danger-btn" onClick={() => removeEvent(ev.id)}>Delete</button></td></tr>)}
          </tbody></table></div>
        </div>
      )}

      {showForm && (
        <div className="payment-overlay" onClick={() => setShowForm(false)}>
          <form className="payment-modal calendar-form-modal" onSubmit={handleSave} onClick={e => e.stopPropagation()}>
            <button type="button" className="payment-close" onClick={() => setShowForm(false)}>×</button>
            <h2>{isAdmin ? 'Add / Update Event' : 'Update My Availability'}</h2>
            <p className="payment-member">Date: {selectedDate}</p>

            {isAdmin ? (
              <>
                <label>Event name</label>
                <input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Example: Ganesh Chaturthi" required />
                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save event'}</button>
              </>
            ) : (
              <>
                <label>Availability</label>
                <select value={type} onChange={e => { setType(e.target.value); setEventName(e.target.value) }}>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Not Available</option>
                </select>
                <label>Note</label>
                <input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Optional note" />
                <label>Number of days</label>
                <input type="number" min="1" value={availableDays} onChange={e => setAvailableDays(e.target.value)} />
                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save availability'}</button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
