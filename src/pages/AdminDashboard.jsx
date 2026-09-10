import { useEffect, useState } from 'react'
import { Users, IndianRupee, Wallet, Check, CalendarDays } from 'lucide-react'
import { getMembers, getExpenditures, getCalendarEvents } from '../api/api'
import { dummyMembers, dummyExpenditures } from '../api/dummyData'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { isAdmin, user } = useAuth()

  const [members, setMembers] = useState([])
  const [expenditures, setExpenditures] = useState([])
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState('')

  useEffect(() => {
    getMembers()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : []
        setMembers(data)
      })
      .catch(() => {
        setMembers(dummyMembers)
      })

    getExpenditures()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : []
        setExpenditures(data)
      })
      .catch(() => {
        setExpenditures(dummyExpenditures)
      })

    loadEvents()
  }, [])

  const loadEvents = async () => {
    setEventsLoading(true)
    setEventsError('')

    try {
      const response = await getCalendarEvents()

      console.log('CALENDAR API RESPONSE:', response.data)

      let data = response.data

      if (!Array.isArray(data)) {
        data = []
      }

      setEvents(data)
    } catch (error) {
      console.error('CALENDAR API ERROR:', error)

      setEvents([])

      if (error.response) {
        if (error.response.status === 401) {
          setEventsError('Please log in again to view team events.')
        } else if (error.response.status === 403) {
          setEventsError('You do not have permission to view team events.')
        } else if (error.response.status === 404) {
          setEventsError('Calendar API was not found.')
        } else if (error.response.data?.message) {
          setEventsError(error.response.data.message)
        } else {
          setEventsError(`Could not load events. Error ${error.response.status}`)
        }
      } else {
        setEventsError('Could not connect to the calendar API.')
      }
    } finally {
      setEventsLoading(false)
    }
  }

  const totalDue = members.reduce(
    (sum, member) => sum + Number(member.amountDue || 0),
    0
  )

  const totalPaid = members.reduce(
    (sum, member) => sum + Number(member.amountPaid || 0),
    0
  )

  const totalSpent = expenditures.reduce(
    (sum, expenditure) => sum + Number(expenditure.amount || 0),
    0
  )

  const paidCount = members.filter((member) => member.isPaid).length

  const upcomingEvents = events
    .filter((event) => {
      const type = String(
        event.type ?? event.Type ?? ''
      ).trim().toLowerCase()

      return type === 'event'
    })
    .sort((a, b) => {
      const dateA = new Date(a.date ?? a.Date)
      const dateB = new Date(b.date ?? b.Date)

      const diff = dateA - dateB

      if (diff !== 0) {
        return diff
      }

      const nameA = String(
        a.eventName ?? a.EventName ?? ''
      )

      const nameB = String(
        b.eventName ?? b.EventName ?? ''
      )

      return nameA.localeCompare(nameB)
    })

  const formatEventDate = (date) => {
    if (!date) {
      return ''
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return ''
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="page">
      <h1>Welcome, {user?.name}</h1>

      {isAdmin && (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-card-icon">
              <Check size={18} strokeWidth={2} />
            </span>

            <span>
              <span className="stat-value">
                {paidCount} / {members.length}
              </span>

              <span className="stat-label">
                Members Paid
              </span>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card-icon">
              <IndianRupee size={18} strokeWidth={2} />
            </span>

            <span>
              <span className="stat-value">
                ₹{totalPaid}
              </span>

              <span className="stat-label">
                Chanda Collected
              </span>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card-icon">
              <IndianRupee size={18} strokeWidth={2} />
            </span>

            <span>
              <span className="stat-value">
                ₹{totalDue - totalPaid}
              </span>

              <span className="stat-label">
                Chanda Pending
              </span>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card-icon">
              <Wallet size={18} strokeWidth={2} />
            </span>

            <span>
              <span className="stat-value">
                ₹{totalSpent}
              </span>

              <span className="stat-label">
                Total Expenditure
              </span>
            </span>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="stat-grid">
          {members.map((member) => (
            <div
              className="stat-card"
              key={member.id}
            >
              <span className="stat-card-icon">
                <Users size={18} strokeWidth={2} />
              </span>

              <span>
                <span className="stat-value">
                  ₹{Number(member.amountDue || 0) -
                    Number(member.amountPaid || 0)} remaining
                </span>

                <span className="stat-label">
                  Your Due
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-events-card">
        <div className="dashboard-events-header">
          <div>
            <h2>
              <CalendarDays size={19} />
              Upcoming Events
            </h2>

            <p>
              Team events available for everyone
            </p>
          </div>

          {!eventsLoading && !eventsError && (
            <span className="dashboard-events-count">
              {upcomingEvents.length}
            </span>
          )}
        </div>

        {eventsLoading ? (
          <div className="dashboard-no-events">
            <CalendarDays size={24} />
            <span>Loading events...</span>
          </div>
        ) : eventsError ? (
          <div className="dashboard-no-events">
            <CalendarDays size={24} />
            <span>{eventsError}</span>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="dashboard-events-list">
            {upcomingEvents.map((event) => {
              const eventId = event.id ?? event.Id
              const eventDate = event.date ?? event.Date
              const eventName =
                event.eventName ??
                event.EventName ??
                'Team Event'

              return (
                <div
                  className="dashboard-event-row"
                  key={eventId}
                >
                  <div className="dashboard-event-date">
                    <CalendarDays size={17} />

                    <span>
                      {formatEventDate(eventDate)}
                    </span>
                  </div>

                  <div className="dashboard-event-name">
                    {eventName}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="dashboard-no-events">
            <CalendarDays size={24} />
            <span>No upcoming events</span>
          </div>
        )}
      </div>
    </div>
  )
}