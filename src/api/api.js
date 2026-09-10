import axios from 'axios'
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE_URL })

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If a call fails (e.g. backend not running yet), calling code can fall back to dummy data.
export default api

// ---------------- Auth ----------------
export const login = (username, password) =>
  api.post('/auth/login', { username, password })

export const registerTeam = (data) => api.post('/teams/register', data)

export const getTeams = () => api.get('/teams')
export const getLoginTeams = () => api.get('/auth/teams')
export const getTeamMembersForLogin = (teamId) => api.get(`/auth/teams/${teamId}/members`)
export const memberLogin = (teamId, memberId, password) => api.post('/auth/member-login', { teamId, memberId, password })
export const getUpiOptions = (id, amount) => api.get(`/members/${id}/upi-options`, { params: { amount } })

// ---------------- Members ----------------
export const getMembers = () => api.get('/members')
export const createMember = (data) => api.post('/members', data)
export const updateMember = (id, data) => api.put(`/members/${id}`, data)
export const deleteMember = (id) => api.delete(`/members/${id}`)
export const payMember = (id, data) => api.post(`/members/${id}/pay`, data)
export const getPayments = () => api.get('/payments')
export const approvePayment = (id) => api.post(`/payments/${id}/approve`)
export const getUpiLink = (id, amount) => api.get(`/members/${id}/upi-link`, { params: { amount } })

// Bulk import members from an .xlsx file (Admin only)
export const bulkImportMembers = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/members/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ---------------- Expenditure ----------------
export const getExpenditures = () => api.get('/expenditures')
export const createExpenditure = (data) => api.post('/expenditures', data)
export const deleteExpenditure = (id) => api.delete(`/expenditures/${id}`)

// ---------------- Calendar ----------------
export const getCalendarEvents = () => api.get('/calendar')
export const createCalendarEvent = (data) => api.post('/calendar', data)
export const deleteCalendarEvent = (id) => api.delete(`/calendar/${id}`)
