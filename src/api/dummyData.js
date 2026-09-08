// Fallback dummy data — used if the API call fails (e.g. backend not running yet).
// Mirrors the shape returned by the real API so screens work either way.

export const dummyTeams = [
  { id: 1, name: 'Team 1', upiId: 'team1@okhdfcbank', optionalUpiId: null },
  { id: 2, name: 'Team 2', upiId: 'team2@okhdfcbank', optionalUpiId: 'team2alt@okaxis' }
]

export const dummyMembers = [
  { id: 2, name: 'Ravi Kumar', username: '9000000002', mobile: '9000000002', amountDue: 500, amountPaid: 0, isPaid: false },
  { id: 3, name: 'Sita Devi', username: '9000000003', mobile: '9000000003', amountDue: 500, amountPaid: 500, isPaid: true },
  { id: 5, name: 'Anil Reddy', username: '9000000005', mobile: '9000000005', amountDue: 750, amountPaid: 250, isPaid: false }
]

export const dummyExpenditures = [
  { id: 1, category: 'Decoration', description: 'Flowers and mandap', amount: 3500, date: '2026-09-04' },
  { id: 2, category: 'Prasadam', description: 'Sweets for 100 people', amount: 5200, date: '2026-09-06' }
]

export const dummyCalendarEvents = [
  { id: 1, date: '2026-09-11', eventName: 'Ganesh Sthapana', memberName: 'Ravi Kumar', availableDays: 1 },
  { id: 2, date: '2026-09-18', eventName: 'Visarjan', memberName: 'Sita Devi', availableDays: 1 }
]

export const expenditureCategories = [
  'Decoration', 'Prasadam', 'Sound System', 'Priest / Pooja', 'Electricity', 'Tent', 'Other'
]
