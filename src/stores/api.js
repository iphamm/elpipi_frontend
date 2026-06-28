// frontend/src/stores/api.js
import axios from 'axios'

// Dev  → baseURL '/api' diproxy Vite ke localhost:3000
// Prod → baseURL pakai VITE_API_URL yang di-set di Vercel dashboard
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL, timeout: 60000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if ([401, 403].includes(err.response?.status)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
