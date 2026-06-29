// frontend/src/stores/api.js
import axios from 'axios'

// Kita arahkan ke /api (karena nanti akan di-rewrite oleh vercel.json ke Railway)
const api = axios.create({ 
  baseURL: '/api', 
  timeout: 60000 
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && [401, 403].includes(err.response.status)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
