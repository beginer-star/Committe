import { useEffect, useState } from 'react'
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '../api/api'
import { dummyCalendarEvents } from '../api/dummyData'
import { useAuth } from '../context/AuthContext'

export default function CalendarPage({ embedded = false }) {
  const { isAdmin, user } = useAuth()
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [eventName, setEventName] = useState('')
  const [memberName, setMemberName] = useState(user?.name || '')
  const [availableDays, setAvailableDays] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const loadEvents = () => {
    getCalendarEvents().then((r) => setEvents(r.data)).catch(() => setEvents(dummyCalendarEvents))
  }

  useEffect(loadEvents, [])

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await createCalendarEvent({
        date: selectedDate,
        eventName,
        memberName,
        availableDays: Number(availableDays)
      })
      setShowForm(false)
      setEventName('')
      loadEvents()
    } catch {
      alert('Could not save — check the backend connection.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCalendarEvent(id)
      loadEvents()
    } catch {
      alert('Could not delete — check the backend connection.')
    }
  }

  // Simple upcoming-30-days strip instead of a full month grid, to keep this compact.
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const eventsOn = (d) => events.filter((e) => new Date(e.date).toDateString() === d.toDateString())

  return (
    <div className={embedded ? '' : 'page'}>
      {!embedded && <h1>Calendar</h1>}

      <div className="calendar-strip">
        {days.map((d) => {
          const dayEvents = eventsOn(d)
          const iso = d.toISOString().slice(0, 10)
          return (
            <button
              key={iso}
              className={`calendar-day ${dayEvents.length ? 'has-event' : ''}`}
              onClick={() => handleDateClick(iso)}
            >
              <span className="day-num">{d.getDate()}</span>
              <span className="day-mon">{d.toLocaleString('default', { month: 'short' })}</span>
              {dayEvents.map((ev) => <span key={ev.id} className="event-dot">{ev.eventName}</span>)}
            </button>
          )
        })}
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleSave}>
          <span>Date: {selectedDate}</span>
          <input placeholder="Event name" required value={eventName}
            onChange={(e) => setEventName(e.target.value)} />
          <input placeholder="Member name" required value={memberName}
            onChange={(e) => setMemberName(e.target.value)} />
          <input type="number" min="1" placeholder="Available days" value={availableDays}
            onChange={(e) => setAvailableDays(e.target.value)} />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      {!embedded && (
        <table className="grid-table">
          <thead><tr><th>Date</th><th>Event</th><th>Member</th><th>Days</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{new Date(ev.date).toLocaleDateString()}</td>
                <td>{ev.eventName}</td>
                <td>{ev.memberName}</td>
                <td>{ev.availableDays}</td>
                {isAdmin && <td><button className="danger-btn" onClick={() => handleDelete(ev.id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
